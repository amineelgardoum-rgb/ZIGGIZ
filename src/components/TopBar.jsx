import { useI18n } from '../i18n/I18nContext';

export default function TopBar() {
  const { t } = useI18n();
  const messages = t.topbar.messages;
  return (
    <div className="group relative z-30 overflow-hidden rounded-[1.25rem] bg-ocean-deep px-4 py-2 text-center">
      <div className="marquee flex w-max items-center gap-10 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.25em] text-white/80 animate-[marquee_26s_linear_infinite] group-hover:[animation-play-state:paused]">
        {[...messages, ...messages].map((m, i) => (
          <span key={i} className="flex items-center gap-10">
            {m}
            <span className="size-1 rounded-full bg-sun" />
          </span>
        ))}
      </div>
    </div>
  );
}
