import Link from "next/link";
import { posts } from "#site/content";

/**
 * 모든 태그와 글 개수를 계산
 */
function getAllTags() {
  const tagCount: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  // 글 개수 내림차순 정렬
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-16">
        <h1 className="text-3xl font-bold text-warm-text mb-4 tracking-tight">
          태그
        </h1>
      </div>

      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="group inline-flex items-center gap-2 rounded-full bg-warm-muted/10 px-4 py-2 text-sm font-medium text-warm-muted transition-colors hover:bg-warm-primary/10 hover:text-warm-primary"
          >
            <span>#{tag.name}</span>
            <span className="text-xs text-warm-muted/50 group-hover:text-warm-primary/60">
              ({tag.count})
            </span>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-warm-muted">아직 태그가 없습니다.</p>
      )}
    </div>
  );
}
