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

export interface TableOfContentsProps {
  items: TocItem[];
}

export function flattenTocItems(items: TocItem[]): FlatTocItem[] {
  return items.flatMap((item) => {
    const id = getHeadingId(item.url);
    const children = item.items ? flattenTocItems(item.items) : [];

    return id ? [{ ...item, id }, ...children] : children;
  });
}

export function getHeadingId(url: string) {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return "";

  const hash = url.slice(hashIndex + 1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export function TocLinks({
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
 * 스크롤에 따라 활성 헤딩을 추적하고, 레일 위 인디케이터를 직접 DOM에 그림.
 * 데스크톱 사이드바와 모바일 카드가 공유.
 *
 * @param offsetOverride 활성 판정 기준선(px). 없으면 --scroll-offset + 4.
 */
export function useTocIndicator(
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
    // 바로 아래. 값이 어긋나면 TOC를 눌러도 인디케이터가 그 항목에 안 맞음.
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
      // 이 값으로 인디케이터를 항목 사이에서 연속적으로 보간.
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

      // 페이지 끝에 닿으면 마지막 항목까지 채움(상단 진행 바와 같은 감각)
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

      // 매 프레임 호출되므로 리렌더 없이 DOM에 직접 쓰기
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
