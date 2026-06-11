"use client";

import { useEffect, useMemo, useRef } from "react";
import * as runtime from "react/jsx-runtime";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  code: string;
  className?: string;
}

export function MDXContent({ code, className }: MDXContentProps) {
  const Component = useMemo(() => useMDXComponent(code), [code]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pres = root.querySelectorAll("pre");
    pres.forEach((pre) => {
      const element = pre as HTMLElement;
      if (element.dataset.copyInstalled === "true") return;
      element.dataset.copyInstalled = "true";

      // 버튼/라벨을 figure에 붙여 코드 가로 스크롤에도 위치가 고정되게 한다
      const figure = element.closest<HTMLElement>(
        "figure[data-rehype-pretty-code-figure]",
      );
      const container = figure ?? element;
      if (!figure) element.style.position = "relative";

      // 언어 라벨 — plaintext/text는 표시하지 않는다
      const lang = element.dataset.language;
      if (figure && lang && lang !== "text" && lang !== "plaintext") {
        figure.dataset.lang = lang;
      }

      const codeEl = pre.querySelector("code");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "코드 복사");

      // 초기 상태: 복사 아이콘
      button.innerHTML = `
        <svg class="icon icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
        <span class="text-copy">복사</span>
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
            <span class="text-copy">복사됨</span>
          `;
          button.classList.add("success");
        } catch {
          button.innerHTML = `
            <svg class="icon icon-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span class="text-copy">실패</span>
          `;
          button.classList.add("error");
        }

        window.setTimeout(() => {
          button.innerHTML = `
            <svg class="icon icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            <span class="text-copy">복사</span>
          `;
          button.classList.remove("success", "error");
        }, 1500);
      });

      container.appendChild(button);
    });
  }, [code]);

  return (
    <div ref={rootRef} className={className}>
      <Component />
    </div>
  );
}
