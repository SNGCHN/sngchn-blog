"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderNav, type NavLink } from "@/components/layout/header-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ReadingCrumb } from "@/components/layout/reading-crumb";
import { SearchDialog } from "@/components/search/dialog";
import { useReadingCrumb } from "@/hooks/use-reading-crumb";
import { useSearchShortcut } from "@/hooks/use-search-shortcut";
import { cn } from "@/lib/utils";

const navLinks: NavLink[] = [
  { label: "홈", href: "/" },
  { label: "글 목록", href: "/posts" },
  { label: "태그", href: "/tags" },
  { label: "소개", href: "/about" },
];

/**
 * 블로그 헤더
 * 로고/읽기경로(ReadingCrumb), 네비(HeaderNav), 액션(HeaderActions),
 * 메뉴 드롭다운(MobileMenu), 검색 모달(SearchDialog)을 조립한다.
 */
export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { crumb, headProgress } = useReadingCrumb(pathname);

  useSearchShortcut(() => setIsSearchOpen(true));

  // 읽기모드(crumb) 해제되면 열려 있던 메뉴를 닫는다.
  useEffect(() => {
    if (!crumb) setIsMobileMenuOpen(false);
  }, [crumb]);

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
        <ReadingCrumb crumb={crumb} headProgress={headProgress} />
        <HeaderNav links={navLinks} pathname={pathname} crumb={crumb} />
        <HeaderActions
          crumb={crumb}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMenu={() => setIsMobileMenuOpen((v) => !v)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        links={navLinks}
        pathname={pathname}
        onLinkClick={() => setIsMobileMenuOpen(false)}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
