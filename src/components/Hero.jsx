import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Header from './Header';
import SurfScene from './SurfScene';
import { WordReveal, StackedLines } from './RevealText';
import { Dots } from './UI';

const TRIPS = [
  { tag: 'Featured Trip', title: 'Sunset Reef Break', cta: 'See the swell forecast' },
  { tag: 'New Route', title: 'Island Boat Charters', cta: 'View the charter' },
  { tag: 'Youth Program', title: 'Junior Grom Camp', cta: 'Browse camps' },
];

function TripSlider({ ready }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % TRIPS.length), 3800);
    return () => clearInterval(t);
  }, [ready]);

  const trip = TRIPS[index];

  return (
    <motion.div
      className="hidden w-64 flex-col gap-3 md:flex"
      initial={{ opacity: 0, y: 28 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.65 }}
    >
      <div className="relative flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-lg shadow-ocean-deep/20 backdrop-blur">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="flex w-full items-center gap-3"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24 }}
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-coral to-sun text-white">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 15c2-2.5 4 1 6-1s3-4 5-2 3 1.5 5 0" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-medium uppercase tracking-wide">{trip.tag}</p>
              <p className="truncate text-[0.7rem] uppercase opacity-80">{trip.title}</p>
              <span className="text-[0.65rem] underline underline-offset-2">{trip.cta} &rarr;</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <Dots count={TRIPS.length} active={index} onSelect={setIndex} tone="light" />
    </motion.div>
  );
}

function StatCard({ ready }) {
  return (
    <motion.article
      className="flex w-full max-w-xs items-stretch gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 shadow-lg shadow-ocean-deep/20 backdrop-blur sm:max-w-60"
      initial={{ opacity: 0, y: 28 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.78 }}
    >
      <div className="flex flex-col justify-between">
        <span className="text-3xl font-medium leading-none">12K+</span>
        <div className="-space-x-2 flex">
          {['#FF6A4D', '#F2B705', '#4FA69B', '#FFFFFF'].map((c, i) => (
            <span
              key={i}
              className="size-5 rounded-full border border-ocean-deep/40"
              style={{ background: c }}
            />
          ))}
        </div>
        <span className="text-[0.65rem] opacity-80">Surfers hosted</span>
      </div>
      <div className="ml-auto grid w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-ocean-light to-ocean">
        <svg viewBox="0 0 24 24" className="size-8 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 18c2-3 4 1.5 6-1s3-5 5-2.5 3 1.5 5 0" />
          <path d="M9 18v3M15 18v3" />
        </svg>
      </div>
    </motion.article>
  );
}

export default function Hero({ onOpenMenu, onOpenContact, ready }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col overflow-hidden rounded-[2rem] text-white"
      style={{ height: 'calc(100svh - 1rem)', minHeight: '36rem' }}
    >
      <SurfScene progress={scrollYProgress} />

      <Header onOpenMenu={onOpenMenu} onOpenContact={onOpenContact} />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
  <WordReveal
    as="h1"
    text="Surf,Beach,Sunset"
    gate={ready}
    delayStart={0}
    stagger={0.14}
    duration={1.1}
    className="pointer-events-auto whitespace-nowrap font-display font-medium uppercase leading-[0.85] tracking-tight text-[10.3vw] py-10 px-5 bg-ocean-deep/15 backdrop-blur-[2px] border border-ocean-light/20 rounded-2xl inline-block w-fit"
  />
</div>

      <div className="relative z-10 mt-auto flex flex-col gap-6 px-6 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-10">
        <StackedLines
          lines={['Paddle Out,', 'Wake Up Salty']}
          className="font-display font-medium uppercase leading-[0.95] tracking-tight text-white/85"
          stagger={0.11}
          baseDelay={0.35}
          duration={0.9}
        />
        <div className="flex items-end gap-4">
          <TripSlider ready={ready} />
          <StatCard ready={ready} />
        </div>
      </div>
    </section>
  );
}
