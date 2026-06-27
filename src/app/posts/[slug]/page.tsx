import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { getLikes } from "@/app/actions";
import { GiscusComments } from "@/components/comments/giscus-comments";
import { MDXContent } from "@/components/mdx/content";
import { FloatingMenu } from "@/components/post/floating-menu";
import { LikeButton } from "@/components/post/like-button";
import { LikeProvider } from "@/components/post/like-provider";
import {
  type SeriesPost,
  SeriesTableOfContents,
} from "@/components/post/series-table-of-contents";
import {
  DesktopTableOfContents,
  MobileTableOfContents,
} from "@/components/post/table-of-contents";
import { getSortedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const decodedSlug = decodeURIComponent(slug);
  const post = posts.find((p) => p.slug === decodedSlug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  const decodedSlug = decodeURIComponent(slug);
  const post = posts.find((p) => p.slug === decodedSlug);

  if (!post) return notFound();

  const sortedPosts = getSortedPosts();
  const postIndex = sortedPosts.findIndex((p) => p.slug === decodedSlug);
  const prevPost =
    postIndex < sortedPosts.length - 1 ? sortedPosts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? sortedPosts[postIndex - 1] : null;
  const currentSeries = post.series;
  const seriesPosts: SeriesPost[] = currentSeries
    ? sortedPosts
        .map((seriesPost) => ({
          title: seriesPost.title,
          slug: seriesPost.slug,
          date: seriesPost.date,
          series: seriesPost.series,
        }))
        .filter((seriesPost) => seriesPost.series?.slug === currentSeries.slug)
    : [];
  const tocItems = (post.toc ?? []).filter((item) => item.url && item.title);
  const hasToc = tocItems.length > 0;
  const postShellClass = hasToc
    ? "grid grid-cols-1 xl:grid-cols-[180px_minmax(0,50rem)_180px] gap-y-12 xl:gap-x-8"
    : "grid grid-cols-1";
  const contentColumnClass = hasToc ? "xl:col-start-2" : "";
  const initialLikes = await getLikes(post.slug);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative">
      <div className={postShellClass}>
        <Link
          href="/posts"
          className={`${contentColumnClass} mb-12 inline-flex w-fit items-center gap-2 text-sm font-medium text-warm-muted hover:text-warm-text transition-colors duration-300 group`}
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
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </span>
          목록으로 돌아가기
        </Link>
      </div>

      <LikeProvider slug={post.slug} initialLikes={initialLikes}>
        <div className={postShellClass}>
          <article
            className={`${contentColumnClass} min-w-0 mx-auto w-full max-w-[50rem]`}
          >
            <SeriesTableOfContents
              currentSlug={post.slug}
              currentSeries={currentSeries}
              posts={seriesPosts}
            />

            <header className="mb-12 border-b border-warm-border pb-8">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="text-xs font-semibold tracking-wide text-warm-primary uppercase bg-warm-muted/10 px-2 py-1 rounded-md"
                    >
                      #{tag}
                    </Link>
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
                      aria-hidden="true"
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
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    약 {post.metadata.readingTime}분
                  </span>
                </div>
                <LikeButton />
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

            <div className="mt-20 flex flex-col items-center gap-4">
              <LikeButton />
            </div>

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
          </article>

          {hasToc ? <DesktopTableOfContents items={tocItems} /> : null}
        </div>

        {hasToc ? <MobileTableOfContents items={tocItems} /> : null}
        <FloatingMenu />
      </LikeProvider>
    </main>
  );
}
