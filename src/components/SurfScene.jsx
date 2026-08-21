import { motion, useTransform } from 'framer-motion';

/**
 * SurfScene — the signature illustrated element: a hand-built, line-art
 * beach scene (sun, headland, swell lines, a surfer riding a wave, foam)
 * built entirely from SVG so it's crisp at any size and needs no photo
 * assets. Each layer is wired to hero scroll progress and moves at its
 * own rate, so the whole scene drifts and the surfer appears to carve
 * down the wave face as the page scrolls.
 */
export default function SurfScene({ progress }) {
  const sunY = useTransform(progress, [0, 1], [0, -40]);
  const headlandX = useTransform(progress, [0, 1], [0, -60]);
  const farSwellY = useTransform(progress, [0, 1], ['0%', '10%']);
  const waveY = useTransform(progress, [0, 1], ['0%', '22%']);
  const surferY = useTransform(progress, [0, 1], [0, 90]);
  const surferRotate = useTransform(progress, [0, 1], [-6, 10]);
  const foamY = useTransform(progress, [0, 1], ['0%', '34%']);
  const foamX = useTransform(progress, [0, 1], ['0%', '-6%']);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
  <img
    src="/images/beach.png"
    alt="Surfer riding a wave at sunset"
    className="h-full w-full object-cover"
    loading="eager"
    fetchpriority="high"
  />
  <div
    className="absolute inset-0"
    style={{
      background:
        'linear-gradient(to bottom, rgba(11,61,58,0.55), rgba(11,61,58,0.15) 45%, rgba(11,61,58,0.7))',
    }}
  />
</div>
  );
}
