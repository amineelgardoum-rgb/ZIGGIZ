import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Eyebrow } from './UI';
import { StackedLines } from './RevealText';
import { lockScroll, unlockScroll } from '../hooks/useLenis';

export default function ContactModal({ open, onClose }) {
  const nameRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (open) {
      lockScroll();
      const t = setTimeout(() => nameRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    unlockScroll();
    const t = setTimeout(() => setStatus('idle'), 350);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setFirstName((fd.get('name') || '').toString().split(' ')[0]);
    setStatus('sending');
    // Stub only — no network request is made.
    setTimeout(() => setStatus('done'), 900);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6 ${
        open ? '' : 'pointer-events-none'
      }`}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 bg-ocean-deep/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a trip"
            className="relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-ink shadow-2xl shadow-ocean-deep/30 sm:p-8"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>Book a trip</Eyebrow>
                <StackedLines
                  lines={['Come find', 'your wave']}
                  className="mt-3 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
                  stagger={0.09}
                  duration={0.8}
                />
              </div>
              <motion.button
                aria-label="Close"
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-sand hover:bg-hairline"
                whileHover="hover"
                initial="rest"
                animate="rest"
              >
                <motion.span variants={{ rest: { rotate: 0 }, hover: { rotate: 90 } }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                  <X className="h-4 w-4" />
                </motion.span>
              </motion.button>
            </div>

            {status !== 'done' ? (
              <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
                <Field label="Full name" name="name" placeholder="Alex Rivera" inputRef={nameRef} />
                <Field label="Email" name="email" type="email" placeholder="you@email.com" />
                <Field
                  label="What would you like to surf?"
                  name="message"
                  as="textarea"
                  rows={3}
                  placeholder="I'd love to try a private reef session on the south point…"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-ocean-deep disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Request a trip'}
                </button>
              </form>
            ) : (
              <div className="mt-8 rounded-3xl bg-sand p-6 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-ocean text-white">
                  <Check className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-medium">Request received</p>
                <p className="mt-2 text-sm text-ink-soft">
                  Thanks, {firstName || 'there'} — our crew will reach out to lock in your swell window.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full bg-ink px-7 py-3 text-sm font-medium uppercase tracking-wide text-white hover:bg-ocean-deep"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function Field({ label, name, type = 'text', placeholder, as = 'input', rows, inputRef }) {
  const Comp = as;
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">{label}</span>
      <Comp
        ref={inputRef}
        name={name}
        type={as === 'input' ? type : undefined}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-hairline bg-sand px-4 py-3 text-sm outline-none transition-colors focus:border-ocean-light"
      />
    </label>
  );
}
