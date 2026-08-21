import { motion } from 'framer-motion';
import Photo from './Photo';
import { StackedLines, WordFade } from './RevealText';

const BREAKS = [
  {
    variant: 'headland',
    name: 'Redline Reef',
    description: 'A punchy outdoor reef break tuned for long, hollow rides.',
    tone: 'teal',
  },
  {
    variant: 'point',
    name: 'Harbor Point',
    description: 'A sheltered point break built for clean lines and evening glass-off.',
    tone: 'gold',
  },
];

export default function Spots() {
  return (
    <section
      id="spots"
      className="-mt-10 rounded-[2rem] bg-sand px-6 pb-20 pt-16 sm:px-10"
    >
      <div className="grid items-end gap-10 md:grid-cols-2">
        <div className="max-w-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <Photo variant="dawn" className="size-16 rounded-3xl" label="Dawn patrol at the point" />
          </motion.div>

          <StackedLines
            lines={['Explore Our', 'Home Coast', 'Breaks']}
            className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-tight"
            stagger={0.12}
          />

          <WordFade
            text="Book a break for a focused session, a boat-in crew mission, or a private guide — and surf the same conditions you'll come back for."
            className="mt-6 max-w-xs text-sm text-ink-soft"
          />
        </div>

        <div className="flex items-end gap-5">
          {BREAKS.map((b, i) => (
            <motion.figure
              key={b.name}
              className={`group relative aspect-[3/4] flex-1 overflow-hidden rounded-3xl bg-sand-deep ${i === 1 ? 'mb-8' : ''}`}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 180, damping: 26, delay: i * 0.14 }}
            >
              <motion.div className="h-full w-full" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <Photo variant={b.variant} className="h-full w-full" label={b.name} />
              </motion.div>
              <figcaption
                className={`absolute inset-x-3 bottom-3 rounded-xl px-4 py-3 text-white backdrop-blur ${
                  b.tone === 'gold' ? 'bg-sun/50' : 'bg-ocean-deep/40'
                }`}
              >
                <p className="text-sm font-medium">{b.name}</p>
                <p className="mt-0.5 text-[0.65rem] opacity-85">{b.description}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
