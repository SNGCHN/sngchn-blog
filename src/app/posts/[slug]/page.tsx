import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { MDXContent } from "@/components/mdx-content";
import { formatDate } from "@/lib/utils";
import { LikeButton } from "@/components/ui/like-button";
import { FloatingMenu } from "@/components/ui/floating-menu";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type TocItem = {
  title: string;
  url: string;
  items?: TocItem[];
};

function TocList({ items, depth = 0 }: { items: TocItem[]; depth?: number }) {
  if (!items || items.length === 0) return null;

  return (
    <ul
      className={
        depth === 0
          ? "space-y-4 text-sm border-l border-warm-border pl-4"
          : "mt-3 space-y-3 pl-4"
      }
    >
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            className="block text-warm-muted hover:text-warm-text transition-colors -ml-[17px] border-l-2 border-transparent hover:border-warm-muted pl-4 py-1"
          >
            {item.title}
          </a>
          {item.items && item.items.length > 0 ? (
            <TocList items={item.items} depth={depth + 1} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) return notFound();

  const sortedPosts = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const postIndex = sortedPosts.findIndex((p) => p.slug === slug);
  const prevPost =
    postIndex < sortedPosts.length - 1 ? sortedPosts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? sortedPosts[postIndex - 1] : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 relative">
      <Link
        href="/posts"
        className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-warm-muted hover:text-warm-text transition-colors duration-300 group"
      >
        <span className="w-6 h-6 rounded-full bg-warm-border/30 flex items-center justify-center group-hover:bg-warm-primary group-hover:text-warm-bg transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </span>
        목록으로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-16">
        <article className="min-w-0">
          <header className="mb-12 border-b border-warm-border pb-8">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold tracking-wide text-warm-primary uppercase bg-warm-muted/10 px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-warm-text mb-6 leading-[1.1] tracking-[-0.03em] break-keep">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-xl text-warm-muted break-keep mb-6">
                {post.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-6 text-sm text-warm-muted font-mono">
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {post.metadata.readingTime} min read
                </span>
              </div>
              <LikeButton initialLikes={0} />
            </div>
          </header>

          <div className="prose max-w-none mb-16">
            <MDXContent code={post.code} />
          </div>

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

          <div
            id="comments-section"
            className="mt-20 pt-10 border-t border-warm-border scroll-mt-24"
          >
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
              >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
              </svg>
              댓글
            </h3>
            <div className="min-h-[240px] flex flex-col items-center justify-center bg-warm-muted/5 border border-warm-border rounded-2xl p-8 text-center hover:border-warm-muted/30 transition-colors duration-300">
              <p className="text-warm-muted mb-4 font-medium">Giscus 댓글 영역</p>
              <p className="text-sm text-warm-muted/70 max-w-md break-keep">
                GitHub 계정으로 로그인하여 댓글을 남겨주세요.
              </p>
            </div>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <h4 className="text-xs font-bold text-warm-text uppercase tracking-wider mb-6 opacity-40">
              On this page
            </h4>
            <TocList items={(post.toc as TocItem[]) ?? []} />
          </div>
        </aside>
      </div>

      <FloatingMenu initialLikes={0} />
    </main>
  );
}
