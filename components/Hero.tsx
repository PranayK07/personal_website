'use client';

import { motion, useSpring, useTransform, useScroll } from 'framer-motion';

// Hook: normalises window scroll to 0–1 over 65dvh
function useHeroScrollProgress() {
  const { scrollY } = useScroll();

  const raw = useTransform(scrollY, (y) => {
    if (typeof window === 'undefined') return 0;
    const limit = window.innerHeight * 0.65;
    return Math.min(1, Math.max(0, y / limit));
  });

  return { raw };
}

export default function Hero() {
  const { raw } = useHeroScrollProgress();

  // Spring-smoothed scroll progress (silky deceleration)
  const progress = useSpring(raw, { stiffness: 80, damping: 22, mass: 0.6 });

  // ── Name: subtle scale-down as it moves from hero → layout ───────────
  const nameScale = useTransform(progress, [0, 1], [1.08, 1]);

  // ── Secondary elements opacity/y ─────────────────────────────────────
  // Fade in as progress increases
  const secondaryOpacity = useTransform(progress, [0.25, 0.85], [0, 1]);
  const secondaryY       = useTransform(progress, [0.25, 0.85], [20, 0]);

  const taglineOpacity = useTransform(progress, [0.3, 0.9], [0, 1]);
  const taglineY       = useTransform(progress, [0.3, 0.9], [28, 0]);

  const bioOpacity = useTransform(progress, [0.5, 1], [0, 1]);
  const bioY       = useTransform(progress, [0.5, 1], [32, 0]);

  const metaOpacity = useTransform(progress, [0, 0.35], [1, 0]);

  // ── Role/subtitle opacity (shown only in hero mode) ───────────────────
  const roleOpacity = useTransform(progress, [0, 0.3], [1, 0]);

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative"
      style={{
        // Section occupies 165vh so the user has room to scroll through it
        minHeight: '165dvh',
        // Sticky so content stays in view while user scrolls through the section
      }}
    >
      <p className="sr-only">Scroll to reveal the rest of the site.</p>

      {/* Sticky inner — stays in viewport while user scrolls through 165vh */}
      <div
        className="sticky top-0 flex min-h-dvh items-stretch overflow-hidden"
        style={{ height: '100dvh' }}
      >
        {/* ── Centre stage: the animated name block ─────────────────── */}
        <motion.div
          className="relative flex w-full flex-col justify-start"
          style={{
            alignItems: 'flex-start',
            paddingTop: 'clamp(6rem, 14vw, 10rem)',
            paddingBottom: 'clamp(3rem, 6vw, 5rem)',
            paddingLeft: 'clamp(1.25rem, 4vw, 5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 5rem)',
          }}
        >
          {/* ── Pre-reveal label — fades OUT as we scroll ────────────── */}
          <motion.p
            className="font-mono-label mb-5 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--secondary)]"
            style={{ opacity: metaOpacity }}
          >
            PORTFOLIO_SYSTEM&nbsp;// UCONN_CS
          </motion.p>

          {/* ── The main grid: name | tagline ─────────────────────────── */}
          <div className="w-full max-w-[var(--content-max)]">
            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,0.9fr)] lg:items-end lg:gap-16">
              {/* Name */}
              <motion.div style={{ scale: nameScale, originX: 0, originY: 0.5 }}>
                <motion.h1
                  className="font-display leading-[0.95] tracking-[-0.025em] text-[var(--on-surface)]"
                  style={{
                    fontSize: 'clamp(2.8rem, 8.5vw, 5.5rem)',
                    fontWeight: 400,
                  }}
                >
                  Pranay Kakkar
                </motion.h1>

                {/* Role — visible in hero, fades on scroll */}
                <motion.p
                  className="mt-4 font-body text-[clamp(1rem,2.2vw,1.125rem)] text-[var(--secondary)]"
                  style={{ opacity: roleOpacity }}
                >
                  CS @ UConn
                </motion.p>
              </motion.div>

              {/* Tagline — fades in on scroll */}
              <motion.div
                style={{
                  opacity: taglineOpacity,
                  y: taglineY,
                }}
              >
                <p
                  className="font-display font-medium leading-[1.15] tracking-[-0.02em] text-[var(--on-surface)] lg:text-right"
                  style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.2rem)' }}
                >
                  ML, security research,
                  <br className="hidden sm:block" /> and systems with intent.
                </p>
              </motion.div>
            </div>

            {/* ── Bio / body — fades in last ──────────────────────────── */}
            <motion.div
              className="mt-12 border-t border-[var(--ghost-border)] pt-10"
              style={{
                opacity: bioOpacity,
                y: bioY,
              }}
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                <p
                  className="max-w-[58ch] font-body leading-[1.65] text-[color-mix(in_srgb,var(--on-surface)_85%,var(--secondary))]"
                  style={{ fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)' }}
                >
                  Hi, I&apos;m Pranay Kakkar, a Computer Science major at UConn, passionate about
                  applying data and machine learning to real-world problems. I&apos;ve researched
                  cryptography, ML, and physics while also enjoying soccer, astronomy, and side
                  projects that help me learn new skills.
                </p>

                <motion.div
                  className="flex flex-col gap-3 lg:items-end lg:text-right"
                  style={{ opacity: secondaryOpacity, y: secondaryY }}
                >
                  <p className="font-mono-label text-[0.6rem] uppercase tracking-[0.22em] text-[var(--secondary)]">
                    LOC // CONNECTICUT
                  </p>
                  <p className="font-mono-label text-[0.6rem] uppercase tracking-[0.22em] text-[var(--secondary)]">
                    CS @ UCONN
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
