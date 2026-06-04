# The Animation Spectrum

An interactive, single-page site that maps animated TV series by the audience that
**actually watches them**. Instead of dropping each show into one age *bucket*, every show is
plotted as a **range on a continuous age line**, so crossover hits (Bluey, Avatar, Adventure
Time) visibly stretch across the whole axis. A **List** view (group by age bucket, animation
style, decade, or A–Z) is the secondary mode.

**Live:** https://henri-cmd.github.io/MCC-Animation-Research/

Dark, cinematic, editorial. Static SPA — no backend, no database. The data is a bundled JSON file.

## The idea in three interactions

1. **Age Line (default).** A continuous age axis (`0 · 2 · 5 · 8 · 11 · 14 · 17 · Adult`). Each show
   is a horizontal capsule spanning `ageFrom → ageTo`, colour-graded along the maturity spectrum so
   the whole chart flows warm/cream (young, left) to deep crimson (adult, right). Open-ended /
   all-ages shows (`ageTo === 99`) reach into the **Adult** zone and fade out. Bars are
   interval-packed into rows so non-overlapping shows share a row.
2. **The age scrubber.** Drag the marker along the axis (or focus it and use arrow keys). Every bar
   whose range covers that age stays lit; the rest dim. A live readout answers *“what can a
   9-year-old actually watch?”* — `At age 9 · 24 of 48 shows`.
3. **Detail panel.** Click any bar or card for a focus-trapped drawer: a key-art hero, mini
   age-axis, stats, animation style, synopsis, themes, an **honest viewership** block, a reach
   note, and outbound **IMDb + Wikipedia** links. Deep-linkable via `?show=<id>` (e.g. `/?show=bluey`).

## Data honesty (please read before editing the dataset)

The dataset lives at [`public/data/shows.json`](public/data/shows.json). Three rules are baked into
the UI and must be preserved:

- **No revenue or profit figures.** Deliberately omitted — usually unreliable or tied to spin-off
  films rather than the show. Don’t add them back.
- **Viewership is shown only when documented.** Each show either displays a sourced figure
  (premiere/peak rating or a notable milestone) **with a citation link**, or reads **“Not publicly
  disclosed.”** Streaming originals (`viewership.disclosed: false`) are **never** numbered —
  Netflix/Prime/etc. don’t release per-title figures. Never fabricate or estimate a number.
- **Counts are verified before launch.** Entries with `verified: false` are best-effort estimates;
  confirm `seasons` / `episodes` / `yearEnd` via web search, then flip `verified: true`.

A short **About the data** note in the footer paraphrases the above for visitors.

## Tech stack

- **Vite + React + TypeScript + Tailwind CSS** (v3)
- Plain **SVG/CSS** for the age line — no charting library. The scales, spectrum interpolation, and
  interval-packing are small local modules.
- Fonts via Google Fonts CDN: **Anton** (display), **Space Mono** (data/labels), **Archivo** (body).

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build locally
```

## Deploy

### GitHub Pages (current host)

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
builds with `GH_PAGES=true` (so Vite uses the `/MCC-Animation-Research/` base path) and publishes
`dist/` to Pages. Live at **https://henri-cmd.github.io/MCC-Animation-Research/**. No secrets or
backend required — just `git push`.

### Cloudflare Pages (alternative, root-hosted)

The build is also a plain static `dist/` folder. Because the base path is only set when
`GH_PAGES=true`, a normal build targets the site root, which is what Cloudflare expects:

```bash
npm run deploy
# = npm run build && npx wrangler pages deploy dist
```

Or connect the repo in the Cloudflare dashboard with build command `npm run build` and output
directory `dist`.

## Project structure

```
public/data/shows.json          the seed dataset (source of truth)
src/main.tsx, App.tsx            entry + app shell (header, controls, views, footer)
src/data/shows.ts               Show interface + typed JSON loader
src/lib/spectrum.ts             age → colour interpolation along the maturity ramp
src/lib/scale.ts                age ↔ axis position, per-bar gradient, open-ended handling
src/lib/pack.ts                 first-fit interval packing for the age-line rows
src/lib/filter.ts               search / filter / sort + grouping helpers
src/lib/hooks.ts                element-measure + ?show= URL deep-link sync
src/components/AgeLine.tsx      hero view: packed spectrum bars + tooltip
src/components/AxisScrubber.tsx the draggable age marker + live readout
src/components/ListView.tsx     grouped card grid (bucket / style / decade / A–Z)
src/components/ShowDetail.tsx   focus-trapped detail drawer (deep-linked)
src/components/MiniAxis.tsx     compact age axis used inside the drawer
src/components/Controls.tsx     search / filters / sort / group / view toggle
scripts/*.mjs                   one-off data-enrichment scripts (provenance of counts,
                                viewership, IMDb links + animation-style tags)
```

## Features

- Age Line with interval-packed, spectrum-graded bars and an open-ended **Adult** zone
- Draggable **age scrubber** with live “shows at this age” readout (keyboard-operable)
- **List** view toggle, with **group by** age bucket / animation style / decade / A–Z
- **Search** by title (filters both views)
- **Filters:** bucket, **animation style**, theme, decade (from `yearStart`), ongoing-only
- **Sort** (list view): age, reach (span), episodes, seasons, year, A–Z
- **Detail panel** with `?show=` deep-linking, honest viewership, and **IMDb + Wikipedia** links
- **Animation-style tags** (2D · Anime · 3D / CGI · Stop-motion · Cutout · Puppetry)
- Image-ready: poster thumbnails + a detail gallery slot, with an on-theme spectrum fallback until
  artwork is sourced (see **Images** below)
- Footer **About the data** note
- **Responsive** (the age line scrolls horizontally on phones) and **keyboard accessible**
  (tab to bars, Enter to open, Esc/backdrop to close, focus-trapped drawer, skip link,
  `prefers-reduced-motion` respected)

## Images

Cards, the age-line hover tooltip, and the detail drawer all render a **poster thumbnail** with a
designed spectrum-gradient fallback, and the drawer has a **gallery** slot. They light up with real
artwork the moment a show's `images` field is populated:

```jsonc
"images": { "poster": "https://…", "gallery": ["https://…", "https://…"] }
```

Artwork is **not** scraped from IMDb (their terms forbid it and the images are licensed). The
intended source is **TMDB**, whose API is free and permits image display with attribution — its
image URLs can be baked into the dataset so the static site needs no key at runtime.

## Accessibility & motion

- Bars are real buttons with descriptive `aria-label`s; the scrubber is a `role="slider"` with
  arrow/Home/End support and `aria-valuetext`.
- The detail drawer is `role="dialog"` / `aria-modal`, focus-trapped, restores focus on close, and
  locks background scroll.
- The staggered “sunrise” bar reveal and other animations are disabled under
  `prefers-reduced-motion: reduce`.
