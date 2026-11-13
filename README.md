# RideFlow Landing Page

A responsive React + TypeScript + Vite landing page using Tailwind CSS, Framer Motion and Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Main files

- `src/App.tsx` — navigation, hero, artwork, floating cards and capability strip
- `src/index.css` — visual system, layout and responsive styling
- `index.html` — document metadata and font loading

## Notes

- The animated artwork video and poster are loaded from the exact remote URLs supplied in the design brief. They are not bundled or downloaded.
- The counters are visual placeholder metrics for the landing-page concept. Replace them with verified RideFlow metrics before publishing.
- Booking and authentication links are placeholders for future application routes.
- The mobile menu supports click-to-open, click-to-navigate and Escape-to-close.
- Reduced-motion preferences are respected.
