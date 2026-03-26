'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type SiteRevealContextValue = {
  /** 0 = hero fullscreen, 1 = fully scrolled past hero */
  heroProgress: number;
  /** true once the user has scrolled past the hero section */
  pastHero: boolean;
  reveal: () => void;
};

const SiteRevealContext = createContext<SiteRevealContextValue | null>(null);

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function SiteRevealProvider({ children }: { children: ReactNode }) {
  const [heroProgress, setHeroProgress] = useState(0);
  const [pastHero, setPastHero] = useState(false);
  const frameRef = useRef(0);

  const reveal = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 80, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const HERO_TRANSITION_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600;

    const update = () => {
      frameRef.current = 0;
      const scrollY = window.scrollY;
      const heroEl = document.getElementById('home');

      // Progress through the hero section (0 = at top, 1 = name should be in full layout position)
      const progress = clamp01(scrollY / HERO_TRANSITION_HEIGHT);
      setHeroProgress(progress);

      // Past hero = hero bottom has left the viewport
      const past = heroEl ? heroEl.getBoundingClientRect().bottom <= 0 : false;
      setPastHero(past);

      // Sync CSS var for non-React consumers
      document.documentElement.style.setProperty('--hero-progress', progress.toFixed(4));
      if (scrollY > 4) {
        document.documentElement.dataset.siteRevealed = 'true';
      } else {
        document.documentElement.removeAttribute('data-site-revealed');
      }
    };

    const request = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(update);
    };

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);

  return (
    <SiteRevealContext.Provider value={{ heroProgress, pastHero, reveal }}>
      {children}
    </SiteRevealContext.Provider>
  );
}

export function useSiteReveal() {
  const ctx = useContext(SiteRevealContext);
  if (!ctx) throw new Error('useSiteReveal must be used within SiteRevealProvider');
  return ctx;
}
