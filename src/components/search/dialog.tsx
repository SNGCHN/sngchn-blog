"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { SearchPost } from "@/types/post";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const pattern = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  return text.split(pattern).map((part, index) =>
    part.toLowerCase() === trimmedQuery.toLowerCase() ? (
      <mark
        // biome-ignore lint/suspicious/noArrayIndexKey: Split parts have no stable IDs.
        key={index}
        className="rounded-sm bg-warm-primary/15 px-0.5 text-warm-text"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

// 본문에서 매칭 지점 주변을 잘라 스니펫을 만든다. 빈 query/매칭 없으면 null.
function buildSnippet(text: string, query: string, radius = 70) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return null;

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + trimmed.length + radius);
  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  return prefix + text.slice(start, end).trim() + suffix;
}

function formatSearchDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  // 검색 인덱스(본문 포함)는 모달이 처음 열릴 때만 가져온다. null = 아직 미로드.
  const [posts, setPosts] = useState<SearchPost[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  // React Compiler가 메모이즈하므로 useMemo 불필요. 키보드 effect는 이 값을
  // dependency로 들지 않고 아래 ref로 최신값을 읽는다(리스너 재등록 방지).
  const lowerQuery = trimmedQuery.toLowerCase();
  const searchResults =
    trimmedQuery && posts
      ? posts.filter(
          (post) =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.description.toLowerCase().includes(lowerQuery) ||
            post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
            post.searchText.toLowerCase().includes(lowerQuery),
        )
      : [];

  // 키보드 핸들러가 읽는 최신 상태(매 렌더 갱신). effect는 isOpen에만 의존.
  const keyStateRef = useRef({ searchResults, selectedIndex, onClose, router });
  keyStateRef.current = { searchResults, selectedIndex, onClose, router };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 모달이 처음 열릴 때 정적 검색 인덱스를 lazy load (한 번만).
  useEffect(() => {
    if (!isOpen || posts) return;

    let cancelled = false;
    setLoadError(false);
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`search index ${res.status}`);
        return res.json();
      })
      .then((data: SearchPost[]) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, posts]);

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setSelectedIndex(0);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { searchResults, selectedIndex, onClose, router } =
        keyStateRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (searchResults.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) =>
          current < searchResults.length - 1 ? current + 1 : current,
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current > 0 ? current - 1 : current));
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selectedPost = searchResults[selectedIndex];
        if (selectedPost) {
          onClose();
          router.push(`/posts/${selectedPost.slug}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= searchResults.length) {
      setSelectedIndex(Math.max(searchResults.length - 1, 0));
    }
  }, [searchResults.length, selectedIndex]);

  useEffect(() => {
    const selectedElement = resultsRef.current?.children.item(selectedIndex);
    if (selectedElement instanceof HTMLElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-6 sm:px-6 sm:py-12">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-warm-bg/80"
        aria-label="Close search"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search posts"
        className="relative mt-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-warm-border bg-warm-bg shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-warm-border px-4 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-warm-muted"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search posts by title, content, or tag"
            className="min-w-0 flex-1 bg-transparent text-base text-warm-text outline-none placeholder:text-warm-muted sm:text-lg"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg p-1.5 text-warm-muted transition-colors hover:bg-warm-muted/10 hover:text-warm-text"
              aria-label="Clear search"
            >
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
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-warm-muted transition-colors hover:bg-warm-muted/10 hover:text-warm-text"
            aria-label="Close search"
          >
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto py-2">
          {!trimmedQuery ? (
            <div className="px-6 py-12 text-center">
              <p className="text-warm-muted">Type to search posts.</p>
            </div>
          ) : loadError ? (
            <div className="px-6 py-12 text-center">
              <p className="text-warm-muted">
                Couldn't load search. Close and try again.
              </p>
            </div>
          ) : !posts ? (
            <div className="px-6 py-12 text-center">
              <p className="text-warm-muted">Searching…</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-warm-muted">
                No results for{" "}
                <span className="font-medium text-warm-text">
                  {trimmedQuery}
                </span>
                .
              </p>
            </div>
          ) : (
            searchResults.map((post, index) => {
              // 제목·요약에 없고 본문에서만 걸린 경우, 왜 떴는지 보이게 스니펫 표시
              const inTitleOrDesc =
                post.title.toLowerCase().includes(lowerQuery) ||
                post.description.toLowerCase().includes(lowerQuery);
              const snippet = inTitleOrDesc
                ? null
                : buildSnippet(post.searchText, trimmedQuery);

              return (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "block border-l-2 px-4 py-3 transition-colors hover:bg-warm-muted/5",
                    selectedIndex === index
                      ? "border-warm-primary bg-warm-muted/5"
                      : "border-transparent",
                  )}
                >
                  {post.series ? (
                    <div className="mb-2 flex items-center gap-2 text-xs">
                      <span className="font-medium text-warm-primary">
                        {post.series.name}
                      </span>
                      <span className="text-warm-muted/60">
                        Part {post.series.order}
                      </span>
                    </div>
                  ) : null}
                  <h3 className="mb-1 text-lg font-bold text-warm-text">
                    {highlightText(post.title, trimmedQuery)}
                  </h3>
                  {snippet ? (
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-warm-muted">
                      {highlightText(snippet, trimmedQuery)}
                    </p>
                  ) : post.description ? (
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-warm-muted">
                      {highlightText(post.description, trimmedQuery)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-warm-muted/60">
                    <span>{formatSearchDate(post.date)}</span>
                    {post.tags.length > 0 ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-warm-border" />
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag}>
                              #{highlightText(tag, trimmedQuery)}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {searchResults.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-border bg-warm-muted/5 px-4 py-3 text-xs text-warm-muted/70">
            <span>Use Arrow keys to move.</span>
            <span>Enter to open. Esc to close.</span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
