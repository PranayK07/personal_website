'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

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
          <div className="grid gap-4 max-w-2xl mx-auto">
            {projects.map((project, index) => (
              <div
                key={index}
                className="card group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="text-center sm:text-left">
                    <h3 className="heading-3 mb-2">
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
                      className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
