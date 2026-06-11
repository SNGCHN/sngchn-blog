"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const flatItems = useMemo(() => flattenTocItems(items), [items]);

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
    const offset = scrollOffset + 4;

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

      setActiveId(headings[index].id);
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
  }, [flatItems]);

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
