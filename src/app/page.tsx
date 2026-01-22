import Link from "next/link";
import { posts } from "#site/content";
import { formatDate } from "@/lib/utils";

function getAllTags() {
  const tagCount: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export default function Home() {
  const recentPosts = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  const popularTags = getAllTags().slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-32">
      {/* Hero */}
      <section className="mb-32 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-warm-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-warm-text mb-8 leading-[0.9] break-keep">
          본질을 찾고, <br className="hidden md:block" />
          배움을 정리하는 공간
        </h1>
        <p className="text-xl md:text-2xl text-warm-muted max-w-xl leading-relaxed font-medium tracking-tight">
          배운 것을 정리하고,{" "}
          <br className="md:hidden" />
          다시 꺼내볼 수 있게 남깁니다.
        </p>
      </section>

      {/* Recent Posts */}
      <section className="mb-32">
        <div className="flex items-end justify-between mb-12 border-b border-warm-border pb-4">
          <h2 className="text-2xl font-bold text-warm-text tracking-tight">
            Latest Writings
          </h2>
          <Link
            href="/posts"
            className="group flex items-center gap-1 text-sm font-medium text-warm-muted hover:text-warm-text transition-colors"
          >
            All Posts
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
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-12">
          {recentPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link
                href={`/posts/${post.slug}`}
                className="block p-6 -mx-6 rounded-2xl hover:bg-warm-muted/5 transition-colors"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-warm-text group-hover:text-warm-primary transition-colors duration-300">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-warm-muted mb-5 max-w-2xl leading-relaxed break-keep text-lg">
                    {post.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-warm-muted/60">
                  <span>{formatDate(post.date)}</span>
                  <span className="w-1 h-1 bg-warm-border rounded-full" />
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Popular Tags */}
      <section>
        <h2 className="text-2xl font-bold text-warm-text mb-8 tracking-tight">
          Explore by Topics
        </h2>
        <div className="flex flex-wrap gap-3">
          {popularTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="px-5 py-2.5 rounded-xl border border-warm-border text-warm-muted font-medium hover:border-warm-primary hover:text-warm-text hover:bg-warm-bg shadow-sm hover:shadow transition-all duration-300 bg-warm-bg/50"
            >
              {tag.name}{" "}
              <span className="ml-1 opacity-40 text-xs">({tag.count})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
