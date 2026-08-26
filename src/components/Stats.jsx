import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';

const STATS = [
  { value: '3+' ,label: 'Local guides on call' },
  { value: '4+', label: 'Signature breaks' },
  { value: '1+', label: 'Surfer Coach' },
  { value: '2+', label: 'Years chasing swell' },
];

function Counter({ value, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const numeric = parseFloat(value);
  const suffix = value.replace(/[\d.]/g, '');
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, numeric, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, numeric, count]);

  return <motion.dd ref={ref} className={className}>{text}</motion.dd>;
}

export default function Stats() {
  return (
    <section
      id="stats"
      style={{
        backgroundImage: "url('/images/background/agadir.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="relative isolate flex min-h-[34rem] scroll-mt-24 flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-ocean-deep px-6 py-12 text-white sm:px-10 sm:py-16"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ocean-deep/85 via-ocean-deep/45 to-ocean-deep/70" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-ocean-light/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto mt-4  max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
            <Eyebrow tone="light">By the numbers</Eyebrow>
          </span>
          <StackedLines
            lines={['A crew that', 'knows the tide']}
            className="mt-4 font-display text-5xl font-medium leading-[0.95] tracking-tight sm:text-6xl"
          />
        </div>
      </div>

      <dl className="mt-5 grid w-full grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="group flex flex-col items-center rounded-xl border border-white/15 bg-black/30 p-6 text-center backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-sun/60 cursor-pointer transition-transform  ease-out hover:-translate-y-2 "
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.14 }}
          >
            <dt className="sr-only">{s.label}</dt>
            <Counter
              value={s.value}
              className="font-display text-6xl font-medium tracking-tight sm:text-7xl"
            />
            <dd className="mt-3 text-sm text-white/70 transition-colors duration-300 group-hover:text-white/90">
              {s.label}
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
