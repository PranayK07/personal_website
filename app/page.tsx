import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import CustomCursor from '@/components/CustomCursor';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <Navigation />
      <main>
        <Hero />
        <WorkExperience />
        <TechStack />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  );
}
