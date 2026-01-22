"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  initialLikes: number;
}

export function FloatingMenu({ initialLikes }: FloatingMenuProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastScrollYRef = useRef(0);
  const scrollStopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateDesktop = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : media.matches);
    };

    updateDesktop();

    if (media.addEventListener) {
      media.addEventListener("change", updateDesktop);
      return () => media.removeEventListener("change", updateDesktop);
    }

    media.addListener(updateDesktop);
    return () => media.removeListener(updateDesktop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setShowTopButton(currentScrollY > 300);

      if (isDesktop) {
        setIsVisible(true);
      } else {
        if (currentScrollY > 100 && currentScrollY > lastScrollYRef.current) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        if (scrollStopTimeoutRef.current) {
          window.clearTimeout(scrollStopTimeoutRef.current);
        }
        scrollStopTimeoutRef.current = window.setTimeout(() => {
          setIsVisible(true);
        }, 500);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollStopTimeoutRef.current) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }
    };
  }, [isDesktop]);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const buttonClass =
    "flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full transition-transform duration-200 active:scale-95 bg-warm-text text-warm-bg hover:opacity-90";

  const showActions = isDesktop || isVisible;

  const actionWrapperClass = cn(
    "relative group flex items-center justify-center lg:justify-end",
    "transition-[max-width,opacity,transform] duration-300 overflow-hidden",
    showActions
      ? "max-w-10 opacity-100 scale-100"
      : "max-w-0 opacity-0 scale-95 pointer-events-none",
    "lg:max-w-none lg:opacity-100 lg:scale-100"
  );

  const topDesktopWrapperClass = cn(
    "hidden lg:block transition-[max-height,opacity] duration-300 overflow-hidden origin-center",
    showTopButton ? "max-h-12 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
  );

  const topDesktopInnerClass = cn(
    "transition-transform duration-300",
    showTopButton ? "translate-y-0" : "translate-y-2"
  );

  const topMobileWrapperClass = cn(
    "fixed bottom-6 right-6 z-40 lg:hidden transition-[opacity,transform] duration-300",
    showTopButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
  );

  return (
    <>
      <div
        className={cn(
          "fixed z-40 transition-all duration-300 ease-in-out",
          "bottom-6 left-1/2 -translate-x-1/2 flex flex-row items-center",
          showActions ? "gap-3" : "gap-0",
          "lg:bottom-12 lg:left-auto lg:right-12 lg:translate-x-0 lg:flex-col lg:items-end lg:gap-4"
        )}
      >
      <div className={actionWrapperClass}>
        <span className="hidden lg:block absolute right-full mr-3 px-2 py-1 bg-warm-text/80 text-warm-bg text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">
          좋아요 {likes}
        </span>
        <button
          onClick={handleLike}
          className={cn(buttonClass, isLiked && "text-red-500")}
          aria-label="좋아요"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>

      <div className={actionWrapperClass}>
        <span className="hidden lg:block absolute right-full mr-3 px-2 py-1 bg-warm-text/80 text-warm-bg text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm backdrop-blur-sm">
          댓글 보기
        </span>
        <button onClick={scrollToComments} className={buttonClass} aria-label="댓글 보기">
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
          >
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          </svg>
        </button>
      </div>

        <div className={topDesktopWrapperClass}>
          <div
            className={cn(
              "relative group flex items-center justify-center lg:justify-end",
              topDesktopInnerClass
            )}
          >
          <span className="hidden lg:block absolute right-full mr-3 px-2 py-1 bg-warm-text/80 text-warm-bg text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm backdrop-blur-sm">
            맨 위로
          </span>
          <button onClick={scrollToTop} className={buttonClass} aria-label="맨 위로">
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
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </div>
        </div>
      </div>

      <div className={topMobileWrapperClass}>
        <button onClick={scrollToTop} className={buttonClass} aria-label="맨 위로">
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
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}
