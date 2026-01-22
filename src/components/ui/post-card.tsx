import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  title: string;
  slug: string;
  date: string;
  description?: string;
  readingTime?: number;
  tags?: string[];
}

/**
 * 블로그 포스트 카드 컴포넌트
 * 홈페이지, 글 목록 페이지에서 사용
 */
export function PostCard({
  title,
  slug,
  date,
  description,
  readingTime,
  tags,
}: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="group block">
      <article className="flex flex-col h-full p-8 rounded-2xl border border-warm-border hover:border-warm-primary/30 hover:shadow-lg hover:shadow-warm-muted/5 bg-warm-bg/50 transition-colors">
        <div className="flex flex-wrap gap-3 mb-6 text-xs font-mono text-warm-muted/60">
          <span>{formatDate(date)}</span>
          {readingTime && <span>• {readingTime} min</span>}
        </div>

        <h3 className="text-2xl font-bold text-warm-text mb-4 group-hover:text-warm-primary transition-colors duration-300 tracking-tight leading-snug">
          {title}
        </h3>

        {description && (
          <p className="text-warm-muted mb-8 flex-grow leading-relaxed break-keep">
            {description}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-warm-border/50">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-warm-primary bg-warm-muted/10 px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
