'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV = [
  { id: 'home', label: 'Intro', href: '#home' },
  { id: 'chat', label: 'Ask', href: '#chat' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'stack', label: 'Stack', href: '#stack' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export default function SiteHeader({
  activeId,
  className = '',
}: {
  activeId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-[var(--ghost-border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl ${className}`}
      style={{ height: 'var(--site-header-h)' }}
    >
      <div className="mx-auto flex h-full max-w-[var(--content-max)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="font-mono-label text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--on-surface)] transition-colors duration-150 [transition-timing-function:var(--ease-snap)] hover:text-[var(--secondary)]"
        >
          pk
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative pt-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors duration-150 [transition-timing-function:var(--ease-snap)] ${active
                    ? 'border-t-2 border-[var(--primary)] text-[var(--on-surface)]'
                    : 'border-t-2 border-transparent text-[var(--secondary)] hover:text-[var(--on-surface)]'
                  }`}
              >
                {item.label}
              </a>
            );
          })}
          <Link
            href="/chat"
            className="ds-btn-primary ml-2 !py-2 !px-4 !text-[0.65rem]"
          >
            Chat
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center border border-[var(--ghost-border)] text-[var(--on-surface)] transition-colors duration-150 [transition-timing-function:var(--ease-snap)] hover:border-[color-mix(in_srgb,var(--outline)_60%,transparent)] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden strokeWidth={1.25} /> : <Menu className="h-5 w-5" aria-hidden strokeWidth={1.25} />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[var(--ghost-border)] bg-[var(--surface)] px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-0" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`border-b border-[var(--ghost-border)] px-1 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] last:border-b-0 ${activeId === item.id ? 'text-[var(--on-surface)]' : 'text-[var(--secondary)]'
                  }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/chat"
              className="ds-btn-primary mt-4 w-full text-center"
              onClick={() => setOpen(false)}
            >
              Chat
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
