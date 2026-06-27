import Link from "next/link";
import { getAllTags } from "@/lib/posts";

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
