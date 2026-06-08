"use client";

import { useEffect, useRef, useState } from "react";

const GISCUS_ORIGIN = "https://giscus.app";

function getGiscusTheme() {
  if (typeof window === "undefined") return "preferred_color_scheme";

  const theme = document.documentElement.getAttribute("data-theme");
  const isDark =
    theme === "dark" ||
    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // giscus.app(HTTPS) iframe에서 http://localhost CSS를 fetch하면
  // mixed content로 브라우저가 차단하므로, 로컬에서는 내장 테마 사용
  const isLocalhost = ["localhost", "127.0.0.1"].includes(
    window.location.hostname,
  );

  if (isLocalhost) {
    return isDark ? "dark_dimmed" : "light";
  }

  return isDark
    ? `${window.location.origin}/giscus-dark.css`
    : `${window.location.origin}/giscus-light.css`;
}

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

    if (!repo || !repoId || !category || !categoryId || !containerRef.current) {
      setIsConfigured(false);
      return;
    }

    setIsConfigured(true);

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "0");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", getGiscusTheme());
    script.setAttribute("data-lang", "ko");
    script.setAttribute("data-loading", "lazy");

    containerRef.current.replaceChildren(script);

    const updateTheme = () => {
      const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );

      iframe?.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: getGiscusTheme(),
            },
          },
        },
        GISCUS_ORIGIN,
      );
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      containerRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-lg">
      <div ref={containerRef} />
      {!isConfigured ? (
        <div className="min-h-[180px] flex flex-col items-center justify-center text-center">
          <p className="text-warm-muted mb-3 font-medium">
            Giscus is not configured yet.
          </p>
          <p className="text-sm text-warm-muted/70 max-w-md">
            Add the NEXT_PUBLIC_GISCUS_REPO, NEXT_PUBLIC_GISCUS_REPO_ID,
            NEXT_PUBLIC_GISCUS_CATEGORY, and NEXT_PUBLIC_GISCUS_CATEGORY_ID
            environment variables.
          </p>
        </div>
      ) : null}
    </div>
  );
}
