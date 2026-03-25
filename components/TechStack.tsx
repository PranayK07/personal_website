'use client';

import { RefObject } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Image from 'next/image';

interface Tech {
  name: string;
  icon?: string;
  logo?: string;
  color: string;
}

const techStack: Tech[] = [
  { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776AB' },
  { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', color: '#F05032' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', color: '#3178C6' },
  { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', color: '#47A248' },
  { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', color: '#ED8B00' },
  { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', color: '#FF9900' },
  {
    name: 'scikit-learn',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg',
    color: '#F7931E',
  },
  { name: 'OpenCV', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg', color: '#5C3EE8' },
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#61DAFB' },
  { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', color: '#F7DF1E' },
  { name: 'Azure', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg', color: '#0089D6' },
  { name: 'Kotlin', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg', color: '#d500ae' },
  { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: '#2496ED' },
  { name: 'CUDA', logo: 'https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg', color: '#078912' },
];

export default function TechStack() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="stack" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref as RefObject<HTMLDivElement>} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-14 max-w-2xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">Toolkit</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight">Tech stack</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
              Languages, frameworks, and platforms I use regularly.
            </p>
          </header>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {techStack.map((tech) => (
              <li
                key={tech.name}
                className="flex flex-col items-center border border-[var(--line)] bg-[color-mix(in_oklch,var(--bg-elevated)_85%,transparent)] px-4 py-6 text-center transition-colors hover:border-[color-mix(in_oklch,var(--accent)_45%,var(--line))]"
              >
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm"
                  style={{ backgroundColor: `${tech.color}12` }}
                >
                  {tech.logo ? (
                    <div className="relative h-8 w-8">
                      <Image src={tech.logo} alt={`${tech.name} logo`} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <span className="text-2xl" aria-hidden>
                      {tech.icon}
                    </span>
                  )}
                </div>
                <span className="text-[0.8125rem] font-medium text-[var(--fg)]">{tech.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
