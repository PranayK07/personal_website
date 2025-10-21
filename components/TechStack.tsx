'use client';

import { useEffect, useRef } from 'react';

const techStack = [
  { name: 'React', logo: '⚛️' },
  { name: 'Next.js', logo: '▲' },
  { name: 'TypeScript', logo: 'TS' },
  { name: 'Node.js', logo: '🟢' },
  { name: 'Python', logo: '🐍' },
  { name: 'Java', logo: '☕' },
  { name: 'JavaScript', logo: 'JS' },
  { name: 'Git', logo: '📦' },
  { name: 'Docker', logo: '🐳' },
  { name: 'AWS', logo: '☁️' },
  { name: 'MongoDB', logo: '🍃' },
  { name: 'PostgreSQL', logo: '🐘' },
];

export default function TechStack() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const intervalId = setInterval(scroll, 20);

    return () => clearInterval(intervalId);
  }, []);

  // Duplicate items for seamless loop
  const duplicatedStack = [...techStack, ...techStack];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-12 text-center">
          Tech Stack
        </h2>
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-hidden scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {duplicatedStack.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex-shrink-0 flex flex-col items-center justify-center p-6 min-w-[120px] bg-card-bg rounded-lg border border-accent-cyan/20 hover:border-accent-cyan/50 transition-colors"
              >
                <div className="text-4xl mb-3">{tech.logo}</div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
