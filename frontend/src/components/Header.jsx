import { Link } from 'react-router-dom';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { goTo } from '../hooks/useLenis';
import { useI18n } from '../i18n/I18nContext';

export default function Header({ onOpenMenu }) {
  const { t } = useI18n();
  return (
    <header className="relative z-20 flex items-center px-6 pt-6 sm:px-10 sm:pt-8">
      <nav className="hidden flex-1 items-center gap-8 text-xs text-white/90 lg:flex">
        <a href="#lessons" onClick={goTo('lessons')} className="transition-opacity hover:opacity-100 hover:text-white">
          {t.header.lessonsCoaches}
        </a>
      </nav>

      <div className="flex flex-1 justify-start lg:justify-center">
        <Logo />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
        <Link
          to="/reservation"
          className="hidden text-xs uppercase tracking-wide text-white/90 underline-offset-4 hover:underline sm:inline-block"
        >
          {t.header.bookTrip}
        </Link>
        <LanguageSwitcher />
        <button
          aria-label={t.header.openMenu}
          onClick={onOpenMenu}
          className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25"
        >
          <span className="flex flex-col gap-[5px]">
            <span className="h-px w-4 bg-white" />
            <span className="h-px w-4 bg-white" />
          </span>
        </button>
      </div>
    </header>
  );
}
