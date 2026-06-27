import type { Post } from "#site/content";

// 글에 시리즈가 존재하면 가질 객체 타입
export type SeriesInfo = NonNullable<Post["series"]>;

// 시리즈 목차에 넘기는 슬림 글 정보.
// client 컴포넌트로 전달하므로 무거운 code/toc는 제외한다.
export type SeriesPost = {
  title: string;
  slug: string;
  date: string;
  series?: SeriesInfo;
};

// 검색 모달에 사용하는 글 정보 (searchText는 본문 평문, 매칭 전용)
export type SearchPost = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
  series?: SeriesInfo;
  searchText: string;
};
