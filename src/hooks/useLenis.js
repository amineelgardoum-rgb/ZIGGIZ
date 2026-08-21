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
    if (!lenisInstance) {
      lenisInstance = new Lenis({
        smoothWheel: true,
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
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
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -12 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
