import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export function likeKey(slug: string) {
  return `likes:${slug}`;
}
