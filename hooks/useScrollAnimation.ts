'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Observes the mounted element for intersection. Uses a callback ref so the observer
 * attaches after the DOM node exists (ref.current is often null on the first effect run).
 */
export const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const ref = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold]);

  return [ref, isVisible] as const;
};
