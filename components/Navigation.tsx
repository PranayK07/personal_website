'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-sm border-b border-accent-cyan/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-accent-cyan hover:text-accent-cyan-light transition-colors">
            PK
          </Link>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('projects')}
              className="text-foreground hover:text-accent-cyan transition-colors text-sm font-medium"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-foreground hover:text-accent-cyan transition-colors text-sm font-medium"
            >
              Contact
            </button>
            <a
              href="/Resume_Template_PDF.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent-cyan text-background rounded-lg hover:bg-accent-cyan-light transition-colors text-sm font-medium"
            >
              Resume
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
