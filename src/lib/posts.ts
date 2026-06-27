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
