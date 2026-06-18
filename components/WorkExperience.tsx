'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Experience {
  title: string;
  company: string;
  location: string;
  date: string;
  description: string;
  technologies: string[];
}

const experiences: Experience[] = [
  {
    title: 'Founding Engineer',
    company: 'DeepSalud LLC',
    location: 'Remote',
    date: 'Nov 2025 – Present',
    description:
      'Working on a patient engagement platform for healthcare.',
    technologies: ['Supabase', 'REST APIs', 'Multi-Agent Systems', 'FHIR', 'RAG', 'LangChain', 'AI Safety'],
  },
  {
    title: 'Researcher',
    company: 'LLM Agent-Tool Interaction & Security Research Group',
    location: 'Storrs, CT',
    date: 'Jan 2026 – Present',
    description:
      'Conducted security research on agentic AI systems, synthesizing 10+ foundational papers into a unified threat model covering prompt injection, memory poisoning, credential leakage, and unauthorized autonomous actions. Performed red-team analysis of OpenClaw agents, reproducing real-world incidents such as the Shellraiser token launch and malicious agent tooling, and translating observed failures into concrete security tests and mitigations.',
    technologies: ['Python', 'LLM Agents', 'Red Teaming', 'Threat Modeling', 'AI Safety'],
  },
  {
    title: 'Analyst',
    company: 'Hillside Venture',
    location: 'Storrs, CT',
    date: 'Oct 2025 – Present',
    description:
      'Conducted quantitative startup analysis for a student-run venture capital fund, sourcing and evaluating 40+ early-stage fintech, AI, and SaaS companies using data-driven market research and competitive analysis. Built 3-statement financial models, unit economics, and DCF valuations for 10+ startups, applying KPI benchmarking, growth decomposition, and sensitivity analysis to support high-conviction investment decisions.',
    technologies: ['Python', 'Venture Capital', 'Financial Modeling', 'Market Research', 'Competitive Analysis'],
  },
  {
    title: 'AI/ML Researcher',
    company: 'University of Connecticut Undergraduate Research',
    location: 'Storrs, CT',
    date: 'May 2024 – Aug 2024',
    description:
      'Conducted research on data-driven biometric cryptography solutions, co-developing Face Recognition Privacy models with 92% accuracy using ResNet, DenseNet, and SVMs. Engineered CUDA-accelerated feature extraction algorithms reducing runtime by 40% while processing 400K+ structured and unstructured samples. Documented ML architectures achieving 90–94% accuracy, enhancing data communication and automation.',
    technologies: ['PyTorch', 'scikit-learn', 'CUDA', 'Python', 'Machine Learning', 'OpenCV', 'ETL', 'Git'],
  },
  {
    title: 'Physics Lab Assistant',
    company: 'The McCarron Group, University of Connecticut',
    location: 'Storrs, CT',
    date: 'May 2023 – Sep 2023',
    description:
      'Automated Python-based data collection and visualization workflows for high-precision laser calibration experiments. Applied statistical regression models to improve measurement accuracy and instrument control. Supported demonstrations and reports for 50+ researchers, improving productivity and data organization within the research team.',
    technologies: ['Python', 'Matplotlib', 'Pandas', 'NumPy', 'Data Analysis', 'SciPy', 'SQL'],
  },
  {
    title: 'Programming Lead',
    company: 'Bobcat Robotics – FRC Team 177',
    location: 'South Windsor, CT',
    date: '2023 – 2025',
    description:
      'Engineered a modular robotics software library with intuitive user interfaces and scalable architecture. Collaborated with the robotics team to translate functional requirements into efficient control algorithms. Authored documentation ensuring maintainability and extensibility for future teams.',
    technologies: ['Java', 'Git', 'Python', 'JavaScript', 'Robotics', 'Motion Control', 'Team Leadership'],
  },
];

function ExperienceBlock({ experience }: { experience: Experience }) {
  return (
    <article className="group border-t border-[var(--ghost-border)] py-8 transition-colors duration-300 hover:border-[var(--outline)] sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-[var(--on-surface)] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] sm:text-xl group-hover:translate-x-1">
            {experience.title}
          </h3>
          <p className="mt-2 font-body text-sm font-medium text-[var(--on-surface)]">
            {experience.company}
            <span className="font-normal text-[var(--secondary)]"> · {experience.location}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end sm:pt-0.5">
          <time
            className="font-mono-label text-[0.65rem] uppercase tracking-[0.12em] text-[var(--secondary)]"
            dateTime={experience.date}
          >
            {experience.date}
          </time>
        </div>
      </div>
      <p className="mt-8 max-w-[65ch] font-body text-[0.9375rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface)_82%,var(--secondary))]">
        {experience.description}
      </p>
      {experience.technologies.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
          {experience.technologies.map((tech) => (
            <li key={tech}>
              <span className="ds-chip">{tech}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ExperienceRailCard({ experience }: { experience: Experience }) {
  return (
    <article data-rail-card className="ds-card ds-rail-card group flex flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-[var(--on-surface)] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-1">
            {experience.title}
          </h3>
        </div>
        <time
          className="font-mono-label shrink-0 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--secondary)] sm:pt-0.5"
          dateTime={experience.date}
        >
          {experience.date}
        </time>
      </div>
      <p className="mt-2 font-body text-[0.8125rem] font-medium leading-[1.45] text-[var(--on-surface)]">
        {experience.company}
        <span className="font-normal text-[var(--secondary)]"> · {experience.location}</span>
      </p>
      <p className="mt-5 font-body text-[0.875rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface)_82%,var(--secondary))]">
        {experience.description}
      </p>
      {experience.technologies.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
          {experience.technologies.map((tech) => (
            <li key={tech}>
              <span className="ds-chip">{tech}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function WorkExperience() {
  const [ref, isVisible] = useScrollAnimation(0.15);
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const featured = experiences.slice(0, 3);
  const railExperiences = experiences.slice(3);

  const updateArrows = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scrollRail = useCallback((dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-rail-card]');
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount });
  }, []);

  return (
    <section id="work" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-16 max-w-3xl">
            <p className="ds-section-meta">03 // Experience</p>
            <h2 className="ds-section-title mt-4">Work & research</h2>
            <p className="mt-6 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
              Roles where I&apos;ve shipped analysis, research, and software in team settings.
            </p>
          </header>
          <div className="flex flex-col gap-11">
            {featured.map((experience) => (
              <ExperienceBlock key={`${experience.company}-${experience.date}`} experience={experience} />
            ))}
          </div>
          {railExperiences.length > 0 && (
            <div className="mt-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <p className="ds-section-meta">More experience</p>
                  <p className="mt-3 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
                    Earlier roles and research positions.
                    <span className="ml-1 text-[var(--on-surface)]">Scroll or use the arrows&nbsp;→</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="ds-scroll-btn"
                    onClick={() => scrollRail(-1)}
                    disabled={!canPrev}
                    aria-label="Previous experiences"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="ds-scroll-btn"
                    onClick={() => scrollRail(1)}
                    disabled={!canNext}
                    aria-label="Next experiences"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </div>
              <div
                ref={railRef}
                className="ds-hscroll"
                role="region"
                aria-label="More experience carousel — scroll horizontally"
                tabIndex={0}
              >
                {railExperiences.map((experience) => (
                  <ExperienceRailCard
                    key={`${experience.company}-${experience.date}`}
                    experience={experience}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
