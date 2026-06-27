"use client";

import { useMemo, useRef } from "react";
import * as runtime from "react/jsx-runtime";
import { Counter } from "@/components/mdx/counter";
import { MdxLink } from "@/components/mdx/link";
import { useCodeCopyButtons } from "@/hooks/use-code-copy-buttons";
import { useLinkUrlTooltip } from "@/hooks/use-link-url-tooltip";

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

  useCodeCopyButtons(rootRef);
  useLinkUrlTooltip(rootRef);

  return (
    <div ref={rootRef} className={className}>
      <Component components={mdxComponents} />
    </div>
  );
}
