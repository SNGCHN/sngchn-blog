import Link from "next/link";
import { cn } from "@/lib/utils";

// 로고 ↔ 읽는 중 섹션 경로(본문 h1 › h2).
// 경로는 absolute라 레이아웃을 안 바꿈 → 네비게이션은 고정.
export function ReadingCrumb({
  crumb,
  headProgress,
}: {
  crumb: string[] | null;
  headProgress: number;
}) {
  return (
    <div className="relative group">
      <Link
        href="/"
        tabIndex={crumb ? -1 : undefined}
        className={cn(
          "block h-7 leading-7 font-bold text-lg tracking-[-0.02em] text-warm-text transition duration-300 hover:opacity-70 motion-reduce:transition-none",
          crumb &&
            "xl:-translate-y-2 xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100",
        )}
      >
        sngchn.blog
      </Link>
      <Link
        href="/"
        aria-label="홈으로 이동"
        tabIndex={crumb ? 0 : -1}
        aria-hidden={!crumb}
        className={cn(
          "absolute left-0 top-0 hidden h-7 max-w-2xl truncate text-left font-bold text-lg leading-7 tracking-[-0.02em] text-warm-text transition duration-300 hover:opacity-70 motion-reduce:transition-none xl:block",
          crumb
            ? "xl:translate-y-0 xl:opacity-100 xl:group-hover:translate-y-2 xl:group-hover:opacity-0"
            : "xl:pointer-events-none xl:translate-y-2 xl:opacity-0",
        )}
      >
        {crumb?.map((part, i) => {
          const isLast = i === crumb.length - 1;
          return (
            <span
              key={`${i}-${part}`}
              className={cn(
                "inline-block will-change-transform",
                isLast ? "text-warm-text" : "text-warm-muted",
              )}
              // 마지막 세그먼트만 스크롤 진행률에 묶여 아래에서 위로 진입
              style={
                isLast
                  ? {
                      transform: `translateY(${(1 - headProgress) * 12}px)`,
                      opacity: 0.3 + 0.7 * headProgress,
                    }
                  : undefined
              }
            >
              {i > 0 && (
                <span className="mx-1.5 font-normal text-warm-muted/60">›</span>
              )}
              {part}
            </span>
          );
        })}
      </Link>
    </div>
  );
}
