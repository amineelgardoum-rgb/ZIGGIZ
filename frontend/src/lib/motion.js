// Shared motion presets — tuned to feel like a slow, confident swell rather than a bouncy UI.
export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 260, damping: 24 },
  gentle: { type: 'spring', stiffness: 90, damping: 22 },
};

export const riseIn = (delay = 0, y = 32) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px -10% 0px' },
  transition: { ...spring.soft, delay },
});

export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

export const clipUp = (delay = 0, duration = 0.95) => ({
  initial: { y: '115%', opacity: 0 },
  whileInView: { y: '0%', opacity: 1 },
  viewport: { once: true },
  transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
});
