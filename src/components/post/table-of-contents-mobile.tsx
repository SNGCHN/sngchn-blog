"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  flattenTocItems,
  getHeadingId,
  type TableOfContentsProps,
  TocLinks,
  useTocIndicator,
} from "@/components/post/table-of-contents";
import { cn } from "@/lib/utils";

const MOBILE_TOC_OFFSET = 128;

// 이만큼 스크롤하면 모바일 TOC 오버레이가 나타난다(헤딩/제목을 지난 뒤).
// NOTE(yagni): 제목 영역 높이 바뀌면 조정
const MOBILE_TOC_REVEAL = 240;

/**
 * 모바일/태블릿용 목차. 본문에 끼우지 않고 화면 상단에 fixed로 떠 있음.
 * 최상단에선 숨겨졌다가 스크롤하면 나타나며, 기본은 접힘(현재 섹션 + 진행 바)이고
 * 탭하면 목차가 펼쳐짐.
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
        // 본문 위에 떠 있는 오버레이라 불투명해야 뒤 글자가 안 비침
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
