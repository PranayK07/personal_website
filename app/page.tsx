'use client';

import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import PillNav from '@/components/PillNav';
import AIChat from '@/components/AIChat';
import GravityStarsBackground from '@/components/GravityStarsBackground';

export default function Home() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <GravityStarsBackground />
      </div>
      <CustomCursor />
      <PillNav
        items={[
          { label: 'Home', href: '#home' },
          { label: 'Work', href: '#work' },
          { label: 'Stack', href: '#stack' },
          { label: 'Projects', href: '#projects' },
          { label: 'Contact', href: '#contact' }
        ]}
        activeHref="/"
        baseColor="#111118"
        pillColor="#1a1a24"
        hoveredPillTextColor="#6366f1"
        pillTextColor="#94a3b8"
        hideOnMobile={false}
      />
      <main>
        <Hero />
        {/* Dedicated Chat section below the fold; always mounted */}
        <section id="chat" style={{
          paddingTop: 'var(--pillnav-safe-top, 192px)',
          scrollMarginTop: 'var(--pillnav-safe-top, 192px)'
        }} className="px-4 flex justify-center">
          <AIChat />
        </section>
        <WorkExperience />
        <TechStack />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
