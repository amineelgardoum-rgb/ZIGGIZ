import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';
import { scrollToId } from '../hooks/useLenis';

const ROWS = [
  {
    index: '01',
    name: 'Grom Camp',
    description: 'Whitewash confidence, pop-ups, and ocean safety for ages 6–14.',
    href: '#grom',
  },
  {
    index: '02',
    name: 'Advanced Squad',
    description: 'Wave selection, turns, and reef strategy for competitive surfers.',
    href: '#advanced',
  },
  {
    index: '03',
    name: 'Adult Lessons',
    description: 'Small-group coaching to fix habits and catch more waves, faster.',
    href: '#adult-lessons',
  },
  {
    index: '04',
    name: 'Private Guiding',
    description: 'One-on-one sessions matched to your goals, tide, and swell window.',
    href: '#private-guiding',
  },
];

export default function Lessons() {
  return (
    <section id="lessons" className="relative isolate overflow-hidden bg-sand-deep px-5 py-20 sm:px-10">
      <div className="absolute inset-2 -z-10 overflow-hidden rounded-[2rem]">
        <img
          src="/images/surf.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ocean-deep/60" />
      </div>

      <Eyebrow className="inline-block rounded-2xl border border-white/20 bg-black/10 px-5 py-2.5 backdrop-blur-md">
        Lessons &amp; Coaching
      </Eyebrow>

      <StackedLines
        lines={['Built for', 'every level']}
        className="mt-3 font-display text-6xl font-medium leading-[0.95] tracking-tight"
      />

      <ul className="mt-10 space-y-4 rounded-2xl border border-white/20 bg-black/10 p-6">
        {ROWS.map((row, i) => (
          <motion.li
            key={row.index}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ type: 'spring', stiffness: 190, damping: 26, delay: i * 0.09 }}
            className="rounded-2xl border border-white/10"
          >
            <a
              href={row.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(row.href.slice(1));
              }}
              className="group flex items-center gap-6 rounded-2xl p-5 transition duration-300 ease-in-out focus-visible:bg-sand hover:backdrop-blur-md"
            >
              <span className="w-10 text-sm font-medium text-ink-soft">{row.index}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-2xl font-medium tracking-tight sm:text-3xl">{row.name}</span>
                <span className="mt-1 block text-sm text-ink-soft">{row.description}</span>
              </span>
              <motion.span
                className="grid size-11 shrink-0 place-items-center rounded-full border border-hairline"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.span
                  variants={{ rest: { x: 0, opacity: 0.55 }, hover: { x: 8, opacity: 1 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </motion.span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}