import Link from "next/link";

type PagerPost = { slug: string; title: string };

export function PostPager({
  prevPost,
  nextPost,
}: {
  prevPost: PagerPost | null;
  nextPost: PagerPost | null;
}) {
  return (
    <div className="border-t border-warm-border pt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      {prevPost ? (
        <Link
          href={`/posts/${prevPost.slug}`}
          className="group flex flex-col items-start text-left p-6 -ml-6 rounded-2xl hover:bg-warm-muted/5 transition-colors duration-300"
        >
          <span className="text-xs text-warm-muted mb-2 font-mono flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            이전 글
          </span>
          <span className="text-lg font-bold text-warm-text group-hover:text-warm-primary transition-colors duration-300 break-keep">
            {prevPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          href={`/posts/${nextPost.slug}`}
          className="group flex flex-col items-end text-right p-6 -mr-6 rounded-2xl hover:bg-warm-muted/5 transition-colors duration-300"
        >
          <span className="text-xs text-warm-muted mb-2 font-mono flex items-center gap-1">
            다음 글
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
          <span className="text-lg font-bold text-warm-text group-hover:text-warm-primary transition-colors duration-300 break-keep">
            {nextPost.title}
          </span>
        </Link>
      ) : null}
    </div>
  );
}
