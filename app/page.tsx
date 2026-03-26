import HomePageContent from '@/components/HomePageContent';
import Footer from '@/components/Footer';
import PortfolioShell from '@/components/PortfolioShell';
import MonolithBackdrop from '@/components/MonolithBackdrop';
import ParallaxDepthCanvas from '@/components/ParallaxDepthCanvas';
import { SiteRevealProvider } from '@/components/SiteRevealContext';

export default function Home() {
  return (
    <SiteRevealProvider>
      {/* Base dot-grid surface */}
      <MonolithBackdrop />
      {/* Floating depth particles layered above */}
      <ParallaxDepthCanvas />
      <PortfolioShell>
        <main>
          <HomePageContent />
        </main>
      </PortfolioShell>
      <Footer />
    </SiteRevealProvider>
  );
}
