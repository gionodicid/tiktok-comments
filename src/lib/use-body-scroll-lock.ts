import { useEffect } from "react";

/** Locks document body scroll while active; restores prior overflow on cleanup. */
export function useBodyScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
