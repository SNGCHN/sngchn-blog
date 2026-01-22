"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 다크/라이트 모드 토글 버튼
 *
 * 동작 방식:
 * 1. 기본: CSS @media (prefers-color-scheme)로 시스템 설정 따라감
 * 2. 토글 시: data-theme 속성으로 수동 오버라이드 + localStorage 저장
 * 3. 재방문 시: localStorage에 저장된 값 적용
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  // 마운트 시 저장된 테마 확인
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    if (savedTheme) {
      // 저장된 테마가 있으면 적용
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // 없으면 시스템 설정 감지 (아이콘 표시용)
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
      // data-theme은 설정 안 함 → CSS 미디어 쿼리가 처리
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // SSR 중에는 placeholder 렌더링
  if (!mounted) {
    return <div className="w-[34px] h-[34px]" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-1.5 rounded-md transition-colors duration-300",
        "text-warm-muted hover:text-warm-text",
        "hover:bg-warm-border/30"
      )}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      {theme === "light" ? (
        // Moon 아이콘 (현재 라이트 → 다크로 전환)
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
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        // Sun 아이콘 (현재 다크 → 라이트로 전환)
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
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
