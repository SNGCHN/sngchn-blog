import type { Post } from "#site/content";

// 글에 시리즈가 존재하면 가질 객체 타입
export type SeriesInfo = NonNullable<Post["series"]>;

// 시리즈 목차에 넘기는 슬림 글 정보(무거운 code/toc 제외).
export type SeriesPost = Pick<Post, "title" | "slug" | "date" | "series">;

// 검색 모달에 사용하는 글 정보. searchText는 본문 평문(매칭 전용).
// description은 인덱스 생성 시 항상 채우므로(?? "") optional이 아닌 string.
export type SearchPost = Pick<
  Post,
  "title" | "date" | "tags" | "slug" | "series" | "searchText"
> & { description: string };
