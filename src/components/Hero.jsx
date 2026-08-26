import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Header from './Header';
import SurfScene from './SurfScene';
import { TypeWriter, StackedLines } from './RevealText';
import { Dots, PillButton } from './UI';
import { scrollToId } from '../hooks/useLenis';


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


export default function Hero({ onOpenMenu, onOpenContact, ready }) {
  const wrapperRef = useRef(null);

  // Track scroll across the TALL wrapper, not the sticky section itself.
  // This is what gives the pinned section real scroll distance to
  // animate across before it releases to the rest of the page.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    // Tall outer container — controls how much scroll distance the
    // pinned hero eats before releasing to the next section.
    // 300vh = pinned for ~2 extra screens of scrolling.
    // Increase (e.g. 400vh) for slower/more deliberate image transitions,
    // decrease (e.g. 200vh) for a snappier effect.
    <div ref={wrapperRef} className="relative h-[200vh]">
      <section
        className="sticky top-0 isolate flex flex-col overflow-hidden rounded-[2rem] text-white"
        style={{ height: 'calc(100svh - 1rem)', minHeight: '36rem' }}
      >
        <SurfScene progress={scrollYProgress} />

        <Header onOpenMenu={onOpenMenu} onOpenContact={onOpenContact} />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-7 px-6">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
            <PillButton variant="light" onClick={onOpenContact}>
              Book your session
            </PillButton>
            <button
              onClick={() => scrollToId('lessons')}
              className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              Explore trips
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-auto flex flex-col gap-6 px-6 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-10">
          <StackedLines
            lines={['Paddle Out,', 'Wake Up Salty']}
            className="font-display font-medium uppercase leading-[0.95] tracking-tight text-white/85"
            stagger={0.11}
            baseDelay={0.35}
            duration={0.9}
            />
          </div>

        <motion.div
          style={{ opacity: scrollCueOpacity }}
          className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/70">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm text-white/70"
          >
            &darr;
          </motion.span>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/10">
          <motion.div className="h-full origin-left bg-sun" style={{ scaleX: scrollYProgress }} />
        </div>
      </section>
    </div>
  );
}