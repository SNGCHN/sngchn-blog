import { useEffect, useRef, useState } from "react";

/**
 * 글 상세에서 스크롤 시 로고 자리에 띄울 "글제목 › H2 › H3" 경로(crumb)와
 * 마지막 세그먼트의 진입 진행률(headProgress)을 계산.
 * 글 상세가 아니면 crumb = null(로고 유지).
 */
export function useReadingCrumb(pathname: string) {
  // 글을 내리면 로고 자리를 경로로 교체(null이면 로고)
  const [crumb, setCrumb] = useState<string[] | null>(null);
  // 현재 헤딩이 헤더 선을 넘는 진행률(0=막 닿음 → 1=완전히 들어옴)
  const [headProgress, setHeadProgress] = useState(1);
  const crumbKeyRef = useRef("");
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const isPost = pathname.startsWith("/posts/") && pathname !== "/posts";
    const commit = (parts: string[] | null) => {
      // 세그먼트 경계를 보존(join("")은 ["ab","c"]와 ["a","bc"]가 충돌)
      const key = parts ? JSON.stringify(parts) : "";
      if (key === crumbKeyRef.current) return;
      crumbKeyRef.current = key;
      setCrumb(parts);
    };
    if (!isPost) {
      commit(null);
      return;
    }

    const HEADER = 64; // 헤더 높이(h-16)
    let frame = 0;
    const compute = () => {
      frame = 0;
      const article = document.querySelector("main article");
      const titleEl = article?.querySelector("h1");
      // 제목이 아직 헤더 아래 보이면 로고 유지
      if (
        !article ||
        !titleEl ||
        titleEl.getBoundingClientRect().bottom >= HEADER
      ) {
        commit(null);
        return;
      }
      // 제목(첫 h1)을 뺀 본문 헤딩 중, 기준선을 지난 마지막 헤딩의 계층 경로.
      const headings = [...article.querySelectorAll("h1, h2, h3, h4")].filter(
        (h) => h !== titleEl,
      );
      // 보더박스가 아닌 실제 글자 위치(h1 padding-top 보정)
      const textTop = (h: Element) =>
        h.getBoundingClientRect().top +
        (Number.parseFloat(getComputedStyle(h).paddingTop) || 0);
      let curIdx = -1;
      headings.forEach((h, i) => {
        if (textTop(h) <= HEADER + 8) curIdx = i;
      });
      if (curIdx < 0) {
        commit(null);
        return;
      }
      const path: string[] = [];
      let need = 7;
      for (let i = curIdx; i >= 0; i--) {
        const lvl = Number(headings[i].tagName[1]);
        if (lvl < need) {
          path.unshift(headings[i].textContent?.trim() ?? "");
          need = lvl;
        }
      }
      commit(path);

      // 현재(가장 깊은) 헤딩이 헤더 선을 넘어 들어온 정도. 44px 구간에서 0→1.
      const top = textTop(headings[curIdx]);
      const p = reduceMotionRef.current
        ? 1
        : Math.min(1, Math.max(0, (HEADER + 8 - top) / 44));
      setHeadProgress((prev) => (Math.abs(prev - p) < 0.001 ? prev : p));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return { crumb, headProgress };
}
