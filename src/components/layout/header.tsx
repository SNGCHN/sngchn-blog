"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "홈", href: "/" },
  { label: "글 목록", href: "/posts" },
  { label: "태그", href: "/tags" },
  { label: "소개", href: "/about" },
];

/**
 * 블로그 헤더 컴포넌트
 *
 * 구성:
 * - 로고 (홈 링크)
 * - 데스크탑 네비게이션
 * - 모바일 햄버거 메뉴
 * - 테마 토글
 * - Portfolio 외부 링크
 */
export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-warm-border",
        "bg-warm-bg/80",
        "backdrop-blur-md transition-colors duration-300"
      )}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="font-bold text-lg tracking-[-0.02em] hover:opacity-70 transition-opacity text-warm-text"
        >
          sngchn.blog
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[15px] transition-colors duration-300",
                pathname === link.href
                  ? "font-semibold text-warm-text"
                  : "text-warm-muted hover:text-warm-text"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 데스크탑 우측 영역 */}
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <a
            href="https://sngchn.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-center gap-1.5",
              "text-[15px] font-medium",
              "text-warm-primary hover:text-warm-text",
              "transition-colors duration-300"
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
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* 모바일 우측 영역 */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-warm-border bg-warm-bg">
          <div className="px-4 py-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block w-full text-left text-lg font-medium tracking-tight",
                  pathname === link.href
                    ? "text-warm-text"
                    : "text-warm-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-warm-border">
              <a
                href="https://sngchn.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg font-medium text-warm-primary"
              >
                포트폴리오
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
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
