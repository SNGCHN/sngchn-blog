import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// 좋아요는 SET으로 저장. 멤버 = 익명 사용자 id, 개수 = SCARD.
// 기존 문자열 카운터 likes:<slug> 와 겹치지 않게 네임스페이스 분리
export function likeKey(slug: string) {
  return `likes:set:${slug}`;
}
