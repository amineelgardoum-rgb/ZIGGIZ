import { useState } from 'react';
import Loader from '../components/Loader';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import Lessons from '../components/Lessons';
import Pricing from '../components/Pricing';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import MenuOverlay from '../components/MenuOverlay';
import TopBar from '../components/TopBar';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Loader />

      <main className="flex w-full flex-col gap-0 overflow-x-clip">
        <TopBar />

        <Hero onOpenMenu={() => setMenuOpen(true)} />
        <Ticker />
        <Lessons />
        <Pricing />
        <Stats />
        <Testimonials />
        <Footer />
      </main>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
