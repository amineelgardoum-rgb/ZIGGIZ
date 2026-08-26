import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from './Header';
import SurfScene from './SurfScene';
import { StackedLines } from './RevealText';
import { PillButton } from './UI';
import { scrollToId } from '../hooks/useLenis';
import { useI18n } from '../i18n/I18nContext';

export default function Hero({ onOpenMenu, onOpenContact }) {
  const { t } = useI18n();
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

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-4 sm:gap-7 sm:px-6">
          <div className="pointer-events-auto flex w-full max-w-sm flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <PillButton variant="light" onClick={onOpenContact} className="justify-center">
              {t.hero.bookSession}
            </PillButton>
            <button
              onClick={() => scrollToId('lessons')}
              className="rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              {t.hero.exploreTrips}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-auto flex flex-col gap-6 px-6 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-10">
          <StackedLines
            lines={t.hero.titleLines}
            className="font-display text-4xl font-medium uppercase leading-[0.95] tracking-tight text-white/85 sm:text-6xl lg:text-7xl"
            stagger={0.11}
            baseDelay={0.35}
            duration={0.9}
            />
          </div>

        <motion.div
          style={{ opacity: scrollCueOpacity }}
          className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/70">{t.hero.scroll}</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm text-white/70"
          >
            &darr;
          </motion.span>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/10">
          <motion.div className="h-full origin-left rtl:origin-right bg-sun" style={{ scaleX: scrollYProgress }} />
        </div>
      </section>
    </div>
  );
}
