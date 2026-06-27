"use client";

import Link from "next/link";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";

export type SeriesInfo = {
  name: string;
  slug: string;
  order: number;
};

export type SeriesPost = {
  title: string;
  slug: string;
  date: string;
  series?: SeriesInfo;
};

interface SeriesTableOfContentsProps {
  currentSlug: string;
  currentSeries?: SeriesInfo;
  posts: SeriesPost[];
}

export function SeriesTableOfContents({
  currentSlug,
  currentSeries,
  posts,
}: SeriesTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!currentSeries) return null;

  const seriesPosts = posts
    .filter((post) => post.series?.slug === currentSeries.slug)
    .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0));

  if (seriesPosts.length === 0) return null;

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentSlug,
  );

  return (
    <section className="mb-12 overflow-hidden rounded-2xl border border-warm-border bg-warm-muted/5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition-colors",
          isOpen && "border-b border-warm-border/50",
          "hover:bg-warm-muted/5",
        )}
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-bg text-warm-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wider text-warm-muted">
              Series
            </span>
            <span className="mt-1 block truncate text-lg font-bold text-warm-text">
              {currentSeries.name}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-warm-bg px-3 py-1 text-xs font-medium text-warm-muted">
            Part {currentIndex + 1} of {seriesPosts.length}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "text-warm-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <ol className="divide-y divide-warm-border/50">
          {seriesPosts.map((post) => {
            const isCurrent = post.slug === currentSlug;
            const order = post.series?.order ?? 0;

            return (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "group flex items-start gap-4 px-5 py-4 transition-colors",
                    isCurrent ? "bg-warm-primary/5" : "hover:bg-warm-muted/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isCurrent
                        ? "bg-warm-primary text-warm-bg"
                        : "bg-warm-bg text-warm-muted group-hover:text-warm-primary",
                    )}
                  >
                    {order}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-medium transition-colors",
                        isCurrent
                          ? "text-warm-primary"
                          : "text-warm-text group-hover:text-warm-primary",
                      )}
                    >
                      {post.title}
                    </span>
                    <span className="mt-1 block text-xs text-warm-muted/70">
                      {formatDate(post.date)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
