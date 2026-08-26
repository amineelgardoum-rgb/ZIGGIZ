import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowButton } from './UI';

const SLIDES = [
  {
    headline: ['Beach', 'Vibes,', 'Enjoy', 'Surf'],
    variant: 'crew',
    title: 'Surf',
    image: '/images/surf/surf10.png',
    cardTitle: 'Ride your first wave',
    cardDescription:
      'Daily surf coaching for every level — warm local guides, small groups, and the best breaks picked for you each morning.',
  },
  {
    headline: ['Yoga', 'Sport,', 'Client', 'First'],
    variant: 'reef',
    title: 'Yoga Sessions',
    image: '/images/activities/activitie2.jpeg',
    cardTitle: 'Flow with the ocean',
    cardDescription:
      'Sunrise and sunset yoga on the terrace — stretch, breathe, and recover between sessions with the sound of the waves.',
  },
  {
    headline: ['Desert', 'Trails,', 'Quad', 'Rides'],
    variant: 'quad',
    title: 'Quad Adventures',
    image: '/images/activities/activitie3.png',
    cardTitle: 'Ride the dunes',
    cardDescription:
      'Quad trips through desert tracks and coastal trails — golden dunes, hidden viewpoints, and pure adventure.',
  },
  {
    headline: ['Rest', 'Easy,', 'Surf', 'Early'],
    variant: 'hostel',
    title: 'Hostel',
    image: '/images/hostels/hostle1.png',
    cardTitle: 'Stay where the waves are',
    cardDescription:
      'Beds steps from the break — salty mornings, sunset sessions, and a crew that feels like family by day two.',
  },
];

const SPOTS = ['Taghazout', 'Anchor Point', 'Panorama','Agadir'];

export default function Ticker() {
  const [[index, dir], setSlide] = useState([0, 0]);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });

  const xTL = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);
  const xTR = useTransform(scrollYProgress, [0, 1], ['3%', '-3%']);
  const xBL = useTransform(scrollYProgress, [0, 1], ['-2%', '4%']);
  const xBR = useTransform(scrollYProgress, [0, 1], ['4%', '-3%']);
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const slide = SLIDES[index];
  const go = (d) => setSlide(([i]) => [(i + d + SLIDES.length) % SLIDES.length, d]);

  return (
    <section
      ref={sectionRef}
      id="guides"
      className="relative isolate flex min-h-screen scroll-mt-24 flex-col justify-center overflow-hidden rounded-[2rem] bg-sand px-6 py-16 sm:px-10 sm:py-24"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem] ">
        <motion.img
          src="/images/background/taghazout.png"
          alt=""
          style={{ y: bgY, scale: 1.15 }}
          className="h-full w-full "
        />
        <div className="absolute inset-0 bg-ocean-deep/60" />
      </div>

      <div className="group pointer-events-auto absolute inset-x-6 top-5 z-10 overflow-hidden opacity-70">
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.4em] text-white/60 animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]"
        >
          {[...SPOTS, ...SPOTS].map((spot, i) => (
            <span key={`${spot}-${i}`} className="flex items-center gap-8">
              {spot}
              <span className="size-1 rounded-full bg-ocean-light" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-20 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <motion.div
          className="grid size-28 shrink-0 place-items-center rounded-2xl text-center border-1 bg-sand-deep/20 backdrop-blur-md sm:size-32"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.06, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <span className="block text-2xl font-medium">100%</span>
          <span className="mx-auto mt-1 block max-w-[7em] text-[0.6rem] text-ink-soft">
            Trips shaped around your level
          </span>
        </motion.div>

        <motion.article
          className="flex max-w-md flex-col gap-4 border-1 rounded-3xl bg-sand-deep/20 backdrop-blur-md  p-5 sm:gap-5 sm:p-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.12 }}
        >
          <span className="w-fit rounded-xl bg-sand px-4 py-2 text-xl font-medium">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={index}
                className="block"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {`#0${index + 1}`}
              </motion.span>
            </AnimatePresence>
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-lg font-medium">{slide.cardTitle}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                {slide.cardDescription}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.article>
      </div>

      <h2
        id="trust-title"
        className="pointer-events-none bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6e relative z-0 mx-auto mt-12 max-w-[88rem] select-none text-[8.2vw] font-medium uppercase leading-[1.02] rounded-2xl tracking-tight py-10 px-5"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index + '-a'}
            className="flex justify-between"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <RevealGhostWord word={slide.headline[0]} x={xTL} color="#FFF" />
            <RevealGhostWord word={slide.headline[1]} x={xTR} color="#94aef3" />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key={index + '-b'}
            className="flex justify-between"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <RevealGhostWord word={slide.headline[2]} x={xBL} color="#000" />
            <RevealGhostWord word={slide.headline[3]} x={xBR} color="#0036ac" />
          </motion.div>
        </AnimatePresence>
      </h2>

      <div className="relative z-10 mx-auto mt-6 flex justify-center sm:mt-0">
        <div className="sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
          <motion.figure
            className="relative aspect-[3/4] w-64 shrink-0 overflow-hidden rounded-3xl bg-ocean shadow-xl sm:w-72"
            animate={{ y: [0, -10, 0], rotate: -6 }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0, x: dir >= 0 ? 90 : -90 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir >= 0 ? -90 : 90 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-ocean-deep/40 px-4 py-2.5 text-white backdrop-blur">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={index}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-base font-medium"
                >
                  {slide.title}
                </motion.p>
              </AnimatePresence>
            </figcaption>
          </motion.figure>
        </div>
      </div>

      <div className="relative z-20 mt-12 flex items-center justify-between sm:mt-24">
        <ArrowButton direction="prev" variant="outline" onClick={() => go(-1)} label="Previous section" />
        <ArrowButton direction="next" variant="outline" onClick={() => go(1)} label="Next section" />
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
