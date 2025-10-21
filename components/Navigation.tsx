'use client';

import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'experience', 'stack', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 200; // Distance from top of viewport

      // Find which section is currently in view
      let currentSection = 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          // Check if we've scrolled past the start of this section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = section;
            break;
          }
          // If we're past this section, it might be the active one
          if (scrollPosition >= offsetTop) {
            currentSection = section;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'stack', label: 'Stack' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          relative backdrop-blur-2xl bg-background/30
          border-2 border-white/15 rounded-3xl
          shadow-[0_8px_32px_0_rgba(20,184,166,0.15)]
          transition-all duration-500 ease-out
          p-3
          ${isScrolled
            ? 'shadow-[0_8px_32px_0_rgba(20,184,166,0.3)] bg-background/40 backdrop-blur-3xl'
            : ''
          }
          before:absolute before:inset-0 before:rounded-3xl
          before:bg-gradient-to-br before:from-accent/10 before:via-accent/5 before:to-transparent
          before:opacity-60 before:pointer-events-none
          after:absolute after:inset-0 after:rounded-3xl
          after:bg-gradient-to-t after:from-white/5 after:to-transparent
          after:pointer-events-none
        `}
      >
        <div className="relative flex items-center justify-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                relative rounded-2xl
                px-10 py-5
                text-base font-bold tracking-wide
                transition-all duration-300 ease-out
                group overflow-hidden
                flex items-center justify-center
                min-w-[140px]
                ${activeSection === item.id
                  ? 'text-background'
                  : 'text-foreground/80 hover:text-foreground'
                }
              `}
            >
              {activeSection === item.id && (
                <span
                  className="absolute inset-0 bg-gradient-to-r from-accent to-accent-hover rounded-2xl animate-in fade-in duration-300"
                  style={{
                    boxShadow: `
                      0 0 50px rgba(20, 184, 166, 0.7),
                      0 0 80px rgba(20, 184, 166, 0.5),
                      0 0 120px rgba(20, 184, 166, 0.3),
                      0 0 160px rgba(20, 184, 166, 0.15)
                    `
                  }}
                />
              )}
              {activeSection !== item.id && (
                <span
                  className="absolute inset-0 bg-accent/10 rounded-2xl opacity-0
                             group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
              <span className="relative z-10 text-center whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
