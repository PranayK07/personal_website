'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import AIChat from '@/components/AIChat';
import { useSiteReveal } from '@/components/SiteRevealContext';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function HomePageContent() {
  const { heroProgress } = useSiteReveal();
  // Show the rest of the page once the hero is well into its animation
  const showContent = heroProgress > 0.65;

  return (
    <>
      <Hero />
      <AnimatePresence>
        {showContent && (
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.05 }}
          >
            <section id="chat" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
              <div className="mx-auto max-w-[var(--content-max)]">
                <AIChat />
              </div>
            </section>
            <WorkExperience />
            <TechStack />
            <Projects />
            <Contact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
