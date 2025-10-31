'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import FluidGlass with no SSR
const FluidGlass = dynamic(() => import('./FluidGlass'), {
  ssr: false,
  loading: () => null
});

export default function FluidNavBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      const heroSection = document.getElementById('home');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        // Show nav bar when user scrolls past 80% of the hero section
        const shouldBeVisible = window.scrollY > heroBottom * 0.8;
        setIsVisible(shouldBeVisible);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  const navItems = [
    { label: 'Home', link: '#home' },
    { label: 'Experience', link: '#experience' },
    { label: 'Stack', link: '#stack' },
    { label: 'Projects', link: '#projects' },
    { label: 'Contact', link: '#contact' }
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-24 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
        width: '100%',
        height: '96px'
      }}
    >
      <FluidGlass navItems={navItems} />
    </div>
  );
}
