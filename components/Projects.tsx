'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, MouseEvent, RefObject } from 'react';

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
    description: 'Built a face recognition model on the LFW Deep Funneled dataset using PCA and Support Vector Machines with linear, RBF, and polynomial kernels; achieved highest accuracy with RBF on facial feature classification.',
    githubUrl: 'https://github.com/PranayK07/SVM_regressiontest',
    technologies: ['Python', 'scikit-learn', 'PCA', 'SVM', 'OpenCV'],
},

  // Add more projects by copying the format above
];


function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
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

  const cardStyle = {
    transform: `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) ${isHovering ? 'translateZ(20px)' : 'translateZ(0)'}`,
    transition: 'transform 0.1s ease-out',
  };

  const content = (
    <div
      className="card relative overflow-hidden group perspective-1000"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(17, 17, 17, 0.7) 100%)',
      }}
    >
      {/* Animated gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, rgba(99, 102, 241, 0.15), transparent 50%)`,
        }}
      />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.1) ${(mousePosition.x + 1) * 50}%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header with title on left and date on right */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h3 className="heading-3 mb-3 group-hover:text-accent transition-colors duration-300 text-left">
              {project.title}
            </h3>
            <p className="text-accent font-medium text-left">
              {project.role}
              {project.company && ` at ${project.company}`}
            </p>
          </div>
          <span className="text-muted text-sm whitespace-nowrap flex-shrink-0 text-right">{project.date}</span>
        </div>
        
        <p className="text-muted mb-6 leading-relaxed text-left">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full hover:bg-accent/20 hover:scale-105 transition-all duration-200 cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 3D depth effect border */}
      <div className="absolute inset-0 rounded-xl border border-accent/0 group-hover:border-accent/30 transition-all duration-500 pointer-events-none" />
    </div>
  );

  if (project.githubUrl) {
    return (
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={cardStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
    >
      {content}
    </div>
  );
}

export default function Projects() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section id="projects" className="section">
      <div className="container text-center">
        <div
          ref={ref as RefObject<HTMLDivElement>}
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
