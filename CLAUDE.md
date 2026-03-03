# TemperPack Frontend JavaScript — Refactor Briefing

## Project Context

TemperPack is a sustainable packaging company. This codebase powers the frontend interactivity of their Webflow site. The goal of this phase is to **refactor existing functionality into a clean, modular structure** — no new features, no behaviour changes. Everything that works now must work after the refactor.

The site is built in **Webflow**. Custom JS is pasted into the footer custom code block. On production, a single compiled file is served via **jsDelivr CDN**, with source tracked in **GitHub**.

---

## Build Setup

Use **esbuild** to compile ES modules into a single IIFE bundle.

```
src/
  main.js          ← entry point, imports and calls init() from each module
  utils.js
  navigation.js
  drawers.js
  interactions.js
  animations.js
  swipers.js
dist/
  temperpack.js    ← compiled output — this is what goes to Webflow / jsDelivr
```

Basic esbuild command:
```bash
npx esbuild src/main.js --bundle --format=iife --outfile=dist/temperpack.js --minify
```

Use `--watch` during development. Commit both `src/` and `dist/` to git.

---

## Module Structure

Write proper ES modules with `import`/`export`. esbuild handles the bundling.

### `utils.js`
Shared state and helpers used across multiple modules. Currently this functionality is duplicated/entangled between navigation and drawer code.

Owns:
- Overlay show/hide (`.overlay` element, `is-visible` class)
- Body scroll lock/unlock (`document.body.style.overflow`)
- Any other shared helpers that emerge during refactor

```js
export function showOverlay() { ... }
export function hideOverlay() { ... }
export function lockScroll() { ... }
export function unlockScroll() { ... }
```

### `navigation.js`
Desktop dropdowns, mobile nav drawer, scroll behaviour.

Note: The mobile nav drawer is part of navigation — it is the mobile manifestation of the nav, not to be confused with the content drawer (which lives in `drawers.js`).

Current code uses `window.closeContentDrawer` as a hack to coordinate with the content drawer from within the overlay click handler. After refactor, both modules call `utils.hideOverlay()` directly — this hack can be removed.

Owns:
- `.header` / `.header-fixed` scroll behaviour (`is-scrolled` class)
- Desktop dropdown open/close (`is-open` class, `aria-expanded`)
- Mouse leave delay (300ms)
- Click outside to close
- Hamburger / mobile drawer open/close
- Mobile accordion panels
- Escape key handling
- Resize handler (closes mobile state on desktop resize)

Constants to preserve:
```js
const MOUSE_LEAVE_DELAY = 300;
const MOBILE_BREAKPOINT = 991;
```

### `drawers.js`
AJAX content drawer — fetches CMS page content and renders in a slide-in panel.

Owns:
- Creates `.drawer` element dynamically and appends to body
- Event delegation for `[data-drawer="true"]` link clicks
- `fetch()` call to retrieve page, parse `.drawer-content` element
- In-memory cache (`drawerCache` object)
- Loading/error states
- Close button, Escape key
- Exposes `window.closeContentDrawer` — keep for now, navigation overlay click depends on it

### `interactions.js`
The `Accordion` class and its initialization.

The Accordion class supports feature flags via data attributes:
- `data-auto-rotate` — interval-based auto progression with progress bar animation
- `data-image-swap="true"` — clones accordion item images into a shared container, swaps on open
- `data-first-open="true"` — opens first item on init

Preserve all existing behaviour exactly. The class is well-structured — this module is mostly about isolating it cleanly.

### `animations.js`
Viewport entry animations, marquee, and the hero green text swap.

**Hero green text** (currently in codebase — preserve exactly):
- Reads `data-green-text` attribute on `h1` elements
- Wraps matching text in `<span class="text--green-dark">` with a `<br>` before it

**Viewport entry animations** — leave placeholder comment, do not build during this refactor:
- `animate-fade-up`: opacity 0 + translateY → opacity 1 + translateY 0
- `animate-scale-in`: scale 1.1 → scale 1
- Driven by Intersection Observer, CSS handles transitions

**Marquee** — leave placeholder comment, do not build during this refactor:
```html
<div class="overflow-wrapper">
  <div class="marquee">
    <div class="marquee-pill">Vaccines</div>
    <!-- etc -->
  </div>
</div>
```
Infinite horizontal scroll via JS clone + CSS animation. Respect `prefers-reduced-motion`.

### `swipers.js`
All three Swiper instances. Each guarded with a `document.querySelector` check.

1. `.swiper-media` — `slidesPerView: 'auto'`, fraction pagination, named nav buttons
2. `.swiper-case-studies` — `slidesPerView: 'auto'`, fraction pagination, responsive `spaceBetween` breakpoints
3. `.swiper-testimonials` — creative effect, centred, looped, clickable dot pagination

Swiper is loaded via CDN in Webflow — it is a global. Do not import it.

---

## Hero Animations — Page-Level Scripts

- Shared `animations.js` handles repeatable patterns only
- Complex, page-specific sequences live in `src/heroes/hero-[pagename].js`
- These are added to individual Webflow page custom code blocks, not the global footer script
- GSAP can be used here without affecting any other module

Defer entirely until after the refactor is complete.

---

## Image / Element Readiness

No loading screens. Preferred approach when building animations:
- Gate CSS entrance animations on an `is-loaded` class added to `<html>`
- Class added once `document.fonts.ready` resolves and critical images are loaded
- Elements hold layout space (`visibility: hidden`, not `display: none`)

Implementation deferred until animation module is built.

---

## Design System — JS-Relevant Conventions

**State classes:** `is-open`, `is-active`, `is-visible`, `is-scrolled`, `is-loading`, `autorotate-disabled`, `has-open-panel`

**Data attributes for JS hooks:** `data-accordion`, `data-trigger`, `data-drawer`, `data-auto-rotate`, `data-image-swap`, `data-first-open`, `data-green-text`

---

## Refactor Rules

1. **No new functionality** — this phase is refactor only
2. **No behaviour changes** — everything that works now must work identically after
3. **Preserve all class names and data attributes** — Webflow HTML depends on them
4. **Guard all component inits** — check element exists before initialising
5. **Keep `window.closeContentDrawer`** until nav and drawers both cleanly use utils
6. **Single output file** — `dist/temperpack.js` is what gets deployed

---

## Current Code State

The existing code contains:
- Three Swiper initialisations (guarded)
- `Accordion` class with auto-rotate, image-swap, and first-open features
- Hero green text handler
- Navigation IIFE (desktop dropdowns, mobile drawer, scroll behaviour, overlay)
- Content drawer IIFE (AJAX fetch, in-memory cache, render, close handlers)

All of this works in production. The refactor reorganises it — nothing more.