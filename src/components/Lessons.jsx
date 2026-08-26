import HoverBanner from './HoverBanner';
import { useI18n } from '../i18n/I18nContext';

const PANELS = [
  {
    id: 'surf',
    image: '/images/surf/surf3.jpeg',
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
  {
    id: 'quads',
    image: '/images/activities/activitie3.jpg',
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
  {
    id: 'boats',
    image: '/images/activities/activitie4.jpg',
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
  {
    id: 'hostel',
    image: '/images/hostels/hostle1.jpg',
    links: [
      { href: 'lessons' },
      { href: 'lessons' },
      { href: 'lessons' },
    ],
  },
];

export default function Lessons() {
  const { t } = useI18n();
  const panels = PANELS.map((panel, i) => ({
    ...panel,
    ...t.lessons.panels[i],
    links: panel.links.map((link, j) => ({ ...link, ...t.lessons.panels[i].links[j] })),
  }));

  return (
    <section
      id="lessons"
      className="relative isolate scroll-mt-24 overflow-hidden rounded-[2rem] bg-sand-deep px-6 py-16 sm:px-10 sm:py-24"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/background/agadir.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ocean-deep/60" />
      </div>
      <div className="h-[36rem] md:h-[34rem]">
        <HoverBanner items={panels} label={t.lessons.ariaLabel} />
      </div>
    </section>
  );
}
