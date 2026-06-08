"use client";

import { useEffect, useMemo, useState } from "react";
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
                "block border-l-2 py-1 pl-4 transition-colors",
                "-ml-[17px]",
                depth > 0 && "text-[13px]",
                isActive
                  ? "border-warm-primary text-warm-text"
                  : "border-transparent text-warm-muted hover:border-warm-muted hover:text-warm-text",
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
  const flatItems = useMemo(() => flattenTocItems(items), [items]);

  useEffect(() => {
    if (flatItems.length === 0) return;

    let frameId: number | null = null;

    const updateActiveHeading = () => {
      frameId = null;

      const headingPositions = flatItems
        .map((item) => {
          const element = document.getElementById(item.id);
          if (!element) return null;

          return {
            id: item.id,
            top: element.getBoundingClientRect().top,
          };
        })
        .filter((item): item is { id: string; top: number } => item !== null);

      if (headingPositions.length === 0) return;

      const activationOffset = 128;
      const visibleHeading = headingPositions.find(
        (item) =>
          item.top >= activationOffset && item.top <= window.innerHeight * 0.45,
      );

      if (visibleHeading) {
        setActiveId(visibleHeading.id);
        return;
      }

      let currentId = headingPositions[0].id;
      for (const item of flatItems) {
        const element = document.getElementById(item.id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= activationOffset) {
          currentId = item.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    updateActiveHeading();
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
    <nav aria-label="Table of contents">
      <TocLinks items={items} activeId={activeId} />
    </nav>
  );
}
