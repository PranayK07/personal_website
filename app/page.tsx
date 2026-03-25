import HomePageContent from '@/components/HomePageContent';
import Footer from '@/components/Footer';
import PortfolioShell from '@/components/PortfolioShell';
import StarfieldBackdrop from '@/components/StarfieldBackdrop';
import { SiteRevealProvider } from '@/components/SiteRevealContext';

export default function Home() {
  return (
    <SiteRevealProvider>
      <StarfieldBackdrop />
      <PortfolioShell>
        <main>
          <HomePageContent />
        </main>
      </PortfolioShell>
      <Footer />
    </SiteRevealProvider>
  );
}
