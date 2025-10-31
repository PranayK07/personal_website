import Hero from '@/components/Hero';
import WorkExperience from '@/components/WorkExperience';
import TechStack from '@/components/TechStack';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import DotGrid from '@/components/DotGrid';
import CustomCursor from '@/components/CustomCursor';
import Chat from '@/components/Chat';
import FluidNavBar from '@/components/FluidNavBar';

export default function Home() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-10" style={{ opacity: 0.7 }}>
        <DotGrid
          dotSize={2}
          gap={40}
          baseColor="#4a4a5a"
          activeColor="#6366f1"
          proximity={120}
          shockRadius={200}
          shockStrength={4}
          resistance={800}
          returnDuration={1.2}
        />
      </div>
      <CustomCursor />
      <FluidNavBar />
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
