import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const element = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const animate = (now: number) => {
          if (cancelled) return;
          const elapsed = Math.min((now - start) / 1600, 1);
          setProgress(1 - Math.pow(1 - elapsed, 3));
          if (elapsed < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      },
      { rootMargin: "0px 0px 80px 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <strong ref={element} aria-label={`${value.toFixed(decimals)}${suffix}`}>
      {(value * progress).toFixed(decimals)}{suffix}
    </strong>
  );
}
