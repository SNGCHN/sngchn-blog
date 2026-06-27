import { useEffect, useRef } from "react";

/** Ctrl+K로 콜백 실행(검색 열기). 콜백 identity와 무관하게 리스너는 1회만 등록. */
export function useSearchShortcut(onTrigger: () => void) {
  const triggerRef = useRef(onTrigger);
  triggerRef.current = onTrigger;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        triggerRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
