import { type RefObject, useEffect } from "react";

/**
 * PC(호버 가능 기기)에서만: 본문 링크에 커서를 따라다니는 주소 툴팁.
 * 긴 주소는 CSS text-overflow로 … 처리된다.
 */
export function useLinkUrlTooltip(rootRef: RefObject<HTMLDivElement | null>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: rootRef는 파라미터로 받은 안정적 ref. 마운트 시점 .current로 충분해 deps 불필요.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const tip = document.createElement("div");
    tip.className = "link-url-tip";
    document.body.appendChild(tip);
    let active: HTMLAnchorElement | null = null;

    const move = (e: MouseEvent) => {
      if (!active) return;
      const pad = 14;
      const x = Math.min(
        e.clientX + pad,
        window.innerWidth - tip.offsetWidth - 8,
      );
      tip.style.left = `${Math.max(8, x)}px`;
      tip.style.top = `${e.clientY + 18}px`;
    };
    const over = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const a = e.target.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (!root.contains(a) || a.closest("h1,h2,h3,h4,h5,h6")) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      active = a;
      tip.textContent = href;
      tip.style.opacity = "1";
      move(e);
    };
    const out = (e: MouseEvent) => {
      const related = e.relatedTarget;
      if (active && !(related instanceof Node && active.contains(related))) {
        active = null;
        tip.style.opacity = "0";
      }
    };

    root.addEventListener("mouseover", over);
    root.addEventListener("mousemove", move);
    root.addEventListener("mouseout", out);
    return () => {
      root.removeEventListener("mouseover", over);
      root.removeEventListener("mousemove", move);
      root.removeEventListener("mouseout", out);
      tip.remove();
    };
  }, []);
}
