'use client';

import { useEffect, useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Tech {
  name: string;
  icon: string;
  color: string;
}

const techStack: Tech[] = [
  { name: 'React', icon: '⚛️', color: '#61DAFB' },
  { name: 'Next.js', icon: '▲', color: '#000000' },
  { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
  { name: 'JavaScript', icon: '🟨', color: '#F7DF1E' },
  { name: 'Node.js', icon: '🟢', color: '#339933' },
  { name: 'Python', icon: '🐍', color: '#3776AB' },
  { name: 'Java', icon: '☕', color: '#ED8B00' },
  { name: 'Git', icon: '📦', color: '#F05032' },
  { name: 'Docker', icon: '🐳', color: '#2496ED' },
  { name: 'AWS', icon: '☁️', color: '#FF9900' },
  { name: 'MongoDB', icon: '🍃', color: '#47A248' },
  { name: 'PostgreSQL', icon: '🐘', color: '#336791' },
];

export default function TechStack() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [ref, isVisible] = useScrollAnimation(0.2);

  const scrollLeft = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft -= 200;
    }
  };

  const scrollRight = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft += 200;
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.8;
    let isPaused = false;
    let isUserScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const animate = () => {
      if (!isPaused && !isUserScrolling) {
        scrollPosition += scrollSpeed;
        
        // Get the total scrollable width
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Reset position when we've scrolled through all items
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    // Start animation immediately with a small delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 500);

    // Pause animation on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    // Handle manual scrolling
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      isUserScrolling = true;
      scrollPosition += e.deltaY * 0.5;
      scrollContainer.scrollLeft = scrollPosition;
      
      // Resume auto-scroll after user stops scrolling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
      }, 2000);
    };

    const handleTouchStart = () => {
      isUserScrolling = true;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        isUserScrolling = false;
      }, 2000);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <section id="about" className="section">
      <div className="container">
        <div 
          ref={ref}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2 text-center mb-12">
            Tech Stack
          </h2>
          <div className="relative max-w-2xl mx-auto">
            {/* Left Arrow Button */}
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-accent/20 rounded-full p-3 hover:bg-accent/10 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-accent/20 rounded-full p-3 hover:bg-accent/10 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-hidden scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Duplicate the tech stack for seamless infinite scroll */}
              {[...techStack, ...techStack].map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="group flex-shrink-0 flex flex-col items-center justify-center p-3 card min-w-[100px] hover:scale-105 transition-all duration-300"
                >
                  <div 
                    className="w-10 h-10 mb-2 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: tech.color + '20' }}
                  >
                    {tech.icon}
                  </div>
                  <span className="text-xs font-medium text-foreground text-center">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
