import Link from "next/link";

const links: { label: string; href: string }[] = [
  { label: "홈으로 돌아가기", href: "/" },
  { label: "전체 글 둘러보기", href: "/posts" },
  { label: "태그로 찾아보기", href: "/tags" },
];

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32">
      <section className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-warm-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <p className="mb-6 font-mono text-xs uppercase tracking-wider text-warm-muted/60">
          Error 404
        </p>

        <h1 className="mb-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-warm-text leading-[1.05] break-keep">
          페이지를 찾을 수 없어요.
        </h1>
        <p className="max-w-2xl text-xl text-warm-muted leading-relaxed break-keep">
          주소가 바뀌었거나, 사라진 글일 수 있어요. 아래에서 다시 길을
          찾아보세요.
        </p>

        <div className="mt-12 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex items-center gap-2 text-lg font-medium text-warm-text transition-colors hover:text-warm-primary"
            >
              {link.label}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
