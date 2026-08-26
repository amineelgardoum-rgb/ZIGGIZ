const MESSAGES = [
  'Free gear rental with every lesson',
  'Boat charters departing daily at sunrise',
  'Grom Camp summer spots are open',
  'Book 3 sessions, get the 4th free',
];

export default function TopBar() {
  return (
    <div className="group relative z-30 overflow-hidden rounded-[1.25rem] bg-ocean-deep px-4 py-2 text-center">
      <div className="flex w-max items-center gap-10 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.25em] text-white/80 animate-[marquee_26s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...MESSAGES, ...MESSAGES].map((m, i) => (
          <span key={i} className="flex items-center gap-10">
            {m}
            <span className="size-1 rounded-full bg-sun" />
          </span>
        ))}
      </div>
    </div>
  );
}
