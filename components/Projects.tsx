'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, MouseEvent } from 'react';

interface Project {
  title: string;
  role: string;
  company?: string;
  date: string;
  description: string;
  technologies: string[];
}

const projects: Project[] = [
  {
    title: 'Project Title 1',
    role: 'Full Stack Developer',
    company: 'Company Name',
    date: '2024',
    description: 'Add your project description here. Describe what you built, the impact it had, and your key contributions.',
    technologies: ['React', 'Node.js', 'MongoDB'],
  },
  {
    title: 'Project Title 2',
    role: 'Software Engineer',
    company: 'Company Name',
    date: '2023',
    description: 'Add your project description here. Describe what you built, the impact it had, and your key contributions.',
    technologies: ['Python', 'Django', 'PostgreSQL'],
  },
  {
    title: 'Project Title 3',
    role: 'Developer',
    date: '2023',
    description: 'Add your project description here. Describe what you built, the impact it had, and your key contributions.',
    technologies: ['TypeScript', 'Next.js', 'AWS'],
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const rotateX = isHovering ? mousePosition.y * 10 : 0;
  const rotateY = isHovering ? mousePosition.x * 10 : 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative group perspective-1000"
      style={{
        transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) ${isHovering ? 'translateZ(20px)' : 'translateZ(0)'}`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div
        className="card relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(17, 17, 17, 0.7) 100%)',
        }}
      >
        {/* Animated gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, rgba(20, 184, 166, 0.15), transparent 50%)`,
          }}
        />

        {/* Shimmer effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 0%, rgba(20, 184, 166, 0.1) ${(mousePosition.x + 1) * 50}%, transparent 100%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="text-center sm:text-left">
              <h3 className="heading-3 mb-2 group-hover:text-accent transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-accent font-medium">
                {project.role}
                {project.company && ` at ${project.company}`}
              </p>
            </div>
            <span className="text-muted text-sm mt-2 sm:mt-0 text-center sm:text-right">{project.date}</span>
          </div>
          <p className="text-muted mb-6 leading-relaxed text-center sm:text-left">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full border border-accent/20 hover:bg-accent/20 hover:scale-105 transition-all duration-200 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 3D depth effect border */}
        <div className="absolute inset-0 rounded-xl border border-accent/0 group-hover:border-accent/30 transition-all duration-500 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Projects() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section id="projects" className="section">
      <div className="container text-center">
        <div
          ref={ref}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2 text-center mb-12">
            Projects & Achievements
          </h2>
          <div className="grid gap-6 max-w-2xl mx-auto">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
