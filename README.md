# Saltline Surf Co.

A production-ready React + Vite + Tailwind CSS v4 marketing site for a boutique
surf-tourism outfit — guided trips, lessons, and coastal stays. Rebuilt from a
tennis-club reference brief and re-themed for surf travel, with an original
illustrated (SVG, not stock-photo) parallax beach/surfer scene in the hero
that animates as you scroll.

## Stack

- **React 18 + Vite** — app shell and build tooling
- **Tailwind CSS v4** — utility styling, design tokens declared in `src/index.css` via `@theme`
- **Framer Motion** — scroll-linked parallax, clip-mask text reveals, hover/tap micro-interactions, the intro loader, modal, and menu transitions
- **Lenis** — inertial smooth scrolling
- **lucide-react** — icons

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

## Project structure

```TSX
src/
  components/
    Hero.jsx           hero section (title, tagline, trip slider, stat card)
    SurfScene.jsx       the signature layered parallax illustration
    Ticker.jsx          guide/conditions carousel with oversized ghost words
    Lessons.jsx         numbered lesson-level list
    Spots.jsx           destination/break cards
    Stats.jsx           by-the-numbers band
    Testimonials.jsx    traveler review cards
    Footer.jsx          footer with CTA, nav columns, social/legal
    ContactModal.jsx    "Book a trip" modal (stub submit, no network call)
    MenuOverlay.jsx     fullscreen nav menu
    Loader.jsx          intro loading curtain
    RevealText.jsx      reusable clip-mask / word-fade text reveal primitives
    UI.jsx              Eyebrow, PillButton, ArrowButton, Dots
    Photo.jsx           generative illustrated "photo" tiles (no external image hosting)
    Logo.jsx            wordmark
  hooks/
    useLenis.js          smooth-scroll setup + scroll lock/unlock helpers
  lib/
    motion.js            shared Framer Motion presets
```

## Design notes

- All imagery is hand-built inline SVG (the hero scene and the section
  "photo" tiles) rather than hotlinked stock photography, so the build has
  zero external image dependencies and no licensing risk.
- Colors, radii, and fonts are declared once as CSS variables in
  `src/index.css` (`@theme` block) and consumed as Tailwind utilities
  (`bg-ocean-deep`, `text-ink-soft`, `rounded-[2rem]`, etc.).
- Layout is fully responsive: mobile-first Tailwind breakpoints (`sm`,
  `md`, `lg`), fluid `vw`-based hero type, hover-only micro-interactions
  (they simply don't fire on touch), and `prefers-reduced-motion` support
  in both CSS and the loader timing.
- The contact form's submit handler is a stub — it never calls a network
  endpoint. Wire it to your booking backend/email provider before going live.

## Deploying

`npm run build` outputs a static `dist/` folder that can be hosted on any
static host (Vercel, Netlify, Cloudflare Pages, S3 + CDN, etc.).
