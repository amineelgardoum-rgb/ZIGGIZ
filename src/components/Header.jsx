import { motion } from 'framer-motion';
import Logo from './Logo';
import { scrollToId } from '../hooks/useLenis';

export default function Header({ onOpenMenu, onOpenContact }) {
  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <header className="relative z-20 flex items-center px-6 pt-6 sm:px-10 sm:pt-8">
      <nav className="hidden flex-1 items-center gap-8 text-xs text-white/90 lg:flex">
        <a href="#spots" onClick={go('spots')} className="transition-opacity hover:opacity-100 hover:text-white">
          Trips &amp; Spots
        </a>
        <a href="#lessons" onClick={go('lessons')} className="transition-opacity hover:opacity-100 hover:text-white">
          Lessons &amp; Coaches
        </a>
      </nav>

      <div className="flex flex-1 justify-start lg:justify-center">
        <Logo />
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
        <button
          onClick={onOpenContact}
          className="hidden text-xs uppercase tracking-wide text-white/90 underline-offset-4 hover:underline sm:inline-block"
        >
          Book a Trip
        </button>
        <button
          aria-label="Open menu"
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
