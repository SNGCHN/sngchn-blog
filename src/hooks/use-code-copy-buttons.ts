import { type RefObject, useEffect } from "react";

/**
 * 본문 코드 블록(pre)에 복사 버튼을 설치한다.
 *
 * deps 배열이 없는 건 의도: client 라우팅으로 글을 전환하면 MDXContent가
 * remount되지 않고 code prop만 바뀔 수 있어, 매 렌더 후 새 pre를 다시 훑어야
 * 새 글의 코드 블록에도 버튼이 붙는다. dataset.copyInstalled 가드로 중복 설치는 막힌다.
 */
export function useCodeCopyButtons(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pres = root.querySelectorAll("pre");
    pres.forEach((element) => {
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

      const codeEl = element.querySelector("code");
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
}
