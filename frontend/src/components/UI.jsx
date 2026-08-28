import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Eyebrow({ children, tone = 'dark', className = '' }) {
  const text = tone === 'light' ? 'text-white' : 'text-ink-soft';
  const dot = tone === 'light' ? 'bg-ocean-light' : 'bg-ocean';
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] ${text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

export function PillButton({ children, variant = 'solid', onClick, href, type = 'button', className = '' }) {
  const variants = {
    light: 'bg-white text-ocean-deep hover:bg-ocean-light hover:text-white',
    solid: 'bg-ink text-white hover:bg-ocean-deep',
    outline: 'border border-current text-ink hover:bg-ink hover:text-white',
  };
  const Comp = href ? motion.a : motion.button;
  return (
    <Comp
      href={href}
      type={href ? undefined : type}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-ocean-light ${variants[variant]} ${className}`}
      whileTap={{ scale: 0.97 }}
    >
      {children}
      <motion.span className="grid" whileHover="hover" initial="rest" animate="rest">
        <motion.span variants={{ rest: { x: 0 }, hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 320, damping: 20 }}>
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      </motion.span>
    </Comp>
  );
}

export function ArrowButton({ direction = 'next', variant = 'outline', onClick, label }) {
  const base = 'grid size-12 sm:size-14 place-items-center rounded-full border transition-colors';
  const variants = {
    outline: 'border-hairline text-ink hover:border-ink hover:bg-transparent',
    solid: 'border-ink bg-ink text-white hover:bg-ocean-deep',
  };
  return (
    <motion.button
      aria-label={label || (direction === 'next' ? 'Next' : 'Previous')}
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <motion.span
        variants={{ rest: { scale: 1 }, hover: { scale: 1.15 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        style={direction === 'prev' ? { transform: 'scaleX(-1)' } : undefined}
      >
        <ArrowRight className="h-5 w-5" />
      </motion.span>
    </motion.button>
  );
}

export function Dots({ count, active, onSelect, tone = 'dark' }) {
  const idle = tone === 'dark' ? 'bg-ghost' : 'bg-white/40';
  const activeColor = tone === 'dark' ? 'bg-ink' : 'bg-white';
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-current={i === active}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className="p-1.5"
        >
          <motion.span
            className={`block h-1.5 rounded-full ${i === active ? activeColor : idle}`}
            animate={{ width: i === active ? 20 : 6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          />
        </button>
      ))}
    </div>
  );
}
