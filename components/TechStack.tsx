'use client';

import { useEffect, useRef, useState } from 'react';
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
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    color: '#61DAFB'
  },
  {
    name: 'Next.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    color: '#000000'
  },
  {
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    color: '#3178C6'
  },
  {
    name: 'JavaScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    color: '#F7DF1E'
  },
  {
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    color: '#339933'
  },
  {
    name: 'Python',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: '#3776AB'
  },
  {
    name: 'Java',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    color: '#ED8B00'
  },
  {
    name: 'Git',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    color: '#F05032'
  },
  {
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    color: '#2496ED'
  },
  {
    name: 'AWS',
    icon: '☁️',
    color: '#FF9900'
  },
  {
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    color: '#47A248'
  },
  {
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    color: '#336791'
  },
];

function TechCard({ tech, onHover }: { tech: Tech; onHover: (hovering: boolean) => void }) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="group flex-shrink-0 flex flex-col items-center justify-center p-4 card min-w-[120px] hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div
        className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ backgroundColor: tech.color + '15' }}
      >
        {tech.logo ? (
          <div className="relative w-8 h-8">
            <Image
              src={tech.logo}
              alt={`${tech.name} logo`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <span className="text-2xl">{tech.icon}</span>
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

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Slower, smoother scrolling

    const animate = () => {
      if (!isPaused) {
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
  }, [isPaused]);

  const handleCardHover = (hovering: boolean) => {
    setIsPaused(hovering);
  };

  return (
    <section id="about" className="section py-20">
      <div className="container">
        <div
          ref={ref}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2 text-center mb-4">
            Tech Stack
          </h2>
          <p className="text-center text-foreground/60 mb-12 max-w-2xl mx-auto">
            Technologies and tools I work with
          </p>

          <div className="relative max-w-5xl mx-auto">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-hidden scrollbar-hide py-4"
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

          {/* Subtle hint that hovering pauses */}
          <p className="text-center text-foreground/40 text-xs mt-6">
            Hover over a card to pause
          </p>
        </div>
      </div>
    </section>
  );
}
