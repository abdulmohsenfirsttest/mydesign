import SiteHeader from "./components/site/SiteHeader";
import Hero from "./components/site/Hero";
import FeaturedWork from "./components/site/FeaturedWork";
import SelectedWork from "./components/site/SelectedWork";
import Process from "./components/site/Process";
import Impact from "./components/site/Impact";
import Capabilities from "./components/site/Capabilities";
import Closing from "./components/site/Closing";
import Trust from "./components/site/Trust";
import SiteFooter from "./components/site/SiteFooter";

// v5.0.0 public home page — sections in the Wix desktop order of mydesign.sa.
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main data-public-site className="bg-site-ink">
        <Hero />
        <FeaturedWork />
        <SelectedWork />
        <Process />
        <Impact />
        <Capabilities />
        <Closing />
        <Trust />
      </main>
      <SiteFooter />
    </>
  );
}
