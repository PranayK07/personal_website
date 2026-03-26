'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Contact() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="contact" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-14 max-w-3xl">
            <p className="ds-section-meta">06 // Contact</p>
            <h2 className="ds-section-title mt-4">Reach me</h2>
            <p className="mt-6 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
              Open to collaborations, internships, and opportunities that match my work.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="ds-card p-8">
              <h3 className="font-mono-label text-[0.65rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
                Email
              </h3>
              <a
                href="mailto:pranay.kakkar@outlook.com"
                className="mt-4 inline-block font-display text-lg font-medium text-[var(--on-surface)] underline decoration-[var(--ghost-border)] underline-offset-[6px] transition-[text-decoration-color] duration-150 [transition-timing-function:var(--ease-snap)] hover:decoration-[var(--primary)]"
              >
                pranay.kakkar@outlook.com
              </a>
            </div>
            <div className="ds-card p-8">
              <h3 className="font-mono-label text-[0.65rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
                Location
              </h3>
              <p className="mt-4 font-display text-lg font-medium text-[var(--on-surface)]">Connecticut</p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-mono-label text-[0.65rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
              Profiles
            </h3>
            <ul className="mt-6 flex flex-wrap gap-4">
              <li>
                <a
                  href="https://github.com/PranayK07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn-secondary !inline-flex !px-5 !py-3 !normal-case !tracking-normal"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/pranay-kakkar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn-secondary !inline-flex !px-5 !py-3 !normal-case !tracking-normal"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/pranay_kakkar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn-secondary !inline-flex !px-5 !py-3 !normal-case !tracking-normal"
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
