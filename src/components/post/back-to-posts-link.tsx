import Link from "next/link";
import { cn } from "@/lib/utils";

export function BackToPostsLink({ className }: { className?: string }) {
  return (
    <Link
      href="/posts"
      className={cn(
        "mb-12 inline-flex w-fit items-center gap-2 text-sm font-medium text-warm-muted hover:text-warm-text transition-colors duration-300 group",
        className,
      )}
    >
      <span className="w-6 h-6 rounded-full bg-warm-border/30 flex items-center justify-center group-hover:bg-warm-primary group-hover:text-warm-bg transition-colors">
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
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </span>
      목록으로 돌아가기
    </Link>
  );
}
