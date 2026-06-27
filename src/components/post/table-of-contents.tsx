"use client";

import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = {
  title: string;
  url: string;
  items?: TocItem[];
};

type FlatTocItem = TocItem & {
  id: string;
};

interface TableOfContentsProps {
  items: TocItem[];
}

const MOBILE_TOC_OFFSET = 128;

function flattenTocItems(items: TocItem[]): FlatTocItem[] {
  return items.flatMap((item) => {
    const id = getHeadingId(item.url);
    const children = item.items ? flattenTocItems(item.items) : [];

    return id ? [{ ...item, id }, ...children] : children;
  });
}

function getHeadingId(url: string) {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return "";

  const hash = url.slice(hashIndex + 1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function TocLinks({
  items,
  activeId,
  depth = 0,
}: {
  items: TocItem[];
  activeId: string;
  depth?: number;
}) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        depth === 0
          ? "space-y-3 border-l border-warm-border pl-4 text-sm"
          : "mt-2 space-y-2 pl-4",
      )}
    >
      {items.map((item) => {
        const id = getHeadingId(item.url);
        const isActive = id && activeId === id;

        return (
          <li key={item.url}>
            <a
              href={item.url}
              className={cn(
                "block py-1 transition-colors",
                depth > 0 && "text-[13px]",
                isActive
                  ? "text-warm-text"
                  : "text-warm-muted hover:text-warm-text",
              )}
            >
              {item.title}
            </a>
            {item.items ? (
              <TocLinks
                items={item.items}
                activeId={activeId}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 스크롤에 따라 활성 헤딩을 추적하고, 레일 위 인디케이터를 직접 DOM에 그린다.
 * 데스크톱 사이드바와 모바일 카드가 공유한다.
 *
 * @param offsetOverride 활성 판정 기준선(px). 없으면 --scroll-offset + 4.
 */
function useTocIndicator(
  flatItems: FlatTocItem[],
  navRef: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLDivElement | null>,
  offsetOverride?: number,
) {
  const [activeId, setActiveId] = useState("");
  const lastActiveRef = useRef("");

  useEffect(() => {
    const nav = navRef.current;
    if (flatItems.length === 0 || !nav) return;

    // heading id → TOC 링크 매핑(매 프레임 쿼리하지 않도록 캐시)
    const linkById = new Map<string, HTMLAnchorElement>();
    for (const link of nav.querySelectorAll("a")) {
      const id = getHeadingId(link.getAttribute("href") ?? "");
      if (id) linkById.set(id, link);
    }

    let frameId: number | null = null;

    // 읽기 기준선: 앵커 클릭 시 헤딩이 떨어지는 지점(scroll-padding-top)
    // 바로 아래. 값이 어긋나면 TOC를 눌러도 인디케이터가 그 항목에 안 맞는다.
    const scrollOffset =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--scroll-offset",
        ),
      ) || 96;
    const offset = offsetOverride ?? scrollOffset + 4;

    const update = () => {
      frameId = null;

      const indicator = indicatorRef.current;
      if (!indicator) return;

      const headings = flatItems
        .map((item) => {
          const element = document.getElementById(item.id);
          const link = linkById.get(item.id);
          if (!element || !link) return null;

          return {
            id: item.id,
            top: element.getBoundingClientRect().top,
            link,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (headings.length === 0) return;

      // 기준선을 지난 마지막 헤딩 = 현재 읽고 있는 섹션
      let index = 0;
      let passed = false;
      headings.forEach((heading, i) => {
        if (heading.top <= offset) {
          index = i;
          passed = true;
        }
      });

      // 섹션 내 진행률(0~1): 기준선이 현재 헤딩과 다음 헤딩 사이 어디인지.
      // 이 값으로 인디케이터를 항목 사이에서 연속적으로 보간한다.
      let progress = 0;
      if (passed && index < headings.length - 1) {
        const current = headings[index].top;
        const next = headings[index + 1].top;
        if (next > current) {
          progress = Math.min(
            1,
            Math.max(0, (offset - current) / (next - current)),
          );
        }
      }

      // 페이지 끝에 닿으면 마지막 항목까지 채운다(상단 진행 바와 같은 감각)
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        index = headings.length - 1;
        progress = 0;
      }

      const navTop = nav.getBoundingClientRect().top;
      const currentRect = headings[index].link.getBoundingClientRect();
      const nextRect =
        headings[
          Math.min(index + 1, headings.length - 1)
        ].link.getBoundingClientRect();

      const y =
        currentRect.top - navTop + (nextRect.top - currentRect.top) * progress;
      const height =
        currentRect.height + (nextRect.height - currentRect.height) * progress;

      // 매 프레임 호출되므로 리렌더 없이 DOM에 직접 쓴다
      indicator.style.transform = `translateY(${y}px)`;
      indicator.style.height = `${height}px`;
      indicator.style.opacity = "1";

      const activeHeading = headings[index];
      setActiveId(activeHeading.id);

      // 목차가 길어 내부 스크롤되면, 활성 항목이 화면 밖일 때만 부드럽게 따라감.
      // (활성이 바뀐 순간에만 — 매 프레임 스크롤하면 떨림)
      if (activeHeading.id !== lastActiveRef.current) {
        lastActiveRef.current = activeHeading.id;
        const box = nav.parentElement;
        if (box && box.scrollHeight > box.clientHeight) {
          const link = activeHeading.link;
          const top =
            link.getBoundingClientRect().top -
            box.getBoundingClientRect().top +
            box.scrollTop;
          const bottom = top + link.offsetHeight;
          if (top < box.scrollTop) {
            box.scrollTo({ top: top - 8, behavior: "smooth" });
          } else if (bottom > box.scrollTop + box.clientHeight) {
            box.scrollTo({
              top: bottom - box.clientHeight + 8,
              behavior: "smooth",
            });
          }
        }
      }
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [flatItems, navRef, indicatorRef, offsetOverride]);

  return activeId;
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const flatItems = useMemo(() => flattenTocItems(items), [items]);
  const activeId = useTocIndicator(flatItems, navRef, indicatorRef);

  if (items.length === 0) return null;

  return (
    <nav ref={navRef} aria-label="Table of contents" className="relative">
      {/* 스크롤에 따라 레일 위를 미끄러지는 인디케이터 */}
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute -left-px top-0 w-0.5 rounded-full bg-warm-primary opacity-0 will-change-transform"
      />
      <TocLinks items={items} activeId={activeId} />
    </nav>
  );
}

// 데스크톱 고정 TOC의 뷰포트 상단 거리(헤더 64 + 여백). ponytail: 헤더 높이 바뀌면 조정
const DESKTOP_TOC_TOP = 128;

/**
 * 데스크톱 사이드바 목차. sticky의 초기 catch-up 없이 position:fixed로 완전 고정.
 * 가운데 정렬 컨테이너의 우측 컬럼 위치를 placeholder로 측정해 가로를 맞춘다.
 */
export function DesktopTableOfContents({ items }: TableOfContentsProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ph = placeholderRef.current;
    const toc = tocRef.current;
    if (!ph || !toc) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      // placeholder는 그리드 stretch로 기사 컬럼 전체 높이 → bottom = 컬럼(=기사) 바닥
      const r = ph.getBoundingClientRect();
      if (r.width === 0) return; // 모바일(hidden)일 땐 무시
      // TOC 바닥이 컬럼 바닥을 넘지 않게 top을 위로 당김 → 푸터 앞에서 멈춤(sticky 끝 동작)
      const top = Math.min(DESKTOP_TOC_TOP, r.bottom - toc.offsetHeight);
      toc.style.position = "fixed";
      toc.style.top = `${top}px`;
      toc.style.left = `${r.left}px`;
      toc.style.width = `${r.width}px`;
    };
    const onScrollOrResize = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    // placeholder: 그리드 우측 컬럼(220px) 자리 차지. fixed 적용은 마운트 후 effect에서.
    <div ref={placeholderRef} className="hidden xl:block">
      <div
        ref={tocRef}
        // px-1: 인디케이터(-left-px)가 overflow에 안 잘리게
        className="max-h-[calc(100dvh-152px)] overflow-y-auto overscroll-contain px-1"
      >
        <TableOfContents items={items} />
      </div>
    </div>
  );
}

// 이만큼 스크롤하면 모바일 TOC 오버레이가 나타난다(헤딩/제목을 지난 뒤).
// ponytail: 제목 영역 높이 바뀌면 조정
const MOBILE_TOC_REVEAL = 240;

/**
 * 모바일/태블릿용 목차. 본문에 끼우지 않고 화면 상단에 fixed로 떠 있다.
 * 최상단에선 숨겨졌다가 스크롤하면 나타나며, 기본은 접힘(현재 섹션 + 진행 바)이고
 * 탭하면 목차가 펼쳐진다.
 */
export function MobileTableOfContents({ items }: TableOfContentsProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  // 진행 바 하나: 지금 읽는 챕터의 진행률(섹션 시작 0% → 다음 섹션 100%)
  const [chapterProgress, setChapterProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const flatItems = useMemo(() => flattenTocItems(items), [items]);
  const activeId = useTocIndicator(
    flatItems,
    navRef,
    indicatorRef,
    MOBILE_TOC_OFFSET,
  );

  const activeTitle =
    flatItems.find((item) => item.id === activeId)?.title ??
    flatItems[0]?.title ??
    "";

  // 노출 여부 + 현재 챕터 진행률(읽기 기준선이 현재 헤딩과 다음 헤딩 사이 어디인지)
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      setVisible(scrolled > MOBILE_TOC_REVEAL);

      const offset = MOBILE_TOC_OFFSET;
      const tops = flatItems.map((it) => {
        const el = document.getElementById(it.id);
        return el ? el.getBoundingClientRect().top : null;
      });
      // 현재 챕터 = 기준선을 지난 마지막 헤딩
      let idx = -1;
      tops.forEach((t, i) => {
        if (t != null && t <= offset) idx = i;
      });

      let p = 0;
      const start = idx >= 0 ? tops[idx] : null;
      if (start != null) {
        let end: number | null = null;
        for (let j = idx + 1; j < tops.length; j++) {
          if (tops[j] != null) {
            end = tops[j];
            break;
          }
        }
        const atBottom = scrolled + window.innerHeight >= doc.scrollHeight - 2;
        if (end == null) {
          p = atBottom
            ? 1
            : (offset - start) / Math.max(1, doc.clientHeight - start);
        } else {
          p = end > start ? (offset - start) / (end - start) : 1;
        }
      }
      setChapterProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [flatItems]);

  // 펼칠 때 리스트가 0→실제 높이로 자라므로, 펼침 직후 인디케이터를 다시 측정
  useEffect(() => {
    if (collapsed) return;
    const id = window.setTimeout(
      () => window.dispatchEvent(new Event("resize")),
      320,
    );
    return () => window.clearTimeout(id);
  }, [collapsed]);

  // 항목 탭(클릭/키보드 Enter 모두 click 발생): 카드를 접고,
  // 헤더+접힌 카드에 가리지 않게 직접 스크롤. 위임 리스너로 a11y 린트 회피.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onClick = (event: globalThis.MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      if (!link) return;
      event.preventDefault();
      const id = getHeadingId(link.getAttribute("href") ?? "");
      const element = id ? document.getElementById(id) : null;
      if (element) {
        const top =
          element.getBoundingClientRect().top +
          window.scrollY -
          MOBILE_TOC_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      }
      setCollapsed(true);
    };
    nav.addEventListener("click", onClick);
    return () => nav.removeEventListener("click", onClick);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "xl:hidden fixed top-[72px] inset-x-4 sm:inset-x-6 z-30 overflow-hidden",
        "rounded-2xl border border-warm-border",
        // 본문 위에 떠 있는 오버레이라 불투명해야 뒤 글자가 안 비친다
        "bg-warm-bg/95 backdrop-blur-md",
        "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
        "transition-[opacity,transform] duration-300",
        visible
          ? "opacity-100 translate-y-0"
          : "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className="relative block w-full overflow-hidden text-left"
      >
        {/* 현재 챕터 진행: 바 전체가 왼→오로 채워짐(따뜻한 연한색) */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-warm-primary/15 transition-[width] duration-150"
          style={{ width: `${chapterProgress * 100}%` }}
        />
        <span className="relative flex items-center gap-2 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-warm-muted"
          >
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-warm-text">
            <span key={activeId} className="block truncate animate-toc-title">
              {activeTitle}
            </span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn(
              "shrink-0 text-warm-muted transition-transform duration-300",
              collapsed && "-rotate-90",
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* 펼침: 목차 리스트 */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300",
          collapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {/* 목차가 길면 카드가 뷰포트를 넘으므로 높이를 제한하고 내부 스크롤.
              72(top)+48(헤더 버튼)+여백 ≈ 140px를 화면에서 제외 */}
          <div className="max-h-[calc(100dvh-150px)] overflow-y-auto overscroll-contain px-4 pt-1 pb-4">
            <nav ref={navRef} aria-label="목차" className="relative">
              <div
                ref={indicatorRef}
                aria-hidden="true"
                className="absolute -left-px top-0 w-0.5 rounded-full bg-warm-primary opacity-0 will-change-transform"
              />
              <TocLinks items={items} activeId={activeId} />
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
