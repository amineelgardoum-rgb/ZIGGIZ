import { useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';

// Each slide can art-direct per breakpoint: `wide` for desktop, `narrow`
// for phones. The old 2:1 crops were upscaled ~4x on portrait screens
// (blurry), so phones get taller, higher-resolution sources instead.
const SLIDES = [
  { wide: '/images/surf/surf1.jpeg', narrow: '/images/background/agadir-portrait.jpg' },
  { wide: '/images/surf/surf2.jpeg', narrow: '/images/surf/surf10.jpg' },
  { wide: '/images/activities/activitie1.jpeg' },
  { wide: '/images/hostels/hostle2.jpg' },
];

function SlideLayer({ progress, slide, index, count, eager }) {
  // Continuous scroll-linked cross-fade: this layer peaks at its position
  // and smoothly fades out as its neighbours fade in (no hard swaps).
  const opacity = useTransform(progress, (v) => {
    const p = v * (count - 1);
    return Math.max(0, 1 - Math.abs(p - index));
  });

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <picture>
        {slide.narrow && <source media="(max-width: 767px)" srcSet={slide.narrow} />}
        <img
          src={slide.wide}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority={eager ? 'high' : 'auto'}
          decoding={eager ? 'eager' : 'async'}
        />
      </picture>
    </motion.div>
  );
}

export default function SurfScene({ progress }) {
  const scale = useTransform(progress, [0, 1], [1.02, 1.14]);

  // preload every frame so scroll swaps never flash empty
  useEffect(() => {
    SLIDES.forEach((slide) => {
      [slide.wide, slide.narrow].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ocean-deep">
      <motion.div className="absolute inset-0" style={{ scale }}>
        {SLIDES.map((slide, i) => (
          <SlideLayer
            key={slide.wide}
            progress={progress}
            slide={slide}
            index={i}
            count={SLIDES.length}
            eager={i === 0}
          />
        ))}
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,27,46,0.55), rgba(7,27,46,0.15) 45%, rgba(7,27,46,0.75))',
        }}
      />
    </div>
  );
}
