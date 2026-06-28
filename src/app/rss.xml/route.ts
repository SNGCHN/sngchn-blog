import { Feed } from "feed";
import { posts } from "#site/content";

export const dynamic = "force-static";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.sngchn.dev"
).replace(/\/+$/, "");

export function GET() {
  const feed = new Feed({
    title: "sngchn.blog",
    description: "배운 것과 트러블슈팅을 기록합니다",
    id: SITE_URL,
    link: SITE_URL,
    language: "ko",
    copyright: `© ${new Date().getFullYear()} sngchn`,
    feedLinks: { rss: `${SITE_URL}/rss.xml` },
  });

  const sorted = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  for (const post of sorted) {
    const link = `${SITE_URL}${post.url}`;
    feed.addItem({
      title: post.title,
      id: link,
      link,
      date: new Date(post.date),
      description: post.description,
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
