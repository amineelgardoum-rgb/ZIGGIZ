import { useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';

const IMAGES = [
  '/images/surf/surf1.jpeg',
  '/images/surf/surf2.jpeg',
  '/images/activities/activitie1.jpeg',
  '/images/hostels/hostle2.png',
];

export default function SurfScene({ progress }) {
  const scale = useTransform(progress, [0, 1], [1.02, 1.14]);

  // Continuous scroll-linked cross-fade: each image peaks at its position
  // and smoothly fades out as the next one fades in (no hard swaps).
  const opacities = IMAGES.map((_, i) =>
    useTransform(progress, (v) => {
      const p = v * (IMAGES.length - 1);
      return Math.max(0, 1 - Math.abs(p - i));
    })
  );

  // preload every frame so scroll swaps never flash empty
  useEffect(() => {
    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-ocean-deep">
      <motion.div className="absolute inset-0" style={{ scale }}>
        {IMAGES.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: opacities[i] }}
            fetchPriority={i === 0 ? 'high' : 'auto'}
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
