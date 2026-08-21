import { motion } from 'framer-motion';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';

const QUOTES = [
  {
    quote: 'I paddled out nervous and left carving the point break with a crew I still text. Best week of the trip.',
    name: 'Priya Anand',
    role: 'Advanced Squad',
  },
  {
    quote: 'The guides read the reef like a map. Safest and most fun surf trip I have ever booked.',
    name: 'Lukas Brenner',
    role: 'Adult Lessons',
  },
  {
    quote: 'My daughter went from scared of whitewash to riding green waves in five days. Worth every minute.',
    name: 'Dana Okafor',
    role: 'Parent, Grom Camp',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-sand px-6 py-20 sm:px-10 sm:py-24">
      <Eyebrow>What travelers say</Eyebrow>
      <StackedLines
        lines={['Loved by', 'the whole lineup']}
        className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-tight"
      />

      <ul className="mt-14 grid gap-5 md:grid-cols-3">
        {QUOTES.map((t, i) => (
          <motion.li
            key={t.name}
            className="flex h-full flex-col justify-between rounded-3xl bg-sand-deep p-7"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 180, damping: 26, delay: i * 0.12 }}
            whileHover={{ y: -8 }}
          >
            <div>
              <span className="font-display text-4xl leading-none text-ocean">&ldquo;</span>
              <blockquote className="mt-4 text-lg leading-relaxed text-ink">{t.quote}</blockquote>
            </div>
            <figcaption className="mt-6 border-t border-hairline pt-4">
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-ink-soft">{t.role}</p>
            </figcaption>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
