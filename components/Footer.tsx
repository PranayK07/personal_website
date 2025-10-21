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
    <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-card-border bg-card-bg/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-center">
          <div className="text-footer-text text-sm order-2 sm:order-1">
            © 2025 Pranay Kakkar. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-accent-cyan order-1 sm:order-2">
            <span className="text-xs sm:text-sm">New York Time:</span>
            <span className="font-mono text-xs sm:text-sm font-medium">{time}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
