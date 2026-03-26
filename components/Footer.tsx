'use client';

import { useEffect, useState } from 'react';
import { useSiteReveal } from '@/components/SiteRevealContext';

const STATS = [
  { label: 'Projects', value: '6' },
  { label: 'Stack items', value: '14' },
  { label: 'Status', value: 'Open' },
] as const;

export default function Footer() {
  const { heroProgress } = useSiteReveal();
  const revealed = heroProgress > 0.6;
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nyTime = now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTime(nyTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!revealed) return null;

  return (
    <footer className="border-t border-[var(--ghost-border)]">
      <div className="mx-auto max-w-[var(--content-max)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-mono-label text-[0.6rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
                {s.label}
              </p>
              <p className="font-display mt-2 text-3xl font-semibold tabular-nums tracking-[-0.02em] text-[var(--on-surface)] md:text-4xl">
                {s.value}
              </p>
            </div>
          ))}
          <div>
            <p className="font-mono-label text-[0.6rem] uppercase tracking-[0.2em] text-[var(--secondary)]">
              Eastern time
            </p>
            <p className="font-mono-label mt-2 text-xl font-medium tabular-nums text-[var(--on-surface)] md:text-2xl">
              {time}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-[var(--ghost-border)] pt-10 md:flex-row md:items-center">
          <span className="font-mono-label text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--on-surface)]">
            pk
          </span>
          <p className="font-mono-label text-[0.65rem] text-[var(--secondary)]">
            © {new Date().getFullYear()} Pranay Kakkar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
