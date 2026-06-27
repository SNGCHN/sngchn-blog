"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { setLike } from "@/app/actions";

export type LikeStatus = "idle" | "pending" | "rate-limited" | "error";

interface LikeContextValue {
  likes: number;
  liked: boolean;
  status: LikeStatus;
  toggle: () => void;
}

const LikeContext = createContext<LikeContextValue | null>(null);

export function useLikeContext(): LikeContextValue {
  const ctx = useContext(LikeContext);
  if (!ctx) {
    throw new Error("useLikeContext must be used within <LikeProvider>");
  }
  return ctx;
}

interface LikeProviderProps {
  slug: string;
  initialLikes: number;
  children: ReactNode;
}

export function LikeProvider({
  slug,
  initialLikes,
  children,
}: LikeProviderProps) {
  // serverCount: 서버가 확정한 개수(SCARD). 이 사용자의 like 포함 여부 = serverLiked.
  // liked: 사용자가 원하는(낙관적) 최종 상태.
  const [serverCount, setServerCount] = useState(initialLikes);
  const [serverLiked, setServerLiked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [status, setStatus] = useState<LikeStatus>("idle");

  const desiredRef = useRef(false);
  const serverLikedRef = useRef(false);
  const syncingRef = useRef(false);
  const statusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setServerCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    const stored = localStorage.getItem(`liked:${slug}`) === "true";
    // 이미 like한 사용자는 initialLikes에 이미 포함돼 있으므로 serverLiked로 상쇄한다.
    setLiked(stored);
    setServerLiked(stored);
    desiredRef.current = stored;
    serverLikedRef.current = stored;
  }, [slug]);

  // 표시 개수 = 서버 확정 개수 + 낙관적 차이. liked === serverLiked면 곧 serverCount.
  const likes = Math.max(
    0,
    serverCount + (liked ? 1 : 0) - (serverLiked ? 1 : 0),
  );

  const scheduleIdle = useCallback((ms: number) => {
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatus("idle"), ms);
  }, []);

  // 서버 상태가 desiredRef와 일치할 때까지 동기화한다(연타는 자동으로 합쳐짐).
  const flush = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setStatus("pending");

    try {
      while (desiredRef.current !== serverLikedRef.current) {
        const sending = desiredRef.current;
        const result = await setLike(slug, sending);

        if (!result.ok) {
          // 롤백: 마지막으로 서버가 확정한 상태로 되돌린다.
          desiredRef.current = serverLikedRef.current;
          setLiked(serverLikedRef.current);
          if (result.reason === "rate-limited") {
            setStatus("rate-limited");
            scheduleIdle(8000);
          } else {
            setStatus("error");
            scheduleIdle(4000);
          }
          return;
        }

        setServerCount(result.likes);
        setServerLiked(result.liked);
        serverLikedRef.current = result.liked;
        if (result.liked) {
          localStorage.setItem(`liked:${slug}`, "true");
        } else {
          localStorage.removeItem(`liked:${slug}`);
        }
      }
      setStatus("idle");
    } finally {
      syncingRef.current = false;
      // 동기화 종료 직전에 끼어든 클릭이 있으면 한 번 더 돌린다.
      if (desiredRef.current !== serverLikedRef.current) {
        void flush();
      }
    }
  }, [slug, scheduleIdle]);

  const toggle = useCallback(() => {
    const next = !desiredRef.current;
    desiredRef.current = next;
    setLiked(next); // 즉시 낙관적 반영(개수는 파생값으로 자동 갱신)
    void flush();
  }, [flush]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  return (
    <LikeContext.Provider value={{ likes, liked, status, toggle }}>
      {children}
    </LikeContext.Provider>
  );
}
