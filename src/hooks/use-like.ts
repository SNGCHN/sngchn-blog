"use client";

import { useEffect, useState } from "react";
import { toggleLike } from "@/app/actions";

export type LikeStatus = "idle" | "pending" | "rate-limited";

export function useLike(slug: string, initialLikes: number) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [status, setStatus] = useState<LikeStatus>("idle");

  useEffect(() => {
    setIsLiked(localStorage.getItem(`liked:${slug}`) === "true");

    const handler = (e: Event) => {
      const { slug: eventSlug, likes: newLikes, isLiked: newIsLiked } = (
        e as CustomEvent
      ).detail;
      if (eventSlug === slug) {
        setLikes(newLikes);
        setIsLiked(newIsLiked);
      }
    };

    window.addEventListener("like-changed", handler);
    return () => window.removeEventListener("like-changed", handler);
  }, [slug]);

  const handleLike = async () => {
    if (status !== "idle") return;
    setStatus("pending");

    const newLiked = !isLiked;

    // 낙관적 업데이트
    setIsLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const newCount = await toggleLike(slug, newLiked);
      setLikes(newCount);

      if (newLiked) {
        localStorage.setItem(`liked:${slug}`, "true");
      } else {
        localStorage.removeItem(`liked:${slug}`);
      }

      window.dispatchEvent(
        new CustomEvent("like-changed", {
          detail: { slug, likes: newCount, isLiked: newLiked },
        })
      );
      setStatus("idle");
    } catch {
      // 레이트리밋: 롤백 후 amber 메시지 표시
      setIsLiked(!newLiked);
      setLikes((prev) => (newLiked ? Math.max(0, prev - 1) : prev + 1));
      setStatus("rate-limited");
      window.setTimeout(() => setStatus("idle"), 10_000);
    }
  };

  return { likes, isLiked, status, handleLike };
}
