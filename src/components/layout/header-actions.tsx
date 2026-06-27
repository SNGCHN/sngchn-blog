import type { SVGProps } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// 검색 버튼 · 테마 토글 · 포트폴리오 링크 (데스크탑/모바일 양쪽 액션 클러스터)
export function HeaderActions({
  crumb,
  isMobileMenuOpen,
  onToggleMenu,
  onOpenSearch,
}: {
  crumb: string[] | null;
  isMobileMenuOpen: boolean;
  onToggleMenu: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <>
      {/* 데스크탑 우측 영역 */}
      <div className="relative hidden md:flex items-center gap-6">
        {/* xl 읽기모드 햄버거: absolute라 검색/테마/포트폴리오 레이아웃을 밀지 않음 */}
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="메뉴"
          aria-expanded={isMobileMenuOpen}
          className={cn(
            "absolute right-full mr-6 hidden h-5 w-5 items-center justify-center text-warm-text transition duration-300 xl:flex",
            crumb
              ? "xl:translate-x-0 xl:opacity-100"
              : "xl:pointer-events-none xl:translate-x-2 xl:opacity-0",
          )}
        >
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
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            "group inline-flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-full border border-warm-border bg-warm-bg/50 px-3 text-warm-muted transition-all duration-300 hover:border-warm-primary/50 hover:text-warm-text",
            // xl 읽기모드: 글귀만 오른쪽으로 접히며 검색 아이콘 버튼으로 수축
            crumb && "xl:gap-0 xl:px-2.5",
          )}
          aria-label="Open search"
        >
          <SearchIcon className="h-4 w-4 shrink-0" />
          <span
            className={cn(
              "max-w-20 overflow-hidden whitespace-nowrap text-xs font-mono opacity-70 transition-all duration-300 group-hover:opacity-100",
              crumb && "xl:max-w-0 xl:opacity-0",
            )}
          >
            Ctrl + K
          </span>
        </button>
        <ThemeToggle />
        <a
          href="https://sngchn.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group inline-flex items-center gap-1.5",
            "text-[15px] font-medium",
            "text-warm-primary hover:text-warm-text",
            "transition-colors duration-300",
          )}
        >
          포트폴리오
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
            className="transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* 모바일 우측 영역 */}
      <div className="flex md:hidden items-center gap-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="text-warm-text"
          aria-label="Open search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <ThemeToggle />
        <button
          type="button"
          onClick={onToggleMenu}
          className="text-warm-text"
          aria-label="메뉴 열기"
        >
          {isMobileMenuOpen ? (
            // X 아이콘
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
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            // Menu 아이콘
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
              aria-hidden="true"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
