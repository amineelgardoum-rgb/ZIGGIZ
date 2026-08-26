import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Logo from './Logo';
import { Eyebrow, PillButton } from './UI';
import { StackedLines } from './RevealText';
import { getLenis, goTo } from '../hooks/useLenis';

const COLUMNS = [
  {
    heading: 'Lessons',
    links: [
      { label: 'Grom Camp', href: 'lessons' },
      { label: 'Advanced Squad', href: 'lessons' },
      { label: 'Adult Lessons', href: 'lessons' },
      { label: 'Private Guiding', href: 'lessons' },
    ],
  },
  {
    heading: 'Trips',
    links: [
      { label: 'Boat Charters', href: 'lessons' },
      { label: 'Breaks', href: 'lessons' },
      { label: 'Events', href: 'lessons' },
      { label: 'Gear Shop', href: 'lessons' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: 'contact' },
      { label: 'Guides', href: 'lessons' },
      { label: 'Careers', href: 'contact' },
      { label: 'Contact', href: 'contact' },
    ],
  },
];

const SOCIAL = ['Instagram', 'X', 'YouTube', 'TikTok'];
const LEGAL = ['Privacy', 'Terms'];

export default function Footer({ onOpenContact }) {
  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="scroll-mt-24 rounded-[2rem] bg-ocean-deep px-6 py-16 text-white sm:px-10 sm:py-24">
      <div className="flex flex-col gap-8 border-b border-white/15 pb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow tone="light">Get started</Eyebrow>
          <StackedLines
            lines={['Ready to', 'paddle out?']}
            className="mt-4 font-display text-6xl font-medium leading-[0.92] tracking-tight"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
        >
          <PillButton variant="light" onClick={onOpenContact}>
            Book a Trip
          </PillButton>
        </motion.div>
      </div>

      <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-white/65">
            A boutique surf outfit running guided trips, lessons, and coastal stays where the
            swell forecast actually holds up.
          </p>
          <address className="mt-6 not-italic text-sm text-white/80">
            <a href="mailto:crew@saltline.co" className="block hover:text-white">
              crew@saltline.co
            </a>
            <a href="tel:+18085550148" className="mt-2 block hover:text-white">
              +1 (808) 555-0148
            </a>
            <p className="mt-2 text-white/55">14 Shoreline Ave, Wave Bay</p>
          </address>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading}>
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">{col.heading}</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={`#${l.href}`} onClick={goTo(l.href)} className="hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-col items-start gap-5 border-t border-white/15 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Ziggiz Surf Co. All rights reserved.</p>
        <nav className="flex gap-5">
          {SOCIAL.map((s) => (
            <a key={s} href={`#${s.toLowerCase()}`} className="transition-colors hover:text-white">
              {s}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <nav className="flex gap-5">
            {LEGAL.map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="transition-colors hover:text-white">
                {s}
              </a>
            ))}
          </nav>
          <button
            onClick={toTop}
            aria-label="Back to top"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition-colors duration-300 hover:border-sun hover:bg-sun hover:text-ocean-deep"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
