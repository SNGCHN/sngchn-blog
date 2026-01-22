"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  initialLikes: number;
}

export function LikeButton({ initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-full border border-warm-border hover:border-red-200 hover:bg-red-50/50 transition-all duration-300"
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
          isLiked ? "text-red-500 scale-110" : "text-warm-muted group-hover:text-red-400"
        )}
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      <span
        className={cn(
          "text-sm font-medium font-mono transition-colors",
          isLiked ? "text-red-600" : "text-warm-muted"
        )}
      >
        {likes}
      </span>
      <span className="sr-only">좋아요</span>
    </button>
  );
}
