import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let lenisInstance = null;
let rafId = null;
let refCount = 0;

export function getLenis() {
  return lenisInstance;
}

export default function useLenis() {
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!lenisInstance && !prefersReduced) {
      lenisInstance = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      const raf = (time) => {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }
    refCount += 1;
    started.current = true;

    return () => {
      refCount -= 1;
      if (refCount <= 0 && lenisInstance) {
        cancelAnimationFrame(rafId);
        lenisInstance.destroy();
        lenisInstance = null;
      }
    };
  }, []);
}

export function lockScroll() {
  lenisInstance?.stop();
  document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
  lenisInstance?.start();
  document.documentElement.classList.remove('scroll-locked');
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) {
    if (import.meta.env?.DEV) console.warn(`[scrollToId] no element with id="${id}"`);
    return;
  }
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -12 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/** Returns a click handler that prevents default and smooth-scrolls to a section. */
export function goTo(id) {
  return (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    scrollToId(id);
  };
}
