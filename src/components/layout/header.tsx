"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type SVGProps, useEffect, useRef, useState } from "react";
import { SearchDialog } from "@/components/search/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import type { SearchPost } from "@/types/post";

const navLinks = [
  { label: "홈", href: "/" },
  { label: "글 목록", href: "/posts" },
  { label: "태그", href: "/tags" },
  { label: "소개", href: "/about" },
];

interface HeaderProps {
  searchPosts: SearchPost[];
}

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
export function Header({ searchPosts }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // 글을 내리면 로고 자리를 "글제목 › H2 › H3" 경로로 교체(null이면 로고)
  const [crumb, setCrumb] = useState<string[] | null>(null);
  // 현재 헤딩이 헤더 선을 넘는 진행률(0=막 닿음 → 1=완전히 들어옴). 마지막 세그먼트가 스크롤에 맞춰 쏙 들어오게 한다.
  const [headProgress, setHeadProgress] = useState(1);
  const crumbKeyRef = useRef("");
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!crumb) setIsMobileMenuOpen(false);
  }, [crumb]);

  // 글 상세에서만: 제목이 헤더 위로 올라가면 현재 섹션 경로를 만든다.
  useEffect(() => {
    const isPost = pathname.startsWith("/posts/") && pathname !== "/posts";
    const commit = (parts: string[] | null) => {
      const key = parts ? parts.join("") : "";
      if (key === crumbKeyRef.current) return;
      crumbKeyRef.current = key;
      setCrumb(parts);
    };
    if (!isPost) {
      commit(null);
      return;
    }

    const HEADER = 64; // 헤더 높이(h-16)
    let frame = 0;
    const compute = () => {
      frame = 0;
      const article = document.querySelector("main article");
      const titleEl = article?.querySelector("h1");
      // 제목이 아직 헤더 아래 보이면 로고 유지
      if (
        !article ||
        !titleEl ||
        titleEl.getBoundingClientRect().bottom >= HEADER
      ) {
        commit(null);
        return;
      }
      // 제목(첫 h1)을 뺀 본문 헤딩 중, 기준선을 지난 마지막 헤딩의 계층 경로.
      // 레벨에 의존하지 않으므로 본문이 h1·h2 어느 조합을 써도 반영된다.
      const headings = [...article.querySelectorAll("h1, h2, h3, h4")].filter(
        (h) => h !== titleEl,
      );
      // 보더박스가 아닌 실제 글자 위치. h1은 padding-top/border-top이 있어
      // 보더박스 상단이 글자보다 한참 위라, 이걸 빼야 h2와 타이밍이 맞는다.
      const textTop = (h: Element) =>
        h.getBoundingClientRect().top +
        (Number.parseFloat(getComputedStyle(h).paddingTop) || 0);
      let curIdx = -1;
      headings.forEach((h, i) => {
        if (textTop(h) <= HEADER + 8) curIdx = i;
      });
      if (curIdx < 0) {
        commit(null);
        return;
      }
      const path: string[] = [];
      let need = 7;
      for (let i = curIdx; i >= 0; i--) {
        const lvl = Number(headings[i].tagName[1]);
        if (lvl < need) {
          path.unshift(headings[i].textContent?.trim() ?? "");
          need = lvl;
        }
      }
      commit(path);

      // 현재(가장 깊은) 헤딩이 헤더 선을 넘어 들어온 정도. 44px 구간에서 0→1.
      // 막 넘은 순간 마지막 세그먼트가 본문 헤딩 위치쯤에서 시작해 위로 쏙 들어온다.
      const top = textTop(headings[curIdx]);
      const p = reduceMotionRef.current
        ? 1
        : Math.min(1, Math.max(0, (HEADER + 8 - top) / 44));
      setHeadProgress((prev) => (Math.abs(prev - p) < 0.001 ? prev : p));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-warm-border",
        "bg-warm-bg/80",
        "backdrop-blur-md transition-colors duration-300",
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 로고 ↔ 읽는 중 섹션 경로(본문 h1 › h2).
            경로는 absolute라 레이아웃을 안 바꿈 → 네비게이션은 고정. */}
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
                  // 마지막 세그먼트만 스크롤 진행률에 묶여 아래에서 위로 들어온다
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
                    <span className="mx-1.5 font-normal text-warm-muted/60">
                      ›
                    </span>
                  )}
                  {part}
                </span>
              );
            })}
          </Link>
        </div>

        {/* 데스크탑 네비게이션 (xl 읽기모드: 오른쪽으로 슬라이드+페이드 아웃) */}
        <nav
          className={cn(
            "hidden md:flex items-center gap-8 transition-opacity duration-300 motion-reduce:transition-none",
            crumb && "xl:pointer-events-none xl:opacity-0",
          )}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[15px] transition-colors duration-300",
                pathname === link.href
                  ? "font-semibold text-warm-text"
                  : "text-warm-muted hover:text-warm-text",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 데스크탑 우측 영역 */}
        <div className="relative hidden md:flex items-center gap-6">
          {/* xl 읽기모드 햄버거: absolute라 검색/테마/포트폴리오 레이아웃을 밀지 않음 */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
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
            onClick={() => setIsSearchOpen(true)}
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
            onClick={() => setIsSearchOpen(true)}
            className="text-warm-text"
            aria-label="Open search"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <button
            type="button"
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
      </div>

      {/* 메뉴 드롭다운 (모바일 햄버거 + xl 읽기모드 햄버거 공용) */}
      <div
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          "grid bg-transparent transition-[grid-template-rows,opacity,border-color] duration-300 ease-out motion-reduce:transition-none",
          isMobileMenuOpen
            ? "grid-rows-[1fr] border-b border-warm-border opacity-100"
            : "pointer-events-none grid-rows-[0fr] border-b border-transparent opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 px-4 py-6 md:items-center md:text-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                tabIndex={isMobileMenuOpen ? undefined : -1}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 35}ms` : "0ms",
                }}
                className={cn(
                  "block w-full text-left text-lg font-medium tracking-tight transition duration-300 ease-out motion-reduce:transition-none md:w-auto md:text-center",
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                  pathname === link.href ? "text-warm-text" : "text-warm-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div
              className={cn(
                "border-t border-warm-border pt-6 transition duration-300 ease-out motion-reduce:transition-none md:hidden",
                isMobileMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-2 opacity-0",
              )}
              style={{
                transitionDelay: isMobileMenuOpen
                  ? `${navLinks.length * 35}ms`
                  : "0ms",
              }}
            >
              <a
                href="https://sngchn.dev"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isMobileMenuOpen ? undefined : -1}
                className="flex items-center gap-2 text-lg font-medium text-warm-primary md:justify-center"
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
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={searchPosts}
      />
    </header>
  );
}
