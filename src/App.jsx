import { useState } from 'react';
import Loader from './components/Loader';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Lessons from './components/Lessons';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import MenuOverlay from './components/MenuOverlay';
import TopBar from './components/TopBar';
import useLenis from './hooks/useLenis';

export default function App() {
  useLenis();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Loader onReady={() => setReady(true)} />

      <main className="flex w-full flex-col gap-2 overflow-x-clip p-2 sm:gap-3 sm:p-3">
        <TopBar />

        <Hero
          ready={ready}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenContact={() => setContactOpen(true)}
        />
        <Ticker />
        <Lessons />
        <Stats />
        <Testimonials />
        <Footer onOpenContact={() => setContactOpen(true)} />
      </main>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} onOpenContact={() => setContactOpen(true)} />
    </>
  );
}
