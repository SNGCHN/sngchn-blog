import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { getLikes } from "@/app/actions";
import { MDXContent } from "@/components/mdx/content";
import { BackToPostsLink } from "@/components/post/back-to-posts-link";
import { FloatingMenu } from "@/components/post/floating-menu";
import { LikeButton } from "@/components/post/like-button";
import { LikeProvider } from "@/components/post/like-provider";
import { PostComments } from "@/components/post/post-comments";
import { PostHeader } from "@/components/post/post-header";
import { PostPager } from "@/components/post/post-pager";
import { SeriesTableOfContents } from "@/components/post/series-table-of-contents";
import { DesktopTableOfContents } from "@/components/post/table-of-contents-desktop";
import { MobileTableOfContents } from "@/components/post/table-of-contents-mobile";
import { getPostBySlug, getPostPageData } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getPostPageData(slug);

  if (!data) return notFound();

  const { post, prevPost, nextPost, seriesPosts } = data;
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
        <BackToPostsLink className={contentColumnClass} />
      </div>

      <LikeProvider slug={post.slug} initialLikes={initialLikes}>
        <div className={postShellClass}>
          <article
            className={`${contentColumnClass} min-w-0 mx-auto w-full max-w-[50rem]`}
          >
            <SeriesTableOfContents
              currentSlug={post.slug}
              currentSeries={post.series}
              posts={seriesPosts}
            />

            <PostHeader post={post} />

            <div className="prose max-w-none mb-16">
              <MDXContent code={post.code} />
            </div>

            <PostPager prevPost={prevPost} nextPost={nextPost} />

            <div className="mt-20 flex flex-col items-center gap-4">
              <LikeButton />
            </div>

            <PostComments />
          </article>

          {hasToc ? <DesktopTableOfContents items={tocItems} /> : null}
        </div>

        {hasToc ? <MobileTableOfContents items={tocItems} /> : null}
        <FloatingMenu />
      </LikeProvider>
    </main>
  );
}
