'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
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

  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-[0.8125rem] text-[var(--muted)]">© {new Date().getFullYear()} Pranay Kakkar</p>
        <p className="text-[0.8125rem] text-[var(--muted)]">
          <span className="text-[var(--muted)]">Eastern Time · </span>
          <span className="tabular-nums text-[var(--fg)]">{time}</span>
        </p>
      </div>
    </footer>
  );
}
