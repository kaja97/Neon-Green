## Goal
Unify the entire Neon Farming frontend under **one cohesive design system** with a buttery-smooth **dark matte-neon** theme (default) + a full **light mode** toggle, and upgrade the dashboard/project scroll background into a living "crop grows & flowers as you scroll" scene — enhancing the existing `crop-bg.png` / `neon-seeds-bg.png` with parallax layers, drifting particles, and a scroll-driven sky color shift.

This is a **restyle + layout polish** pass: all existing functionality (fetches, mutations, routes, forms, auth) stays intact. Only visuals, tokens, and the scroll background change.

---

## Phase 1 — Theme infrastructure (the foundation)

**1.1 `tailwind.config.ts`** — add `darkMode: "class"` and convert the hardcoded hex colors to CSS-variable references so they swap automatically:
- `surface.primary` → `hsl(var(--color-surface-primary))`, etc. for all surface/text/border tokens.
- Keep neon + primary palettes as static hex (brand colors don't change).
- This makes `bg-surface-primary`, `text-text-primary`, `border-border`, etc. resolve differently per theme.

**1.2 `app/globals.css`** — split `:root` into theme-aware tokens:
- Keep current HSL values as the **dark default** in `:root` (= dark is default).
- Add a **`.light`** override block with a soft, buttery light palette:
  - bg `#f8fafc`, surfaces `#ffffff / #f1f5f9 / #e2e8f0 / #cbd5e1`
  - text `#0f172a / #475569 / #94a3b8`, border `#e2e8f0`
  - brand green stays, but borders/shadows tuned for contrast
  - glass tokens: light = `rgba(255,255,255,0.7)` bg + `rgba(15,23,42,0.06)` border
- Rewrite `.glass-card`, `.glass-card-hover`, `.btn-*`, glow utilities to read from these CSS variables so they adapt to both themes.
- Refine scrollbar, selection color, and add smooth `color-scheme` transitions on `body` for the buttery feel.

**1.3 `lib/stores/uiStore.ts`** — already has `theme` + `setTheme` (persisted). Leave as-is; just consume it.

**1.4 New `components/providers/ThemeProvider.tsx`** — client component that:
- Reads `theme` from `useUIStore`, applies `document.documentElement.classList` (`dark`/`light`), and keeps it in sync.
- Added to `app/layout.tsx` next to `QueryProvider`.

**1.5 `app/layout.tsx`** — add a **no-flash inline script** in `<head>` that reads the persisted theme from `localStorage("ui-storage")` and sets the `<html>` class **before paint** (prevents the dark→light flash on reload). Wrap children in `ThemeProvider`.

---

## Phase 2 — Theme toggle UI

**2.1 `components/layout/TopBar.tsx`** — add a Sun/Moon toggle button (animated icon swap via Framer Motion) next to the notifications bell. Calls `setTheme`.
**2.2 `components/layout/BottomNav.tsx`** — no change needed.
**2.3 `app/(app)/profile/page.tsx`** — add an "Appearance" row in Preferences (Dark / Light segmented control) alongside language & push notifications.

---

## Phase 3 — Convert all clashing light pages to the token system (the big one)

Replace `bg-slate-50`, `bg-white`, `text-slate-900/800/700`, `border-slate-200`, `bg-green-50/100`, etc. → semantic tokens (`bg-surface-primary`, `glass-card`, `text-text-primary/secondary`, `text-text-muted`, `border-border`) + `btn-primary`/`btn-secondary`. Light status badges (e.g. `bg-green-100 text-green-700`) → neon-tinted dark variants (`bg-green-500/10 text-green-400 border-green-500/20`).

**Pages (13):**
- `app/page.tsx` (landing — full redesign to dark matte hero)
- `app/(app)/projects/page.tsx` (projects list)
- `app/(app)/projects/new/page.tsx` (wizard)
- `app/(app)/profile/page.tsx` (settings)
- `app/(app)/notifications/page.tsx`
- `app/(app)/admin/layout.tsx` (sidebar)
- `app/(app)/admin/dashboard/page.tsx`
- `app/(app)/admin/users/page.tsx`
- `app/(app)/admin/master-data/page.tsx`
- `app/(app)/admin/projects/page.tsx`
- `app/(app)/projects/[id]/soil/page.tsx`
- `app/(app)/projects/[id]/soil/new/page.tsx`
- `app/(app)/projects/[id]/weather/page.tsx`
- `app/(app)/projects/[id]/market/page.tsx`

**Components (7):**
- `components/blocks/ActivityBlock.tsx`
- `components/blocks/SoilBlock.tsx`
- `components/settings/ProfileSection.tsx`
- `components/settings/LocationSection.tsx` (also fixes its internal light/dark mismatch)
- `components/settings/LandSection.tsx`
- `components/settings/LivestockSection.tsx`

Already-dark pages (dashboard, project detail, auth, market, nav, modal, FarmingCircle, ProjectCard, WeatherForecast, most blocks) only need minor token-consistency touches where they use raw `bg-slate-*` instead of tokens.

---

## Phase 4 — Scroll-driven "crop grows & flowers" background (enhance existing assets)

Rewrite **`components/dashboard/ParallaxBackground.tsx`** → a richer `CropSceneBackground` using Framer Motion `useScroll` / `useTransform` / `useSpring`:

- **Layer 1 — base field:** `crop-bg.png`, translated vertically at ~0.3× scroll speed (slow parallax).
- **Layer 2 — neon seeds/particles:** `neon-seeds-bg.png` at ~0.6× speed, opacity ramping in as you descend.
- **Layer 3 — drifting particles:** ~16 lightweight pollen/seed dots, randomized positions, animated drift (translateY + opacity loop), each on its own parallax depth — gives a living, floating feel.
- **Layer 4 — scroll-driven sky tint overlay:** a full-screen gradient whose color stops interpolate with scroll progress: top = deep midnight `#0a0f12` → ~40% = dawn indigo/violet → ~75% = daytime teal-green → bottom = warm harvest gold/green. Achieved with `useTransform(scrollYProgress, […], […])` on `background`. This is the "as you scroll down, the crop matures and flowers" illusion — the whole atmosphere evolves.
- **Layer 5 — soil vignette** at the bottom for depth.
- Respects `prefers-reduced-motion` (disables particles + parallax, keeps static image).
- **Mount on both `/dashboard` AND `/projects/[id]`** (project page currently has no background). Add to `app/(app)/projects/[id]/page.tsx`.
- Sits at `fixed inset-0 z-[-1] pointer-events-none`, behind all content. Content cards already use `glass-card` so they float beautifully over it.

---

## Phase 5 — Polish & verify

- Consistent radii (`rounded-3xl` cards, `rounded-2xl` inputs), spacing rhythm, heading tracking across pages.
- Ensure `focus-visible` rings use the brand green in both themes.
- Run `npm run build` (TypeScript + Next build) to confirm no type/build breaks from the token conversion.

---

## Notes / non-goals
- **No backend, API, route, or data-logic changes** — purely visual.
- Brand neon green/gold/red/blue accents stay; only surfaces/text/borders/glass become theme-aware.
- I will not add new dependencies — Framer Motion, Tailwind, clsx, zustand are all already installed.

## Files touched (summary)
- **Infra (5):** `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, new `components/providers/ThemeProvider.tsx`, `lib/stores/uiStore.ts` (no-op confirm)
- **Toggle (2):** `components/layout/TopBar.tsx`, `app/(app)/profile/page.tsx`
- **Light→dark conversions (20):** the pages + components listed in Phase 3
- **Scroll background (2):** `components/dashboard/ParallaxBackground.tsx` (rewrite), `app/(app)/projects/[id]/page.tsx` (mount it)