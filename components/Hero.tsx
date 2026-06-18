'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Mail } from 'lucide-react';
import { SiGithub, SiX } from 'react-icons/si';
import type { SVGProps } from 'react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Authentic LinkedIn brand mark — Simple Icons no longer ships LinkedIn (brand
// restrictions), so it's hand-rolled here as a monochrome currentColor glyph to
// match the other brand marks.
function SiLinkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Real contact affordances — sourced from components/Contact.tsx
const CONTACTS = [
  {
    label: 'Email',
    href: 'mailto:pranay.kakkar@outlook.com',
    icon: Mail,
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/PranayK07',
    icon: SiGithub,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/pranay-kakkar',
    icon: SiLinkedin,
    external: true,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/pranay_kakkar',
    icon: SiX,
    external: true,
  },
] as const;

// Normalise window scroll to 0–1 over 65dvh — mirrors SiteRevealContext's signal,
// purely for a graceful hand-off fade of the card (the reveal itself is driven by
// SiteRevealContext reading window.scrollY directly).
function useHeroScrollProgress() {
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, (y) => {
    if (typeof window === 'undefined') return 0;
    const limit = window.innerHeight * 0.65;
    return Math.min(1, Math.max(0, y / limit));
  });
  return useSpring(raw, { stiffness: 80, damping: 22, mass: 0.6 });
}

export default function Hero() {
  const progress = useHeroScrollProgress();

  // Gentle hand-off: the card recedes as the rest of the site reveals.
  const cardOpacity = useTransform(progress, [0, 0.6], [1, 0]);
  const cardY = useTransform(progress, [0, 0.6], [0, -28]);
  const cardScale = useTransform(progress, [0, 0.6], [1, 0.98]);

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative"
      // Section occupies 165dvh so the user has room to scroll through it —
      // this scrollable height is what lets SiteRevealContext reach its
      // heroProgress thresholds (0.65 / 0.7). Do not shrink it.
      style={{ minHeight: '165dvh' }}
    >
      <p className="sr-only">Scroll to reveal the rest of the site.</p>

      {/* Sticky inner — keeps the card centred in the viewport while the user
          scrolls through the 165dvh section. */}
      <div
        className="sticky top-0 flex min-h-dvh items-center justify-center overflow-hidden px-4 sm:px-6"
        style={{ height: '100dvh' }}
      >
        <motion.div
          style={{ opacity: cardOpacity, y: cardY, scale: cardScale }}
          className="flex w-full max-w-[30rem] flex-col items-center"
        >
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
            className="ds-card w-full px-9 py-12 text-center sm:px-12 sm:py-14"
            aria-label="Pranay Kakkar — contact card"
          >
            {/* Name — the focal point */}
            <h1
              className="font-display leading-[1.05] tracking-[-0.025em] text-[var(--on-surface)]"
              style={{ fontSize: 'clamp(2.25rem, 8vw, 3.25rem)', fontWeight: 400 }}
            >
              Pranay Kakkar
            </h1>

            {/* Single, plain role line */}
            <p className="mt-3 font-mono-label text-[0.7rem] uppercase tracking-[0.28em] text-[var(--secondary)]">
              Computer Science · UConn
            </p>

            {/* Hairline divider, classic business-card style */}
            <div className="mx-auto mt-7 h-px w-12 bg-[var(--outline)]" />

            {/* Tagline */}
            <p
              className="mx-auto mt-7 max-w-[24rem] font-display leading-[1.4] tracking-[-0.01em] text-[var(--secondary)]"
              style={{ fontSize: 'clamp(0.95rem, 2.4vw, 1.0625rem)' }}
            >
              ML, security research, and systems with intent.
            </p>

            {/* Contact details */}
            <div className="mt-9 grid grid-cols-2 gap-2.5">
              {CONTACTS.map(({ label, href, icon: Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="ds-contact-link"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
