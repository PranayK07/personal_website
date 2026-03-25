'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { RefObject } from 'react';

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
    technologies: [],
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
    <article className="group py-12 first:pt-2 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-medium tracking-tight text-[var(--fg)] sm:text-[1.35rem]">
            {experience.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--accent)]">
            {experience.company}
            <span className="text-[var(--muted)]"> · {experience.location}</span>
          </p>
        </div>
        <time
          className="shrink-0 text-[0.8125rem] tabular-nums text-[var(--muted)] sm:pt-1 sm:text-right"
          dateTime={experience.date}
        >
          {experience.date}
        </time>
      </div>
      <p className="mt-6 max-w-[65ch] text-[0.9375rem] leading-[1.7] text-[color-mix(in_oklch,var(--fg)_75%,var(--muted))]">
        {experience.description}
      </p>
      {experience.technologies.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
          {experience.technologies.map((tech) => (
            <li
              key={tech}
              className="border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--muted)]"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function WorkExperience() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="work" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref as RefObject<HTMLDivElement>} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-14 max-w-2xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">Experience</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight">
              Work & research
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
              Roles where I&apos;ve shipped analysis, research, and software in team settings.
            </p>
          </header>
          <div className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {experiences.map((experience) => (
              <ExperienceBlock key={`${experience.company}-${experience.date}`} experience={experience} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
