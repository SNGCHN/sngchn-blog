"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { posts } from "#site/content";
import { likeKey, redis } from "@/lib/redis";

const UID_COOKIE = "blog_uid";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1m"),
  prefix: "ratelimit:like",
});

function isValidSlug(slug: string): boolean {
  return posts.some((post) => post.slug === slug);
}

// 개수만 캐시한다(사용자별 상태가 아니므로 안전). 토글 시 revalidateTag로 갱신.
const getCachedCount = unstable_cache(
  async (slug: string) => {
    const count = await redis.scard(likeKey(slug));
    return count ?? 0;
  },
  ["like-count"],
  { revalidate: 60, tags: ["likes"] },
);

export async function getLikes(slug: string): Promise<number> {
  if (!isValidSlug(slug)) return 0;
  return getCachedCount(slug);
}

export type LikeResult =
  | { ok: true; likes: number; liked: boolean }
  | { ok: false; reason: "rate-limited" | "invalid" | "error" };

// 목표 상태(liked)를 멱등하게 설정한다. SADD/SREM은 멱등이라 같은 요청이
// 여러 번 와도 안전하고, 음수/중복이 구조적으로 불가능하다. 클라이언트가
// 낙관적 업데이트를 위해 원하는 최종 상태를 그대로 보낼 수 있다.
export async function setLike(
  slug: string,
  liked: boolean,
): Promise<LikeResult> {
  try {
    if (!isValidSlug(slug)) return { ok: false, reason: "invalid" };

    // 익명 식별자(쿠키). 없으면 발급한다. localStorage 삭제로는 우회되지 않는다.
    const cookieStore = await cookies();
    let uid = cookieStore.get(UID_COOKIE)?.value;
    if (!uid) {
      uid = crypto.randomUUID();
      cookieStore.set(UID_COOKIE, uid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    // 양방향(좋아요/취소) 모두 레이트리밋 대상.
    const { success } = await ratelimit.limit(uid);
    if (!success) return { ok: false, reason: "rate-limited" };

    const key = likeKey(slug);
    if (liked) {
      await redis.sadd(key, uid);
    } else {
      await redis.srem(key, uid);
    }

    // 다른 방문자에게는 getCachedCount의 60초 revalidate로 전파된다.
    // 작성자 본인은 아래 반환값으로 즉시 갱신.
    const likes = await redis.scard(key);

    return { ok: true, likes: likes ?? 0, liked };
  } catch {
    return { ok: false, reason: "error" };
  }
}
