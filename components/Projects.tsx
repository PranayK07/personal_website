'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { RefObject } from 'react';

interface Project {
  title: string;
  role: string;
  company?: string;
  date: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
}

const projects: Project[] = [
  {
    title: 'Value at Risk Estimation',
    role: 'Researcher & Developer',
    company: 'MIT iQuHack 2026 (3rd Place, State Street x Classiq Challenge)',
    date: 'Jan 2026',
    description:
      'Developed a quantitative Value at Risk (VaR) estimation framework comparing classical Monte Carlo methods with a quantum-based estimator, demonstrating improved convergence for high-precision tail risk estimation. Designed an optimized quantile inversion pipeline for 95% VaR using interpolation-based search, reducing evaluation steps by 30–40%, and extended analysis to fat-tailed and skewed return distributions with CVaR and EVaR risk measures.',
    technologies: ['Python', 'Quantum Computing', 'Quantitative Risk Modeling', 'Statistical Analysis', 'Optimization'],
    githubUrl: 'https://github.com/UConn-Quantum-Computing/MIT-iQuHack-2026-State-Street-Classiq',
  },
  {
    title: 'FinMate',
    role: 'Backend Engineer',
    company: 'CodeLinc 10 Hackathon (2nd Place, $2,500 Award)',
    date: 'Oct 2025',
    description:
      'Developed an AI-powered financial assistant using Claude Sonnet 4 via AWS Bedrock with a RAG-based agentic backend for personalized employee benefits guidance. Built a hybrid AWS stack with Lambda, API Gateway, S3, RDS (MySQL), and EC2, implementing secure CRUD operations, prompt engineering, and real-time retrieval optimization.',
    technologies: ['AWS Bedrock', 'Claude Sonnet 4', 'Lambda', 'API Gateway', 'RDS (MySQL)', 'S3', 'EC2', 'TypeScript'],
    githubUrl: 'https://github.com/SujayCh07/codelinc10',
  },
  {
    title: 'FlowIQ',
    role: 'Full Stack Developer',
    date: 'Oct 2025',
    description:
      'Engineered an AI-enhanced analytics and visualization platform that automates data tracking, insights generation, and performance optimization. Built a React + TypeScript frontend with Tailwind CSS, Recharts, and react-query, and a modular analytics engine designed for scalability with MongoDB and AWS/GCP integration.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'react-query', 'Vite', 'MongoDB', 'AWS'],
    githubUrl: 'https://github.com/PranayK07/FlowIQ',
  },
  {
    title: 'Stationery',
    role: 'Mobile Developer',
    company: 'Congressional App Challenge',
    date: 'Jan 2025 – Mar 2025',
    description:
      'Built a career exploration app using Kotlin and MongoDB to deliver personalized, data-driven career advising features. Collaborated with users through beta testing, improving UX and usability; received Special Recognition for Innovation at the Congressional App Challenge.',
    technologies: ['Kotlin', 'MongoDB', 'Android Studio', 'NoSQL', 'Figma'],
    githubUrl: 'https://github.com/PranayK07/Stationery',
  },
  {
    title: 'BobcatLib',
    role: 'Software Engineer',
    company: 'Bobcat Robotics – FRC Team 177',
    date: 'May 2024',
    description:
      'Developed a modular robotics software library with intuitive interfaces and optimized control algorithms. Collaborated with team engineers to translate system requirements into scalable technical solutions and created maintainable documentation for long-term usability.',
    technologies: ['Java', 'WPILib', 'Gradle', 'Git', 'FRC Robotics'],
    githubUrl: 'https://github.com/BobcatRobotics/BobcatLib',
  },
  {
    title: 'Face Classification with SVMs',
    role: 'Independent Project',
    company: '',
    date: 'Jun 2025',
    description:
      'Built a face recognition model on the LFW Deep Funneled dataset using PCA and Support Vector Machines with linear, RBF, and polynomial kernels; achieved highest accuracy with RBF on facial feature classification.',
    githubUrl: 'https://github.com/PranayK07/SVM_regressiontest',
    technologies: ['Python', 'scikit-learn', 'PCA', 'SVM', 'OpenCV'],
  },
];

function ProjectBlock({ project }: { project: Project }) {
  return (
    <article className="py-12 first:pt-2 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-medium tracking-tight text-[var(--fg)] sm:text-[1.35rem]">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--accent)]">
            {project.role}
            {project.company && <span className="text-[var(--muted)]"> · {project.company}</span>}
          </p>
        </div>
        <time className="shrink-0 text-[0.8125rem] tabular-nums text-[var(--muted)] sm:pt-1 sm:text-right">
          {project.date}
        </time>
      </div>
      <p className="mt-6 max-w-[65ch] text-[0.9375rem] leading-[1.7] text-[color-mix(in_oklch,var(--fg)_75%,var(--muted))]">
        {project.description}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-wider text-[var(--muted)]"
          >
            {tech}
          </li>
        ))}
      </ul>
      {project.githubUrl && (
        <p className="mt-6">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
          >
            View repository
            <span aria-hidden>↗</span>
          </a>
        </p>
      )}
    </article>
  );
}

export default function Projects() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="projects" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref as RefObject<HTMLDivElement>} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-14 max-w-2xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">Projects</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-tight">
              Projects & achievements
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
              Hackathons, research builds, and tools I&apos;ve shipped or led.
            </p>
          </header>
          <div className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
            {projects.map((project) => (
              <ProjectBlock key={project.title} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
