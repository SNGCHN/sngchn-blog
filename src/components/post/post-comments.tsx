import { GiscusComments } from "@/components/comments/giscus-comments";

export function PostComments() {
  return (
    <div id="comments-section" className="mt-16 pt-4">
      <h3 className="text-xl font-bold text-warm-text mb-8 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        </svg>
        댓글
      </h3>
      <GiscusComments />
    </div>
  );
}
