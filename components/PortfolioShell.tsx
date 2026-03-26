'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SiteHeader from '@/components/SiteHeader';
import { useSiteReveal } from '@/components/SiteRevealContext';

const SECTION_IDS = ['home', 'chat', 'work', 'stack', 'projects', 'contact'] as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function PortfolioShell({ children }: { children: ReactNode }) {
  const { heroProgress, pastHero } = useSiteReveal();
  const [activeId, setActiveId] = useState<string>('home');
  // Nav bar shows once heroProgress > 0.7 (content has fully animated in)
  const showNav = heroProgress > 0.7;

  const updateScroll = useCallback(() => {
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
      {/* ── Sticky nav — slides in once hero is animated open ─────────── */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            key="nav-shell"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="pointer-events-auto"
          >
            <SiteHeader activeId={activeId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────────────── */}
      {children}
    </>
  );
}
