"use client";

import { useEffect, useRef } from "react";
import {
  TableOfContents,
  type TableOfContentsProps,
} from "@/components/post/table-of-contents";

// 데스크톱 고정 TOC의 뷰포트 상단 거리(헤더 64 + 여백). NOTE(yagni): 헤더 높이 바뀌면 조정
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
