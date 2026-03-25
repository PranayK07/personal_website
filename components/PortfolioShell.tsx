'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SectionRail from '@/components/SectionRail';

const SECTION_IDS = ['home', 'chat', 'work', 'stack', 'projects', 'contact'] as const;

export default function PortfolioShell({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string>('home');
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScroll = useCallback(() => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY;
    const docHeight = doc.scrollHeight - window.innerHeight;
    setScrollProgress(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0);

    const mid = window.innerHeight * 0.35;
    for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
      const id = SECTION_IDS[i];
      const el = document.getElementById(id);
      if (!el) continue;
      const { top } = el.getBoundingClientRect();
      if (top <= mid) {
        setActiveId(id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll]);

  return (
    <>
      <SiteHeader activeId={activeId} />
      <SectionRail activeId={activeId} scrollProgress={scrollProgress} />
      <div className="lg:pl-[var(--rail-width)]">{children}</div>
    </>
  );
}
