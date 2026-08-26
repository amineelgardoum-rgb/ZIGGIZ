import HoverBanner from './HoverBanner';

const PANELS = [
  {
    id: 'surf',
    label: 'Surf Lessons',
    description: 'From first paddle-out to green waves',
    image: '/images/surf/surf3.jpeg',
    links: [
      { name: 'Grom Camp', note: 'Ages 6–14', href: 'lessons' },
      { name: 'Adult Lessons', note: 'Small groups', href: 'lessons' },
      { name: 'Private Guiding', note: 'One-on-one', href: 'lessons' },
    ],
  },
  {
    id: 'quads',
    label: 'Quad Trips',
    description: 'Coastal tracks & cliff-top views',
    image: '/images/activities/activitie3.png',
    links: [
      { name: 'Sunset Dune Run', note: 'Golden hour', href: 'lessons' },
      { name: 'Paradise Valley Ride', note: 'Swim stop', href: 'lessons' },
    ],
  },
  {
    id: 'boats',
    label: 'Boat Trips',
    description: 'Hidden coves & sunsets at sea',
    image: '/images/activities/activitie4.png',
    links: [
      { name: 'Sunset Coast Cruise', note: 'Mint tea on deck', href: 'lessons' },
      { name: 'Snorkel & Hidden Coves', note: 'Fresh fish lunch', href: 'lessons' },
    ],
  },
  {
    id: 'hostel',
    label: 'Surf Hostel',
    description: 'Beds steps from the break',
    image: '/images/hostels/hostle1.png',
    links: [
      { name: 'Shared Dorm', note: 'Meet the crew', href: 'lessons' },
      { name: 'Private Room', note: 'Ocean view', href: 'lessons' },
      { name: 'Surf & Stay Pack', note: 'Bed + lessons', href: 'lessons' },
    ],
  },
];

export default function Lessons() {
  return (
    <section
      id="lessons"
      className="relative isolate scroll-mt-24 overflow-hidden rounded-[2rem] bg-sand-deep px-6 py-16 sm:px-10 sm:py-24"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/background/agadir.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ocean-deep/60" />
      </div>
      <div className="h-[28rem] sm:h-[34rem]">
        <HoverBanner items={PANELS} label="Lessons and trips" />
      </div>
    </section>
  );
}
