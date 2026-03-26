import HomePageContent from '@/components/HomePageContent';
import Footer from '@/components/Footer';
import PortfolioShell from '@/components/PortfolioShell';
import MonolithBackdrop from '@/components/MonolithBackdrop';
import { SiteRevealProvider } from '@/components/SiteRevealContext';

export default function Home() {
  return (
    <SiteRevealProvider>
      <MonolithBackdrop />
      <PortfolioShell>
        <main>
          <HomePageContent />
        </main>
      </PortfolioShell>
      <Footer />
    </SiteRevealProvider>
  );
}
