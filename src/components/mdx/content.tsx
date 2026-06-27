"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import * as runtime from "react/jsx-runtime";
import { Counter } from "@/components/mdx/counter";

// 외부 링크(http~)는 새 탭으로, 내부 경로(/...)는 next/link로 클라이언트 이동,
// 앵커(#...)는 같은 페이지라 plain <a>.
function MdxLink({
  href = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    );
  }
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  return <a href={href} {...props} />;
}

const mdxComponents = {
  Counter,
  a: MdxLink,
};

const getMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  code: string;
  className?: string;
}

export function MDXContent({ code, className }: MDXContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pres = root.querySelectorAll("pre");
    pres.forEach((pre) => {
      const element = pre as HTMLElement;
      if (element.dataset.copyInstalled === "true") return;
      element.dataset.copyInstalled = "true";

      const figure = element.closest<HTMLElement>(
        "figure[data-rehype-pretty-code-figure]",
      );
      const container = figure ?? element;
      if (!figure) element.style.position = "relative";

      const lang = element.dataset.language;
      if (figure && lang && lang !== "text" && lang !== "plaintext") {
        figure.dataset.lang = lang;
      }

      const codeEl = pre.querySelector("code");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "코드 복사");

      button.innerHTML = `
        <svg class="icon icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      `;

      button.addEventListener("click", async () => {
        const text = codeEl?.textContent ?? "";

        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "absolute";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
          }
          button.innerHTML = `
            <svg class="icon icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          button.classList.add("success");
        } catch {
          button.innerHTML = `
            <svg class="icon icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          `;
          button.classList.add("error");
        }

        window.setTimeout(() => {
          button.innerHTML = `
            <svg class="icon icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          `;
          button.classList.remove("success", "error");
        }, 1500);
      });

      container.appendChild(button);
    });
  });

  // PC(호버 가능 기기)에서만: 본문 링크에 커서를 따라다니는 주소 툴팁.
  // 긴 주소는 CSS text-overflow로 ... 처리된다.
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
      const a = (e.target as HTMLElement).closest("a[href]");
      if (!a || !root.contains(a) || a.closest("h1,h2,h3,h4,h5,h6")) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;
      active = a as HTMLAnchorElement;
      tip.textContent = href;
      tip.style.opacity = "1";
      move(e);
    };
    const out = (e: MouseEvent) => {
      if (active && !active.contains(e.relatedTarget as Node)) {
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

  return (
    <div ref={rootRef} className={className}>
      <Component components={mdxComponents} />
    </div>
  );
}
