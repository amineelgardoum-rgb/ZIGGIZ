export default function Logo({ light = true, className = '' }) {
  const color = light ? 'text-white' : 'text-ink';
  return (
    <span className={`inline-flex items-center gap-2 text-base font-medium uppercase tracking-[0.2em] ${color} ${className}`}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 17c2.5-3 5 1.5 7.5-1S15 11 17.5 13.5 21 17 21 17" />
        <path d="M3 20.5c2.5-3 5 1.5 7.5-1s4.5-4.5 7-2 3.5 3.5 3.5 3.5" />
        <circle cx="17.5" cy="5.5" r="2.4" />
      </svg>
      Saltline
    </span>
  );
}
