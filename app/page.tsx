import HomePageContent from '@/components/HomePageContent';
import Footer from '@/components/Footer';
import PortfolioShell from '@/components/PortfolioShell';
import MonolithBackdrop from '@/components/MonolithBackdrop';
import { SiteRevealProvider } from '@/components/SiteRevealContext';
import { getLastUpdated } from '@/lib/getLastUpdated';

export default async function Home() {
  const lastUpdated = await getLastUpdated();

  return (
    <SiteRevealProvider>
      {/* Static dot-grid surface */}
      <MonolithBackdrop />
      <PortfolioShell lastUpdated={lastUpdated}>
        <main>
          <HomePageContent />
        </main>
      </PortfolioShell>
      <Footer />
    </SiteRevealProvider>
  );
}
