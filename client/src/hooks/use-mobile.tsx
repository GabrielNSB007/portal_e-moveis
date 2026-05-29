import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function getMobileSnapshot() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function subscribeToViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  if (typeof window.matchMedia !== "function") {
    window.addEventListener("resize", onStoreChange, { passive: true });
    return () => window.removeEventListener("resize", onStoreChange);
  }

  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const onChange = () => onStoreChange();

  mql.addEventListener("change", onChange);
  window.addEventListener("resize", onStoreChange, { passive: true });

  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribeToViewport, getMobileSnapshot, () => false);
}
