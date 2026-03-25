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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-[var(--line)]/80 bg-[color-mix(in_oklch,var(--bg)_88%,transparent)] backdrop-blur-md ${className}`}
      style={{ height: 'var(--site-header-h)' }}
    >
      <div className="mx-auto flex h-full max-w-[var(--content-max)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="font-display text-[clamp(1rem,2.5vw,1.125rem)] font-medium tracking-tight text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
        >
          Pranay Kakkar
        </a>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`rounded-sm px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                activeId === item.id
                  ? 'text-[var(--accent)] bg-[var(--accent-muted)]'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/chat"
            className="ml-2 border border-[var(--line)] px-2.5 py-1.5 text-[0.8125rem] font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors rounded-sm"
          >
            Full chat
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--line)] text-[var(--fg)]"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-[var(--line)] bg-[color-mix(in_oklch,var(--bg)_95%,transparent)] backdrop-blur-lg px-4 py-4"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`rounded-sm px-3 py-2.5 text-sm font-medium ${
                  activeId === item.id ? 'bg-[var(--accent-muted)] text-[var(--accent)]' : 'text-[var(--muted)]'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/chat"
              className="mt-2 border border-[var(--line)] px-3 py-2.5 text-center text-sm font-medium text-[var(--muted)]"
              onClick={() => setOpen(false)}
            >
              Full chat
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
