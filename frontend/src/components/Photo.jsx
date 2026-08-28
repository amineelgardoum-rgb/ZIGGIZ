const PALETTES = {
  reef: ['#0F5C55', '#1C6E66', '#4FA69B'],
  point: ['#0B3D3A', '#12524C', '#F2B705'],
  dawn: ['#134E48', '#FF6A4D', '#F2B705'],
  headland: ['#08302D', '#1C6E66', '#EDE2C6'],
  crew: ['#0B3D3A', '#4FA69B', '#F6EFDD'],
};

/**
 * A generative "photo" tile — a layered wave/horizon illustration used
 * anywhere the source design called for a photograph. Kept as inline SVG
 * so the whole build stays self-contained with no external image hosts.
 */
export default function Photo({ variant = 'reef', className = '', label }) {
  const [a, b, c] = PALETTES[variant] || PALETTES.reef;
  const seed = variant.length;
  return (
    <div className={`relative overflow-hidden ${className}`} role="img" aria-label={label || `${variant} scene`}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#grad-${variant})`} />
        <circle cx={60 + seed * 30} cy="90" r="34" fill={c} opacity="0.55" />
        <path
          d={`M0 ${300 + seed * 8} Q100 ${260 + seed * 4} 200 ${300 + seed * 8} T400 ${300 + seed * 8} L400 500 L0 500 Z`}
          fill={c}
          opacity="0.18"
        />
        <path
          d={`M0 ${360 + seed * 6} Q100 ${330} 200 ${360 + seed * 6} T400 ${360 + seed * 6} L400 500 L0 500 Z`}
          fill="#F6EFDD"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
