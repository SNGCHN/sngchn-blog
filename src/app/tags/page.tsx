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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
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
            className="group flex items-center justify-between gap-4 px-5 py-3 rounded-lg border border-warm-border hover:border-warm-primary transition-all duration-300 min-w-[160px]"
          >
            <span className="font-medium text-warm-text group-hover:text-warm-primary transition-colors">
              {tag.name}
            </span>
            <span className="text-xs font-mono text-warm-muted">
              {tag.count}
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
