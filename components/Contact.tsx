'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { RefObject } from 'react';

export default function Contact() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="contact" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref as RefObject<HTMLDivElement>} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-12 max-w-2xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">Contact</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight">
              Get in touch
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
              Open to collaborations, internships, and opportunities that match my work.
            </p>
          </header>

          <div className="grid gap-10 border-t border-[var(--line)] pt-12 md:grid-cols-2">
            <div>
              <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Email</h3>
              <a
                href="mailto:pranay.kakkar@outlook.com"
                className="mt-2 inline-block font-display text-lg text-[var(--fg)] underline decoration-[var(--line)] underline-offset-[6px] transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
              >
                pranay.kakkar@outlook.com
              </a>
            </div>
            <div>
              <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Location</h3>
              <p className="mt-2 font-display text-lg text-[var(--fg)]">Connecticut</p>
            </div>
          </div>

          <div className="mt-14 border-t border-[var(--line)] pt-10">
            <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Profiles</h3>
            <ul className="mt-6 flex flex-wrap gap-6">
              <li>
                <a
                  href="https://github.com/PranayK07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] font-medium text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/pranay-kakkar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] font-medium text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/pranay_kakkar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] font-medium text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
