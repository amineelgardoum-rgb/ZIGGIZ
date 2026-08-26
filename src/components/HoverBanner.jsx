import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { scrollToId } from '../hooks/useLenis';

export default function HoverBanner({ items, label = 'Items', className = '' }) {
  const [active, setActive] = useState(null);

  return (
    <div
      role="tablist"
      aria-label={label}
      onMouseLeave={() => setActive(null)}
      className={`flex h-full w-full flex-col gap-2 sm:gap-3 md:flex-row ${className}`}
    >
      {items.map((panel, i) => {
        const isActive = i === active;
        return (
          <motion.div
            key={panel.id}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            aria-label={panel.label}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(isActive ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActive(isActive ? null : i);
              }
            }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ delay: i * 0.09, type: 'spring', stiffness: 170, damping: 26 }}
            style={{ flexGrow: isActive ? 4 : 1, flexBasis: 0 }}
            className="group relative min-h-[4.5rem] min-w-0 cursor-pointer overflow-hidden rounded-3xl border border-white/10 shadow-lg shadow-ocean-deep/30 outline-none transition-all duration-500 ease-out focus-visible:border-ocean-light md:min-h-0"
          >
            <img
              src={panel.image}
              alt={panel.label}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${
                isActive
                  ? 'scale-100'
                  : 'scale-110 grayscale-[45%] group-hover:scale-105 group-hover:grayscale-0'
              }`}
            />
            <span
              className={`absolute inset-0 bg-gradient-to-t from-ocean-deep via-ocean-deep/25 to-transparent transition-opacity duration-500 ${
                isActive ? 'opacity-95' : 'opacity-60 group-hover:opacity-80'
              }`}
            />

            <span
              className={`absolute bottom-4 left-4 whitespace-nowrap rounded-md bg-black/55 px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm backdrop-blur-sm transition-opacity duration-300 md:bottom-5 md:left-5 md:text-sm md:[writing-mode:vertical-rl] md:rotate-180 ${
                isActive ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {panel.label}
            </span>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ delay: 0.14, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-ocean-deep via-ocean-deep/75 to-transparent p-4 sm:p-6"
                >
                  <div>
                    <h3 className="font-display text-xl font-medium leading-none tracking-tight text-white sm:text-3xl">
                      {panel.label}
                    </h3>
                    {panel.description && (
                      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/75 sm:text-sm">
                        {panel.description}
                      </p>
                    )}
                  </div>
                  {panel.links && (
                    <ul className="flex flex-col gap-2">
                      {panel.links.map((item) => (
                        <li key={item.name}>
                          <a
                            href={`#${item.href}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              scrollToId(item.href);
                            }}
                            className="group/item flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md transition-colors duration-300 hover:border-sun hover:bg-sun hover:text-ocean-deep focus-visible:bg-sun focus-visible:text-ocean-deep"
                          >
                            <span className="flex items-baseline gap-3">
                              <span className="text-sm font-medium sm:text-base">{item.name}</span>
                              <span className="hidden text-xs opacity-70 sm:inline">{item.note}</span>
                            </span>
                            <ArrowRight className="size-4 shrink-0 opacity-70 transition-transform duration-300 group-hover/item:translate-x-1" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
