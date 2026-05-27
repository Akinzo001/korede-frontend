import { CallToAction } from "./components/CallToAction";
import { CampaignsSection } from "./components/CampaignsSection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { IntegritySection } from "./components/IntegritySection";
import { LiveLedger } from "./components/LiveLedger";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LiveLedger />
        <IntegritySection />
        <CampaignsSection />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
