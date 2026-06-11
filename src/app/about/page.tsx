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
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sngchn",
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </>
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
          잘 정리된
          지식을 옮겨 적기보다는 직접 헤맨 과정을 다음에 다시 꺼내 쓸 수 있게
          남기려고 합니다.
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
                className="inline-flex items-center gap-2 rounded-full border border-warm-border px-4 py-2 text-sm font-medium text-warm-muted transition-colors hover:border-warm-primary/40 hover:text-warm-text"
              >
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
