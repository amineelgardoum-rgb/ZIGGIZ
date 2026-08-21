import { motion } from 'framer-motion';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';

const STATS = [
  { value: '18', label: 'Local guides on call' },
  { value: '9', label: 'Signature breaks' },
  { value: '12K+', label: 'Surfers hosted' },
  { value: '11', label: 'Years chasing swell' },
];

export default function Stats() {
  return (
    <section className="mt-3 rounded-[2rem] bg-ocean-deep px-6 py-20 text-white sm:px-10">
      <Eyebrow tone="light">By the numbers</Eyebrow>
      <StackedLines
        lines={['A crew that', 'knows the tide']}
        className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-tight"
      />

      <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="border-t border-white/20 pt-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 180, damping: 24, delay: i * 0.11 }}
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-6xl font-medium tracking-tight sm:text-7xl">{s.value}</dd>
            <dd className="mt-3 text-sm text-white/65">{s.label}</dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
