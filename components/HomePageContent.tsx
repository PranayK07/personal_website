'use client';

import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import AIChat from '@/components/AIChat';
import { useSiteReveal } from '@/components/SiteRevealContext';

export default function HomePageContent() {
  const { revealed } = useSiteReveal();

  return (
    <>
      <Hero />
      {revealed && (
        <>
          <section id="chat" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-[var(--content-max)]">
              <AIChat />
            </div>
          </section>
          <WorkExperience />
          <TechStack />
          <Projects />
          <Contact />
        </>
      )}
    </>
  );
}
