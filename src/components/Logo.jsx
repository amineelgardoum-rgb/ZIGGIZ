export default function Logo({ light = true, className = '' }) {
  const color = light ? 'text-white' : 'text-ink';
  return (
    <span className={`inline-flex flex-col items-center ${color} ${className}`}>
      <span className="text-2xl font-medium uppercase tracking-[0.35em]">
        Ziggiz
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em]">
        Beach · Surf · Hostels
      </span>
    </span>
  );
}