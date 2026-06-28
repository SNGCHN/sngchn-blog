"use client";

import { useEffect, useRef, useState } from "react";
import { useLikeContext } from "@/components/post/like-provider";
import { cn } from "@/lib/utils";

export function FloatingMenu() {
  const { likes, liked, status, toggle } = useLikeContext();
  const [showTopButton, setShowTopButton] = useState(false);
  const [atComments, setAtComments] = useState(false);
  // visible: 또렷 / dim: 멈춤 시 반투명 / hidden: 읽으려 내리는 중 숨김
  const [pillState, setPillState] = useState<"visible" | "dim" | "hidden">(
    "visible",
  );
  const [pop, setPop] = useState(false);
  const popTimeoutRef = useRef<number | null>(null);
  const lastYRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const DELTA = 6; // 미세한 흔들림 무시용 임계값
    const handleScroll = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      lastYRef.current = y;

      setShowTopButton(y > 300);

      const atTop = y < 80;
      const atBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 80;

      // 스크롤이 멈추면 잠시 뒤 반투명으로 다시 등장
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => setPillState("dim"), 1000);

      if (atTop || atBottom) setPillState("visible");
      else if (dy > DELTA) setPillState("hidden");
      else if (dy < -DELTA) setPillState("visible");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  // 댓글 섹션이 보이면 알약은 중복이므로 숨김(섹션 위에 좋아요 버튼이 있음).
  useEffect(() => {
    const el = document.getElementById("comments-section");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setAtComments(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (popTimeoutRef.current) {
        window.clearTimeout(popTimeoutRef.current);
      }
    };
  }, []);

  const triggerPop = () => {
    setPop(false);
    window.requestAnimationFrame(() => setPop(true));
    if (popTimeoutRef.current) {
      window.clearTimeout(popTimeoutRef.current);
    }
    popTimeoutRef.current = window.setTimeout(() => setPop(false), 420);
  };

  const handleLike = () => {
    toggle();
    triggerPop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToComments = () => {
    document
      .getElementById("comments-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const likeTooltip =
    status === "rate-limited"
      ? "잠시 후 다시 시도해 주세요"
      : status === "error"
        ? "다시 시도해 주세요"
        : liked
          ? "좋아요 취소"
          : "좋아요";

  // 같은 색 페이지에서 묻히지 않게 다크 필로 대비(우하단 탑버튼과 같은 톤). 블러는 유지.
  const glass = "bg-warm-text/90 shadow-lg shadow-black/15 backdrop-blur-md";

  // 다크 필 위 밝은 아이콘: text-warm-bg/75 → hover 시 full
  const iconBtn =
    "group relative flex items-center justify-center rounded-full text-warm-bg/75 transition-colors duration-200 hover:text-warm-bg active:scale-90";

  const tooltipClass =
    "hidden lg:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-warm-text/80 text-warm-bg text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm";

  const HeartIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-colors duration-200",
        liked && "text-red-400",
      )}
      style={pop ? { animation: "heart-pop 0.42s ease" } : undefined}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );

  const CommentIcon = (
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
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );

  const ArrowUpIcon = (
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
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );

  // 숨김 상태에선 내부 버튼이 탭 포커스를 받지 않도록 inert로 서브트리째 비활성화.
  const pillHidden = atComments || pillState === "hidden";

  return (
    <>
      {/* 중앙 하단 유리 알약: 좋아요(수) + 댓글 */}
      <div
        className={cn(
          "fixed z-40 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full p-1.5",
          "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
          "transition duration-300 motion-reduce:transition-none",
          glass,
          pillHidden
            ? "pointer-events-none translate-y-3 opacity-0"
            : pillState === "dim"
              ? "translate-y-0 opacity-70 hover:opacity-100 focus-within:opacity-100"
              : "translate-y-0 opacity-100",
        )}
        aria-hidden={pillHidden}
        inert={pillHidden}
      >
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={liked}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className={cn(
            iconBtn,
            "h-9 gap-1.5 pl-2.5 pr-3",
            liked && "text-red-400 hover:text-red-400",
            status === "rate-limited" && "opacity-60",
          )}
        >
          <span className={tooltipClass}>{likeTooltip}</span>
          {HeartIcon}
          <span className="text-sm font-medium tabular-nums">{likes}</span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          aria-label="댓글 보기"
          className={cn(iconBtn, "w-9 h-9")}
        >
          <span className={tooltipClass}>댓글 보기</span>
          {CommentIcon}
        </button>
      </div>

      {/* 우하단 독립 탑버튼: 스크롤 시에만 부드럽게 등장 */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로"
        tabIndex={showTopButton ? 0 : -1}
        className={cn(
          "group fixed z-40 right-4 lg:right-8 flex items-center justify-center w-11 h-11 rounded-full transition duration-300 active:scale-90",
          "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
          "bg-warm-text text-warm-bg shadow-lg shadow-black/15 hover:opacity-90",
          showTopButton
            ? "opacity-100 translate-y-0"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <span className={tooltipClass}>맨 위로</span>
        {ArrowUpIcon}
      </button>
    </>
  );
}
