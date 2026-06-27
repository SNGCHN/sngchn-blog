import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post/post-card";
import { getAllTags, getSortedPosts } from "@/lib/posts";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ name }) => ({ tag: encodeURIComponent(name) }));
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

  const filteredPosts = getSortedPosts().filter((post) =>
    post.tags.includes(decodedTag),
  );

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
        <p className="text-warm-muted mt-2">{filteredPosts.length}개의 글</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            descriptionClassName="line-clamp-3"
          />
        ))}
      </div>
    </div>
  );
}
