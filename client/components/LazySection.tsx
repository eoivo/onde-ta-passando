"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}

export default function LazySection({
  children,
  minHeight = 300,
  rootMargin = "650px 0px",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        style={{ minHeight }}
        className="w-full"
        aria-hidden="true"
      />
    );
  }

  return <div className="animate-in fade-in duration-300">{children}</div>;
}
