import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { getAllTags, getSortedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tag?: string | string[] }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { tag: tagParam } = await searchParams;
  const tagValue = Array.isArray(tagParam) ? tagParam[0] : tagParam;
  const selectedTag = tagValue ? decodeURIComponent(tagValue) : null;

  const sortedPosts = getSortedPosts();

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
                ? "px-4 py-2 rounded-full text-sm font-medium bg-warm-muted/10 text-warm-muted transition-colors hover:bg-warm-primary/10 hover:text-warm-primary"
                : "px-4 py-2 rounded-full text-sm font-medium bg-warm-text text-warm-bg shadow-md"
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
                    ? "px-4 py-2 rounded-full text-sm font-medium bg-warm-text text-warm-bg shadow-md"
                    : "px-4 py-2 rounded-full text-sm font-medium bg-warm-muted/10 text-warm-muted transition-colors hover:bg-warm-primary/10 hover:text-warm-primary"
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
          <PostCard key={post.slug} post={post} />
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
