import Link from "next/link";
import type { NavLink } from "@/components/layout/header-nav";
import { cn } from "@/lib/utils";

// 메뉴 드롭다운 (모바일 햄버거 + xl 읽기모드 햄버거 공용)
export function MobileMenu({
  isOpen,
  links,
  pathname,
  onLinkClick,
}: {
  isOpen: boolean;
  links: NavLink[];
  pathname: string;
  onLinkClick: () => void;
}) {
  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "grid bg-transparent transition-[grid-template-rows,opacity,border-color] duration-300 ease-out motion-reduce:transition-none",
        isOpen
          ? "grid-rows-[1fr] border-b border-warm-border opacity-100"
          : "pointer-events-none grid-rows-[0fr] border-b border-transparent opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div className="flex flex-col gap-6 px-4 py-6 md:items-center md:text-center">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              tabIndex={isOpen ? undefined : -1}
              style={{
                transitionDelay: isOpen ? `${index * 35}ms` : "0ms",
              }}
              className={cn(
                "block w-full text-left text-lg font-medium tracking-tight transition duration-300 ease-out motion-reduce:transition-none md:w-auto md:text-center",
                isOpen
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
              isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
            )}
            style={{
              transitionDelay: isOpen ? `${links.length * 35}ms` : "0ms",
            }}
          >
            <a
              href="https://sngchn.dev"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isOpen ? undefined : -1}
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
  );
}
