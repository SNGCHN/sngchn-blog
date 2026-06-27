import Link from "next/link";

const stack: { label: string; value: string }[] = [
  { label: "Framework", value: "Next.js · React" },
  { label: "Content", value: "MDX · Velite" },
  { label: "Styling", value: "Tailwind CSS" },
  { label: "Code", value: "Shiki" },
  { label: "Comments", value: "Giscus" },
  { label: "Likes", value: "Upstash Redis" },
  { label: "Tooling", value: "Biome · pnpm" },
];

const socials: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "GitHub",
    href: "https://github.com/sngchn",
    icon: (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.04c-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.755-1.333-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.102.81 2.222v3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sngchn",
    icon: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32">
      <section className="relative mb-28">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-warm-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <h1 className="mb-8 text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-warm-text leading-[1.05] break-keep">
          흘려보내기 아까운 것들을
          <br className="hidden md:block" /> 여기에 적어 둡니다.
        </h1>
        <p className="max-w-2xl text-xl text-warm-muted leading-relaxed break-keep">
          개발하며 배운 것, 만들며 부딪힌 것을 정리해 두는 공간입니다.
        </p>
        <p className="max-w-2xl text-xl text-warm-muted leading-relaxed break-keep">
          잘 정리된 지식을 옮겨 적기보다는 직접 헤맨 과정을 다음에 다시 꺼내 쓸
          수 있게 남기려고 합니다.
        </p>
      </section>

      <div className="space-y-20">
        <section>
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wider text-warm-muted/60">
            Built with
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl">
            {stack.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-b border-warm-border/60 pb-3"
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-warm-muted/60">
                  {item.label}
                </dt>
                <dd className="text-right text-warm-text">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Explore */}
        <section>
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wider text-warm-muted/60">
            Explore
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/posts"
              className="group inline-flex items-center gap-2 text-lg font-medium text-warm-text transition-colors hover:text-warm-primary"
            >
              전체 글 둘러보기
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
            <Link
              href="/tags"
              className="group inline-flex items-center gap-2 text-lg font-medium text-warm-text transition-colors hover:text-warm-primary"
            >
              태그로 찾아보기
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
          </div>
        </section>

        {/* Elsewhere */}
        <section>
          <h2 className="mb-6 font-mono text-xs uppercase tracking-wider text-warm-muted/60">
            Elsewhere
          </h2>
          <div className="flex flex-wrap gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-warm-muted/10 px-4 py-2 text-sm font-medium text-warm-muted transition-colors hover:bg-warm-primary/10 hover:text-warm-text"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {social.icon}
                </svg>
                {social.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
