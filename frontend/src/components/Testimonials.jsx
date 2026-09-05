import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';
import { useI18n } from '../i18n/I18nContext';
import { fetchReviews } from '../lib/api';

export default function Testimonials() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    fetchReviews()
      .then((data) => {
        if (data && data.length > 0) {
          setReviews(data);
        }
      })
      .catch(() => {});
  }, []);

  const quotes = reviews
    ? reviews.map((r) => ({
        quote: r.quote,
        name: r.authorName,
        role: r.authorRole || '',
      }))
    : t.testimonials.quotes;

  return (
    <section
      id="testimonials"
      style={{
        backgroundImage: "url('/images/background/taghazout.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="relative isolate overflow-hidden rounded-[2rem] bg-sand px-6 py-20 sm:px-10 sm:py-24"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/45 to-ocean-deep/70" />
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
          <Eyebrow tone="light">{t.testimonials.eyebrow}</Eyebrow>
        </span>
        <StackedLines
          lines={t.testimonials.titleLines}
          className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
        />
      </div>

      <ul className="mx-auto grid w-full max-w-7xl gap-8 text-center sm:gap-10 md:grid-cols-3 cursor-pointer ">
        {quotes.map((q, i) => (
          <motion.li
            key={q.name}
            className="group flex h-full flex-col items-center justify-between rounded-xl border border-white/15 bg-black/30 p-6 text-center backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-sun/60 hover:-translate-y-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 180, damping: 26, delay: i * 0.12 }}
            whileHover={{ y: -8 }}
          >
            <div>
              <span className="text-xs tracking-[0.3em] text-sun" aria-label={t.testimonials.starsAria}>
                ★★★★★
              </span>
              <span className="mt-3 block font-display text-4xl leading-none text-ocean-light">&ldquo;</span>
              <blockquote className="mt-3 text-lg leading-relaxed text-ink">{q.quote}</blockquote>
            </div>
            <figcaption className="mt-6 flex items-center justify-center gap-3 border-t border-hairline pt-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ocean text-sm font-medium text-white">
                {q.name[0]}
              </span>
              <span>
                <p className="font-medium">{q.name}</p>
                <p className="text-sm text-ink-soft">{q.role}</p>
              </span>
            </figcaption>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
