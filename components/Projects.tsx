'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Project {
  id: string;
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
    id: 'project-var',
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
    id: 'project-finmate',
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
    id: 'project-echolocate',
    title: 'EchoLocate',
    role: 'Game & AI Engineer',
    company: 'Bitcamp 2026 (1st Place — Best Moonshot Hack)',
    date: 'Apr 2026',
    description:
      'Built an AI-powered digital forensics strategy game where players investigate cyberattacks using specialized AI agents for log analysis, network tracing, artifact recovery, and timeline reconstruction. Developed an interactive cyber city, evidence graph system, and multi-agent investigation workflow that transforms incident response into a playable experience.',
    technologies: ['TypeScript', 'React', 'Multi-Agent Systems', 'AI Agents', 'Game Design', 'Data Visualization', 'Node.js'],
  },
  {
    id: 'project-schrodingers-husky',
    title: "Schrödinger's Husky",
    role: 'Quantum Developer',
    company: 'YQuantum 2026 (2nd Place — Raytheon × QuantumCT × qBraid Challenge)',
    date: 'Apr 2026',
    description:
      'Built a hybrid quantum-classical framework for solving Capacitated Vehicle Routing Problems (CVRPs). Developed a pipeline combining clustering, QUBO formulations, QAOA, QITE, DQI, and classical optimization techniques to benchmark routing performance across quantum and classical approaches. Tested the system on simulators and real quantum hardware through IBM and qBraid.',
    technologies: ['Python', 'QAOA', 'QUBO', 'QITE', 'Qiskit', 'qBraid', 'IBM Quantum', 'Optimization'],
  },
  {
    id: 'project-veritas',
    title: 'Veritas',
    role: 'AI Engineer',
    company: 'YHack 2025 (Finalist — K2 Think V2 Track)',
    date: 'Nov 2025',
    description:
      'Built an AI-powered platform focused on combating misinformation and helping users evaluate the credibility of online information. Combined natural language processing, source analysis, and user-facing tools to promote more informed decision-making and media literacy.',
    technologies: ['Python', 'NLP', 'LLMs', 'Source Analysis', 'React', 'FastAPI'],
  },
  {
    id: 'project-flowiq',
    title: 'FlowIQ',
    role: 'Full Stack Developer',
    date: 'Oct 2025',
    description:
      'Engineered an AI-enhanced analytics and visualization platform that automates data tracking, insights generation, and performance optimization. Built a React + TypeScript frontend with Tailwind CSS, Recharts, and react-query, and a modular analytics engine designed for scalability with MongoDB and AWS/GCP integration.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'react-query', 'Vite', 'MongoDB', 'AWS'],
    githubUrl: 'https://github.com/PranayK07/FlowIQ',
  },
  {
    id: 'project-stationery',
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
    id: 'project-bobcatlib',
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
    id: 'project-face-svm',
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
    <article
      id={project.id}
      data-rail-card
      className="project-block ds-card ds-rail-card group flex scroll-mt-24 flex-col p-6 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-medium tracking-[-0.02em] text-[var(--on-surface)] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-1">
            {project.title}
          </h3>
        </div>
        <time className="font-mono-label shrink-0 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--secondary)] sm:pt-0.5">
          {project.date}
        </time>
      </div>
      <p className="mt-2 font-body text-[0.8125rem] font-medium leading-[1.45] text-[var(--on-surface)]">
        {project.role}
        {project.company && <span className="font-normal text-[var(--secondary)]"> · {project.company}</span>}
      </p>
      <p className="mt-5 font-body text-[0.875rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface)_82%,var(--secondary))]">
        {project.description}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
        {project.technologies.map((tech) => (
          <li key={tech}>
            <span className="ds-chip">{tech}</span>
          </li>
        ))}
      </ul>
      {project.githubUrl && (
        <p className="mt-6 pt-1">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn-secondary inline-flex items-center gap-2 !normal-case !tracking-normal"
          >
            Repository
            <span aria-hidden className="text-[var(--secondary)]">
              →
            </span>
          </a>
        </p>
      )}
    </article>
  );
}

export default function Projects() {
  const [ref, isVisible] = useScrollAnimation(0.15);
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

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
    <section id="projects" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="ds-section-meta">06 // Projects</p>
              <h2 className="ds-section-title mt-4">Shipped work</h2>
              <p className="mt-6 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
                Hackathons, research builds, and tools I&apos;ve shipped or led.
                <span className="ml-1 text-[var(--on-surface)]">Scroll or use the arrows&nbsp;→</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="ds-scroll-btn"
                onClick={() => scrollRail(-1)}
                disabled={!canPrev}
                aria-label="Previous projects"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                className="ds-scroll-btn"
                onClick={() => scrollRail(1)}
                disabled={!canNext}
                aria-label="Next projects"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          </header>
          <div
            ref={railRef}
            className="ds-hscroll"
            role="region"
            aria-label="Projects carousel — scroll horizontally"
            tabIndex={0}
          >
            {projects.map((project) => (
              <ProjectBlock key={project.title} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
