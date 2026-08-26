import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { LANGS } from '../i18n/translations';
import { useI18n } from '../i18n/I18nContext';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        aria-label={t.lang.switch}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-full bg-white/15 px-3.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/25"
      >
        <Globe className="size-4" />
        {lang}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-white/15 bg-ocean-deep/95 py-1.5 shadow-xl shadow-black/30 backdrop-blur-md">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              aria-current={l.code === lang}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start text-sm transition-colors hover:bg-white/10 ${
                l.code === lang ? 'font-semibold text-sun' : 'text-white/85'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true">{l.flag}</span>
                {l.label}
              </span>
              {l.code === lang && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
