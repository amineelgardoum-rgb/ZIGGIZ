import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Logo from './Logo';
import { Eyebrow, PillButton } from './UI';
import { StackedLines } from './RevealText';
import { getLenis, goTo } from '../hooks/useLenis';
import { useI18n } from '../i18n/I18nContext';

const COLUMNS = [
  {
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
  {
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
  {
    links: [
      { href: 'contact' },
      { href: 'lessons' },
      { href: 'contact' },
      { href: 'contact' },
    ],
  },
];

const SOCIAL_HREFS = ['instagram', 'x', 'youtube', 'tiktok'];
const LEGAL_HREFS = ['privacy', 'terms'];

export default function Footer({ onOpenContact }) {
  const { t } = useI18n();

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="scroll-mt-24 rounded-[2rem] bg-ocean-deep px-6 py-16 text-white sm:px-10 sm:py-24">
      <div className="flex flex-col gap-8 border-b border-white/15 pb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow tone="light">{t.footer.getStarted}</Eyebrow>
          <StackedLines
            lines={t.footer.titleLines}
            className="mt-4 font-display text-5xl font-medium leading-[0.92] tracking-tight sm:text-6xl"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
        >
          <PillButton variant="light" onClick={onOpenContact}>
            {t.footer.bookTrip}
          </PillButton>
        </motion.div>
      </div>

      <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-white/65">
            {t.footer.blurb}
          </p>
          <address className="mt-6 not-italic text-sm text-white/80">
            <a href="mailto:crew@saltline.co" className="block hover:text-white">
              crew@saltline.co
            </a>
            <a href="tel:+18085550148" className="mt-2 block hover:text-white">
              +1 (808) 555-0148
            </a>
            <p className="mt-2 text-white/55">{t.footer.addressLine}</p>
          </address>
        </div>

        {COLUMNS.map((col, i) => (
          <nav key={t.footer.columns[i].heading}>
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">{t.footer.columns[i].heading}</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {col.links.map((l, j) => (
                <li key={t.footer.columns[i].links[j]}>
                  <a href={`#${l.href}`} onClick={goTo(l.href)} className="hover:text-white">
                    {t.footer.columns[i].links[j]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-col items-start gap-5 border-t border-white/15 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>{t.footer.copyright}</p>
        <nav className="flex gap-5">
          {t.footer.social.map((s, i) => (
            <a key={s} href={`#${SOCIAL_HREFS[i]}`} className="transition-colors hover:text-white">
              {s}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <nav className="flex gap-5">
            {t.footer.legal.map((s, i) => (
              <a key={s} href={`#${LEGAL_HREFS[i]}`} className="transition-colors hover:text-white">
                {s}
              </a>
            ))}
          </nav>
          <button
            onClick={toTop}
            aria-label={t.footer.backToTop}
            className="grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition-colors duration-300 hover:border-sun hover:bg-sun hover:text-ocean-deep"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
