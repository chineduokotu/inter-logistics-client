import { useEffect, type RefObject } from "react";

export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root.current || media.matches || typeof IntersectionObserver === "undefined") return;
    const elements = root.current.querySelectorAll<HTMLElement>(".home-tracking, .statistics > div, .section-heading, .service-card, .visibility-copy > *, .radar, .cta > *");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed"); observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    elements.forEach((element, i) => {
      // Content stays readable without animation support, or if already visible.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add("reveal-ready");
      element.style.setProperty("--reveal-delay", `${i % 3 * 70}ms`);
      observer.observe(element);
    });
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove("reveal-ready", "is-revealed")); };
  }, [root]);
}
