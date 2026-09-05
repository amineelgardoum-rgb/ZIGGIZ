import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';
import { useI18n } from '../i18n/I18nContext';
import { fetchReviews, submitReview } from '../lib/api';

const ROTATION_INTERVAL = 5000;

export default function Testimonials() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', quote: '' });
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

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

  const total = quotes.length;

  const goTo = useCallback(
    (idx) => {
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex],
  );

  const next = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || showForm) return;
    const id = setInterval(next, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [next, total, showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError(null);
    try {
      await submitReview(form);
      setFormSuccess(true);
      setFormStatus('idle');
      setForm({ name: '', email: '', role: '', quote: '' });
    } catch (err) {
      setFormStatus('idle');
      setFormError(err?.message || 'Something went wrong');
    }
  };

  const r = t.testimonials;

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
          <Eyebrow tone="light">{r.eyebrow}</Eyebrow>
        </span>
        <StackedLines
          lines={r.titleLines}
          className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
        />
      </div>

      {total > 1 && (
        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-xs tracking-[0.3em] text-sun" aria-label={r.starsAria}>
                  ★★★★★
                </span>
                <span className="mt-4 block font-display text-5xl leading-none text-ocean-light">&ldquo;</span>
                <blockquote className="mt-4 text-xl leading-relaxed text-ink sm:text-2xl">
                  {quotes[activeIndex]?.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ocean text-sm font-medium text-white">
                    {quotes[activeIndex]?.name?.[0]}
                  </span>
                  <span>
                    <p className="font-medium">{quotes[activeIndex]?.name}</p>
                    <p className="text-sm text-ink-soft">{quotes[activeIndex]?.role}</p>
                  </span>
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur transition-colors hover:bg-black/50 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white/70 backdrop-blur transition-colors hover:bg-black/50 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 bg-sun' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {total === 1 && (
        <ul className="mx-auto mt-12 grid w-full max-w-7xl gap-8 text-center sm:gap-10 md:grid-cols-1">
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
                <span className="text-xs tracking-[0.3em] text-sun" aria-label={r.starsAria}>
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
      )}

      <div className="mx-auto mt-12 max-w-md text-center">
        {!showForm && !formSuccess && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            {r.writeReview || 'Write a review'}
          </button>
        )}

        {formSuccess && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-sun"
          >
            {r.reviewSubmitted || 'Thanks! Your review will appear after approval.'}
          </motion.p>
        )}

        <AnimatePresence>
          {showForm && !formSuccess && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/15 bg-black/30 p-5 text-left backdrop-blur-md">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{r.formName || 'Name'}</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Rivera"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{r.formEmail || 'Email'}</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{r.formRole || 'Role (optional)'}</span>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Travel Blogger"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{r.formQuote || 'Your review'}</span>
                  <textarea
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    placeholder={r.formQuotePlaceholder || 'Share your experience...'}
                    rows={3}
                    required
                    minLength={10}
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
                  />
                </label>

                {formError && (
                  <p className="text-center text-sm text-coral">{formError}</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="flex items-center gap-2 rounded-full bg-sun px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {formStatus === 'sending' ? (r.formSending || 'Sending...') : (r.formSubmit || 'Submit review')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(null); }}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    {r.formCancel || 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
