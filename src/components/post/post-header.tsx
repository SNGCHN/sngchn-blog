import Link from "next/link";
import type { Post } from "#site/content";
import { LikeButton } from "@/components/post/like-button";
import { formatDate } from "@/lib/utils";

export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="mb-12 border-b border-warm-border pb-8">
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="text-xs font-semibold tracking-wide text-warm-primary uppercase bg-warm-muted/10 px-2 py-1 rounded-md"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-warm-text mb-6 leading-[1.1] tracking-[-0.03em] break-keep">
        {post.title}
      </h1>

      {post.description && (
        <p className="text-xl text-warm-muted break-keep mb-6">
          {post.description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6 text-sm text-warm-muted font-mono">
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            약 {post.metadata.readingTime}분
          </span>
        </div>
        <LikeButton />
      </div>
    </header>
  );
}
