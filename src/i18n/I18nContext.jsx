import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'ziggiz-lang';
const DEFAULT_LANG = 'en';

const I18nContext = createContext(null);

function resolveInitialLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(resolveInitialLang);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const value = useMemo(
    () => ({ lang, setLang, dir, t: translations[lang] || translations[DEFAULT_LANG] }),
    [lang, dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
