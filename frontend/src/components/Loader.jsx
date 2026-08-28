import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { lockScroll, unlockScroll } from '../hooks/useLenis';

const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MIN_VISIBLE_MS = REDUCED ? 200 : 1400;
const MAX_VISIBLE_MS = REDUCED ? 200 : 2600;
const EXIT_MS = REDUCED ? 0 : 850;

export default function Loader({ onReady }) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    lockScroll();
    let done = false;
    let minTimer;

    const finish = () => {
      if (done) return;
      done = true;
      onReady?.();
      unlockScroll();
      setExiting(true);
      setTimeout(() => setMounted(false), EXIT_MS);
    };

    const startCountdown = () => {
      minTimer = setTimeout(finish, MIN_VISIBLE_MS);
    };

    if (document.readyState === 'complete') {
      startCountdown();
    } else {
      window.addEventListener('load', startCountdown, { once: true });
    }
    const maxTimer = setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      window.removeEventListener('load', startCountdown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-ocean-deep text-white"
        animate={{ y: exiting ? '-105%' : '0%' }}
        transition={{ duration: EXIT_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <Logo className="text-2xl" />
        </motion.div>
        <div className="h-px w-40 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full origin-left bg-white"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: (MIN_VISIBLE_MS - 120) / 1000, delay: 0.12, ease: [0.65, 0, 0.35, 1] }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
