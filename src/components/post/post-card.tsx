import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    description?: string;
    date: string;
    tags: string[];
    metadata: {
      readingTime: number;
    };
  };
  descriptionClassName?: string;
}

export function PostCard({ post, descriptionClassName }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl bg-warm-bg/50 p-8 transition-[background-color,box-shadow] hover:bg-warm-muted/5 hover:shadow-lg hover:shadow-warm-muted/5"
    >
      <div className="mb-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-warm-muted/60">
        <span>{formatDate(post.date)}</span>
        <span>•</span>
        <span>약 {post.metadata.readingTime}분</span>
      </div>

      <h3 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-warm-text transition-colors duration-300 group-hover:text-warm-primary">
        {post.title}
      </h3>

      {post.description && (
        <p
          className={cn(
            "mb-8 grow break-keep leading-relaxed text-warm-muted",
            descriptionClassName,
          )}
        >
          {post.description}
        </p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-warm-muted/10 px-2 py-1 text-xs font-medium text-warm-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
