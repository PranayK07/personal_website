'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, MouseEvent, RefObject } from 'react';

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
    date: '2024 – 2025',
    description:
      'Engineered a modular robotics software library with intuitive user interfaces and scalable architecture. Collaborated with the robotics team to translate functional requirements into efficient control algorithms. Authored documentation ensuring maintainability and extensibility for future teams.',
    technologies: ['Java', 'Git', 'Python', 'JavaScript', 'Robotics', 'Motion Control', 'Team Leadership'],
  },

  // Add more experiences by copying the format above
];


function ExperienceCard({ experience, index }: { experience: Experience; index: number }) {
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
          {/* Header with title on left and date on right */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex-1">
              <h3 className="heading-3 mb-3 group-hover:text-accent transition-colors duration-300 text-left">
                {experience.title}
              </h3>
              <p className="text-accent font-medium text-left">
                {experience.company} • {experience.location}
              </p>
            </div>
            <span className="text-muted text-sm whitespace-nowrap flex-shrink-0 text-right">{experience.date}</span>
          </div>
          
          {/* Description */}
          <p className="text-muted mb-6 leading-relaxed text-left">
            {experience.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {experience.technologies.map((tech, techIndex) => (
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
    </div>
  );
}

export default function WorkExperience() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section id="experience" className="section">
      <div className="container text-center">
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2 text-center mb-12">
            Work Experience
          </h2>
          <div className="grid gap-6 max-w-2xl mx-auto">
            {experiences.map((experience, index) => (
              <ExperienceCard key={index} experience={experience} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
