import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string }>;
}

/**
 * 모든 고유 태그 목록 반환 (정적 생성용)
 */
export async function generateStaticParams() {
  const allTags = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      allTags.add(tag);
    }
  }

  return Array.from(allTags).map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag}`,
    description: `${decodedTag} 태그가 달린 글 목록`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  // 해당 태그를 가진 글 필터링
  const filteredPosts = posts
    .filter((post) => post.tags.includes(decodedTag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filteredPosts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <Link
          href="/tags"
          className="text-sm text-warm-muted hover:text-warm-text transition-colors mb-4 inline-block"
        >
          ← 모든 태그
        </Link>
        <h1 className="text-3xl font-bold text-warm-text tracking-tight">
          #{decodedTag}
        </h1>
        <p className="text-warm-muted mt-2">
          {filteredPosts.length}개의 글
        </p>
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
              <p className="text-warm-muted mb-8 flex-grow line-clamp-3 leading-relaxed break-keep">
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
      </div>
    </div>
  );
}
