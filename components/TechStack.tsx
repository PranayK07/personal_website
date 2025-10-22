'use client';


import { useEffect, useRef, useState, RefObject } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Image from 'next/image';

interface Tech {
  name: string;
  // Use either 'icon' for emoji or 'logo' for image URL
  icon?: string;
  logo?: string;
  color: string;
}

/**
 * Tech Stack Configuration
 *
 * How to add a new technology:
 * 1. Add a new object to the array below
 * 2. Set 'name' to the technology name
 * 3. Choose ONE of the following:
 *    - Use 'icon' for emoji (e.g., icon: '⚛️')
 *    - Use 'logo' for image URL (e.g., logo: '/logos/react.svg' or 'https://...')
 * 4. Set 'color' to the brand color (used for background tint)
 *
 * Images will automatically be sized and formatted to fit the card.
 */
const techStack: Tech[] = [
  {
    name: 'Python',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: '#3776AB'
  },
  {
    name: 'Git',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    color: '#F05032'
  },
  {
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    color: '#3178C6'
  },
  {
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    color: '#47A248'
  },
  {
    name: 'Java',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    color: '#ED8B00'
  },
  {
    name: 'AWS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',
    color: '#FF9900'
  },
  {
    name: 'scikit-learn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg',
    color: '#F7931E'
  },
  {
    name: 'OpenCV',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
    color: '#5C3EE8'
  },
  {
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    color: '#61DAFB'
  },
  {
    name: 'JavaScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    color: '#F7DF1E'
  },
  {
    name: 'Azure',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
    color: '#0089D6'
  },
  {
    name: 'Kotlin',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    color: '#d500ae'
  },
  {
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    color: '#2496ED'
  },
  {
    name: 'CUDA',
    logo: 'https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg',
    color: '#078912'
  }
];

function TechCard({ tech, onHover }: { tech: Tech; onHover: (hovering: boolean) => void }) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="group flex-shrink-0 flex flex-col items-center justify-center px-6 py-12 min-w-[140px] min-h-[180px] hover:scale-105 transition-all duration-300 cursor-pointer rounded-xl border border-white/0 shadow-[0_4px_16px_0_rgba(20,184,166,0.15)] hover:shadow-[0_4px_20px_0_rgba(20,184,166,0.3)] hover:border-white/20"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="w-14 h-14 mb-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ backgroundColor: tech.color + '15' }}
      >
        {tech.logo ? (
          <div className="relative w-10 h-10">
            <Image
              src={tech.logo}
              alt={`${tech.name} logo`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <span className="text-3xl">{tech.icon}</span>
        )}
      </div>
      <span className="text-sm font-medium text-foreground text-center">
        {tech.name}
      </span>
    </div>
  );
}

export default function TechStack() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [isPaused, setIsPaused] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.55;
    const animate = () => {
      if (!isPaused && !isManualScrolling) {
        scrollPosition += scrollSpeed;

        // Calculate the width of one set of items
        const itemWidth = scrollContainer.scrollWidth / 2;

        // Reset position for seamless loop
        if (scrollPosition >= itemWidth) {
          scrollPosition = 0;
        }

        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a small delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, isManualScrolling]);

  const handleCardHover = (hovering: boolean) => {
    setIsPaused(hovering);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Pause automatic scrolling
    setIsManualScrolling(true);

    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Scroll by approximately 2 cards width
    const scrollAmount = 300;
    const targetScroll = scrollContainer.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Resume automatic scrolling after 3 seconds of inactivity
    pauseTimeoutRef.current = setTimeout(() => {
      setIsManualScrolling(false);
    }, 3000);
  };

  return (
    <section id="stack" className="section py-32" style={{ overflow: 'visible' }}>
      <div className="container" style={{ overflow: 'visible' }}>
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
          style={{ overflow: 'visible' }}
        >
          <h2 className="heading-2 text-center mb-12">
            Tech Stack
          </h2>

          <div className="relative max-w-5xl mx-auto my-16" style={{ overflow: 'visible' }}>
            {/* Navigation Arrows */}
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] group"
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
              }}
              aria-label="Scroll left"
            >
              <svg
                className="w-6 h-6 text-teal-400 group-hover:text-teal-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => handleScroll('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] group"
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
              }}
              aria-label="Scroll right"
            >
              <svg
                className="w-6 h-6 text-teal-400 group-hover:text-teal-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Gradient overlays for smooth fade effect */}
            <div
              className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, #0a0a0a 0%, rgba(10, 10, 10, 0.8) 40%, transparent 100%)'
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to left, #0a0a0a 0%, rgba(10, 10, 10, 0.8) 40%, transparent 100%)'
              }}
            />

            <div
              ref={scrollContainerRef}
              className="flex gap-4 scrollbar-hide"
              style={{
                overflowX: 'hidden',
                overflowY: 'visible',
                paddingTop: '4rem',
                paddingBottom: '4rem'
              }}
            >
              {/* Triple the tech stack for seamless infinite scroll */}
              {[...techStack, ...techStack, ...techStack].map((tech, index) => (
                <TechCard
                  key={`${tech.name}-${index}`}
                  tech={tech}
                  onHover={handleCardHover}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
