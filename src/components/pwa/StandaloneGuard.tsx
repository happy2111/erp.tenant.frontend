"use client";

import { useEffect } from "react";

/**
 * In iOS standalone PWA, edge-swipe can reveal Safari navigation chrome.
 * This blocks horizontal edge gestures without affecting in-app navigation.
 */
export function StandaloneGuard() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    const blockEdgeSwipe = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const edgeThreshold = 24;

      if (touch.clientX < edgeThreshold || touch.clientX > window.innerWidth - edgeThreshold) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", blockEdgeSwipe, { passive: false });

    return () => {
      document.removeEventListener("touchstart", blockEdgeSwipe);
    };
  }, []);

  return null;
}
