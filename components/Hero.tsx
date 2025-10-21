'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Hero() {
  const [ref, isVisible] = useScrollAnimation(0.3);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center">
      <div className="container text-center">
        <div 
          ref={ref}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h1 className="heading-1">
            Pranay Kakkar
          </h1>
          <p className="text-large mb-4">
            Computer Science Student
          </p>
          <p className="text-muted mb-12">
            South Windsor, CT
          </p>
          
          <p className="text-lg text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Passionate about building innovative solutions and exploring the intersection 
            of technology and creativity. Currently pursuing Computer Science with a focus 
            on full-stack development and software engineering.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const element = document.getElementById('projects');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn"
            >
              View My Work
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn bg-transparent border border-accent text-accent hover:bg-accent hover:text-white"
            >
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
