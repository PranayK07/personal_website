import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import PortfolioShell from '@/components/PortfolioShell';
import AIChat from '@/components/AIChat';
import StarfieldBackdrop from '@/components/StarfieldBackdrop';

export default function Home() {
  return (
    <>
      <StarfieldBackdrop />
      <PortfolioShell>
        <main>
          <Hero />
          <section id="chat" className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-[var(--content-max)]">
              <AIChat />
            </div>
          </section>
          <WorkExperience />
          <TechStack />
          <Projects />
          <Contact />
        </main>
      </PortfolioShell>
      <Footer />
    </>
  );
}
