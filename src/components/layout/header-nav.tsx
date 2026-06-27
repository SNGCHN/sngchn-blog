import Link from "next/link";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };

// 데스크탑 네비게이션 (xl 읽기모드: 오른쪽으로 슬라이드+페이드 아웃)
export function HeaderNav({
  links,
  pathname,
  crumb,
}: {
  links: NavLink[];
  pathname: string;
  crumb: string[] | null;
}) {
  return (
    <nav
      className={cn(
        "hidden md:flex items-center gap-8 transition-opacity duration-300 motion-reduce:transition-none",
        crumb && "xl:pointer-events-none xl:opacity-0",
      )}
    >
      {links.map((link) => (
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
  );
}
