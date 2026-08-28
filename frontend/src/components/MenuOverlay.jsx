import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { lockScroll, unlockScroll, scrollToId } from '../hooks/useLenis';
import { useI18n } from '../i18n/I18nContext';

const LINK_HREFS = ['lessons', 'lessons', 'testimonials', 'contact'];
const SOCIAL_HREFS = ['instagram', 'x', 'youtube', 'tiktok'];

export default function MenuOverlay({ open, onClose }) {
  const { t } = useI18n();

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (href) => {
    onClose();
    setTimeout(() => scrollToId(href), 250);
  };

  return createPortal(
    <div className={`fixed inset-0 z-[70] flex flex-col ${open ? '' : 'pointer-events-none'}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 bg-ocean-deep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="relative flex h-full flex-col p-2 text-white sm:p-3"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          >
            <div className="flex items-center justify-between p-4 sm:p-8">
              <Logo />
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <motion.button
                  aria-label={t.menu.closeMenu}
                  onClick={onClose}
                  className="grid size-10 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <motion.span variants={{ rest: { rotate: 0 }, hover: { rotate: 90 } }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                    <X className="h-4 w-4" />
                  </motion.span>
                </motion.button>
              </div>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-2 px-4 sm:px-8">
              {t.menu.links.map((label, i) => (
                <motion.button
                  key={LINK_HREFS[i] + label}
                  onClick={() => go(LINK_HREFS[i])}
                  className="block text-start font-display text-5xl font-medium tracking-tight transition-colors hover:text-ocean-light sm:text-7xl"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.12 + i * 0.07 }}
                >
                  {label}
                </motion.button>
              ))}
            </nav>

            <div className="flex flex-col gap-6 border-t border-white/15 px-4 pb-6 pt-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <Link
                to="/reservation"
                onClick={onClose}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-ocean-deep transition-colors hover:bg-ocean-light hover:text-white"
              >
                {t.menu.bookTrip}
                <span aria-hidden="true" className="rtl:-scale-x-100">&rarr;</span>
              </Link>
              <nav className="flex gap-5 text-sm text-white/70">
                {t.menu.social.map((s, i) => (
                  <a key={s} href={`#${SOCIAL_HREFS[i]}`} className="hover:text-white">
                    {s}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
