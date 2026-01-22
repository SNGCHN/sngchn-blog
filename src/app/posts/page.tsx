import Link from "next/link";
import { posts } from "#site/content";
import { formatDate } from "@/lib/utils";

interface PageProps {
  searchParams?: {
    tag?: string;
  };
}

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

export default function PostsPage({ searchParams }: PageProps) {
  const tagParam = searchParams?.tag;
  const selectedTag = tagParam ? decodeURIComponent(tagParam) : null;

  const sortedPosts = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredPosts = selectedTag
    ? sortedPosts.filter((post) => post.tags.includes(selectedTag))
    : sortedPosts;

  const allTags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-warm-text mb-6 tracking-tight">
          Writings
        </h1>
        <p className="text-warm-muted text-lg mb-10">
          개발 여정의 기록들입니다.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/posts"
            className={
              selectedTag
                ? "px-4 py-2 rounded-full text-sm font-medium border bg-transparent text-warm-muted border-transparent hover:border-warm-border hover:bg-warm-bg"
                : "px-4 py-2 rounded-full text-sm font-medium border bg-warm-text text-warm-bg border-warm-text shadow-md"
            }
          >
            All
          </Link>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag.name;
            return (
              <Link
                key={tag.name}
                href={`/posts?tag=${encodeURIComponent(tag.name)}`}
                className={
                  isSelected
                    ? "px-4 py-2 rounded-full text-sm font-medium border bg-warm-text text-warm-bg border-warm-text shadow-md"
                    : "px-4 py-2 rounded-full text-sm font-medium border bg-transparent text-warm-muted border-transparent hover:border-warm-border hover:bg-warm-bg"
                }
              >
                {tag.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group flex flex-col h-full p-8 rounded-2xl border border-warm-border hover:border-warm-primary/30 hover:shadow-lg hover:shadow-warm-muted/5 bg-warm-bg/50 transition-colors"
          >
            <div className="flex flex-wrap gap-3 mb-6 text-xs font-bold tracking-wider text-warm-muted/60 uppercase">
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.metadata.readingTime} min read</span>
            </div>

            <h3 className="text-2xl font-bold text-warm-text mb-4 group-hover:text-warm-primary transition-colors duration-300 tracking-tight leading-snug">
              {post.title}
            </h3>

            {post.description && (
              <p className="text-warm-muted mb-8 flex-grow leading-relaxed break-keep">
                {post.description}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-warm-border/50">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-warm-primary bg-warm-muted/10 px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <p className="text-warm-muted text-lg">
              {selectedTag
                ? `"${selectedTag}" 태그가 포함된 글이 아직 없습니다.`
                : "아직 글이 없습니다."}
            </p>
            <Link
              href="/posts"
              className="mt-4 inline-block text-warm-primary hover:underline"
            >
              전체 글 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
