import { posts } from "#site/content";

export function getAllTags() {
  const tagCount: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function getSortedPosts() {
  return posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** URL slug(인코딩됨)로 글 찾기. 없으면 null. */
export function getPostBySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  return posts.find((p) => p.slug === decoded) ?? null;
}

/**
 * 글 페이지에 필요한 데이터(앞뒤 글 · 같은 시리즈 글)를 한 번의 정렬로 모음. 글이 없으면 null.
 *
 * seriesPosts는 client 컴포넌트로 넘기므로 무거운 code/toc를 빼고 필요한 필드만 추림
 * (정렬은 표시 컴포넌트가 order로 처리).
 */
export function getPostPageData(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return null;

  const sorted = getSortedPosts();
  const index = sorted.findIndex((p) => p.slug === post.slug);
  const prevPost = index < sorted.length - 1 ? sorted[index + 1] : null;
  const nextPost = index > 0 ? sorted[index - 1] : null;

  const series = post.series;
  const seriesPosts = series
    ? sorted
        .filter((p) => p.series?.slug === series.slug)
        .map((p) => ({
          title: p.title,
          slug: p.slug,
          date: p.date,
          series: p.series,
        }))
    : [];

  return { post, prevPost, nextPost, seriesPosts };
}
