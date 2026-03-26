'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const techStack = [
  'Python',
  'Git',
  'MongoDB',
  'Java',
  'AWS',
  'scikit-learn',
  'OpenCV',
  'JavaScript',
  'Docker',
  'CUDA',
  'Supabase',
  'REST APIs',
  'Multi-Agent Systems',
  'RAG',
  'LangChain',
  'Financial Modeling',
  'Market Research',
  'Competitive Analysis',
  'Robotics',
  'Motion Control',
  'SciPy',
  'SQL',
  'Matplotlib',
  'Pandas',
  'NumPy',
  'Machine Learning',
] as const;

export default function TechStack() {
  const [ref, isVisible] = useScrollAnimation(0.15);

  return (
    <section id="stack" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-14 max-w-3xl">
            <p className="ds-section-meta">04 // Stack</p>
            <h2 className="ds-section-title mt-4">Toolkit</h2>
            <p className="mt-6 max-w-[55ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
              Languages, frameworks, and platforms I use regularly—listed as data, not decoration.
            </p>
          </header>

          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {techStack.map((name) => (
              <li
                key={name}
                className="font-mono-label border-b border-[var(--ghost-border)] py-2 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--secondary)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:translate-x-1 hover:border-[var(--outline)] hover:text-[var(--on-surface)]"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
