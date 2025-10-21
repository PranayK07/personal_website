'use client';

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
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="projects">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-12 text-center">
          Projects & Achievements
        </h2>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-card-bg rounded-lg p-6 border border-accent-cyan/20 hover:border-accent-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-cyan/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="mb-2 sm:mb-0">
                  <h3 className="text-xl sm:text-2xl font-semibold text-heading mb-1">
                    {project.title}
                  </h3>
                  <p className="text-accent-cyan font-medium">
                    {project.role}
                    {project.company && ` at ${project.company}`}
                  </p>
                </div>
                <span className="text-text-muted text-sm">{project.date}</span>
              </div>
              <p className="text-foreground mb-4 leading-relaxed">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 text-xs font-medium bg-accent-cyan/10 text-accent-cyan-light rounded-full border border-accent-cyan/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
