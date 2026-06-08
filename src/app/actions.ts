"use server";

import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { Ratelimit } from "@upstash/ratelimit";
import { redis, likeKey } from "@/lib/redis";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1m"),
});

const getCachedLikes = unstable_cache(
  async (slug: string) => {
    const count = await redis.get<number>(likeKey(slug));
    return count ?? 0;
  },
  ["likes"],
  { revalidate: 60 }
);

export async function getLikes(slug: string): Promise<number> {
  return getCachedLikes(slug);
}

export async function toggleLike(
  slug: string,
  liked: boolean
): Promise<number> {
  if (liked) {
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";

    const { success } = await ratelimit.limit(`like:${ip}`);
    if (!success) throw new Error("Too many requests");
  }

  const count = liked
    ? await redis.incr(likeKey(slug))
    : await redis.decr(likeKey(slug));

  return Math.max(0, count);
}
