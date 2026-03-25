'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type SiteRevealContextValue = {
  revealed: boolean;
  reveal: () => void;
};

const SiteRevealContext = createContext<SiteRevealContextValue | null>(null);

const SCROLL_REVEAL_PX = 36;

export function SiteRevealProvider({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    setRevealed((prev) => {
      if (prev) return prev;
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.siteRevealed = 'true';
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (revealed) return;

    const onScroll = () => {
      if (window.scrollY > SCROLL_REVEAL_PX) reveal();
    };

    const onInteract = () => reveal();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onInteract, { passive: true });
    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
    window.addEventListener('touchmove', onInteract, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchmove', onInteract);
    };
  }, [revealed, reveal]);

  return (
    <SiteRevealContext.Provider value={{ revealed, reveal }}>
      {children}
    </SiteRevealContext.Provider>
  );
}

export function useSiteReveal() {
  const ctx = useContext(SiteRevealContext);
  if (!ctx) {
    throw new Error('useSiteReveal must be used within SiteRevealProvider');
  }
  return ctx;
}
