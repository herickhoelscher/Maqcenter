"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HIDDEN: Keyframe[] = [{ opacity: 0, transform: "translateY(18px)" }];
const SHOWN: Keyframe[] = [
  { opacity: 0, transform: "translateY(18px)" },
  { opacity: 1, transform: "none" },
];

// Fades in elements marked with data-reveal as they scroll into view.
// - Only elements below the fold at load are hidden, so nothing the visitor
//   already sees waits for JavaScript (keeps LCP fast).
// - It never touches attributes React rendered (that breaks hydration):
//   hiding and showing use element.animate(), which leaves the DOM alone.
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hiding = new WeakMap<Element, Animation>();
    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          const delay = parseInt(getComputedStyle(el).getPropertyValue("--reveal-delay")) || 0;
          const reveal = el.animate(SHOWN, { duration: 600, delay, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "backwards" });
          // Drop the hiding animation once the reveal has taken over.
          reveal.ready.then(() => hiding.get(el)?.cancel());
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const watch = () =>
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
        hiding.set(el, el.animate(HIDDEN, { duration: 1, fill: "forwards" }));
        observer.observe(el);
      });
    watch();

    // Content streamed in after navigation (Suspense) is picked up too,
    // batched to one scan per frame.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        watch();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
