import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';
import { useI18n } from '../i18n/I18nContext';
import { riseIn } from '../lib/motion';

const CTA_ARROW = <span aria-hidden="true" className="rtl:-scale-x-100">&rarr;</span>;

export default function Pricing() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const p = t.pricing;
  const retreat = p.retreat;
  const excursions = p.excursions;

  const reveal = (delay = 0) => (reduceMotion ? {} : riseIn(delay));

  return (
    <section
      id="prices"
      aria-label={p.eyebrow}
      className="relative isolate scroll-mt-24 overflow-hidden rounded-[2rem] bg-sand-deep px-6 py-16 sm:px-10 sm:py-24"
    >
      <div
        className="pointer-events-none absolute -end-24 -top-24 -z-10 size-72 rounded-full bg-ocean-light/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -start-24 -z-10 size-80 rounded-full bg-sun/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-3xl text-center">
        <motion.span
          {...reveal(0)}
          className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md"
        >
          <Eyebrow tone="light">{p.eyebrow}</Eyebrow>
        </motion.span>
        <StackedLines
          as="h2"
          lines={p.titleLines}
          className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-6xl"
        />
        <motion.p
          {...reveal(0.15)}
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base"
        >
          {p.intro}
        </motion.p>
      </div>

      {/* Retreat packages */}
      <div className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
        <div>
          <Eyebrow>{retreat.eyebrow}</Eyebrow>
          <motion.h3
            {...reveal(0.05)}
            className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl"
          >
            {retreat.title}
          </motion.h3>
        </div>
        <motion.p
          {...reveal(0.1)}
          className="max-w-xl text-sm leading-relaxed text-ink-soft lg:justify-self-end"
        >
          {retreat.description}
        </motion.p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {retreat.durations.map((pkg, i) => (
          <motion.article
            key={`${pkg.value}-${pkg.unit}`}
            {...reveal(0.08 + i * 0.08)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-black/20 p-6 transition-colors duration-300 hover:border-sun/50"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute end-0 top-0 font-display text-7xl leading-none text-white/[0.04]"
            >
              0{i + 1}
            </span>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              {pkg.name}
            </p>
            <p className="mt-4 flex items-baseline gap-2 font-display text-5xl font-medium tracking-tight text-ink">
              {pkg.value}
              <span className="font-body text-base font-normal text-ink-soft">{pkg.unit}</span>
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
              {pkg.bonus}
            </p>
            <p className="mt-auto pt-8 text-sm font-medium text-sun">{retreat.priceOnRequest}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        {...reveal(0.12)}
        className="mt-4 grid gap-6 rounded-2xl border border-hairline bg-black/20 p-6 lg:grid-cols-[1.15fr_1fr]"
      >
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            {retreat.includesLabel}
          </p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {retreat.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between gap-6 lg:border-s lg:border-hairline lg:ps-6">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
              {retreat.essentialsLabel}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {retreat.essentials.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs leading-relaxed text-ink-soft">{retreat.groupNote}</p>
            <Link
              to="/reservation"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-sun px-6 py-3 text-sm font-medium uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral focus-visible:outline-2 focus-visible:outline-ocean-light"
            >
              {retreat.cta}
              {CTA_ARROW}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Excursion tariff list */}
      <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{excursions.eyebrow}</Eyebrow>
          <motion.h3
            {...reveal(0.05)}
            className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl"
          >
            {excursions.title}
          </motion.h3>
        </div>
        <p className="text-sm text-ink-soft">
          {excursions.description} <span className="text-ink">{excursions.perPerson}</span>
        </p>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-hairline bg-black/20 md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
              <th scope="col" className="w-12 py-3.5 ps-5 text-start font-semibold">
                #
              </th>
              <th scope="col" className="py-3.5 pe-4 text-start font-semibold">
                {excursions.excursionLabel}
              </th>
              <th scope="col" className="py-3.5 pe-4 text-end font-semibold">
                {excursions.timeLabel}
              </th>
              <th scope="col" className="py-3.5 pe-5 text-end font-semibold">
                {excursions.priceLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {excursions.items.map((item, i) => (
              <motion.tr
                key={item.name}
                {...reveal(Math.min(i * 0.035, 0.35))}
                className="group border-b border-white/5 transition-colors duration-200 last:border-0 hover:bg-white/[0.03]"
              >
                <td className="py-3.5 ps-5 align-top font-display text-xs tabular-nums text-ink-soft">
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td className="max-w-md py-3.5 pe-4 align-top">
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                    {item.note}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3.5 pe-4 text-end align-top text-xs text-ink-soft">
                  <span dir="ltr">{item.time}</span>
                </td>
                <td className="whitespace-nowrap py-3.5 pe-5 text-end align-top">
                  <span dir="ltr" className="font-display text-lg font-medium text-ink">
                    {item.mad}{' '}
                    <span className="font-body text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
                      MAD
                    </span>
                  </span>
                  <span dir="ltr" className="mt-0.5 block text-xs text-sun">
                    &asymp; {item.eur} &euro;
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-8 grid gap-3 md:hidden">
        {excursions.items.map((item, i) => (
          <motion.li
            key={item.name}
            {...reveal(Math.min(i * 0.03, 0.3))}
            className="rounded-2xl border border-hairline bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{item.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{item.note}</p>
              </div>
              <span className="shrink-0 font-display text-sm tabular-nums text-ink-soft">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/5 pt-3">
              <span dir="ltr" className="text-xs text-ink-soft">
                {item.time}
              </span>
              <span className="text-end">
                <span dir="ltr" className="block font-display text-base font-medium text-ink">
                  {item.mad}{' '}
                  <span className="font-body text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
                    MAD
                  </span>
                </span>
                <span dir="ltr" className="block text-xs text-sun">
                  &asymp; {item.eur} &euro;
                </span>
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      <motion.div
        {...reveal(0.12)}
        className="mt-6 flex flex-col gap-6 rounded-2xl border border-hairline bg-black/20 p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            {excursions.termsLabel}
          </p>
          <ul className="mt-3 space-y-1.5">
            {excursions.terms.map((term) => (
              <li key={term} className="flex items-start gap-2 text-sm text-ink-soft">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-sun" />
                {term}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/reservation"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium uppercase tracking-wide text-sand-deep transition-colors hover:bg-sun focus-visible:outline-2 focus-visible:outline-ocean-light"
        >
          {excursions.cta}
          {CTA_ARROW}
        </Link>
      </motion.div>
    </section>
  );
}
