"use client";

import { useLike } from "@/hooks/use-like";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
}

export function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const { likes, isLiked, status, handleLike } = useLike(slug, initialLikes);

  const isRateLimited = status === "rate-limited";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleLike}
        disabled={status !== "idle"}
        className={cn(
          "group relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
          isRateLimited
            ? "border-warm-border bg-warm-muted/5 cursor-not-allowed"
            : isLiked
              ? "border-red-200 hover:border-warm-border hover:bg-transparent"
              : "border-warm-border hover:border-red-200 hover:bg-red-50/50"
        )}
        aria-label="좋아요"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "transition-all duration-300",
            isRateLimited
              ? "text-warm-muted"
              : isLiked
                ? "text-red-500 scale-110"
                : "text-warm-muted group-hover:text-red-400"
          )}
          aria-hidden="true"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
        <span
          className={cn(
            "text-sm font-medium font-mono transition-colors",
            isRateLimited ? "text-warm-muted" : isLiked ? "text-red-600" : "text-warm-muted"
          )}
        >
          {likes}
        </span>
        <span className="sr-only">좋아요</span>
      </button>

      {isRateLimited && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="relative z-10 whitespace-nowrap rounded-md border border-warm-border bg-warm-bg px-2 py-1 text-xs text-warm-muted">
            Please try again in a moment.
          </p>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-warm-bg border-r border-b border-warm-border rotate-45" />
        </div>
      )}
    </div>
  );
}
