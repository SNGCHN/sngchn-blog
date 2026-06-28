import { posts } from "#site/content";
import type { SearchPost } from "@/types/post";

// 검색 모달 본문 인덱스 라우트 핸들러
// 빌드 시점에 정적 JSON으로 생성. 검색 모달이 열릴 때만 클라이언트가 가져가므로
// 전역 페이지 payload에 검색 데이터(본문 포함)를 싣지 않음.
export const dynamic = "force-static";

export function GET() {
  const index: SearchPost[] = posts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      title: post.title,
      description: post.description ?? "",
      date: post.date,
      tags: post.tags,
      slug: post.slug,
      series: post.series,
      searchText: post.searchText,
    }));

  return Response.json(index);
}
