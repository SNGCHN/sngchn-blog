"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="my-8 flex justify-center">
      <button
        type="button"
        onClick={() => setCount((prev) => prev + 1)}
        className="inline-flex items-center gap-2 rounded-full border border-warm-border bg-warm-bg px-5 py-2.5 text-sm font-medium text-warm-text transition-colors hover:border-warm-primary/40 hover:bg-warm-muted/10 active:scale-[0.98]"
      >
        클릭
        {count > 0 && (
          <span className="font-mono text-warm-primary">×{count}</span>
        )}
      </button>
    </div>
  );
}
