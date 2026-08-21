import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Photo from './Photo';
import { ArrowButton, Dots } from './UI';

const SLIDES = [
  {
    headline: ['Local', 'Line-Ups,', 'Honest', 'Forecasts'],
    variant: 'crew',
    name: 'Redoune EL GARDOUM',
    role: 'Head Guide',
    image: '/images/Red1.png',
  },
  {
    headline: ['Reef', 'Reading,', 'Safety', 'First'],
    variant: 'reef',
    name: 'Owen Bright',
    role: 'Swell Forecaster',
    image: '/images/owen-bright.jpg',
  },
  {
    headline: ['Grommets', 'Welcome,', 'Legends', 'Made'],
    variant: 'dawn',
    name: 'Aroha Nui',
    role: 'Juniors Lead',
    image: '/images/aroha-nui.jpg',
  },
];
export default function Ticker() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });

  const xTL = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);
  const xTR = useTransform(scrollYProgress, [0, 1], ['3%', '-3%']);
  const xBL = useTransform(scrollYProgress, [0, 1], ['-2%', '4%']);
  const xBR = useTransform(scrollYProgress, [0, 1], ['4%', '-3%']);

  const slide = SLIDES[index];
  const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-sand px-6 py-16 sm:px-10 sm:py-20"
    >
    <div className="absolute inset-2 -z-10 overflow-hidden rounded-[2rem] ">
    <img
      src="/images/hotel.png"
      alt=""
      className="h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-ocean-deep/60" />
  </div>


      <div className="relative z-20 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <motion.div
          className="grid size-28 shrink-0 place-items-center rounded-2xl text-center  sm:size-32"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <span className="block text-2xl font-medium">100%</span>
          <span className="mx-auto mt-1 block max-w-[7em] text-[0.6rem] text-ink-soft">
            Trips shaped around your level
          </span>
        </motion.div>

        <motion.article
          className="flex max-w-md flex-col gap-4 rounded-3xl bg-sand-deep p-5 sm:gap-5 sm:p-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.12 }}
        >
          <span className="w-fit rounded-xl bg-sand px-4 py-2 text-xl font-medium">#01</span>
          <h3 className="text-lg font-medium">Guided by people who live here</h3>
          <p className="text-xs leading-relaxed text-ink-soft">
            From first paddle-outs to overhead reef days, every trip is led by guides who surf
            this coastline year-round — so the swell talk is real, not a brochure.
          </p>
        </motion.article>
      </div>

      <h2
        id="trust-title"
        className="pointer-events-none bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6e relative z-0 mx-auto mt-12 max-w-[88rem] select-none text-[8.2vw] font-medium uppercase leading-[1.02] rounded-2xl tracking-tight py-10 px-5"
      >
        <AnimatePresence mode="wait">
          <div key={index + '-a'} className="fleacx justify-between">
            <RevealGhostWord word={slide.headline[0]} x={xTL} color="#FFF" />
            <RevealGhostWord word={slide.headline[1]} x={xTR} color="#94aef3" />
          </div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <div key={index + '-b'} className="flex justify-between">
            <RevealGhostWord word={slide.headline[2]} x={xBL} color="#000" />
            <RevealGhostWord word={slide.headline[3]} x={xBR} color="#0036ac" />
          </div>
        </AnimatePresence>
      </h2>

      <div className="relative z-10 mx-auto mt-6 flex justify-center sm:mt-0">
        <figure className="relative aspect-[3/4] w-70 shrink-0 -rotate-6 overflow-hidden rounded-3xl bg-ocean shadow-xl sm:w-70 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
  <AnimatePresence mode="wait">
    <motion.div
      key={index}
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={slide.image}
        alt={`${slide.name}, ${slide.role}`}
        className="h-full w-full object-cover"
      />
    </motion.div>
  </AnimatePresence>
  <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-ocean-deep/40 px-3 py-2 text-white backdrop-blur">
    <p className="text-sm font-medium">{slide.name}</p>
    <p className="text-[0.65rem] opacity-80">{slide.role}</p>
  </figcaption>
</figure>
      </div>

      <div className="relative z-20 mt-12 flex items-center justify-between sm:mt-24">
        <ArrowButton direction="prev" variant="outline" onClick={() => go(-1)} label="Previous guide" />
        <Dots count={SLIDES.length} active={index} onSelect={setIndex} tone="dark" />
        <ArrowButton direction="next" variant="solid" onClick={() => go(1)} label="Next guide" />
      </div>
    </section>
  );
}

function RevealGhostWord({ word, x, color }) {
  return (
    <span className="clip-word" style={{ padding: '0 0.12em' }}>
      <motion.span
        className="inline-block"
        style={{ color, x }}
        initial={{ y: '115%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {word}
      </motion.span>
    </span>
  );
}
