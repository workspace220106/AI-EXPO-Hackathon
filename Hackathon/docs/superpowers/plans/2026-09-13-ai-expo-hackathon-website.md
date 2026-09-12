# AI EXPO Subway-Runner Hackathon Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full front-end (mock-data) AI EXPO hackathon site: a single persistent 3D subway world with landing journey, kiosk sign-in, five-step registration ending in a Hack Pass, and a Runner Station dashboard with six trains, progress track, live-ish leaderboard, coins and badges.

**Architecture:** One Vite + React + TypeScript SPA. A fixed React-Three-Fiber `<Canvas>` renders a procedurally built station laid out along −Z; `react-router` routes map to named camera shots (the landing route maps scroll progress to a spline). All forms/panels/HUD are DOM overlays styled as kiosk screens and subway signage. Data goes through a `HackathonApi` interface implemented by a `localStorage`-backed mock. zustand slices hold session, registration draft, game (coins/badges), leaderboard ticker and transient world events.

**Tech Stack:** Vite 6, React 19, TypeScript (strict), three + @react-three/fiber 9 + @react-three/drei 10, maath, zustand 5, react-router 7, framer-motion 12, lenis, Tailwind CSS 4 (`@tailwindcss/vite`), qrcode, @fontsource/bungee + @fontsource/rubik, vitest + @testing-library/react + jsdom.

**Spec:** `docs/superpowers/specs/2026-09-12-ai-expo-hackathon-website-design.md` — read it before starting any task.

## Global Constraints

- **Palette is locked.** The only colour literals allowed anywhere in `src/` are `#FDD013` (yellow), `#6AEEFD` (cyan), `#354093` (navy), `#C6FEFE` (pale), `#F7BE76` (orange), `#E31902` (red), `#FFFFFF` (white). `npm run lint` runs `scripts/check-palette.mjs` and fails on anything else. Never write `rgb(`/`hsl(`/named CSS colours. Use `PALETTE.*` in TS and Tailwind tokens (`bg-navy`, `text-pale`, …) in JSX.
- **Background is light.** `<body>`, `scene.background`, fog, walls and platform tops are `pale`. `navy` is never a page or scene background — only structure, trains, panels, text, shadows.
- **No forbidden aesthetics:** no black, no grey UI, no purple/pink/green, no glow/bloom post-processing, no glassmorphism/blur, no gradients except between two palette colours (and rarely).
- **No external 3D/texture assets.** Everything is primitives, instancing, drei `Text` and runtime-painted canvas textures.
- **Fonts:** display/signage = Bungee (`font-display`), UI = Rubik (`font-ui`), self-hosted via `@fontsource`.
- **Copy is UPPERCASE for signage/CTAs** exactly as written in the spec (`RUN THE HACKATHON.`, `▶ START RUNNING`, `RUN IN`, `YOU'RE IN.`, …).
- **Event facts** come only from `src/config/event.ts`. Event name is `AI EXPO`; tagline `RUN THE HACKATHON`.
- **Runner IDs** are `#` + 4 digits; the mock counter starts at 246 so the first registration is `#0247`. Team codes are `RAIL-XXXX` from alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- **Accessibility:** every flow works with keyboard; inputs have `<label>`s; `prefers-reduced-motion` disables cinematic, particles, confetti, auto-run and dolly damping (instant cuts).
- **Tests** live in `tests/` mirroring `src/`, run with `npx vitest run`. 3D components are not unit-tested; pure helpers behind them are. Each task ends with `npx vitest run` green and a commit.
- **Commits** use the repo root `C:\Users\araji\AI` and touch only files under `Hackathon/`. Commit with `git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "..." -- <paths>` and end every message with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Working directory for all commands:** `C:\Users\araji\AI\Hackathon`.
- Node ≥ 20, npm. Never run `npm audit fix` or upgrade packages mid-plan.

---

## File Structure

| Path | Responsibility |
|---|---|
| `index.html`, `src/main.tsx`, `src/App.tsx` | Entry; `App` = `<WorldCanvas/>` + `<Shell/>`; `Shell` = HUD + routes + toasts (renderable in jsdom) |
| `src/theme/palette.ts`, `src/theme/theme.css` | The seven tokens; Tailwind v4 theme with defaults wiped; fonts; utility classes (`shadow-bevel`) |
| `src/config/event.ts` | All event facts, domains, timeline, prizes (mock values) |
| `src/api/types.ts` | Domain types (`Runner`, `Team`, `AvatarConfig`, …), `HackathonApi`, `ApiError` |
| `src/api/seed.ts`, `src/api/mock.ts`, `src/api/index.ts` | Seed data; `localStorage`-backed mock implementation; the `api` singleton |
| `src/lib/storage.ts` | Safe JSON storage with in-memory fallback |
| `src/lib/validation.ts` | Form rules (identity, team, code, submission, word count) |
| `src/lib/progress.ts` | `deriveStage()` — the six-stage run progress |
| `src/lib/badges.ts` | Badge definitions and `evaluateBadges()` |
| `src/lib/leaderboard.ts` | Pure ticker math (`tickScores`, `rankRows`, `rankDeltas`) |
| `src/lib/time.ts` | `now()` with a dev offset |
| `src/lib/ids.ts` | Runner ID / team code generators |
| `src/lib/graffiti.ts` | Canvas painter for graffiti walls (pure layout + draw) |
| `src/lib/intro.ts` | Pure intro-cinematic timeline `introAt(t)` |
| `src/lib/landingPath.ts` | Landing spline control points and `sampleLanding(t)` |
| `src/store/session.ts` | Signed-in runner |
| `src/store/registration.ts` | Draft + completed steps |
| `src/store/game.ts` | Coins, badges, visited zones, collected coins |
| `src/store/leaderboard.ts` | Rows, deltas, ticker lifecycle |
| `src/store/world.ts` | Camera shot, scrollT, quality tier, transient events, intro state |
| `src/store/toasts.ts` | Toast queue (coins, badges, rank, guard redirects) |
| `src/routes/index.tsx`, `src/routes/guards.tsx` | Route table; `RequireSession`, `RequireStep` |
| `src/ui/*` | `ArcadeButton`, `Field`, `Pill`, `Chip`, `Panel`, `Toasts`, `SplitFlap`, `HackPass`, `QrCode`, `Hud`, `MobileNav`, `DevPanel`, `ErrorBoundary` |
| `src/world/WorldCanvas.tsx` | The single canvas, fallback, lights, fog, quality |
| `src/world/CameraRig.tsx`, `src/world/shots.ts`, `src/world/layout.ts` | Shots per route; zone Z ranges |
| `src/world/materials.ts` | `mat(name, variant)` registry |
| `src/world/quality.ts` | Tier detection |
| `src/world/props/*` | Procedural props (Rails, Platform, Wall, Pillar, Train, RouteDoor, Kiosk, Coin, Particles, Sign, GraffitiWall, DepartureBoard, small props) |
| `src/world/runner/*` | `Runner` avatar, parts, animation state machine |
| `src/world/zones/*` | Zone compositions |
| `src/world/cinematic/Intro.tsx` | Drives the rig from `introAt(t)` |
| `src/hooks/*` | `useLenis`, `useReducedMotion`, `useWorldEvents`, `useQualityTier` |
| `src/pages/*` | Landing sections, SignIn, Register steps, Station sections, NotFound |
| `scripts/check-palette.mjs` | Palette guard |
| `tests/**` | Vitest suites mirroring `src/` |

---

## Phase 1 — Foundation

### Task 1: Scaffold the app (Vite + React + TS + Tailwind v4 + fonts + vitest)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/theme/theme.css`, `src/vite-env.d.ts`
- Create: `tests/setup.ts`, `tests/smoke.test.tsx`

**Interfaces:**
- Produces: `App` (default export, mounts canvas + shell), `Shell` (named export; HUD + routes, jsdom-safe). Tailwind classes `bg-pale bg-navy bg-yellow bg-cyan bg-orange bg-red text-* border-* font-display font-ui shadow-bevel shadow-bevel-sm`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "ai-expo-hackathon",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . && node scripts/check-palette.mjs",
    "check-palette": "node scripts/check-palette.mjs"
  },
  "dependencies": {
    "@fontsource/bungee": "^5.2.5",
    "@fontsource/rubik": "^5.2.5",
    "@react-three/drei": "^10.0.6",
    "@react-three/fiber": "^9.1.2",
    "framer-motion": "^12.9.0",
    "lenis": "^1.2.3",
    "maath": "^0.10.8",
    "qrcode": "^1.5.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router": "^7.5.0",
    "three": "^0.176.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@tailwindcss/vite": "^4.1.4",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.14.0",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@types/three": "^0.176.0",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "globals": "^16.0.0",
    "jsdom": "^26.1.0",
    "tailwindcss": "^4.1.4",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.31.0",
    "vite": "^6.3.2",
    "vitest": "^3.1.2"
  }
}
```

- [ ] **Step 2: Write `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `src/vite-env.d.ts`**

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["vite/client", "node"],
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests", "scripts", "vite.config.ts"]
}
```

`eslint.config.js`:
```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,mjs}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
```

`.gitignore`:
```
node_modules
dist
*.local
.DS_Store
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

- [ ] **Step 3: Write `index.html` and `src/theme/theme.css`**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#C6FEFE" />
    <title>AI EXPO — RUN THE HACKATHON</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/theme/theme.css`:
```css
@import "tailwindcss";
@import "@fontsource/bungee/400.css";
@import "@fontsource/rubik/400.css";
@import "@fontsource/rubik/500.css";
@import "@fontsource/rubik/700.css";

@theme {
  --color-*: initial;
  --color-yellow: #FDD013;
  --color-cyan: #6AEEFD;
  --color-navy: #354093;
  --color-pale: #C6FEFE;
  --color-orange: #F7BE76;
  --color-red: #E31902;
  --color-white: #FFFFFF;

  --font-display: "Bungee", system-ui, sans-serif;
  --font-ui: "Rubik", system-ui, sans-serif;

  --shadow-bevel: 6px 6px 0 0 #354093;
  --shadow-bevel-sm: 3px 3px 0 0 #354093;
  --shadow-bevel-yellow: 6px 6px 0 0 #FDD013;
}

@layer base {
  html { background: #C6FEFE; }
  body {
    margin: 0;
    background: #C6FEFE;
    color: #354093;
    font-family: var(--font-ui);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  #root { min-height: 100dvh; }
  ::selection { background: #FDD013; color: #354093; }
  :focus-visible { outline: 3px solid #6AEEFD; outline-offset: 2px; }
}

@layer utilities {
  .text-stroke-navy { -webkit-text-stroke: 2px #354093; }
  .pointer-none { pointer-events: none; }
  .pointer-auto { pointer-events: auto; }
}
```

- [ ] **Step 4: Write `src/main.tsx` and `src/App.tsx`**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './theme/theme.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

`src/App.tsx` (the canvas is added in Task 13; keep `Shell` free of three.js so tests can render it):
```tsx
export function Shell() {
  return (
    <div className="relative z-10 min-h-dvh">
      <header className="fixed left-4 top-4 z-20">
        <span className="font-display text-2xl text-navy">AI EXPO</span>
        <span className="block font-ui text-xs font-bold tracking-widest text-navy">// RUN THE HACKATHON</span>
      </header>
    </div>
  );
}

export default function App() {
  return <Shell />;
}
```

- [ ] **Step 5: Write the failing smoke test**

`tests/setup.ts` (jsdom lacks a few browser APIs the app touches; stub them once here):
```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
  class Observer { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= Observer;
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver ??= Observer;
}

// Lenis needs real layout; replace it with an inert stub in tests (LenisRoot mounts it on "/").
vi.mock('lenis', () => ({
  default: class LenisStub {
    scroll = 0; limit = 0; animatedScroll = 0;
    on() {} raf() {} stop() {} start() {} destroy() {} scrollTo() {}
  },
}));
```

`tests/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Shell } from '@/App';

describe('Shell', () => {
  it('renders the AI EXPO brand', () => {
    render(
      <MemoryRouter>
        <Shell />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AI EXPO').length).toBeGreaterThan(0); // the HUD brand; later the footer repeats it
  });
});
```

- [ ] **Step 6: Install and run the test**

Run: `npm install` then `npx vitest run`
Expected: `1 passed`. If `npm install` fails on a peer-dependency conflict, re-run with `npm install --legacy-peer-deps` and note it in the commit body.

- [ ] **Step 7: Verify the dev server boots**

Run: `npx vite build`
Expected: `✓ built in …` with no type errors. (Do not leave `vite dev` running from this step.)

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/package.json Hackathon/package-lock.json Hackathon/vite.config.ts Hackathon/tsconfig.json Hackathon/eslint.config.js Hackathon/.gitignore Hackathon/index.html Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): scaffold Vite React TS app with locked Tailwind palette

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/package.json Hackathon/package-lock.json Hackathon/vite.config.ts Hackathon/tsconfig.json Hackathon/eslint.config.js Hackathon/.gitignore Hackathon/index.html Hackathon/src Hackathon/tests
```

---

### Task 2: Palette tokens and the palette guard

**Files:**
- Create: `src/theme/palette.ts`, `scripts/check-palette.mjs`
- Test: `tests/theme/palette.test.ts`, `tests/scripts/check-palette.test.ts`

**Interfaces:**
- Produces: `PALETTE` (`Record<PaletteName, string>`), `type PaletteName = 'yellow'|'cyan'|'navy'|'pale'|'orange'|'red'|'white'`, `PALETTE_NAMES: PaletteName[]`, `SWATCH_NAMES` (the six without white). `scripts/check-palette.mjs` exports `findViolations(text: string): string[]` and `ALLOWED: Set<string>`; when run as a script it scans `src/` and exits 1 on violations.

- [ ] **Step 1: Write the failing tests**

`tests/theme/palette.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { PALETTE, PALETTE_NAMES, SWATCH_NAMES } from '@/theme/palette';

describe('PALETTE', () => {
  it('has exactly the seven locked colours', () => {
    expect(PALETTE).toEqual({
      yellow: '#FDD013', cyan: '#6AEEFD', navy: '#354093', pale: '#C6FEFE',
      orange: '#F7BE76', red: '#E31902', white: '#FFFFFF',
    });
    expect(PALETTE_NAMES).toHaveLength(7);
    expect(SWATCH_NAMES).toEqual(['yellow', 'cyan', 'navy', 'pale', 'orange', 'red']);
  });
});
```

`tests/scripts/check-palette.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { findViolations } from '../../scripts/check-palette.mjs';

describe('check-palette', () => {
  it('accepts the seven palette colours in any case and 3-digit white', () => {
    expect(findViolations('color: #fdd013; background: #C6FEFE; border: #fff')).toEqual([]);
  });
  it('rejects off-palette hex, rgb and hsl', () => {
    const v = findViolations('a{color:#8b5cf6} b{color: rgb(0,0,0)} c{color: hsl(0 0% 0%)}');
    expect(v).toEqual(['#8b5cf6', 'rgb(0,0,0)', 'hsl(0 0% 0%)']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/theme tests/scripts`
Expected: FAIL — cannot resolve `@/theme/palette` and `scripts/check-palette.mjs`.

- [ ] **Step 3: Write `src/theme/palette.ts`**

```ts
export const PALETTE = {
  yellow: '#FDD013',
  cyan: '#6AEEFD',
  navy: '#354093',
  pale: '#C6FEFE',
  orange: '#F7BE76',
  red: '#E31902',
  white: '#FFFFFF',
} as const;

export type PaletteName = keyof typeof PALETTE;
export const PALETTE_NAMES = Object.keys(PALETTE) as PaletteName[];
/** The six pickable colours (white is reserved for readability). */
export const SWATCH_NAMES: PaletteName[] = ['yellow', 'cyan', 'navy', 'pale', 'orange', 'red'];
```

- [ ] **Step 4: Write `scripts/check-palette.mjs`**

```js
// Palette guard: every colour literal under src/ must be one of the seven locked colours.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALLOWED = new Set([
  '#fdd013', '#6aeefd', '#354093', '#c6fefe', '#f7be76', '#e31902', '#ffffff', '#fff',
]);

const HEX = /#[0-9a-f]{3,8}\b/gi;
const FUNC = /\b(?:rgba?|hsla?)\([^)]*\)/gi;

export function findViolations(text) {
  const out = [];
  for (const m of text.match(HEX) ?? []) if (!ALLOWED.has(m.toLowerCase())) out.push(m);
  for (const m of text.match(FUNC) ?? []) out.push(m);
  return out;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (['.ts', '.tsx', '.css', '.html', '.mjs'].includes(extname(p))) files.push(p);
  }
  return files;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = join(process.cwd(), 'src');
  let bad = 0;
  for (const file of walk(root)) {
    const v = findViolations(readFileSync(file, 'utf8'));
    if (v.length) { bad += v.length; console.error(`${file}: ${v.join(', ')}`); }
  }
  if (bad) { console.error(`\n✖ ${bad} off-palette colour literal(s).`); process.exit(1); }
  console.log('✔ palette clean');
}
```

- [ ] **Step 5: Run tests and the guard**

Run: `npx vitest run tests/theme tests/scripts && node scripts/check-palette.mjs`
Expected: tests PASS; guard prints `✔ palette clean`.

- [ ] **Step 6: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/theme/palette.ts Hackathon/scripts Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): palette tokens and off-palette guard script

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/theme/palette.ts Hackathon/scripts Hackathon/tests
```

---

### Task 3: Event configuration

**Files:**
- Create: `src/config/event.ts`
- Test: `tests/config/event.test.ts`

**Interfaces:**
- Produces: `EVENT` (typed const), `DomainId`, `DomainConfig`, `DOMAINS: DomainConfig[]`, `domainById(id)`, `TIMELINE_STOPS` (ordered `{ id, label, at, alert }[]`), `formatEventDates()`.

- [ ] **Step 1: Write the failing test**

`tests/config/event.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DOMAINS, EVENT, TIMELINE_STOPS, domainById, formatEventDates } from '@/config/event';

describe('EVENT config', () => {
  it('names the event AI EXPO with the tagline', () => {
    expect(EVENT.name).toBe('AI EXPO');
    expect(EVENT.tagline).toBe('RUN THE HACKATHON');
  });
  it('has four domains with the locked dominant colours', () => {
    expect(DOMAINS.map((d) => [d.id, d.number, d.color])).toEqual([
      ['ai', '01', 'yellow'], ['data', '02', 'cyan'], ['cyber', '03', 'red'], ['future', '04', 'orange'],
    ]);
    expect(domainById('cyber').line).toBe('BREAK IT. SECURE IT.');
    for (const d of DOMAINS) expect(d.problems).toHaveLength(3);
  });
  it('orders the timeline and flags the deadline as an alert', () => {
    const times = TIMELINE_STOPS.map((s) => Date.parse(s.at));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(TIMELINE_STOPS.find((s) => s.id === 'deadline')?.alert).toBe(true);
  });
  it('formats the event dates', () => {
    expect(formatEventDates()).toBe('14–15 NOV 2026');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/config`
Expected: FAIL — cannot resolve `@/config/event`.

- [ ] **Step 3: Write `src/config/event.ts`**

```ts
import type { PaletteName } from '@/theme/palette';

export type DomainId = 'ai' | 'data' | 'cyber' | 'future';

export interface DomainConfig {
  id: DomainId;
  number: '01' | '02' | '03' | '04';
  name: string;
  line: string;
  color: PaletteName;
  theme: string;
  problems: string[];
}

export const DOMAINS: DomainConfig[] = [
  {
    id: 'ai', number: '01', name: 'AI', line: 'MAKE MACHINES THINK.', color: 'yellow',
    theme: 'Build systems that learn, reason and act. Agents, copilots, vision, speech — anything that makes a machine useful in a way it was not yesterday.',
    problems: [
      'An agent that turns a messy college notice board into a personal weekly plan.',
      'A voice assistant for a local language that works fully offline on a phone.',
      'A model that grades hackathon demos from a 2-minute video and explains its score.',
    ],
  },
  {
    id: 'data', number: '02', name: 'DATA', line: 'FIND THE PATTERN.', color: 'cyan',
    theme: 'Turn raw, noisy, real-world data into decisions. Pipelines, dashboards, forecasting, anomaly detection — make the invisible obvious.',
    problems: [
      'Predict crowding at metro stations from open transit feeds and weather.',
      'A live dashboard that spots fraudulent UPI patterns from synthetic transaction streams.',
      'Rank which city wards need a new water tanker route this week — with evidence.',
    ],
  },
  {
    id: 'cyber', number: '03', name: 'CYBER', line: 'BREAK IT. SECURE IT.', color: 'red',
    theme: 'Find the gap, then close it. Defensive tooling, threat detection, secure-by-default developer experience, privacy tech.',
    problems: [
      'A GitHub bot that flags leaked secrets and auto-opens a fix PR.',
      'Phishing-resistant login for a campus portal using passkeys.',
      'A honeypot dashboard that visualises attacker behaviour in real time.',
    ],
  },
  {
    id: 'future', number: '04', name: 'FUTURE TECH', line: "BUILD WHAT'S NEXT.", color: 'orange',
    theme: 'Robotics, AR/VR, drones, IoT, bio-inspired computing — prototypes that feel like they arrived early from ten years ahead.',
    problems: [
      'A drone that maps potholes on a campus loop and exports a repair list.',
      'AR wayfinding inside a metro station that works from a single photo of a sign.',
      'A low-cost sensor kit that turns any classroom into a live air-quality map.',
    ],
  },
];

export const EVENT = {
  name: 'AI EXPO',
  tagline: 'RUN THE HACKATHON',
  mode: 'In-person',
  venue: 'Innovation Hall, Platform 9',
  city: 'Bengaluru',
  organizer: 'AI EXPO Organising Committee',
  timezone: 'Asia/Kolkata',
  timeline: {
    registrationOpens: '2026-10-01T00:00:00+05:30',
    kickoff: '2026-11-14T10:00:00+05:30',
    buildHours: 36,
    submissionDeadline: '2026-11-15T22:00:00+05:30',
    judging: '2026-11-16T10:00:00+05:30',
    finals: '2026-11-17T15:00:00+05:30',
  },
  team: { min: 1, max: 4 },
  prizes: [
    { place: 1, label: 'GRAND PRIZE', amount: '₹1,00,000' },
    { place: 2, label: 'RUNNER-UP', amount: '₹50,000' },
    { place: 3, label: 'THIRD', amount: '₹25,000' },
    { place: 0, label: 'BEST IN EACH ROUTE', amount: '₹10,000 × 4' },
  ],
  judging: ['Innovation', 'Technical depth', 'Impact', 'Demo & pitch'],
  rules: [
    'Teams of 1–4. One submission per team.',
    'All code written during the 36-hour build window.',
    'Open-source libraries and public APIs are allowed; disclose them.',
    'Submit a repo, a demo link and a 2-minute walkthrough before the deadline.',
  ],
  socials: { instagram: '#', linkedin: '#', discord: '#' },
} as const;

export const TIMELINE_STOPS = [
  { id: 'opens', label: 'REGISTRATION OPENS', at: EVENT.timeline.registrationOpens, alert: false },
  { id: 'kickoff', label: 'KICKOFF', at: EVENT.timeline.kickoff, alert: false },
  { id: 'build', label: '36H BUILD', at: '2026-11-14T12:00:00+05:30', alert: false },
  { id: 'deadline', label: 'SUBMISSION DEADLINE', at: EVENT.timeline.submissionDeadline, alert: true },
  { id: 'judging', label: 'JUDGING', at: EVENT.timeline.judging, alert: false },
  { id: 'finals', label: 'FINALS', at: EVENT.timeline.finals, alert: false },
] as const;

export function domainById(id: DomainId): DomainConfig {
  const d = DOMAINS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown domain ${id}`);
  return d;
}

/** "14–15 NOV 2026" — derived from kickoff/deadline in the event timezone. */
export function formatEventDates(): string {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: EVENT.timezone, ...opts }).format(new Date(iso));
  const start = fmt(EVENT.timeline.kickoff, { day: 'numeric' });
  const end = fmt(EVENT.timeline.submissionDeadline, { day: 'numeric' });
  const month = fmt(EVENT.timeline.kickoff, { month: 'short' }).toUpperCase();
  const year = fmt(EVENT.timeline.kickoff, { year: 'numeric' });
  return `${start}–${end} ${month} ${year}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/config`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/config Hackathon/tests/config && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): event configuration with domains, timeline and prizes

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/config Hackathon/tests/config
```

---

### Task 4: Domain types, safe storage, ID generators and seed data

**Files:**
- Create: `src/api/types.ts`, `src/lib/storage.ts`, `src/lib/ids.ts`, `src/api/seed.ts`
- Test: `tests/lib/storage.test.ts`, `tests/lib/ids.test.ts`, `tests/api/seed.test.ts`

**Interfaces:**
- Produces (types): `AvatarConfig`, `DEFAULT_AVATAR`, `Runner`, `Team`, `TeamMember`, `Submission`, `LeaderboardRow`, `Announcement`, `Challenge`, `RegistrationInput`, `SubmissionInput`, `ApiError`, `ApiErrorCode`, `HackathonApi`.
- Produces (storage): `createStorage(backing: Storage | null): JsonStorage` with `get<T>(key, fallback): T`, `set(key, value)`, `remove(key)`; `storage` singleton.
- Produces (ids): `CODE_ALPHABET`, `formatRunnerId(n)`, `makeTeamCode(rng?)`, `isTeamCode(s)`, `uid(prefix)`.
- Produces (seed): `DEMO_RUNNER`, `DEMO_PASSWORD`, `SEED_TEAMS`, `SEED_LEADERBOARD`, `SEED_ANNOUNCEMENTS`, `SEED_CHALLENGES`, `makeSeedState()`, `MockState`, `StoredRunner`.

- [ ] **Step 1: Write the failing tests**

`tests/lib/storage.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createStorage } from '@/lib/storage';

describe('createStorage', () => {
  it('round-trips JSON through a Storage backing', () => {
    const s = createStorage(window.localStorage);
    s.set('k', { a: 1 });
    expect(s.get('k', null)).toEqual({ a: 1 });
    s.remove('k');
    expect(s.get('k', 'fallback')).toBe('fallback');
  });
  it('falls back to memory when the backing throws', () => {
    const throwing = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    } as unknown as Storage;
    const s = createStorage(throwing);
    s.set('k', 42);
    expect(s.get('k', 0)).toBe(42);
  });
  it('returns the fallback for corrupt JSON', () => {
    window.localStorage.setItem('bad', '{not json');
    expect(createStorage(window.localStorage).get('bad', 'x')).toBe('x');
  });
});
```

`tests/lib/ids.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CODE_ALPHABET, formatRunnerId, isTeamCode, makeTeamCode, uid } from '@/lib/ids';

describe('ids', () => {
  it('formats runner ids as # + 4 digits', () => {
    expect(formatRunnerId(247)).toBe('#0247');
    expect(formatRunnerId(12)).toBe('#0012');
  });
  it('makes RAIL-XXXX codes without ambiguous characters', () => {
    expect(CODE_ALPHABET).not.toMatch(/[0O1I]/);
    const code = makeTeamCode(() => 0);
    expect(code).toBe('RAIL-AAAA');
    expect(isTeamCode(code)).toBe(true);
    expect(isTeamCode('RAIL-0OI1')).toBe(false);
    expect(isTeamCode('rail-aaaa')).toBe(false);
  });
  it('makes unique uids with a prefix', () => {
    expect(uid('t')).toMatch(/^t_/);
    expect(uid('t')).not.toBe(uid('t'));
  });
});
```

`tests/api/seed.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { DEMO_RUNNER, SEED_LEADERBOARD, SEED_TEAMS, makeSeedState } from '@/api/seed';
import { isTeamCode } from '@/lib/ids';

describe('seed', () => {
  it('starts the runner counter at 246 and seeds the demo runner', () => {
    const s = makeSeedState();
    expect(s.runnerCounter).toBe(246);
    expect(s.runners[DEMO_RUNNER.id]?.email).toBe('demo@aiexpo.run');
    expect(s.currentRunnerId).toBeNull();
  });
  it('seeds joinable teams with valid codes, including PIXEL RAIDERS', () => {
    const pixel = SEED_TEAMS.find((t) => t.name === 'PIXEL RAIDERS');
    expect(pixel?.code).toBe('RAIL-7K2Q');
    for (const t of SEED_TEAMS) expect(isTeamCode(t.code)).toBe(true);
  });
  it('seeds 24 leaderboard rows across all four domains', () => {
    expect(SEED_LEADERBOARD).toHaveLength(24);
    expect(new Set(SEED_LEADERBOARD.map((r) => r.domain)).size).toBe(4);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib tests/api`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/api/types.ts`**

```ts
import type { DomainId } from '@/config/event';
import type { PaletteName } from '@/theme/palette';

export type BodyType = 'slim' | 'regular' | 'chunky';
export type ToneName = 'orange' | 'pale' | 'yellow';
export type HairStyle = 'buzz' | 'spike' | 'bob' | 'afro' | 'cap';
export type OutfitPattern = 'solid' | 'stripe' | 'block';
export type ShoeStyle = 'low' | 'high' | 'boot';
export type BackpackStyle = 'none' | 'daypack' | 'tube';
export type BoardStyle = 'skate' | 'hover' | 'none';

export interface AvatarConfig {
  body: BodyType;
  tone: ToneName;
  hair: HairStyle;
  hairColor: PaletteName;
  outfit: { color: PaletteName; pattern: OutfitPattern };
  shoes: { style: ShoeStyle; color: PaletteName };
  backpack: BackpackStyle;
  board: BoardStyle;
  teamColor: PaletteName;
  name: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  body: 'regular',
  tone: 'orange',
  hair: 'spike',
  hairColor: 'navy',
  outfit: { color: 'yellow', pattern: 'solid' },
  shoes: { style: 'high', color: 'cyan' },
  backpack: 'daypack',
  board: 'skate',
  teamColor: 'cyan',
  name: 'RUNNER',
};

export interface Runner {
  id: string;            // "#0247"
  name: string;
  email: string;
  org: string;
  phone: string;
  domain: DomainId;
  avatar: AvatarConfig;
  teamId: string | null;
  registeredAt: string;  // ISO
  openedChallengeAt: string | null;
}

export type TeamRole = 'leader' | 'member';

export interface TeamMember {
  runnerId: string;
  name: string;
  avatar: AvatarConfig;
  domain: DomainId;
  role: TeamRole;
}

export interface Team {
  id: string;
  name: string;
  code: string;          // "RAIL-7K2Q"
  leaderId: string;
  maxMembers: number;
  members: TeamMember[];
}

export interface Submission {
  id: string;
  ownerKey: string;      // teamId if the runner has a team, else runnerId
  projectName: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  deckUrl: string;
  submittedAt: string;
  updatedAt: string;
}

export interface LeaderboardRow {
  teamId: string;
  team: string;
  domain: DomainId;
  score: number;
  rank: number;
}

export type AnnouncementTag = 'none' | 'live' | 'deadline' | 'tip';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  at: string;
  tag: AnnouncementTag;
}

export interface Challenge {
  domain: DomainId;
  title: string;
  statement: string;
  problems: string[];
  rules: string[];
  resources: { label: string; url: string }[];
}

export interface RegistrationInput {
  name: string;
  email: string;
  org: string;
  phone: string;
  password: string;
  domain: DomainId;
  avatar: AvatarConfig;
}

export interface SubmissionInput {
  projectName: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  deckUrl: string;
}

export type ApiErrorCode =
  | 'NO_RUNNER' | 'BAD_PASSWORD' | 'EMAIL_TAKEN' | 'NOT_SIGNED_IN'
  | 'TEAM_NOT_FOUND' | 'TEAM_FULL' | 'ALREADY_IN_TEAM' | 'NOT_IN_TEAM' | 'DEADLINE_PASSED';

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface HackathonApi {
  currentRunner(): Runner | null;
  signIn(input: { identifier: string; password: string }): Promise<Runner>;
  signInWithProvider(provider: 'google' | 'github'): Promise<Runner>;
  signOut(): Promise<void>;
  register(input: RegistrationInput): Promise<Runner>;
  updateAvatar(avatar: AvatarConfig): Promise<Runner>;
  markChallengeOpened(): Promise<Runner>;
  createTeam(input: { name: string; maxMembers: number }): Promise<Team>;
  joinTeam(code: string): Promise<Team>;
  leaveTeam(): Promise<void>;
  getTeam(): Promise<Team | null>;
  getChallenge(domain: DomainId): Promise<Challenge>;
  getSubmission(): Promise<Submission | null>;
  submitProject(input: SubmissionInput): Promise<Submission>;
  getLeaderboard(): Promise<LeaderboardRow[]>;
  getAnnouncements(): Promise<Announcement[]>;
}
```

- [ ] **Step 4: Write `src/lib/storage.ts` and `src/lib/ids.ts`**

`src/lib/storage.ts`:
```ts
export interface JsonStorage {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

/** JSON storage over a Storage-like backing; any thrown error switches that key to memory. */
export function createStorage(backing: Storage | null): JsonStorage {
  const memory = new Map<string, string>();
  const read = (key: string): string | null => {
    if (memory.has(key)) return memory.get(key)!;
    try { return backing?.getItem(key) ?? null; } catch { return null; }
  };
  const write = (key: string, raw: string) => {
    try { backing?.setItem(key, raw); memory.delete(key); } catch { memory.set(key, raw); }
    if (!backing) memory.set(key, raw);
  };
  return {
    get<T>(key: string, fallback: T): T {
      const raw = read(key);
      if (raw == null) return fallback;
      try { return JSON.parse(raw) as T; } catch { return fallback; }
    },
    set(key, value) { write(key, JSON.stringify(value)); },
    remove(key) {
      memory.delete(key);
      try { backing?.removeItem(key); } catch { /* memory already cleared */ }
    },
  };
}

function safeLocalStorage(): Storage | null {
  try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
}

export const storage: JsonStorage = createStorage(safeLocalStorage());
```

`src/lib/ids.ts`:
```ts
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function formatRunnerId(n: number): string {
  return `#${String(n).padStart(4, '0')}`;
}

export function makeTeamCode(rng: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  return `RAIL-${s}`;
}

export function isTeamCode(s: string): boolean {
  return /^RAIL-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(s);
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
```

- [ ] **Step 5: Write `src/api/seed.ts`**

```ts
import { DOMAINS, EVENT, type DomainId } from '@/config/event';
import type { AvatarConfig, Announcement, Challenge, LeaderboardRow, Runner, Submission, Team } from './types';

export interface StoredRunner extends Runner { password: string }

export interface MockState {
  version: 1;
  runnerCounter: number;
  runners: Record<string, StoredRunner>;
  teams: Record<string, Team>;
  submissions: Record<string, Submission>;
  leaderboard: LeaderboardRow[];
  announcements: Announcement[];
  readAnnouncementIds: string[];
  currentRunnerId: string | null;
}

const av = (p: Partial<AvatarConfig>): AvatarConfig => ({
  body: 'regular', tone: 'orange', hair: 'spike', hairColor: 'navy',
  outfit: { color: 'yellow', pattern: 'solid' }, shoes: { style: 'high', color: 'cyan' },
  backpack: 'daypack', board: 'skate', teamColor: 'cyan', name: 'RUNNER', ...p,
});

export const DEMO_PASSWORD = 'runner123';

export const DEMO_RUNNER: StoredRunner = {
  id: '#0100',
  name: 'Demo Runner',
  email: 'demo@aiexpo.run',
  org: 'AI EXPO',
  phone: '+910000000000',
  domain: 'ai',
  avatar: av({ name: 'DEMO', hair: 'cap', hairColor: 'red', outfit: { color: 'cyan', pattern: 'stripe' } }),
  teamId: 'team_pixel',
  registeredAt: '2026-10-02T09:00:00+05:30',
  openedChallengeAt: null,
  password: DEMO_PASSWORD,
};

const mate = (runnerId: string, name: string, domain: DomainId, p: Partial<AvatarConfig>) => ({
  runnerId, name, domain, avatar: av({ name: name.toUpperCase(), ...p }), role: 'member' as const,
});

export const SEED_TEAMS: Team[] = [
  {
    id: 'team_pixel', name: 'PIXEL RAIDERS', code: 'RAIL-7K2Q', leaderId: '#0100', maxMembers: 4,
    members: [
      { runnerId: '#0100', name: 'Demo Runner', domain: 'ai', avatar: DEMO_RUNNER.avatar, role: 'leader' },
      mate('#0101', 'Mira', 'data', { hair: 'bob', hairColor: 'yellow', outfit: { color: 'red', pattern: 'block' } }),
    ],
  },
  {
    id: 'team_track', name: 'TRACK HACKERS', code: 'RAIL-M4XZ', leaderId: '#0102', maxMembers: 3,
    members: [
      { ...mate('#0102', 'Dev', 'cyber', { hair: 'buzz', hairColor: 'navy', outfit: { color: 'orange', pattern: 'solid' } }), role: 'leader' },
      mate('#0103', 'Sana', 'cyber', { hair: 'afro', hairColor: 'navy', outfit: { color: 'pale', pattern: 'stripe' } }),
      mate('#0104', 'Arjun', 'ai', { hair: 'cap', hairColor: 'cyan', outfit: { color: 'navy', pattern: 'solid' } }),
    ],
  },
  {
    id: 'team_line', name: 'LINE BREAKERS', code: 'RAIL-B8YT', leaderId: '#0105', maxMembers: 4,
    members: [
      { ...mate('#0105', 'Kai', 'future', { hair: 'spike', hairColor: 'orange', outfit: { color: 'cyan', pattern: 'block' } }), role: 'leader' },
    ],
  },
];

const TEAM_NAMES: [string, DomainId][] = [
  ['PIXEL RAIDERS', 'ai'], ['TRACK HACKERS', 'cyber'], ['LINE BREAKERS', 'future'], ['TUNNEL VISION', 'data'],
  ['COIN COLLECTORS', 'ai'], ['SPRAY SQUAD', 'future'], ['RAIL RUNNERS', 'data'], ['PLATFORM NINE', 'cyber'],
  ['GRAFFITI GANG', 'ai'], ['SIGNAL LOST', 'cyber'], ['NIGHT TRAIN', 'data'], ['CONE HEADS', 'future'],
  ['DEPARTURE BOARD', 'data'], ['HOVERBOARDERS', 'future'], ['TICKET TO RIDE', 'ai'], ['RUSH HOUR', 'cyber'],
  ['LAST STOP', 'data'], ['ORANGE LINE', 'future'], ['CYAN DASH', 'data'], ['YELLOW CARD', 'ai'],
  ['RED SIGNAL', 'cyber'], ['STATION MASTERS', 'ai'], ['SUBWAY SURF', 'future'], ['TRACKSIDE', 'cyber'],
];

export const SEED_LEADERBOARD: LeaderboardRow[] = TEAM_NAMES.map(([team, domain], i) => {
  const id = i === 0 ? 'team_pixel' : i === 1 ? 'team_track' : i === 2 ? 'team_line' : `team_seed_${i}`;
  return { teamId: id, team, domain, score: 980 - i * 31 - (i % 3) * 7, rank: i + 1 };
});

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'REGISTRATION IS OPEN', body: 'Create your runner, pick a route, build your crew. The line opens now.', at: EVENT.timeline.registrationOpens, tag: 'live' },
  { id: 'a2', title: 'KICKOFF AT PLATFORM 9', body: `Doors open 09:00. Kickoff 10:00 sharp at ${EVENT.venue}.`, at: '2026-11-10T09:00:00+05:30', tag: 'none' },
  { id: 'a3', title: 'SUBMISSION DEADLINE', body: 'Submissions lock at 22:00 on 15 Nov. No extensions, no exceptions.', at: '2026-11-11T09:00:00+05:30', tag: 'deadline' },
  { id: 'a4', title: 'MENTOR HOURS', body: 'Route mentors are on the platform 14:00–18:00 both days. Flag one down.', at: '2026-11-12T09:00:00+05:30', tag: 'tip' },
  { id: 'a5', title: 'BRING YOUR OWN HARDWARE', body: 'Future Tech crews: power strips are provided, drones are not.', at: '2026-11-12T12:00:00+05:30', tag: 'none' },
  { id: 'a6', title: 'DEMO FORMAT', body: '2-minute video + live Q&A. Practice the pitch before the deadline.', at: '2026-11-13T09:00:00+05:30', tag: 'tip' },
  { id: 'a7', title: 'LIVE: LEADERBOARD UPDATES', body: 'Scores refresh every round. Watch the board on Train 05.', at: '2026-11-14T11:00:00+05:30', tag: 'live' },
  { id: 'a8', title: 'FINALS LINE-UP', body: 'Top 10 crews present at the finals on 17 Nov, 15:00.', at: '2026-11-16T18:00:00+05:30', tag: 'none' },
];

export const SEED_CHALLENGES: Record<DomainId, Challenge> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, {
    domain: d.id,
    title: `ROUTE ${d.number} — ${d.name}`,
    statement: d.theme,
    problems: d.problems,
    rules: [...EVENT.rules],
    resources: [
      { label: 'Starter kit', url: '#' },
      { label: 'Submission checklist', url: '#' },
      { label: 'Judging rubric', url: '#' },
    ],
  }]),
) as Record<DomainId, Challenge>;

export function makeSeedState(): MockState {
  return {
    version: 1,
    runnerCounter: 246,
    runners: { [DEMO_RUNNER.id]: { ...DEMO_RUNNER } },
    teams: Object.fromEntries(SEED_TEAMS.map((t) => [t.id, structuredClone(t)])),
    submissions: {},
    leaderboard: SEED_LEADERBOARD.map((r) => ({ ...r })),
    announcements: SEED_ANNOUNCEMENTS.map((a) => ({ ...a })),
    readAnnouncementIds: [],
    currentRunnerId: null,
  };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/lib tests/api`
Expected: PASS (9 tests).

- [ ] **Step 7: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/api Hackathon/src/lib Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): domain types, safe storage, id generators and seed data

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/api Hackathon/src/lib Hackathon/tests
```

---

### Task 5: Mock API

**Files:**
- Create: `src/api/mock.ts`, `src/api/index.ts`, `src/lib/time.ts`
- Test: `tests/api/mock.test.ts`, `tests/lib/time.test.ts`

**Interfaces:**
- Consumes: everything from Task 4; `EVENT.timeline.submissionDeadline`.
- Produces: `createMockApi(opts?: { storage?: JsonStorage; latency?: [number, number]; now?: () => number; random?: () => number }): HackathonApi & { reset(): void; markAnnouncementsRead(): void; unreadAnnouncementCount(): number }`; `api` singleton (`src/api/index.ts`); `now()`, `setTimeOffset(ms)`, `getTimeOffset()` in `lib/time.ts`.

- [ ] **Step 1: Write the failing tests**

`tests/lib/time.test.ts`:
```ts
import { afterEach, describe, expect, it } from 'vitest';
import { getTimeOffset, now, setTimeOffset } from '@/lib/time';

describe('time', () => {
  afterEach(() => setTimeOffset(0));
  it('applies a dev offset to now()', () => {
    const real = Date.now();
    setTimeOffset(60_000);
    expect(getTimeOffset()).toBe(60_000);
    expect(now() - real).toBeGreaterThanOrEqual(60_000);
  });
});
```

`tests/api/mock.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createMockApi } from '@/api/mock';
import { DEFAULT_AVATAR, ApiError, type RegistrationInput } from '@/api/types';
import { DEMO_PASSWORD } from '@/api/seed';
import { createStorage } from '@/lib/storage';
import { EVENT } from '@/config/event';

const input = (over: Partial<RegistrationInput> = {}): RegistrationInput => ({
  name: 'Asha Rao', email: 'asha@example.com', org: 'RV College', phone: '+919876543210',
  password: 'longpassword', domain: 'data', avatar: { ...DEFAULT_AVATAR, name: 'ASHA' }, ...over,
});

const BEFORE = Date.parse('2026-11-14T12:00:00+05:30');
const AFTER = Date.parse(EVENT.timeline.submissionDeadline) + 1000;

function make(nowMs = BEFORE) {
  return createMockApi({ storage: createStorage(null), latency: [0, 0], now: () => nowMs, random: () => 0.5 });
}

async function expectCode(p: Promise<unknown>, code: string) {
  await expect(p).rejects.toSatisfy((e) => e instanceof ApiError && e.code === code);
}

describe('mock api — runners', () => {
  let api: ReturnType<typeof make>;
  beforeEach(() => { api = make(); });

  it('registers with sequential ids starting at #0247 and signs the runner in', async () => {
    const a = await api.register(input());
    expect(a.id).toBe('#0247');
    expect(api.currentRunner()?.id).toBe('#0247');
    const b = await api.register(input({ email: 'b@example.com' }));
    expect(b.id).toBe('#0248');
  });
  it('rejects a taken email', async () => {
    await api.register(input());
    await expectCode(api.register(input()), 'EMAIL_TAKEN');
  });
  it('signs in by email or runner name with the right password', async () => {
    await api.register(input());
    await api.signOut();
    expect(api.currentRunner()).toBeNull();
    await expect(api.signIn({ identifier: 'ASHA@example.com', password: 'longpassword' })).resolves.toMatchObject({ id: '#0247' });
    await expect(api.signIn({ identifier: 'ASHA', password: 'longpassword' })).resolves.toMatchObject({ id: '#0247' });
    await expectCode(api.signIn({ identifier: 'asha@example.com', password: 'nope' }), 'BAD_PASSWORD');
    await expectCode(api.signIn({ identifier: 'ghost@example.com', password: 'x' }), 'NO_RUNNER');
  });
  it('provider sign-in returns the demo runner', async () => {
    const r = await api.signInWithProvider('google');
    expect(r.email).toBe('demo@aiexpo.run');
    await api.signOut();
    await expect(api.signIn({ identifier: 'demo@aiexpo.run', password: DEMO_PASSWORD })).resolves.toMatchObject({ id: '#0100' });
  });
  it('updates the avatar and marks the challenge opened once', async () => {
    await api.register(input());
    const r = await api.updateAvatar({ ...DEFAULT_AVATAR, name: 'NEW' });
    expect(r.avatar.name).toBe('NEW');
    const first = await api.markChallengeOpened();
    const second = await api.markChallengeOpened();
    expect(first.openedChallengeAt).toBe(new Date(BEFORE).toISOString());
    expect(second.openedChallengeAt).toBe(first.openedChallengeAt);
  });
  it('requires a session for runner operations', async () => {
    await expectCode(api.updateAvatar(DEFAULT_AVATAR), 'NOT_SIGNED_IN');
    await expectCode(api.createTeam({ name: 'X', maxMembers: 2 }), 'NOT_SIGNED_IN');
  });
});

describe('mock api — teams', () => {
  let api: ReturnType<typeof make>;
  beforeEach(async () => { api = make(); await api.register(input()); });

  it('creates a team with a RAIL code, the creator as leader, and a leaderboard row', async () => {
    const t = await api.createTeam({ name: 'NEW CREW', maxMembers: 3 });
    expect(t.code).toMatch(/^RAIL-[A-Z2-9]{4}$/);
    expect(t.members).toEqual([expect.objectContaining({ runnerId: '#0247', role: 'leader' })]);
    expect(api.currentRunner()?.teamId).toBe(t.id);
    const rows = await api.getLeaderboard();
    expect(rows.find((r) => r.teamId === t.id)).toMatchObject({ team: 'NEW CREW', domain: 'data' });
  });
  it('joins a seeded team by code (case-insensitive) and rejects unknown/full/duplicate joins', async () => {
    const t = await api.joinTeam('rail-7k2q');
    expect(t.name).toBe('PIXEL RAIDERS');
    expect(t.members.map((m) => m.runnerId)).toContain('#0247');
    await expectCode(api.joinTeam('RAIL-B8YT'), 'ALREADY_IN_TEAM');
    await api.leaveTeam();
    await expectCode(api.joinTeam('RAIL-ZZZZ'), 'TEAM_NOT_FOUND');
    await expectCode(api.joinTeam('RAIL-M4XZ'), 'TEAM_FULL');
  });
  it('leaving promotes the next member or deletes an empty team', async () => {
    const t = await api.createTeam({ name: 'SOLO', maxMembers: 2 });
    await api.leaveTeam();
    expect(await api.getTeam()).toBeNull();
    expect((await api.getLeaderboard()).some((r) => r.teamId === t.id)).toBe(false);
    await api.joinTeam('RAIL-B8YT');            // LINE BREAKERS: leader Kai + us
    await expectCode(api.leaveTeam().then(() => api.leaveTeam()), 'NOT_IN_TEAM');
  });
});

describe('mock api — submissions, challenge, board, announcements', () => {
  it('creates and edits a submission before the deadline, locks after', async () => {
    const api = make();
    await api.register(input());
    expect(await api.getSubmission()).toBeNull();
    const s = await api.submitProject({ projectName: 'Metro Mind', repoUrl: 'https://github.com/x/y', demoUrl: 'https://demo.x', description: 'Predicts crowding.', deckUrl: '' });
    expect(s.ownerKey).toBe('#0247');
    const s2 = await api.submitProject({ projectName: 'Metro Mind 2', repoUrl: s.repoUrl, demoUrl: s.demoUrl, description: s.description, deckUrl: '' });
    expect(s2.id).toBe(s.id);
    expect(s2.projectName).toBe('Metro Mind 2');
    expect(s2.submittedAt).toBe(s.submittedAt);
    const late = make(AFTER);
    await late.register(input());
    await expectCode(late.submitProject({ projectName: 'x', repoUrl: 'https://a', demoUrl: '', description: 'd', deckUrl: '' }), 'DEADLINE_PASSED');
  });
  it('keys submissions by team when the runner has one', async () => {
    const api = make();
    await api.register(input());
    const t = await api.createTeam({ name: 'CREW', maxMembers: 2 });
    const s = await api.submitProject({ projectName: 'P', repoUrl: 'https://a', demoUrl: '', description: 'd', deckUrl: '' });
    expect(s.ownerKey).toBe(t.id);
  });
  it('returns ranked leaderboard rows, the challenge and announcements', async () => {
    const api = make();
    const rows = await api.getLeaderboard();
    expect(rows[0].rank).toBe(1);
    expect(rows.every((r, i) => i === 0 || rows[i - 1].score >= r.score)).toBe(true);
    expect((await api.getChallenge('cyber')).title).toBe('ROUTE 03 — CYBER');
    expect(await api.getAnnouncements()).toHaveLength(8);
    expect(api.unreadAnnouncementCount()).toBe(8);
    api.markAnnouncementsRead();
    expect(api.unreadAnnouncementCount()).toBe(0);
    expect(api.isEmailTaken('DEMO@aiexpo.run')).toBe(true);
    expect(api.isEmailTaken('nobody@aiexpo.run')).toBe(false);
  });
  it('persists state through the storage and resets', async () => {
    const store = createStorage(window.localStorage);
    const a = createMockApi({ storage: store, latency: [0, 0], now: () => BEFORE });
    await a.register(input());
    const b = createMockApi({ storage: store, latency: [0, 0], now: () => BEFORE });
    expect(b.currentRunner()?.id).toBe('#0247');
    b.reset();
    expect(b.currentRunner()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/api/mock.test.ts tests/lib/time.test.ts`
Expected: FAIL — `@/api/mock` and `@/lib/time` not found.

- [ ] **Step 3: Write `src/lib/time.ts`**

```ts
let offsetMs = 0;

/** Wall-clock now in ms, plus a dev-panel offset used to demo later event stages. */
export function now(): number {
  return Date.now() + offsetMs;
}
export function setTimeOffset(ms: number): void { offsetMs = ms; }
export function getTimeOffset(): number { return offsetMs; }
```

- [ ] **Step 4: Write `src/api/mock.ts`**

```ts
import { EVENT, type DomainId } from '@/config/event';
import { formatRunnerId, isTeamCode, makeTeamCode, uid } from '@/lib/ids';
import { storage as defaultStorage, type JsonStorage } from '@/lib/storage';
import { now as defaultNow } from '@/lib/time';
import { DEMO_RUNNER, SEED_CHALLENGES, makeSeedState, type MockState, type StoredRunner } from './seed';
import {
  ApiError, type Announcement, type AvatarConfig, type Challenge, type HackathonApi,
  type LeaderboardRow, type RegistrationInput, type Runner, type Submission, type SubmissionInput, type Team,
} from './types';

export const MOCK_STORAGE_KEY = 'aiexpo.mock.v1';

export interface MockApiOptions {
  storage?: JsonStorage;
  latency?: [number, number];
  now?: () => number;
  random?: () => number;
}

export interface MockApi extends HackathonApi {
  reset(): void;
  markAnnouncementsRead(): void;
  unreadAnnouncementCount(): number;
  /** Synchronous helper for inline form validation (a real backend would expose an endpoint). */
  isEmailTaken(email: string): boolean;
}

const strip = (r: StoredRunner): Runner => {
  const { password: _password, ...runner } = r;
  return runner;
};

export function createMockApi(opts: MockApiOptions = {}): MockApi {
  const store = opts.storage ?? defaultStorage;
  const [minLat, maxLat] = opts.latency ?? [180, 420];
  const nowMs = opts.now ?? defaultNow;
  const rng = opts.random ?? Math.random;

  let state: MockState = store.get<MockState | null>(MOCK_STORAGE_KEY, null) ?? makeSeedState();
  if (state.version !== 1) state = makeSeedState();

  const save = () => store.set(MOCK_STORAGE_KEY, state);
  const wait = () => new Promise<void>((res) => setTimeout(res, minLat + rng() * (maxLat - minLat)));
  const iso = () => new Date(nowMs()).toISOString();

  const current = (): StoredRunner => {
    const r = state.currentRunnerId ? state.runners[state.currentRunnerId] : null;
    if (!r) throw new ApiError('NOT_SIGNED_IN', 'Sign in first, runner.');
    return r;
  };
  const teamOf = (r: StoredRunner): Team | null => (r.teamId ? state.teams[r.teamId] ?? null : null);
  const ownerKey = (r: StoredRunner) => r.teamId ?? r.id;
  const rankRows = (rows: LeaderboardRow[]) =>
    [...rows].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    currentRunner: () => (state.currentRunnerId ? strip(state.runners[state.currentRunnerId]) : null),

    async signIn({ identifier, password }) {
      await wait();
      const key = identifier.trim().toLowerCase();
      const r = Object.values(state.runners).find(
        (x) => x.email.toLowerCase() === key || x.avatar.name.toLowerCase() === key,
      );
      if (!r) throw new ApiError('NO_RUNNER', 'No runner found on this line.');
      if (r.password !== password) throw new ApiError('BAD_PASSWORD', 'Wrong password, runner.');
      state.currentRunnerId = r.id; save();
      return strip(r);
    },

    async signInWithProvider() {
      await wait();
      if (!state.runners[DEMO_RUNNER.id]) state.runners[DEMO_RUNNER.id] = { ...DEMO_RUNNER };
      state.currentRunnerId = DEMO_RUNNER.id; save();
      return strip(state.runners[DEMO_RUNNER.id]);
    },

    async signOut() { await wait(); state.currentRunnerId = null; save(); },

    async register(input) {
      await wait();
      const email = input.email.trim().toLowerCase();
      if (Object.values(state.runners).some((r) => r.email.toLowerCase() === email))
        throw new ApiError('EMAIL_TAKEN', 'That email already has a runner.');
      state.runnerCounter += 1;
      const runner: StoredRunner = {
        id: formatRunnerId(state.runnerCounter), name: input.name.trim(), email, org: input.org.trim(),
        phone: input.phone.trim(), domain: input.domain, avatar: input.avatar, teamId: null,
        registeredAt: iso(), openedChallengeAt: null, password: input.password,
      };
      state.runners[runner.id] = runner;
      state.currentRunnerId = runner.id; save();
      return strip(runner);
    },

    async updateAvatar(avatar: AvatarConfig) {
      await wait();
      const r = current();
      r.avatar = avatar;
      const t = teamOf(r);
      if (t) t.members = t.members.map((m) => (m.runnerId === r.id ? { ...m, avatar, name: r.name } : m));
      save();
      return strip(r);
    },

    async markChallengeOpened() {
      await wait();
      const r = current();
      if (!r.openedChallengeAt) { r.openedChallengeAt = iso(); save(); }
      return strip(r);
    },

    async createTeam({ name, maxMembers }) {
      await wait();
      const r = current();
      if (r.teamId) throw new ApiError('ALREADY_IN_TEAM', 'You already have a crew.');
      let code = makeTeamCode(rng);
      const codes = new Set(Object.values(state.teams).map((t) => t.code));
      while (codes.has(code)) code = makeTeamCode(rng);
      const team: Team = {
        id: uid('team'), name: name.trim(), code, leaderId: r.id,
        maxMembers: Math.min(Math.max(maxMembers, 2), EVENT.team.max),
        members: [{ runnerId: r.id, name: r.name, avatar: r.avatar, domain: r.domain, role: 'leader' }],
      };
      state.teams[team.id] = team;
      r.teamId = team.id;
      state.leaderboard.push({ teamId: team.id, team: team.name, domain: r.domain, score: 420, rank: 0 });
      state.leaderboard = rankRows(state.leaderboard);
      save();
      return structuredClone(team);
    },

    async joinTeam(codeInput) {
      await wait();
      const r = current();
      const code = codeInput.trim().toUpperCase();
      const team = isTeamCode(code) ? Object.values(state.teams).find((t) => t.code === code) : undefined;
      if (r.teamId) throw new ApiError('ALREADY_IN_TEAM', 'You already have a crew.');
      if (!team) throw new ApiError('TEAM_NOT_FOUND', 'No crew with that code.');
      if (team.members.length >= team.maxMembers) throw new ApiError('TEAM_FULL', 'That crew is full.');
      team.members.push({ runnerId: r.id, name: r.name, avatar: r.avatar, domain: r.domain, role: 'member' });
      r.teamId = team.id; save();
      return structuredClone(team);
    },

    async leaveTeam() {
      await wait();
      const r = current();
      const team = teamOf(r);
      if (!team) throw new ApiError('NOT_IN_TEAM', 'You are not in a crew.');
      team.members = team.members.filter((m) => m.runnerId !== r.id);
      r.teamId = null;
      if (team.members.length === 0) {
        delete state.teams[team.id];
        state.leaderboard = rankRows(state.leaderboard.filter((row) => row.teamId !== team.id));
      } else if (team.leaderId === r.id) {
        team.leaderId = team.members[0].runnerId;
        team.members[0].role = 'leader';
      }
      save();
    },

    async getTeam() {
      await wait();
      const t = teamOf(current());
      return t ? structuredClone(t) : null;
    },

    async getChallenge(domain: DomainId): Promise<Challenge> {
      await wait();
      return structuredClone(SEED_CHALLENGES[domain]);
    },

    async getSubmission() {
      await wait();
      const s = state.submissions[ownerKey(current())];
      return s ? { ...s } : null;
    },

    async submitProject(input: SubmissionInput) {
      await wait();
      const r = current();
      if (nowMs() >= Date.parse(EVENT.timeline.submissionDeadline))
        throw new ApiError('DEADLINE_PASSED', 'The submission deadline has passed.');
      const key = ownerKey(r);
      const existing = state.submissions[key];
      const sub: Submission = {
        id: existing?.id ?? uid('sub'), ownerKey: key, ...input,
        submittedAt: existing?.submittedAt ?? iso(), updatedAt: iso(),
      };
      state.submissions[key] = sub; save();
      return { ...sub };
    },

    async getLeaderboard() {
      await wait();
      state.leaderboard = rankRows(state.leaderboard);
      return state.leaderboard.map((r) => ({ ...r }));
    },

    async getAnnouncements(): Promise<Announcement[]> {
      await wait();
      return [...state.announcements].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    },

    markAnnouncementsRead() {
      state.readAnnouncementIds = state.announcements.map((a) => a.id); save();
    },
    unreadAnnouncementCount() {
      const read = new Set(state.readAnnouncementIds);
      return state.announcements.filter((a) => !read.has(a.id)).length;
    },
    isEmailTaken(email) {
      const key = email.trim().toLowerCase();
      return Object.values(state.runners).some((r) => r.email.toLowerCase() === key);
    },
    reset() { state = makeSeedState(); save(); },
  };
}
```

- [ ] **Step 5: Write `src/api/index.ts`**

```ts
import { createMockApi, type MockApi } from './mock';

/** The app-wide API. Swap `createMockApi` for a real implementation of `HackathonApi` later. */
export const api: MockApi = createMockApi();
export type { HackathonApi } from './types';
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run`
Expected: all PASS (mock suite 12 tests + earlier suites).

- [ ] **Step 7: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/api Hackathon/src/lib Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): localStorage-backed mock HackathonApi with tests

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/api Hackathon/src/lib Hackathon/tests
```

---

### Task 6: Form validation rules

**Files:**
- Create: `src/lib/validation.ts`
- Test: `tests/lib/validation.test.ts`

**Interfaces:**
- Produces: `Errors<K>`, `IdentityValues`, `validateIdentity(v)`, `validateSignIn(v)`, `validateRunnerName(name)`, `validateTeamCreate(v, max)`, `validateTeamCode(code)`, `validateSubmission(v)`, `wordCount(text)`, `isUrl(s)`, `hasErrors(errors)`.

- [ ] **Step 1: Write the failing test**

`tests/lib/validation.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  hasErrors, validateIdentity, validateRunnerName, validateSignIn, validateSubmission,
  validateTeamCode, validateTeamCreate, wordCount,
} from '@/lib/validation';

const good = { name: 'Asha Rao', email: 'asha@example.com', org: 'RV College', phone: '+919876543210', password: 'longpassword', confirm: 'longpassword' };

describe('validateIdentity', () => {
  it('passes a good form', () => expect(hasErrors(validateIdentity(good))).toBe(false));
  it('flags each bad field', () => {
    const e = validateIdentity({ name: 'A', email: 'nope', org: '', phone: '12', password: 'short', confirm: 'other' });
    expect(Object.keys(e).sort()).toEqual(['confirm', 'email', 'name', 'org', 'password', 'phone']);
  });
  it('allows an empty phone but not a malformed one', () => {
    expect(validateIdentity({ ...good, phone: '' }).phone).toBeUndefined();
    expect(validateIdentity({ ...good, phone: '98-76' }).phone).toBeDefined();
  });
});

describe('sign-in, runner name, team, code', () => {
  it('requires both sign-in fields', () => {
    expect(Object.keys(validateSignIn({ identifier: '', password: '' })).sort()).toEqual(['identifier', 'password']);
    expect(hasErrors(validateSignIn({ identifier: 'a', password: 'b' }))).toBe(false);
  });
  it('limits runner names to 2–16 letters, digits and spaces', () => {
    expect(validateRunnerName('A')).toBeDefined();
    expect(validateRunnerName('A'.repeat(17))).toBeDefined();
    expect(validateRunnerName('Bad!')).toBeDefined();
    expect(validateRunnerName('PIXEL 9')).toBeUndefined();
  });
  it('validates team creation against the max size', () => {
    expect(validateTeamCreate({ name: 'X', maxMembers: 5 }, 4)).toEqual({ name: expect.any(String), maxMembers: expect.any(String) });
    expect(validateTeamCreate({ name: 'PIXEL RAIDERS', maxMembers: 3 }, 4)).toEqual({});
  });
  it('validates team codes', () => {
    expect(validateTeamCode('RAIL-7K2Q')).toBeUndefined();
    expect(validateTeamCode('rail-7k2q')).toBeUndefined();
    expect(validateTeamCode('7K2Q')).toBeDefined();
  });
});

describe('submission', () => {
  it('counts words', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('  one  two\nthree ')).toBe(3);
  });
  it('requires name, repo url and description ≤ 300 words; demo/deck optional but must be urls', () => {
    const e = validateSubmission({ projectName: '', repoUrl: 'github.com/x', demoUrl: 'nope', description: 'w '.repeat(301), deckUrl: '' });
    expect(Object.keys(e).sort()).toEqual(['demoUrl', 'description', 'projectName', 'repoUrl']);
    expect(validateSubmission({ projectName: 'P', repoUrl: 'https://github.com/x/y', demoUrl: '', description: 'ok', deckUrl: 'https://d.eck' })).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/validation.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/validation.ts`**

```ts
import type { SubmissionInput } from '@/api/types';

export type Errors<K extends string> = Partial<Record<K, string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?\d{8,15}$/;
const RUNNER_NAME_RE = /^[A-Za-z0-9 ]{2,16}$/;

export interface IdentityValues {
  name: string; email: string; org: string; phone: string; password: string; confirm: string;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export function isUrl(s: string): boolean {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

export function validateIdentity(v: IdentityValues): Errors<keyof IdentityValues> {
  const e: Errors<keyof IdentityValues> = {};
  if (v.name.trim().length < 2) e.name = 'Give us at least 2 characters.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email does not look right.';
  if (!v.org.trim()) e.org = 'Tell us where you run from.';
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = '8–15 digits, optional leading +.';
  if (v.password.length < 8) e.password = 'At least 8 characters.';
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match.';
  return e;
}

export function validateSignIn(v: { identifier: string; password: string }): Errors<'identifier' | 'password'> {
  const e: Errors<'identifier' | 'password'> = {};
  if (!v.identifier.trim()) e.identifier = 'Email or runner name, please.';
  if (!v.password) e.password = 'Password required.';
  return e;
}

export function validateRunnerName(name: string): string | undefined {
  return RUNNER_NAME_RE.test(name.trim()) ? undefined : '2–16 letters, digits or spaces.';
}

export function validateTeamCreate(v: { name: string; maxMembers: number }, max: number): Errors<'name' | 'maxMembers'> {
  const e: Errors<'name' | 'maxMembers'> = {};
  const n = v.name.trim().length;
  if (n < 2 || n > 24) e.name = 'Crew names are 2–24 characters.';
  if (!Number.isInteger(v.maxMembers) || v.maxMembers < 2 || v.maxMembers > max) e.maxMembers = `Between 2 and ${max} runners.`;
  return e;
}

export function validateTeamCode(code: string): string | undefined {
  return /^RAIL-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(code.trim().toUpperCase())
    ? undefined : 'Codes look like RAIL-7K2Q.';
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function validateSubmission(v: SubmissionInput): Errors<keyof SubmissionInput> {
  const e: Errors<keyof SubmissionInput> = {};
  if (!v.projectName.trim()) e.projectName = 'Name your project.';
  if (!isUrl(v.repoUrl.trim())) e.repoUrl = 'A full https:// repository link.';
  if (v.demoUrl.trim() && !isUrl(v.demoUrl.trim())) e.demoUrl = 'A full https:// link, or leave it empty.';
  if (v.deckUrl.trim() && !isUrl(v.deckUrl.trim())) e.deckUrl = 'A full https:// link, or leave it empty.';
  const words = wordCount(v.description);
  if (words === 0) e.description = 'Describe the run.';
  else if (words > 300) e.description = `Keep it under 300 words (${words} now).`;
  return e;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/validation.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/lib/validation.ts Hackathon/tests/lib/validation.test.ts && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): form validation rules

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/lib/validation.ts Hackathon/tests/lib/validation.test.ts
```

---

### Task 7: Run-progress derivation, badge rules and leaderboard math

**Files:**
- Create: `src/lib/progress.ts`, `src/lib/badges.ts`, `src/lib/leaderboard.ts`
- Test: `tests/lib/progress.test.ts`, `tests/lib/badges.test.ts`, `tests/lib/leaderboard.test.ts`

**Interfaces:**
- Produces (progress): `STAGES` (`['REGISTERED','TEAM READY','BUILDING','SUBMITTED','JUDGING','FINALIST']`), `Stage`, `ProgressContext`, `deriveStage(ctx): Stage | null`, `stageIndex(stage)`.
- Produces (badges): `BadgeId`, `BADGES: { id, label, rule }[]`, `BadgeContext`, `evaluateBadges(ctx): BadgeId[]`.
- Produces (leaderboard): `rankRows(rows)`, `tickScores(rows, rng, userTeamId)`, `rankDeltas(before, after): Record<string, number>` (positive = climbed).

- [ ] **Step 1: Write the failing tests**

`tests/lib/progress.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { deriveStage, stageIndex, STAGES, type ProgressContext } from '@/lib/progress';

const base: ProgressContext = { signedIn: true, teamSize: 1, openedChallenge: false, hasSubmission: false, nowMs: 100, deadlineMs: 200, rank: null };

describe('deriveStage', () => {
  it('is null when signed out', () => expect(deriveStage({ ...base, signedIn: false })).toBeNull());
  it('walks the stages', () => {
    expect(deriveStage(base)).toBe('REGISTERED');
    expect(deriveStage({ ...base, teamSize: 2 })).toBe('TEAM READY');
    expect(deriveStage({ ...base, openedChallenge: true })).toBe('BUILDING');
    expect(deriveStage({ ...base, hasSubmission: true })).toBe('SUBMITTED');
    expect(deriveStage({ ...base, nowMs: 300 })).toBe('JUDGING');
    expect(deriveStage({ ...base, nowMs: 300, rank: 10 })).toBe('FINALIST');
    expect(deriveStage({ ...base, nowMs: 300, rank: 11 })).toBe('JUDGING');
    expect(deriveStage({ ...base, nowMs: 100, rank: 1 })).toBe('REGISTERED');
  });
  it('takes the highest true predicate regardless of lower ones', () => {
    expect(deriveStage({ ...base, hasSubmission: true, teamSize: 1, openedChallenge: false })).toBe('SUBMITTED');
  });
  it('indexes stages', () => {
    expect(STAGES).toHaveLength(6);
    expect(stageIndex('BUILDING')).toBe(2);
  });
});
```

`tests/lib/badges.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadges, type BadgeContext } from '@/lib/badges';

const base: BadgeContext = { registered: false, teamSize: 0, hasSubmission: false, localHour: 12, registeredAtMs: null, submittedAtMs: null, rank: null, judging: false };

describe('evaluateBadges', () => {
  it('defines six badges', () => expect(BADGES.map((b) => b.id)).toEqual(['FIRST_RUN', 'TEAM_BUILDER', 'CODE_WARRIOR', 'NIGHT_OWL', 'SPEED_BUILDER', 'FINALIST']));
  it('awards nothing for a fresh visitor at noon', () => expect(evaluateBadges(base)).toEqual([]));
  it('awards each badge by its rule', () => {
    expect(evaluateBadges({ ...base, registered: true })).toEqual(['FIRST_RUN']);
    expect(evaluateBadges({ ...base, teamSize: 2 })).toEqual(['TEAM_BUILDER']);
    expect(evaluateBadges({ ...base, hasSubmission: true })).toEqual(['CODE_WARRIOR']);
    expect(evaluateBadges({ ...base, localHour: 3 })).toEqual(['NIGHT_OWL']);
    expect(evaluateBadges({ ...base, localHour: 5 })).toEqual([]);
    const h = 3600_000;
    expect(evaluateBadges({ ...base, hasSubmission: true, registeredAtMs: 0, submittedAtMs: 23 * h })).toEqual(['CODE_WARRIOR', 'SPEED_BUILDER']);
    expect(evaluateBadges({ ...base, hasSubmission: true, registeredAtMs: 0, submittedAtMs: 25 * h })).toEqual(['CODE_WARRIOR']);
    expect(evaluateBadges({ ...base, rank: 10, judging: true })).toEqual(['FINALIST']);
    expect(evaluateBadges({ ...base, rank: 10, judging: false })).toEqual([]);
  });
});
```

`tests/lib/leaderboard.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import type { LeaderboardRow } from '@/api/types';
import { rankDeltas, rankRows, tickScores } from '@/lib/leaderboard';

const rows: LeaderboardRow[] = [
  { teamId: 'a', team: 'A', domain: 'ai', score: 900, rank: 1 },
  { teamId: 'b', team: 'B', domain: 'data', score: 800, rank: 2 },
  { teamId: 'c', team: 'C', domain: 'cyber', score: 700, rank: 3 },
  { teamId: 'd', team: 'D', domain: 'future', score: 600, rank: 4 },
];

function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('leaderboard math', () => {
  it('ranks by score descending', () => {
    const r = rankRows([...rows].reverse());
    expect(r.map((x) => x.teamId)).toEqual(['a', 'b', 'c', 'd']);
    expect(r.map((x) => x.rank)).toEqual([1, 2, 3, 4]);
  });
  it('ticks 3–6 teams by ±5–40 with a positive bias for the user team, never below 0', () => {
    const out = tickScores(rows, seq([0, 0, 0.99, 0.5, 0.2, 0.7, 0.1]), 'd');
    const changed = out.filter((r) => r.score !== rows.find((x) => x.teamId === r.teamId)!.score);
    expect(changed.length).toBeGreaterThanOrEqual(3);
    expect(changed.length).toBeLessThanOrEqual(6);
    for (const r of out) {
      const before = rows.find((x) => x.teamId === r.teamId)!.score;
      const d = Math.abs(r.score - before);
      expect(d === 0 || (d >= 5 && d <= 40)).toBe(true);
      expect(r.score).toBeGreaterThanOrEqual(0);
    }
    const user = out.find((r) => r.teamId === 'd')!;
    expect(user.score).toBeGreaterThanOrEqual(600);
  });
  it('computes rank deltas (positive = climbed)', () => {
    const after = rankRows(rows.map((r) => (r.teamId === 'd' ? { ...r, score: 850 } : r)));
    expect(rankDeltas(rows, after)).toEqual({ a: 0, b: -1, c: -1, d: 2 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/progress.test.ts tests/lib/badges.test.ts tests/lib/leaderboard.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/lib/progress.ts`**

```ts
export const STAGES = ['REGISTERED', 'TEAM READY', 'BUILDING', 'SUBMITTED', 'JUDGING', 'FINALIST'] as const;
export type Stage = (typeof STAGES)[number];

export interface ProgressContext {
  signedIn: boolean;
  teamSize: number;
  openedChallenge: boolean;
  hasSubmission: boolean;
  nowMs: number;
  deadlineMs: number;
  rank: number | null;
}

/** Highest stage whose predicate holds, evaluated in order. Never stored — always derived. */
export function deriveStage(c: ProgressContext): Stage | null {
  if (!c.signedIn) return null;
  const judging = c.nowMs >= c.deadlineMs;
  const predicates: Record<Stage, boolean> = {
    REGISTERED: true,
    'TEAM READY': c.teamSize >= 2,
    BUILDING: c.openedChallenge,
    SUBMITTED: c.hasSubmission,
    JUDGING: judging,
    FINALIST: judging && c.rank != null && c.rank <= 10,
  };
  let stage: Stage = 'REGISTERED';
  for (const s of STAGES) if (predicates[s]) stage = s;
  return stage;
}

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}
```

- [ ] **Step 4: Write `src/lib/badges.ts`**

```ts
export type BadgeId = 'FIRST_RUN' | 'TEAM_BUILDER' | 'CODE_WARRIOR' | 'NIGHT_OWL' | 'SPEED_BUILDER' | 'FINALIST';

export interface BadgeDef { id: BadgeId; label: string; rule: string }

export const BADGES: BadgeDef[] = [
  { id: 'FIRST_RUN', label: 'FIRST RUN', rule: 'Complete registration.' },
  { id: 'TEAM_BUILDER', label: 'TEAM BUILDER', rule: 'Have a crew of two or more.' },
  { id: 'CODE_WARRIOR', label: 'CODE WARRIOR', rule: 'Submit a project.' },
  { id: 'NIGHT_OWL', label: 'NIGHT OWL', rule: 'Ride the line between midnight and 5 AM.' },
  { id: 'SPEED_BUILDER', label: 'SPEED BUILDER', rule: 'Submit within 24 hours of registering.' },
  { id: 'FINALIST', label: 'FINALIST', rule: 'Be in the top 10 during judging.' },
];

export interface BadgeContext {
  registered: boolean;
  teamSize: number;
  hasSubmission: boolean;
  localHour: number;
  registeredAtMs: number | null;
  submittedAtMs: number | null;
  rank: number | null;
  judging: boolean;
}

const DAY = 24 * 3600_000;

export function evaluateBadges(c: BadgeContext): BadgeId[] {
  const out: BadgeId[] = [];
  if (c.registered) out.push('FIRST_RUN');
  if (c.teamSize >= 2) out.push('TEAM_BUILDER');
  if (c.hasSubmission) out.push('CODE_WARRIOR');
  if (c.localHour >= 0 && c.localHour < 5) out.push('NIGHT_OWL');
  if (c.hasSubmission && c.registeredAtMs != null && c.submittedAtMs != null && c.submittedAtMs - c.registeredAtMs <= DAY) out.push('SPEED_BUILDER');
  if (c.judging && c.rank != null && c.rank <= 10) out.push('FINALIST');
  return out;
}
```

- [ ] **Step 5: Write `src/lib/leaderboard.ts`**

```ts
import type { LeaderboardRow } from '@/api/types';

export function rankRows(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * One ticker step: 3–6 random teams move by ±(5–40). The user's team, when picked, only ever gains
 * (a mild demo bias so climbs are visible). Scores never drop below 0. Returns re-ranked rows.
 */
export function tickScores(rows: LeaderboardRow[], rng: () => number, userTeamId: string | null): LeaderboardRow[] {
  const count = Math.min(3 + Math.floor(rng() * 4), rows.length);
  // Partial Fisher–Yates: `count` distinct indices, terminates for any rng (even a constant one).
  const idx = rows.map((_, i) => i);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const picked = new Set(idx.slice(0, count));
  const next = rows.map((r, i) => {
    if (!picked.has(i)) return { ...r };
    const magnitude = 5 + Math.floor(rng() * 36);
    const up = r.teamId === userTeamId ? true : rng() < 0.5;
    return { ...r, score: Math.max(0, r.score + (up ? magnitude : -magnitude)) };
  });
  return rankRows(next);
}

/** Positive = climbed that many places. Teams missing from `before` get 0. */
export function rankDeltas(before: LeaderboardRow[], after: LeaderboardRow[]): Record<string, number> {
  const prev = new Map(before.map((r) => [r.teamId, r.rank]));
  const out: Record<string, number> = {};
  for (const r of after) out[r.teamId] = (prev.get(r.teamId) ?? r.rank) - r.rank;
  return out;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run tests/lib`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/lib Hackathon/tests/lib && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): progress derivation, badge rules and leaderboard ticker math

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/lib Hackathon/tests/lib
```

---

### Task 8: zustand stores — toasts, session, registration, game, world, leaderboard

**Files:**
- Create: `src/store/toasts.ts`, `src/store/session.ts`, `src/store/registration.ts`, `src/store/game.ts`, `src/store/world.ts`, `src/store/leaderboard.ts`
- Test: `tests/store/registration.test.ts`, `tests/store/game.test.ts`, `tests/store/world.test.ts`, `tests/store/leaderboard.test.ts`

**Interfaces:**
- `useToasts`: `{ items: Toast[]; push(t: { kind: ToastKind; title: string; body?: string; ttl?: number; x?: number; y?: number }): string; dismiss(id) }`, `ToastKind = 'coin'|'badge'|'rank'|'info'|'error'`.
- `useSession`: `{ user: Runner | null; setUser(u); hydrate(); signOut(): Promise<void> }`.
- `useRegistration`: `Step`, `STEP_ORDER`, `STEP_PATH`, state `{ identity: IdentityDraft | null; domain: DomainId | null; avatar: AvatarConfig; completed: Record<Step, boolean>; setIdentity(v); setDomain(d); setAvatar(a); complete(step); reset() }`, helpers `furthestStep(completed): Step`, `canAccess(step, completed): boolean`. `IdentityDraft` = `IdentityValues` (password kept in memory only, not persisted).
- `useGame`: `{ coins; badges: Partial<Record<BadgeId, string>>; visited: string[]; collectedCoins: string[]; sessionStartHour: number; awardCoins(n, reason?): void; visit(id, coins?): boolean; collectCoin(id, x?, y?): boolean; awardBadge(id): boolean; reset() }`.
- `useWorld`: `ShotName`, `QualityTier`, `WorldEvent`, `WorldEventType = 'pulse'|'burst'|'look'|'celebrate'|'coin'`, state `{ shot; scrollT; scrollLocked; qualityTier; introPlayed; introRunning; hovered: string | null; events: WorldEvent[]; setShot; setScrollT; lockScroll(b); setQuality(t); setIntroPlayed(b); setIntroRunning(b); setHovered(id); emit(e); prune(nowMs) }`.
- `useLeaderboard`: `{ rows; deltas; running; load(): Promise<void>; tick(): void; start(intervalMs?): void; stop(): void; userTeamId(): string | null; userRank(): number | null }`.

- [ ] **Step 1: Write the failing tests**

`tests/store/registration.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { canAccess, furthestStep, STEP_ORDER, STEP_PATH, useRegistration } from '@/store/registration';

describe('registration store', () => {
  beforeEach(() => { window.localStorage.clear(); useRegistration.getState().reset(); });

  it('orders steps and maps paths', () => {
    expect(STEP_ORDER).toEqual(['identity', 'domain', 'runner', 'crew', 'pass']);
    expect(STEP_PATH.domain).toBe('/register/domain');
  });
  it('gates steps on previous completion', () => {
    const c = useRegistration.getState().completed;
    expect(canAccess('identity', c)).toBe(true);
    expect(canAccess('domain', c)).toBe(false);
    expect(furthestStep(c)).toBe('identity');
    useRegistration.getState().complete('identity');
    expect(canAccess('domain', useRegistration.getState().completed)).toBe(true);
    expect(furthestStep(useRegistration.getState().completed)).toBe('domain');
  });
  it('persists the draft but never the password', () => {
    useRegistration.getState().setIdentity({ name: 'A', email: 'a@b.co', org: 'X', phone: '', password: 'secret123', confirm: 'secret123' });
    const raw = window.localStorage.getItem('aiexpo.registration.v1') ?? '';
    expect(raw).toContain('a@b.co');
    expect(raw).not.toContain('secret123');
  });
});
```

`tests/store/game.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useGame } from '@/store/game';
import { useToasts } from '@/store/toasts';

describe('game store', () => {
  beforeEach(() => { window.localStorage.clear(); useGame.getState().reset(); useToasts.setState({ items: [] }); });

  it('awards coins and pushes a coin toast', () => {
    useGame.getState().awardCoins(25, 'STEP COMPLETE');
    expect(useGame.getState().coins).toBe(25);
    expect(useToasts.getState().items[0]).toMatchObject({ kind: 'coin', title: '+25' });
  });
  it('pays a zone visit only once', () => {
    expect(useGame.getState().visit('hall')).toBe(true);
    expect(useGame.getState().visit('hall')).toBe(false);
    expect(useGame.getState().coins).toBe(10);
  });
  it('collects a coin once', () => {
    expect(useGame.getState().collectCoin('c1')).toBe(true);
    expect(useGame.getState().collectCoin('c1')).toBe(false);
    expect(useGame.getState().coins).toBe(10);
  });
  it('awards a badge once with a timestamp and a badge toast', () => {
    expect(useGame.getState().awardBadge('FIRST_RUN')).toBe(true);
    expect(useGame.getState().awardBadge('FIRST_RUN')).toBe(false);
    expect(useGame.getState().badges.FIRST_RUN).toMatch(/^\d{4}-/);
    expect(useToasts.getState().items.some((t) => t.kind === 'badge' && t.title === 'FIRST RUN')).toBe(true);
  });
});
```

`tests/store/world.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useWorld } from '@/store/world';

describe('world store', () => {
  beforeEach(() => useWorld.setState({ events: [], shot: 'landing', scrollT: 0 }));

  it('emits events with ids and prunes old ones', () => {
    useWorld.getState().emit({ type: 'burst', position: [0, 1, 0], color: 'cyan' });
    useWorld.getState().emit({ type: 'pulse', zone: 'checkin' });
    const [a, b] = useWorld.getState().events;
    expect(a.id).not.toBe(b.id);
    expect(a.at).toBeLessThanOrEqual(Date.now());
    useWorld.getState().prune(a.at + 5000);
    expect(useWorld.getState().events).toEqual([]);
  });
  it('clamps scrollT to [0,1]', () => {
    useWorld.getState().setScrollT(1.5);
    expect(useWorld.getState().scrollT).toBe(1);
    useWorld.getState().setScrollT(-1);
    expect(useWorld.getState().scrollT).toBe(0);
  });
});
```

`tests/store/leaderboard.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';
import { useWorld } from '@/store/world';
import type { LeaderboardRow } from '@/api/types';

const rows: LeaderboardRow[] = [
  { teamId: 'a', team: 'A', domain: 'ai', score: 900, rank: 1 },
  { teamId: 'b', team: 'B', domain: 'data', score: 800, rank: 2 },
  { teamId: 'me', team: 'ME', domain: 'cyber', score: 790, rank: 3 },
];

// With Math.random pinned to 0.99 every tick picks all three teams and moves them by 40:
// a → 860, b → 760, me → 830 (user team only climbs) ⇒ me rises from rank 3 to rank 2.
describe('leaderboard store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useLeaderboard.setState({ rows, deltas: {}, running: false });
    useToasts.setState({ items: [] });
    useWorld.setState({ events: [] });
    useSession.setState({ user: { id: '#1', name: 'Me', email: 'm@e', org: '', phone: '', domain: 'cyber', avatar: null as never, teamId: 'me', registeredAt: '', openedChallengeAt: null } });
  });
  afterEach(() => { useLeaderboard.getState().stop(); vi.useRealTimers(); });

  it('ticks on an interval, records deltas, and celebrates a climb', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useLeaderboard.getState().start(1000);
    expect(useLeaderboard.getState().running).toBe(true);
    vi.advanceTimersByTime(1000);
    const s = useLeaderboard.getState();
    expect(s.deltas).toEqual({ a: 0, b: -1, me: 1 });
    expect(s.userRank()).toBe(2);
    expect(useToasts.getState().items.some((t) => t.kind === 'rank' && t.title === '+1 POSITIONS')).toBe(true);
    expect(useWorld.getState().events.some((e) => e.type === 'celebrate')).toBe(true);
    useLeaderboard.getState().stop();
    expect(useLeaderboard.getState().running).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/store`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/store/toasts.ts` and `src/store/session.ts`**

`src/store/toasts.ts`:
```ts
import { create } from 'zustand';

export type ToastKind = 'coin' | 'badge' | 'rank' | 'info' | 'error';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  at: number;
  ttl: number;
  /** Screen position for coin fly-ins (px). */
  x?: number;
  y?: number;
}

interface ToastsState {
  items: Toast[];
  push(t: { kind: ToastKind; title: string; body?: string; ttl?: number; x?: number; y?: number }): string;
  dismiss(id: string): void;
}

let seq = 0;

export const useToasts = create<ToastsState>()((set) => ({
  items: [],
  push(t) {
    const id = `toast_${++seq}`;
    set((s) => ({ items: [...s.items, { id, at: Date.now(), ttl: t.ttl ?? 2600, ...t }] }));
    return id;
  },
  dismiss(id) { set((s) => ({ items: s.items.filter((t) => t.id !== id) })); },
}));
```

`src/store/session.ts`:
```ts
import { create } from 'zustand';
import { api } from '@/api';
import type { Runner } from '@/api/types';

interface SessionState {
  user: Runner | null;
  setUser(user: Runner | null): void;
  hydrate(): void;
  signOut(): Promise<void>;
}

export const useSession = create<SessionState>()((set) => ({
  user: api.currentRunner(),
  setUser: (user) => set({ user }),
  hydrate: () => set({ user: api.currentRunner() }),
  async signOut() { await api.signOut(); set({ user: null }); },
}));
```

- [ ] **Step 4: Write `src/store/registration.ts`**

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/api/types';
import type { DomainId } from '@/config/event';
import type { IdentityValues } from '@/lib/validation';

export type Step = 'identity' | 'domain' | 'runner' | 'crew' | 'pass';
export const STEP_ORDER: Step[] = ['identity', 'domain', 'runner', 'crew', 'pass'];
export const STEP_PATH: Record<Step, string> = {
  identity: '/register/identity', domain: '/register/domain', runner: '/register/runner',
  crew: '/register/crew', pass: '/register/pass',
};

export type Completed = Record<Step, boolean>;
const NONE: Completed = { identity: false, domain: false, runner: false, crew: false, pass: false };

export function canAccess(step: Step, completed: Completed): boolean {
  const i = STEP_ORDER.indexOf(step);
  return STEP_ORDER.slice(0, i).every((s) => completed[s]);
}

export function furthestStep(completed: Completed): Step {
  return STEP_ORDER.find((s) => !completed[s]) ?? 'pass';
}

interface RegistrationState {
  identity: IdentityValues | null;
  domain: DomainId | null;
  avatar: AvatarConfig;
  completed: Completed;
  setIdentity(v: IdentityValues): void;
  setDomain(d: DomainId): void;
  setAvatar(a: AvatarConfig): void;
  complete(step: Step): void;
  reset(): void;
}

export const useRegistration = create<RegistrationState>()(
  persist(
    (set) => ({
      identity: null,
      domain: null,
      avatar: DEFAULT_AVATAR,
      completed: { ...NONE },
      setIdentity: (identity) => set({ identity }),
      setDomain: (domain) => set({ domain }),
      setAvatar: (avatar) => set({ avatar }),
      complete: (step) => set((s) => ({ completed: { ...s.completed, [step]: true } })),
      reset: () => set({ identity: null, domain: null, avatar: DEFAULT_AVATAR, completed: { ...NONE } }),
    }),
    {
      name: 'aiexpo.registration.v1',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({
        identity: s.identity ? { ...s.identity, password: '', confirm: '' } : null,
        domain: s.domain, avatar: s.avatar, completed: s.completed,
      }),
    },
  ),
);
```

- [ ] **Step 5: Write `src/store/game.ts`**

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BADGES, type BadgeId } from '@/lib/badges';
import { useToasts } from './toasts';

interface GameState {
  coins: number;
  badges: Partial<Record<BadgeId, string>>;
  visited: string[];
  collectedCoins: string[];
  sessionStartHour: number;
  awardCoins(n: number, reason?: string): void;
  visit(id: string, coins?: number): boolean;
  collectCoin(id: string, x?: number, y?: number): boolean;
  awardBadge(id: BadgeId): boolean;
  reset(): void;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      badges: {},
      visited: [],
      collectedCoins: [],
      sessionStartHour: new Date().getHours(),
      awardCoins(n, reason) {
        set((s) => ({ coins: s.coins + n }));
        useToasts.getState().push({ kind: 'coin', title: `+${n}`, body: reason });
      },
      visit(id, coins = 10) {
        if (get().visited.includes(id)) return false;
        set((s) => ({ visited: [...s.visited, id] }));
        get().awardCoins(coins, 'NEW STOP');
        return true;
      },
      collectCoin(id, x, y) {
        if (get().collectedCoins.includes(id)) return false;
        set((s) => ({ collectedCoins: [...s.collectedCoins, id], coins: s.coins + 10 }));
        useToasts.getState().push({ kind: 'coin', title: '+10', x, y, ttl: 1400 });
        return true;
      },
      awardBadge(id) {
        if (get().badges[id]) return false;
        set((s) => ({ badges: { ...s.badges, [id]: new Date().toISOString() } }));
        const def = BADGES.find((b) => b.id === id)!;
        useToasts.getState().push({ kind: 'badge', title: def.label, body: def.rule, ttl: 4200 });
        return true;
      },
      reset() { set({ coins: 0, badges: {}, visited: [], collectedCoins: [] }); },
    }),
    {
      name: 'aiexpo.game.v1',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({ coins: s.coins, badges: s.badges, visited: s.visited, collectedCoins: s.collectedCoins }),
    },
  ),
);
```

- [ ] **Step 6: Write `src/store/world.ts`**

```ts
import { create } from 'zustand';
import type { PaletteName } from '@/theme/palette';

export type ShotName =
  | 'landing' | 'hero' | 'routes' | 'line' | 'board' | 'checkin' | 'wall' | 'locker' | 'crew'
  | 'station' | 'stationArrival' | 'train1' | 'train2' | 'train3' | 'train4' | 'train5' | 'train6' | 'hall404';

export type QualityTier = 'high' | 'low';
export type WorldEventType = 'pulse' | 'burst' | 'look' | 'celebrate' | 'coin';

export interface WorldEvent {
  id: number;
  type: WorldEventType;
  at: number;
  position?: [number, number, number];
  color?: PaletteName;
  zone?: string;
}

interface WorldState {
  shot: ShotName;
  scrollT: number;
  scrollLocked: boolean;
  qualityTier: QualityTier;
  introPlayed: boolean;
  introRunning: boolean;
  hovered: string | null;
  events: WorldEvent[];
  setShot(shot: ShotName): void;
  setScrollT(t: number): void;
  lockScroll(locked: boolean): void;
  setQuality(tier: QualityTier): void;
  setIntroPlayed(v: boolean): void;
  setIntroRunning(v: boolean): void;
  setHovered(id: string | null): void;
  emit(e: Omit<WorldEvent, 'id' | 'at'>): void;
  prune(nowMs: number): void;
}

const INTRO_KEY = 'aiexpo.introPlayed';
const readIntro = () => { try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; } };

let eventSeq = 0;
const EVENT_TTL = 3000;

export const useWorld = create<WorldState>()((set) => ({
  shot: 'landing',
  scrollT: 0,
  scrollLocked: false,
  qualityTier: 'high',
  introPlayed: readIntro(),
  introRunning: false,
  hovered: null,
  events: [],
  setShot: (shot) => set({ shot }),
  setScrollT: (t) => set({ scrollT: Math.min(1, Math.max(0, t)) }),
  lockScroll: (scrollLocked) => set({ scrollLocked }),
  setQuality: (qualityTier) => set({ qualityTier }),
  setIntroPlayed(v) {
    try { sessionStorage.setItem(INTRO_KEY, v ? '1' : '0'); } catch { /* memory only */ }
    set({ introPlayed: v });
  },
  setIntroRunning: (introRunning) => set({ introRunning }),
  setHovered: (hovered) => set({ hovered }),
  emit: (e) => set((s) => ({ events: [...s.events, { ...e, id: ++eventSeq, at: Date.now() }] })),
  prune: (nowMs) => set((s) => ({ events: s.events.filter((e) => nowMs - e.at < EVENT_TTL) })),
}));
```

- [ ] **Step 7: Write `src/store/leaderboard.ts`**

```ts
import { create } from 'zustand';
import { api } from '@/api';
import type { LeaderboardRow } from '@/api/types';
import { rankDeltas, tickScores } from '@/lib/leaderboard';
import { useSession } from './session';
import { useToasts } from './toasts';
import { useWorld } from './world';

interface LeaderboardState {
  rows: LeaderboardRow[];
  deltas: Record<string, number>;
  running: boolean;
  load(): Promise<void>;
  tick(): void;
  start(intervalMs?: number): void;
  stop(): void;
  userTeamId(): string | null;
  userRank(): number | null;
}

let timer: ReturnType<typeof setInterval> | null = null;

export const useLeaderboard = create<LeaderboardState>()((set, get) => ({
  rows: [],
  deltas: {},
  running: false,
  async load() { set({ rows: await api.getLeaderboard(), deltas: {} }); },
  tick() {
    const before = get().rows;
    if (before.length === 0) return;
    const rows = tickScores(before, Math.random, get().userTeamId());
    const deltas = rankDeltas(before, rows);
    set({ rows, deltas });
    const mine = get().userTeamId();
    const d = mine ? deltas[mine] ?? 0 : 0;
    if (d > 0) {
      useToasts.getState().push({ kind: 'rank', title: `+${d} POSITIONS`, ttl: 2200 });
      useWorld.getState().emit({ type: 'celebrate' });
    } else if (d < 0) {
      useToasts.getState().push({ kind: 'rank', title: `RANK DROP ${d}`, ttl: 2200 });
    }
  },
  start(intervalMs = 20_000) {
    if (timer) return;
    timer = setInterval(() => { if (typeof document === 'undefined' || !document.hidden) get().tick(); }, intervalMs);
    set({ running: true });
  },
  stop() {
    if (timer) clearInterval(timer);
    timer = null;
    set({ running: false });
  },
  userTeamId: () => useSession.getState().user?.teamId ?? null,
  userRank() {
    const id = get().userTeamId();
    return id ? get().rows.find((r) => r.teamId === id)?.rank ?? null : null;
  },
}));
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run tests/store`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src/store Hackathon/tests/store && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): zustand stores for session, registration, game, world, toasts, leaderboard

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src/store Hackathon/tests/store
```

---

### Task 9: Route table, guards and page stubs

**Files:**
- Create: `src/routes/guards.tsx`, `src/routes/index.tsx`
- Create stubs: `src/pages/Landing/index.tsx`, `src/pages/SignIn.tsx`, `src/pages/Register/Identity.tsx`, `src/pages/Register/Domain.tsx`, `src/pages/Register/RunnerStep.tsx`, `src/pages/Register/Crew.tsx`, `src/pages/Register/Pass.tsx`, `src/pages/Station/Layout.tsx`, `src/pages/Station/Platform.tsx`, `src/pages/Station/Profile.tsx`, `src/pages/Station/Team.tsx`, `src/pages/Station/Challenge.tsx`, `src/pages/Station/Submissions.tsx`, `src/pages/Station/Leaderboard.tsx`, `src/pages/Station/Announcements.tsx`, `src/pages/NotFound.tsx`
- Modify: `src/App.tsx` (Shell renders `<AppRoutes/>`)
- Test: `tests/routes/guards.test.tsx`

**Interfaces:**
- Produces: `AppRoutes` component; guards `RequireSession`, `RedirectIfSignedIn`, `RequireStep({ step })`. Every page is a default-exported component. Later tasks replace stub bodies but keep file paths and default exports.

- [ ] **Step 1: Write the failing test**

`tests/routes/guards.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Shell } from '@/App';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { DEMO_RUNNER } from '@/api/seed';

const at = (path: string) => render(<MemoryRouter initialEntries={[path]}><Shell /></MemoryRouter>);

describe('route guards', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useSession.setState({ user: null });
    useRegistration.getState().reset();
  });

  it('sends signed-out visitors from the station to the kiosk', () => {
    at('/station');
    expect(screen.getByText('WELCOME, RUNNER.')).toBeInTheDocument();
  });
  it('sends a signed-in runner away from the kiosk to the station', () => {
    useSession.setState({ user: { ...DEMO_RUNNER } });
    at('/signin');
    expect(screen.getByText('THE RUNNER STATION')).toBeInTheDocument();
  });
  it('gates registration steps in order', () => {
    at('/register/domain');
    expect(screen.getByText('CREATE YOUR RUNNER')).toBeInTheDocument();
  });
  it('allows the next step once the previous is complete', () => {
    useRegistration.getState().complete('identity');
    at('/register/domain');
    expect(screen.getByText('CHOOSE YOUR DOMAIN')).toBeInTheDocument();
  });
  it('shows the wrong-platform page for unknown routes', () => {
    at('/nowhere');
    expect(screen.getByText('WRONG PLATFORM')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/routes`
Expected: FAIL — pages/guards not found.

- [ ] **Step 3: Write `src/routes/guards.tsx`**

```tsx
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { canAccess, furthestStep, STEP_PATH, useRegistration, type Step } from '@/store/registration';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';

/** Station routes: signed-out visitors go to the kiosk with a short toast. */
export function RequireSession() {
  const user = useSession((s) => s.user);
  const location = useLocation();
  useEffect(() => {
    if (!user) useToasts.getState().push({ kind: 'info', title: 'WRONG PLATFORM', body: 'Wrong platform, runner — heading back.' });
  }, [user]);
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Kiosk and the first registration step: a signed-in runner belongs in the station. */
export function RedirectIfSignedIn({ to = '/station' }: { to?: string }) {
  const user = useSession((s) => s.user);
  return user ? <Navigate to={to} replace /> : <Outlet />;
}

/** Registration steps must be completed in order; out-of-order visits go to the furthest open step. */
export function RequireStep({ step }: { step: Step }) {
  const completed = useRegistration((s) => s.completed);
  if (!canAccess(step, completed)) return <Navigate to={STEP_PATH[furthestStep(completed)]} replace />;
  return <Outlet />;
}
```

- [ ] **Step 4: Write the page stubs**

Each stub is the same shape; only the headline differs. Create every file listed below with this body, substituting `HEADLINE` and the component name:

```tsx
export default function Landing() {
  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center">
      <h1 className="pointer-auto font-display text-4xl text-navy">HEADLINE</h1>
    </main>
  );
}
```

| File | Component | HEADLINE |
|---|---|---|
| `src/pages/Landing/index.tsx` | `Landing` | `RUN THE HACKATHON.` |
| `src/pages/SignIn.tsx` | `SignIn` | `WELCOME, RUNNER.` |
| `src/pages/Register/Identity.tsx` | `Identity` | `CREATE YOUR RUNNER` |
| `src/pages/Register/Domain.tsx` | `Domain` | `CHOOSE YOUR DOMAIN` |
| `src/pages/Register/RunnerStep.tsx` | `RunnerStep` | `YOUR RUN. YOUR IDENTITY.` |
| `src/pages/Register/Crew.tsx` | `Crew` | `BUILD YOUR CREW.` |
| `src/pages/Register/Pass.tsx` | `Pass` | `YOU'RE IN.` |
| `src/pages/Station/Platform.tsx` | `Platform` | `THE RUNNER STATION` |
| `src/pages/Station/Profile.tsx` | `Profile` | `MY PROFILE` |
| `src/pages/Station/Team.tsx` | `Team` | `MY TEAM` |
| `src/pages/Station/Challenge.tsx` | `Challenge` | `CHALLENGE` |
| `src/pages/Station/Submissions.tsx` | `Submissions` | `SUBMISSIONS` |
| `src/pages/Station/Leaderboard.tsx` | `Leaderboard` | `THE RUNNERS` |
| `src/pages/Station/Announcements.tsx` | `Announcements` | `ANNOUNCEMENTS` |
| `src/pages/NotFound.tsx` | `NotFound` | `WRONG PLATFORM` |

`src/pages/Station/Layout.tsx` (the station shell; sub-routes render inside it):
```tsx
import { Outlet } from 'react-router';

export default function StationLayout() {
  return (
    <div className="pointer-none relative z-10 min-h-dvh">
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 5: Write `src/routes/index.tsx`**

```tsx
import { Route, Routes } from 'react-router';
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';
import Identity from '@/pages/Register/Identity';
import Domain from '@/pages/Register/Domain';
import RunnerStep from '@/pages/Register/RunnerStep';
import Crew from '@/pages/Register/Crew';
import Pass from '@/pages/Register/Pass';
import StationLayout from '@/pages/Station/Layout';
import Platform from '@/pages/Station/Platform';
import Profile from '@/pages/Station/Profile';
import Team from '@/pages/Station/Team';
import Challenge from '@/pages/Station/Challenge';
import Submissions from '@/pages/Station/Submissions';
import Leaderboard from '@/pages/Station/Leaderboard';
import Announcements from '@/pages/Station/Announcements';
import NotFound from '@/pages/NotFound';
import { RedirectIfSignedIn, RequireSession, RequireStep } from './guards';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<RedirectIfSignedIn />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register/identity" element={<Identity />} />
      </Route>

      <Route element={<RequireStep step="domain" />}>
        <Route path="/register/domain" element={<Domain />} />
      </Route>
      <Route element={<RequireStep step="runner" />}>
        <Route path="/register/runner" element={<RunnerStep />} />
      </Route>
      <Route element={<RequireStep step="crew" />}>
        <Route path="/register/crew" element={<Crew />} />
      </Route>
      <Route element={<RequireStep step="pass" />}>
        <Route path="/register/pass" element={<Pass />} />
      </Route>

      <Route element={<RequireSession />}>
        <Route path="/station" element={<StationLayout />}>
          <Route index element={<Platform />} />
          <Route path="profile" element={<Profile />} />
          <Route path="team" element={<Team />} />
          <Route path="challenge" element={<Challenge />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

- [ ] **Step 6: Update `src/App.tsx`**

```tsx
import { AppRoutes } from '@/routes';

export function Shell() {
  return (
    <div className="relative z-10">
      <header className="fixed left-4 top-4 z-20">
        <span className="font-display text-2xl text-navy">AI EXPO</span>
        <span className="block font-ui text-xs font-bold tracking-widest text-navy">// RUN THE HACKATHON</span>
      </header>
      <AppRoutes />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run`
Expected: all PASS (the `/register/crew` and `/register/pass` gates follow the same `RequireStep` code path exercised by the domain test).

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): route table with session and step guards, page stubs

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 10: UI primitives, HUD and toasts

**Files:**
- Create: `src/ui/ArcadeButton.tsx`, `src/ui/Field.tsx`, `src/ui/Pill.tsx`, `src/ui/Chip.tsx`, `src/ui/Panel.tsx`, `src/ui/Toasts.tsx`, `src/ui/Hud.tsx`, `src/ui/MobileNav.tsx`, `src/hooks/useReducedMotion.ts`
- Modify: `src/theme/theme.css` (add `--shadow-bevel-lg`), `src/App.tsx` (Shell uses `<Hud/>` and `<Toasts/>`)
- Test: `tests/ui/ArcadeButton.test.tsx`, `tests/ui/Field.test.tsx`, `tests/ui/Hud.test.tsx`, `tests/ui/Toasts.test.tsx`

**Interfaces:**
- `ArcadeButton` props: `variant?: 'primary'|'secondary'|'danger'|'ghost'` (default primary), `size?: 'md'|'lg'`, `to?: string` (renders a router `Link`), `burst?: boolean` (default true for primary: emits `world.burst`), plus native button props. Children are the label.
- `Field` props: `label: string`, `name: string`, `error?: string`, `zone?: string` (world pulse target), `multiline?: boolean`, `hint?: string`, plus native input/textarea props (`value`, `onChange`, `type`, …). Renders `<label htmlFor>` + input with `aria-invalid`/`aria-describedby`.
- `Pill` props: `to?: string`, `active?: boolean`, `tone?: 'pale'|'yellow'|'cyan'`, `onClick?`, children.
- `Chip` props: `selected?: boolean`, `swatch?: PaletteName`, `onClick`, `onMouseEnter?`, children; renders a `<button type="button" aria-pressed>`.
- `Panel` props: `title?: string`, `tone?: 'pale'|'navy'`, `className?`, children.
- `Toasts`: renders `useToasts.items`; coin toasts with `x/y` fly to the element with id `hud-coins`.
- `Hud`: brand, nav pills, `SIGN IN` pill or user chip with `#hud-coins` counter, hamburger < 768 px, scroll mini-track on `/`.
- `useReducedMotion(): boolean`.

- [ ] **Step 1: Write the failing tests**

`tests/ui/ArcadeButton.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { useWorld } from '@/store/world';

describe('ArcadeButton', () => {
  beforeEach(() => useWorld.setState({ events: [] }));
  it('renders a button, calls onClick and emits a world burst', () => {
    const onClick = vi.fn();
    render(<ArcadeButton onClick={onClick}>▶ START RUNNING</ArcadeButton>);
    fireEvent.click(screen.getByRole('button', { name: '▶ START RUNNING' }));
    expect(onClick).toHaveBeenCalled();
    expect(useWorld.getState().events.map((e) => e.type)).toEqual(['burst']);
  });
  it('renders a link when given `to` and does not burst for secondary', () => {
    render(<MemoryRouter><ArcadeButton to="/signin" variant="secondary">SIGN IN</ArcadeButton></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'SIGN IN' });
    expect(link).toHaveAttribute('href', '/signin');
    fireEvent.click(link);
    expect(useWorld.getState().events).toEqual([]);
  });
});
```

`tests/ui/Field.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Field } from '@/ui/Field';
import { useWorld } from '@/store/world';

describe('Field', () => {
  beforeEach(() => useWorld.setState({ events: [] }));
  it('links label and input, shows errors accessibly', () => {
    render(<Field label="EMAIL / USERNAME" name="identifier" value="" onChange={() => {}} error="Email or runner name, please." />);
    const input = screen.getByLabelText('EMAIL / USERNAME');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Email or runner name, please.')).toBeInTheDocument();
  });
  it('emits pulse, burst and look on focus', () => {
    render(<Field label="PASSWORD" name="password" type="password" zone="checkin" value="" onChange={() => {}} />);
    fireEvent.focus(screen.getByLabelText('PASSWORD'));
    expect(useWorld.getState().events.map((e) => e.type).sort()).toEqual(['burst', 'look', 'pulse']);
    expect(useWorld.getState().events.find((e) => e.type === 'pulse')?.zone).toBe('checkin');
  });
});
```

`tests/ui/Hud.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Hud } from '@/ui/Hud';
import { useSession } from '@/store/session';
import { useGame } from '@/store/game';
import { DEMO_RUNNER } from '@/api/seed';

describe('Hud', () => {
  beforeEach(() => { window.localStorage.clear(); useSession.setState({ user: null }); useGame.getState().reset(); });
  it('shows the brand and nav pills with SIGN IN when signed out', () => {
    render(<MemoryRouter><Hud /></MemoryRouter>);
    expect(screen.getByText('AI EXPO')).toBeInTheDocument();
    for (const t of ['RUN', 'DOMAINS', 'CHALLENGE', 'LEADERBOARD']) expect(screen.getAllByText(t).length).toBeGreaterThan(0);
    expect(screen.getAllByText('SIGN IN').length).toBeGreaterThan(0);
  });
  it('shows the runner chip with coin count when signed in', () => {
    useSession.setState({ user: { ...DEMO_RUNNER } });
    useGame.setState({ coins: 45 });
    render(<MemoryRouter><Hud /></MemoryRouter>);
    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    expect(document.getElementById('hud-coins')).toHaveTextContent('45');
    expect(screen.getAllByText('STATION').length).toBeGreaterThan(0);
  });
});
```

`tests/ui/Toasts.test.tsx`:
```tsx
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toasts } from '@/ui/Toasts';
import { useToasts } from '@/store/toasts';

describe('Toasts', () => {
  beforeEach(() => { vi.useFakeTimers(); useToasts.setState({ items: [] }); });
  afterEach(() => vi.useRealTimers());
  it('renders a toast and removes it after its ttl', () => {
    render(<Toasts />);
    act(() => { useToasts.getState().push({ kind: 'badge', title: 'FIRST RUN', body: 'Complete registration.', ttl: 1000 }); });
    expect(screen.getByText('FIRST RUN')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1100); });
    expect(useToasts.getState().items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/ui`
Expected: FAIL — modules not found.

- [ ] **Step 3: Add the large bevel token to `src/theme/theme.css`**

Inside the `@theme { … }` block, after `--shadow-bevel-yellow`, add:
```css
  --shadow-bevel-lg: 9px 9px 0 0 #354093;
  --shadow-bevel-cyan: 6px 6px 0 0 #6AEEFD;
```

- [ ] **Step 4: Write `src/hooks/useReducedMotion.ts`**

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
```

- [ ] **Step 5: Write `src/ui/ArcadeButton.tsx`, `src/ui/Pill.tsx`, `src/ui/Chip.tsx`, `src/ui/Panel.tsx`**

`src/ui/ArcadeButton.tsx`:
```tsx
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { Link } from 'react-router';
import { useWorld } from '@/store/world';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg';
  to?: string;
  burst?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-yellow text-navy border-navy shadow-bevel hover:shadow-bevel-lg',
  secondary: 'bg-pale text-navy border-navy shadow-bevel hover:shadow-bevel-lg',
  danger: 'bg-red text-white border-navy shadow-bevel hover:shadow-bevel-lg',
  ghost: 'bg-white text-navy border-navy shadow-bevel-sm hover:shadow-bevel',
};

const BASE =
  'inline-flex items-center justify-center gap-2 border-4 font-display uppercase tracking-wide select-none ' +
  'transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 ' +
  'active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:pointer-events-none pointer-auto';

const SIZE = { md: 'px-5 py-3 text-base', lg: 'px-8 py-5 text-xl md:text-2xl' };

export function ArcadeButton({ variant = 'primary', size = 'md', to, burst, className = '', onClick, children, ...rest }: ArcadeButtonProps) {
  const shouldBurst = burst ?? variant === 'primary';
  const classes = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  const fire = (e: MouseEvent<HTMLButtonElement>) => {
    if (shouldBurst) useWorld.getState().emit({ type: 'burst', color: 'yellow' });
    onClick?.(e);
  };
  if (to) {
    return (
      <Link id={rest.id} to={to} className={classes} onClick={() => { if (shouldBurst) useWorld.getState().emit({ type: 'burst', color: 'yellow' }); }}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={fire} {...rest}>
      {children}
    </button>
  );
}
```

`src/ui/Pill.tsx`:
```tsx
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

export interface PillProps {
  to?: string;
  href?: string;
  active?: boolean;
  tone?: 'pale' | 'yellow' | 'cyan';
  onClick?: () => void;
  children: ReactNode;
}

const TONE = { pale: 'bg-pale', yellow: 'bg-yellow', cyan: 'bg-cyan' };
const BASE = 'pointer-auto inline-flex items-center rounded-full border-[3px] border-navy px-3 py-1 font-display text-xs tracking-wider text-navy shadow-bevel-sm transition-colors hover:bg-cyan';

export function Pill({ to, href, active, tone = 'pale', onClick, children }: PillProps) {
  const cls = `${BASE} ${active ? 'bg-cyan' : TONE[tone]}`;
  if (to) return <NavLink to={to} className={({ isActive }) => `${BASE} ${isActive || active ? 'bg-cyan' : TONE[tone]}`} onClick={onClick}>{children}</NavLink>;
  if (href) return <a href={href} className={cls} onClick={onClick}>{children}</a>;
  return <button type="button" className={cls} onClick={onClick}>{children}</button>;
}
```

`src/ui/Chip.tsx`:
```tsx
import type { ReactNode } from 'react';
import { PALETTE, type PaletteName } from '@/theme/palette';

export interface ChipProps {
  selected?: boolean;
  swatch?: PaletteName;
  onClick: () => void;
  onMouseEnter?: () => void;
  children?: ReactNode;
  title?: string;
}

export function Chip({ selected, swatch, onClick, onMouseEnter, children, title }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      title={title}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`pointer-auto inline-flex min-h-11 items-center gap-2 border-[3px] border-navy px-3 py-1.5 font-ui text-sm font-bold text-navy transition-transform hover:-translate-y-0.5 ${
        selected ? 'bg-cyan shadow-bevel' : 'bg-white shadow-bevel-sm'
      }`}
    >
      {swatch && <span aria-hidden className="inline-block h-5 w-5 border-2 border-navy" style={{ background: PALETTE[swatch] }} />}
      {children}
    </button>
  );
}
```

`src/ui/Panel.tsx`:
```tsx
import type { ReactNode } from 'react';

export interface PanelProps {
  title?: string;
  tone?: 'pale' | 'navy' | 'white';
  className?: string;
  children: ReactNode;
}

const TONE = {
  pale: 'bg-pale text-navy',
  navy: 'bg-navy text-pale',
  white: 'bg-white text-navy',
};

export function Panel({ title, tone = 'pale', className = '', children }: PanelProps) {
  return (
    <section className={`pointer-auto border-4 border-navy p-5 shadow-bevel-lg md:p-7 ${TONE[tone]} ${className}`}>
      {title && <h2 className="mb-4 font-display text-2xl leading-tight md:text-3xl">{title}</h2>}
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Write `src/ui/Field.tsx`**

```tsx
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useWorld } from '@/store/world';

type Base = { label: string; name: string; error?: string; hint?: string; zone?: string };
type InputProps = Base & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>;
type AreaProps = Base & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;
export type FieldProps = InputProps | AreaProps;

const CONTROL =
  'pointer-auto block w-full border-[3px] border-navy bg-white px-3 py-3 font-ui text-base text-navy placeholder:text-navy/50 ' +
  'transition-transform duration-150 focus:scale-[1.02] focus:border-cyan focus:outline-none aria-[invalid=true]:border-red';

export function Field(props: FieldProps) {
  const { label, name, error, hint, zone, multiline, className = '', ...rest } = props as Base & {
    multiline?: boolean; className?: string;
  } & Record<string, unknown>;
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const onFocus = () => {
    const w = useWorld.getState();
    w.emit({ type: 'pulse', zone: zone ?? 'kiosk', color: 'cyan' });
    w.emit({ type: 'burst', zone: zone ?? 'kiosk', color: 'cyan' });
    w.emit({ type: 'look', zone: zone ?? 'kiosk' });
  };

  const shared = { id, name, 'aria-invalid': !!error, 'aria-describedby': describedBy, onFocus };
  const control = multiline ? (
    <textarea {...shared} className={`${CONTROL} min-h-32 ${className}`} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
  ) : (
    <input {...shared} className={`${CONTROL} ${className}`} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
  );

  return (
    <div className={`mb-4 ${error ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
      <label htmlFor={id} className="mb-1 block font-display text-xs tracking-widest text-navy">{label}</label>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 font-ui text-sm font-bold text-red">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 font-ui text-xs text-navy/80">{hint}</p>
      ) : null}
    </div>
  );
}
```

Add the shake keyframes to `src/theme/theme.css` (bottom of file):
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

- [ ] **Step 7: Write `src/ui/Toasts.tsx`**

```tsx
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToasts, type Toast } from '@/store/toasts';

const KIND_CLASS: Record<Toast['kind'], string> = {
  coin: 'bg-yellow text-navy',
  badge: 'bg-pale text-navy',
  rank: 'bg-yellow text-navy',
  info: 'bg-white text-navy',
  error: 'bg-red text-white',
};

function coinsTarget(): { x: number; y: number } {
  const el = document.getElementById('hud-coins');
  if (!el) return { x: window.innerWidth - 40, y: 24 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {
    const h = setTimeout(() => dismiss(t.id), t.ttl);
    return () => clearTimeout(h);
  }, [t.id, t.ttl, dismiss]);

  if (t.kind === 'coin' && t.x != null && t.y != null) {
    const target = coinsTarget();
    return (
      <motion.div
        aria-hidden
        className="pointer-none fixed z-30 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-navy bg-yellow font-display text-xs text-navy"
        initial={{ x: t.x - 16, y: t.y - 16, scale: 1, opacity: 1 }}
        animate={{ x: target.x - 16, y: target.y - 16, scale: 0.5, opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        ¢
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      role="status"
      className={`pointer-auto border-4 border-navy px-4 py-3 shadow-bevel ${KIND_CLASS[t.kind]} ${t.kind === 'badge' ? '[transform-style:preserve-3d]' : ''}`}
      initial={t.kind === 'badge' ? { rotateY: 90, opacity: 0 } : { y: 16, opacity: 0 }}
      animate={{ rotateY: 0, y: 0, opacity: 1 }}
      exit={{ y: -8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <p className="font-display text-base leading-none">{t.title}</p>
      {t.body && <p className="mt-1 font-ui text-xs font-bold">{t.body}</p>}
    </motion.div>
  );
}

export function Toasts() {
  const items = useToasts((s) => s.items);
  return (
    <div aria-live="polite" className="pointer-none fixed bottom-4 right-4 z-30 flex w-72 flex-col gap-2">
      <AnimatePresence>{items.map((t) => <ToastItem key={t.id} t={t} />)}</AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 8: Write `src/ui/MobileNav.tsx` and `src/ui/Hud.tsx`**

`src/ui/MobileNav.tsx`:
```tsx
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router';

export interface NavItem { label: string; to?: string; href?: string; tone?: 'pale' | 'yellow' | 'cyan' }

export function MobileNav({ open, items, onClose }: { open: boolean; items: NavItem[]; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          aria-label="Menu"
          className="pointer-auto fixed inset-0 z-40 flex flex-col gap-3 bg-pale p-6 pt-20"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {items.map((it) => {
            const cls = `block border-4 border-navy px-5 py-4 font-display text-xl text-navy shadow-bevel ${it.tone === 'yellow' ? 'bg-yellow' : it.tone === 'cyan' ? 'bg-cyan' : 'bg-white'}`;
            return it.to
              ? <Link key={it.label} to={it.to} className={cls} onClick={onClose}>{it.label}</Link>
              : <a key={it.label} href={it.href} className={cls} onClick={onClose}>{it.label}</a>;
          })}
          <button type="button" onClick={onClose} className="mt-auto border-4 border-navy bg-white px-5 py-4 font-display text-navy shadow-bevel">CLOSE</button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
```

`src/ui/Hud.tsx`:
```tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { MobileNav, type NavItem } from './MobileNav';
import { Pill } from './Pill';

const SECTIONS: { label: string; id: string }[] = [
  { label: 'RUN', id: 'hero' }, { label: 'DOMAINS', id: 'domains' }, { label: 'CHALLENGE', id: 'challenge' }, { label: 'LEADERBOARD', id: 'leaderboard' },
];

export function Hud() {
  const user = useSession((s) => s.user);
  const coins = useGame((s) => s.coins);
  const scrollT = useWorld((s) => s.scrollT);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const onLanding = pathname === '/';

  const sectionItems: NavItem[] = SECTIONS.map((s) => ({ label: s.label, href: onLanding ? `#${s.id}` : `/#${s.id}` }));
  const items: NavItem[] = user
    ? [...sectionItems, { label: 'STATION', to: '/station', tone: 'cyan' }]
    : [...sectionItems, { label: 'SIGN IN', to: '/signin', tone: 'yellow' }];

  return (
    <>
      <header className="pointer-none fixed inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:p-4">
        <Link to="/" className="pointer-auto block border-4 border-navy bg-pale px-3 py-1.5 shadow-bevel">
          <span className="block font-display text-xl leading-none text-navy md:text-2xl">AI EXPO</span>
          <span className="block font-ui text-[10px] font-bold tracking-[0.2em] text-navy">// RUN THE HACKATHON</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
          {sectionItems.map((it) => <Pill key={it.label} href={it.href}>{it.label}</Pill>)}
          {user ? (
            <>
              <Pill to="/station" tone="cyan">STATION</Pill>
              <Link to="/station/profile" className="pointer-auto flex items-center gap-2 border-[3px] border-navy bg-white px-2 py-1 shadow-bevel-sm">
                <span aria-hidden className="h-5 w-5 border-2 border-navy" style={{ background: PALETTE[user.avatar.teamColor] }} />
                <span className="font-display text-xs text-navy">{user.avatar.name}</span>
                <span id="hud-coins" className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>
              </Link>
            </>
          ) : (
            <Pill to="/signin" tone="yellow">SIGN IN</Pill>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {user && <span id="hud-coins-mobile" className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>}
          <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}
            className="pointer-auto border-4 border-navy bg-yellow px-3 py-2 font-display text-navy shadow-bevel">
            MENU
          </button>
        </div>
      </header>

      {onLanding && (
        <div aria-hidden className="pointer-none fixed bottom-4 left-4 z-20 hidden h-2 w-40 border-2 border-navy bg-pale md:block">
          <div className="absolute inset-y-0 left-0 bg-yellow" style={{ width: `${scrollT * 100}%` }} />
          <div className="absolute -top-1.5 h-4 w-4 -translate-x-1/2 border-2 border-navy bg-cyan" style={{ left: `${scrollT * 100}%` }} />
        </div>
      )}

      <MobileNav open={open} items={items} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 9: Update `src/App.tsx`**

```tsx
import { AppRoutes } from '@/routes';
import { Hud } from '@/ui/Hud';
import { Toasts } from '@/ui/Toasts';

export function Shell() {
  return (
    <div className="relative z-10">
      <Hud />
      <AppRoutes />
      <Toasts />
    </div>
  );
}

export default function App() {
  return <Shell />;
}
```

- [ ] **Step 10: Run tests, lint and the palette guard**

Run: `npx vitest run && npm run lint`
Expected: all tests PASS; eslint clean; `✔ palette clean`.

- [ ] **Step 11: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): arcade UI primitives, HUD, mobile nav and toasts

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 11: World foundation — canvas, materials, lights, quality, layout, shots, camera rig

**Files:**
- Create: `src/world/layout.ts`, `src/world/materials.ts`, `src/world/quality.ts`, `src/world/shots.ts`, `src/lib/landingPath.ts`, `src/world/lights.tsx`, `src/world/CameraRig.tsx`, `src/world/WorldCanvas.tsx`, `src/world/World.tsx`, `src/world/RouteShotSync.tsx`, `src/world/props/Floor.tsx`, `src/ui/ErrorBoundary.tsx`
- Modify: `src/App.tsx`, `src/theme/theme.css` (fallback pattern utility)
- Test: `tests/world/materials.test.ts`, `tests/world/quality.test.ts`, `tests/world/shots.test.ts`, `tests/ui/ErrorBoundary.test.tsx`

**Interfaces:**
- `layout.ts`: `ZoneName`, `ZONES: Record<ZoneName, { z0: number; z1: number }>`, `zoneCenter(z)`, `zoneLength(z)`, constants `TRACK_X = -6`, `PLATFORM_X0 = -3`, `PLATFORM_X1 = 9`, `PLATFORM_Y = 0.6`, `LEFT_WALL_X = -12`, `RIGHT_WALL_X = 12`, `CEILING_Y = 9`.
- `materials.ts`: `mat(name: PaletteName, variant?: 'toon' | 'flat' | 'emissive'): Material` (cached, shared), `colorOf(name): Color`, `toonGradient()`, `materialCount()`.
- `quality.ts`: `QualitySettings { dpr; shadows; density; particles; fogFar }`, `qualitySettings(tier, devicePixelRatio)`, `detectQualityTier(env: { coarsePointer: boolean; cores: number; memoryGb: number | null })`, `readEnv()`.
- `shots.ts`: `Shot { position: [x,y,z]; lookAt: [x,y,z]; fov: number }`, `SHOTS: Record<Exclude<ShotName,'landing'>, Shot>`, `TRAIN_Z(i: 1..6)`, `shotForPath(pathname): ShotName`, `LANDING_POINTS: Shot[]` (six, one per landing section).
- `landingPath.ts`: `sampleLanding(t): Shot`.
- `CameraRig`, `Lights({ shadows })`, `WorldCanvas({ children })`, `World` (zone container; zones added in later tasks), `RouteShotSync`, `Floor`, `ErrorBoundary({ fallback, children })`, `isWebGLAvailable()`.

- [ ] **Step 1: Write the failing tests**

`tests/world/materials.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { MeshBasicMaterial, MeshToonMaterial } from 'three';
import { colorOf, mat, materialCount } from '@/world/materials';

describe('materials registry', () => {
  it('returns one shared instance per palette name and variant', () => {
    const a = mat('navy');
    const b = mat('navy');
    expect(a).toBe(b);
    expect(a).toBeInstanceOf(MeshToonMaterial);
    expect((a as MeshToonMaterial).color.getHexString().toUpperCase()).toBe('354093');
    expect(mat('navy', 'flat')).toBeInstanceOf(MeshBasicMaterial);
    expect(mat('navy', 'flat')).not.toBe(a);
    expect(materialCount()).toBeGreaterThanOrEqual(2);
  });
  it('builds three.js colours from the palette', () => {
    expect(colorOf('yellow').getHexString().toUpperCase()).toBe('FDD013');
  });
});
```

`tests/world/quality.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { detectQualityTier, qualitySettings } from '@/world/quality';

describe('quality tiers', () => {
  it('picks low for coarse pointers, few cores or little memory', () => {
    expect(detectQualityTier({ coarsePointer: true, cores: 8, memoryGb: 8 })).toBe('low');
    expect(detectQualityTier({ coarsePointer: false, cores: 4, memoryGb: 8 })).toBe('low');
    expect(detectQualityTier({ coarsePointer: false, cores: 8, memoryGb: 4 })).toBe('low');
    expect(detectQualityTier({ coarsePointer: false, cores: 8, memoryGb: null })).toBe('high');
  });
  it('caps dpr at 2 on high and 1 on low', () => {
    expect(qualitySettings('high', 3).dpr).toBe(2);
    expect(qualitySettings('low', 3)).toMatchObject({ dpr: 1, shadows: false, particles: false, density: 0.5 });
    expect(qualitySettings('high', 1.5)).toMatchObject({ dpr: 1.5, shadows: true, particles: true, density: 1 });
  });
});
```

`tests/world/shots.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { LANDING_POINTS, SHOTS, shotForPath } from '@/world/shots';
import { sampleLanding } from '@/lib/landingPath';

describe('shots', () => {
  it('maps every route to a shot', () => {
    expect(shotForPath('/')).toBe('landing');
    expect(shotForPath('/signin')).toBe('checkin');
    expect(shotForPath('/register/identity')).toBe('wall');
    expect(shotForPath('/register/domain')).toBe('routes');
    expect(shotForPath('/register/runner')).toBe('locker');
    expect(shotForPath('/register/crew')).toBe('crew');
    expect(shotForPath('/register/pass')).toBe('stationArrival');
    expect(shotForPath('/station')).toBe('station');
    expect(shotForPath('/station/profile')).toBe('train1');
    expect(shotForPath('/station/announcements')).toBe('train6');
    expect(shotForPath('/nowhere')).toBe('hall404');
  });
  it('keeps fovs in a sane range', () => {
    for (const s of Object.values(SHOTS)) expect(s.fov).toBeGreaterThanOrEqual(40);
    for (const s of Object.values(SHOTS)) expect(s.fov).toBeLessThanOrEqual(65);
  });
  it('samples the landing spline from hero to footer, always moving down -Z', () => {
    expect(LANDING_POINTS).toHaveLength(6);
    expect(sampleLanding(0).position).toEqual(LANDING_POINTS[0].position);
    const zs = Array.from({ length: 11 }, (_, i) => sampleLanding(i / 10).position[2]);
    for (let i = 1; i < zs.length; i++) expect(zs[i]).toBeLessThanOrEqual(zs[i - 1] + 0.5); // small CR overshoot allowed
    expect(sampleLanding(1).position[2]).toBeCloseTo(LANDING_POINTS[5].position[2], 3);
  });
});
```

`tests/ui/ErrorBoundary.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '@/ui/ErrorBoundary';

function Boom(): never { throw new Error('boom'); }

describe('ErrorBoundary', () => {
  it('renders the fallback when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary fallback={<p>RESTART RUN</p>}><Boom /></ErrorBoundary>);
    expect(screen.getByText('RESTART RUN')).toBeInTheDocument();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/world tests/ui/ErrorBoundary.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/world/layout.ts`**

```ts
export type ZoneName = 'TRACKS' | 'HALL' | 'ROUTES' | 'LINE' | 'BOARD' | 'CHECKIN' | 'WALL' | 'LOCKER' | 'CREW' | 'STATION';

/** The station is one long hall along −Z. Each zone owns a Z range (z0 > z1). */
export const ZONES: Record<ZoneName, { z0: number; z1: number }> = {
  TRACKS: { z0: 0, z1: -20 },
  HALL: { z0: -20, z1: -50 },
  ROUTES: { z0: -50, z1: -80 },
  LINE: { z0: -80, z1: -100 },
  BOARD: { z0: -100, z1: -120 },
  CHECKIN: { z0: -120, z1: -140 },
  WALL: { z0: -140, z1: -155 },
  LOCKER: { z0: -155, z1: -170 },
  CREW: { z0: -170, z1: -185 },
  STATION: { z0: -185, z1: -240 },
};

export const zoneCenter = (z: ZoneName): number => (ZONES[z].z0 + ZONES[z].z1) / 2;
export const zoneLength = (z: ZoneName): number => ZONES[z].z0 - ZONES[z].z1;

/** Cross-section: tracks on the left, platform on the right, walls at ±12. */
export const TRACK_X = -6;
export const PLATFORM_X0 = -3;
export const PLATFORM_X1 = 9;
export const PLATFORM_Y = 0.6;
export const LEFT_WALL_X = -12;
export const RIGHT_WALL_X = 12;
export const CEILING_Y = 9;
export const WORLD_Z_END = -240;
```

- [ ] **Step 4: Write `src/world/materials.ts`**

```ts
import { Color, DataTexture, type Material, MeshBasicMaterial, MeshToonMaterial, NearestFilter, RedFormat } from 'three';
import { PALETTE, type PaletteName } from '@/theme/palette';

export type MatVariant = 'toon' | 'flat' | 'emissive';

let gradient: DataTexture | null = null;

/** 3-step toon ramp; the darkest step stays bright (128/255) so shaded sides read as tinted, not black. */
export function toonGradient(): DataTexture {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array([128, 200, 255]), 3, 1, RedFormat);
    gradient.minFilter = NearestFilter;
    gradient.magFilter = NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

const cache = new Map<string, Material>();

export function colorOf(name: PaletteName): Color {
  return new Color(PALETTE[name]);
}

/** Shared, cached palette materials. Never construct a material with a colour elsewhere. */
export function mat(name: PaletteName, variant: MatVariant = 'toon'): Material {
  const key = `${name}:${variant}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let m: Material;
  if (variant === 'flat') m = new MeshBasicMaterial({ color: PALETTE[name] });
  else if (variant === 'emissive') m = new MeshToonMaterial({ color: PALETTE[name], emissive: PALETTE[name], emissiveIntensity: 0.55, gradientMap: toonGradient() });
  else m = new MeshToonMaterial({ color: PALETTE[name], gradientMap: toonGradient() });
  m.name = key;
  cache.set(key, m);
  return m;
}

export function materialCount(): number {
  return cache.size;
}
```

- [ ] **Step 5: Write `src/world/quality.ts`**

```ts
import type { QualityTier } from '@/store/world';

export interface QualitySettings {
  dpr: number;
  shadows: boolean;
  density: number;   // fraction of instanced props to draw
  particles: boolean;
  fogFar: number;
}

export function qualitySettings(tier: QualityTier, devicePixelRatio: number): QualitySettings {
  return tier === 'high'
    ? { dpr: Math.min(devicePixelRatio, 2), shadows: true, density: 1, particles: true, fogFar: 140 }
    : { dpr: 1, shadows: false, density: 0.5, particles: false, fogFar: 90 };
}

export interface QualityEnv { coarsePointer: boolean; cores: number; memoryGb: number | null }

export function detectQualityTier(env: QualityEnv): QualityTier {
  if (env.coarsePointer) return 'low';
  if (env.cores <= 4) return 'low';
  if (env.memoryGb != null && env.memoryGb <= 4) return 'low';
  return 'high';
}

export function readEnv(): QualityEnv {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    coarsePointer: typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches,
    cores: nav.hardwareConcurrency ?? 8,
    memoryGb: nav.deviceMemory ?? null,
  };
}
```

- [ ] **Step 6: Write `src/world/shots.ts` and `src/lib/landingPath.ts`**

`src/world/shots.ts`:
```ts
import type { ShotName } from '@/store/world';
import { TRACK_X } from './layout';

export interface Shot {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

/** Station train cars sit on the track at these Z positions (car i of 6). */
export const TRAIN_Z = (i: number): number => -196 - (i - 1) * 8;

const train = (i: number): Shot => ({ position: [2, 2.2, TRAIN_Z(i) + 4], lookAt: [TRACK_X, 1.8, TRAIN_Z(i)], fov: 45 });

export const SHOTS: Record<Exclude<ShotName, 'landing'>, Shot> = {
  hero: { position: [3, 3.2, -22], lookAt: [1, 2.2, -40], fov: 55 },
  routes: { position: [2, 2.6, -58], lookAt: [-8, 2.4, -70], fov: 50 },
  line: { position: [1, 2.6, -86], lookAt: [10, 3, -92], fov: 50 },
  board: { position: [1, 3, -104], lookAt: [3, 3.5, -118], fov: 50 },
  checkin: { position: [3, 2.4, -124], lookAt: [3, 2, -134], fov: 48 },
  wall: { position: [3, 2.8, -144], lookAt: [-8, 3.5, -150], fov: 55 },
  locker: { position: [3, 2.2, -158], lookAt: [3, 1.4, -164], fov: 45 },
  crew: { position: [3, 2.6, -173], lookAt: [3, 1.4, -180], fov: 50 },
  station: { position: [3, 3.4, -190], lookAt: [0, 1.6, -212], fov: 55 },
  stationArrival: { position: [1, 1.6, -188], lookAt: [-4, 1.8, -205], fov: 60 },
  train1: train(1), train2: train(2), train3: train(3), train4: train(4), train5: train(5), train6: train(6),
  hall404: { position: [3, 3, -26], lookAt: [3, 3, -36], fov: 50 },
};

/** One control point per landing section: HERO, ROUTES, LINE, BOARD, CHECKIN, FOOTER. */
export const LANDING_POINTS: Shot[] = [
  SHOTS.hero, SHOTS.routes, SHOTS.line, SHOTS.board, SHOTS.checkin,
  { position: [3, 2.2, -128], lookAt: [3, 2, -138], fov: 50 },
];

const STATION_SECTIONS: Record<string, ShotName> = {
  profile: 'train1', team: 'train2', challenge: 'train3', submissions: 'train4', leaderboard: 'train5', announcements: 'train6',
};

export function shotForPath(pathname: string): ShotName {
  if (pathname === '/') return 'landing';
  if (pathname === '/signin') return 'checkin';
  if (pathname === '/register/identity') return 'wall';
  if (pathname === '/register/domain') return 'routes';
  if (pathname === '/register/runner') return 'locker';
  if (pathname === '/register/crew') return 'crew';
  if (pathname === '/register/pass') return 'stationArrival';
  if (pathname === '/station') return 'station';
  const m = pathname.match(/^\/station\/([a-z]+)$/);
  if (m && STATION_SECTIONS[m[1]]) return STATION_SECTIONS[m[1]];
  return 'hall404';
}
```

`src/lib/landingPath.ts`:
```ts
import { CatmullRomCurve3, Vector3 } from 'three';
import { LANDING_POINTS, type Shot } from '@/world/shots';

const posCurve = new CatmullRomCurve3(LANDING_POINTS.map((p) => new Vector3(...p.position)), false, 'centripetal');
const lookCurve = new CatmullRomCurve3(LANDING_POINTS.map((p) => new Vector3(...p.lookAt)), false, 'centripetal');
const scratchP = new Vector3();
const scratchL = new Vector3();

/** Camera shot for landing scroll progress t ∈ [0,1]. Allocation-free after warm-up. */
export function sampleLanding(t: number): Shot {
  const u = Math.min(1, Math.max(0, t));
  posCurve.getPointAt(u, scratchP);
  lookCurve.getPointAt(u, scratchL);
  const seg = Math.min(LANDING_POINTS.length - 2, Math.floor(u * (LANDING_POINTS.length - 1)));
  const f = u * (LANDING_POINTS.length - 1) - seg;
  const fov = LANDING_POINTS[seg].fov + (LANDING_POINTS[seg + 1].fov - LANDING_POINTS[seg].fov) * f;
  return { position: [scratchP.x, scratchP.y, scratchP.z], lookAt: [scratchL.x, scratchL.y, scratchL.z], fov };
}
```

- [ ] **Step 7: Write `src/world/lights.tsx`, `src/world/props/Floor.tsx`, `src/world/CameraRig.tsx`**

`src/world/lights.tsx`:
```tsx
import { PALETTE } from '@/theme/palette';

/** Bright station light: pale sky / navy ground hemisphere + warm orange key. No black anywhere. */
export function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <hemisphereLight args={[PALETTE.pale, PALETTE.navy, 1.1]} />
      <directionalLight
        color={PALETTE.orange}
        intensity={1.2}
        position={[8, 14, -30]}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={120}
      />
    </>
  );
}
```

`src/world/props/Floor.tsx`:
```tsx
import { PALETTE } from '@/theme/palette';
import { mat } from '../materials';
import { WORLD_Z_END } from '../layout';

/** Pale ground plane along the whole hall; receives navy-tinted shadows at 35 %. */
export function Floor() {
  const length = -WORLD_Z_END + 20;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, WORLD_Z_END / 2]} receiveShadow material={mat('pale')}>
        <planeGeometry args={[60, length]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, WORLD_Z_END / 2]} receiveShadow>
        <planeGeometry args={[60, length]} />
        <shadowMaterial color={PALETTE.navy} opacity={0.35} transparent />
      </mesh>
    </group>
  );
}
```

`src/world/CameraRig.tsx`:
```tsx
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { damp, damp3 } from 'maath/easing';
import { PerspectiveCamera, Vector3 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sampleLanding } from '@/lib/landingPath';
import { useWorld } from '@/store/world';
import { SHOTS } from './shots';

const SMOOTH = 0.35;

/** Damps the camera toward the current shot (route) or the landing spline (scroll). */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const reduced = useReducedMotion();
  const targetPos = useRef(new Vector3(...SHOTS.hero.position));
  const look = useRef(new Vector3(...SHOTS.hero.lookAt));
  const targetLook = useRef(new Vector3(...SHOTS.hero.lookAt));

  useFrame((_, delta) => {
    const w = useWorld.getState();
    if (w.introRunning) return;
    const shot = w.shot === 'landing' ? sampleLanding(w.scrollT) : SHOTS[w.shot];
    targetPos.current.set(...shot.position);
    targetLook.current.set(...shot.lookAt);
    const dt = Math.min(delta, 0.1);
    if (reduced) {
      camera.position.copy(targetPos.current);
      look.current.copy(targetLook.current);
    } else {
      damp3(camera.position, targetPos.current, SMOOTH, dt);
      damp3(look.current, targetLook.current, SMOOTH, dt);
    }
    camera.lookAt(look.current);
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - shot.fov) > 0.01) {
      if (reduced) camera.fov = shot.fov; else damp(camera, 'fov', shot.fov, SMOOTH, dt);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
```

- [ ] **Step 8: Write `src/world/WorldCanvas.tsx`, `src/world/World.tsx`, `src/world/RouteShotSync.tsx`, `src/ui/ErrorBoundary.tsx`**

`src/world/WorldCanvas.tsx`:
```tsx
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { CameraRig } from './CameraRig';
import { Lights } from './lights';
import { colorOf } from './materials';
import { detectQualityTier, qualitySettings, readEnv } from './quality';
import { SHOTS } from './shots';

export function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function WorldCanvas({ children }: { children?: ReactNode }) {
  const tier = useWorld((s) => s.qualityTier);
  const setQuality = useWorld((s) => s.setQuality);
  const [ok] = useState(isWebGLAvailable);

  useEffect(() => { setQuality(detectQualityTier(readEnv())); }, [setQuality]);

  if (!ok) return <div aria-hidden className="track-lines fixed inset-0 z-0 bg-pale" />;

  const q = qualitySettings(tier, window.devicePixelRatio || 1);
  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <Canvas
        dpr={q.dpr}
        shadows={q.shadows ? 'soft' : false}
        camera={{ fov: SHOTS.hero.fov, near: 0.1, far: 400, position: SHOTS.hero.position }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => { scene.background = colorOf('pale'); }}
      >
        <fog attach="fog" args={[PALETTE.pale, 25, q.fogFar]} />
        <Lights shadows={q.shadows} />
        <CameraRig />
        <PerformanceMonitor onDecline={() => setQuality('low')} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
```

`src/world/World.tsx` (zones are appended here by later tasks):
```tsx
import { Floor } from './props/Floor';

export function World() {
  return (
    <group>
      <Floor />
    </group>
  );
}
```

`src/world/RouteShotSync.tsx`:
```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useWorld } from '@/store/world';
import { shotForPath } from './shots';

/** Keeps the camera shot in step with the router. Lives in the DOM tree (needs router context). */
export function RouteShotSync() {
  const { pathname } = useLocation();
  const setShot = useWorld((s) => s.setShot);
  useEffect(() => { setShot(shotForPath(pathname)); }, [pathname, setShot]);
  return null;
}
```

`src/ui/ErrorBoundary.tsx`:
```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { fallback: ReactNode; children: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[AI EXPO] render error', error, info.componentStack); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
```

- [ ] **Step 9: Wire `src/App.tsx` and add the fallback pattern utility**

`src/App.tsx`:
```tsx
import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { Hud } from '@/ui/Hud';
import { Toasts } from '@/ui/Toasts';
import { RouteShotSync } from '@/world/RouteShotSync';
import { World } from '@/world/World';
import { WorldCanvas } from '@/world/WorldCanvas';

function RestartPanel() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pale p-6">
      <div className="border-4 border-navy bg-navy p-6 text-pale shadow-bevel-yellow">
        <p className="font-display text-2xl">SIGNAL LOST</p>
        <p className="mt-2 font-ui text-sm">Something derailed. Restart the run.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 border-4 border-navy bg-yellow px-5 py-3 font-display text-navy shadow-bevel-sm">RESTART RUN</button>
      </div>
    </div>
  );
}

export function Shell() {
  return (
    <div className="relative z-10">
      <RouteShotSync />
      <Hud />
      <AppRoutes />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ErrorBoundary fallback={<div aria-hidden className="track-lines fixed inset-0 z-0 bg-pale" />}>
        <WorldCanvas><World /></WorldCanvas>
      </ErrorBoundary>
      <ErrorBoundary fallback={<RestartPanel />}>
        <Shell />
      </ErrorBoundary>
    </>
  );
}
```

Append to the `@layer utilities` block in `src/theme/theme.css`:
```css
  .track-lines {
    background-image: repeating-linear-gradient(90deg, #354093 0 2px, transparent 2px 48px);
    opacity: 1;
  }
```

- [ ] **Step 10: Run tests, lint, build**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: all PASS, lint clean, build succeeds (three/drei chunk warnings about size are fine).

- [ ] **Step 11: Visual check**

Run `npm run dev -- --port 5173` in the background, open `http://localhost:5173` in the Browser pane, and confirm: a pale (`#C6FEFE`) page, the AI EXPO HUD top-left, nav pills top-right, no console errors, and the three.js canvas present (DOM: `canvas` inside the fixed `div`). Navigate to `/nowhere` → `WRONG PLATFORM`. Stop the dev server.

- [ ] **Step 12: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): world canvas with palette materials, lights, camera rig and shots

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

## Phase 2 — World & Landing

### Task 12: Structural props — rails, platform, walls, pillars, signs, street props

**Files:**
- Create: `src/world/props/instancing.ts`, `src/world/props/Rails.tsx`, `src/world/props/Platform.tsx`, `src/world/props/Wall.tsx`, `src/world/props/Pillars.tsx`, `src/world/props/Sign.tsx`, `src/world/props/TunnelMouth.tsx`, `src/world/props/street.tsx` (Cone, Barrier, SprayCan, Poster, Skateboard), `src/world/fonts.ts`
- Modify: `src/world/World.tsx`
- Test: `tests/world/instancing.test.ts`

**Interfaces:**
- `instancing.ts`: `spread(z0, z1, spacing, density?)` → z positions from `z0` down to `z1` (inclusive when it lands), spacing divided by density. `useDensity()` → current tier density.
- `fonts.ts`: `BUNGEE_URL` (woff URL for drei `Text`).
- Props: `Rails({ z0, z1 })`, `Platform({ z0, z1 })`, `Wall({ side: 'left' | 'right'; z0; z1 })`, `Pillars({ z0, z1, x })`, `Sign({ text, position, rotation?, width?, height?, plate?: PaletteName, ink?: PaletteName, size? })`, `TunnelMouth({ z })`, `Cone`, `Barrier`, `SprayCan({ cap })`, `Poster({ word, accent })`, `Skateboard` — all accept `position`/`rotation` group props.

- [ ] **Step 1: Write the failing test**

`tests/world/instancing.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { spread } from '@/world/props/instancing';

describe('spread', () => {
  it('spaces positions from z0 down to z1', () => {
    expect(spread(0, -10, 2)).toEqual([0, -2, -4, -6, -8, -10]);
  });
  it('halves the count at density 0.5', () => {
    expect(spread(0, -10, 2, 0.5)).toEqual([0, -4, -8]);
  });
  it('returns just z0 when the range is too short', () => {
    expect(spread(-5, -6, 2)).toEqual([-5]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/world/instancing.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/world/props/instancing.ts` and `src/world/fonts.ts`**

`src/world/props/instancing.ts`:
```ts
import { useWorld } from '@/store/world';
import { qualitySettings } from '../quality';

/** Z positions from z0 down to z1 every `spacing / density` units (z0 > z1). */
export function spread(z0: number, z1: number, spacing: number, density = 1): number[] {
  const step = spacing / Math.max(density, 0.05);
  const out: number[] = [];
  for (let z = z0; z >= z1 - 1e-9; z -= step) out.push(Number(z.toFixed(6)));
  return out;
}

export function useDensity(): number {
  const tier = useWorld((s) => s.qualityTier);
  return qualitySettings(tier, 1).density;
}
```

`src/world/fonts.ts`:
```ts
import bungee from '@fontsource/bungee/files/bungee-latin-400-normal.woff?url';

/** drei <Text> needs a woff/ttf URL (not woff2). */
export const BUNGEE_URL: string = bungee;
```

- [ ] **Step 4: Write `Rails.tsx`, `Platform.tsx`, `Wall.tsx`, `Pillars.tsx`**

`src/world/props/Rails.tsx`:
```tsx
import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { TRACK_X } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Two yellow rails on a pale bed with instanced navy ties. */
export function Rails({ z0, z1 }: { z0: number; z1: number }) {
  const density = useDensity();
  const ties = useMemo(() => spread(z0, z1, 1.2, density), [z0, z1, density]);
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  return (
    <group>
      {[-0.75, 0.75].map((dx) => (
        <mesh key={dx} position={[TRACK_X + dx, 0.16, zc]} material={mat('yellow')} castShadow>
          <boxGeometry args={[0.16, 0.16, length]} />
        </mesh>
      ))}
      <Instances range={ties.length} limit={400} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 0.4]} />
        <primitive object={mat('navy')} attach="material" />
        {ties.map((z) => <Instance key={z} position={[TRACK_X, 0.06, z]} />)}
      </Instances>
    </group>
  );
}
```

`src/world/props/Platform.tsx`:
```tsx
import { PLATFORM_X0, PLATFORM_X1, PLATFORM_Y } from '../layout';
import { mat } from '../materials';

/** Pale slab, yellow safety line, navy tactile strip, navy front face toward the track. */
export function Platform({ z0, z1 }: { z0: number; z1: number }) {
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  const width = PLATFORM_X1 - PLATFORM_X0;
  const xc = (PLATFORM_X0 + PLATFORM_X1) / 2;
  return (
    <group>
      <mesh position={[xc, PLATFORM_Y / 2, zc]} material={mat('pale')} receiveShadow castShadow>
        <boxGeometry args={[width, PLATFORM_Y, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 - 0.05, PLATFORM_Y / 2, zc]} material={mat('navy')}>
        <boxGeometry args={[0.1, PLATFORM_Y, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 + 0.35, PLATFORM_Y + 0.01, zc]} material={mat('yellow')}>
        <boxGeometry args={[0.5, 0.02, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 + 1.1, PLATFORM_Y + 0.01, zc]} material={mat('navy')}>
        <boxGeometry args={[0.6, 0.02, length]} />
      </mesh>
    </group>
  );
}
```

`src/world/props/Wall.tsx`:
```tsx
import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { CEILING_Y, LEFT_WALL_X, RIGHT_WALL_X } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Pale wall panel with instanced navy beams and an orange trim band. Faces into the hall. */
export function Wall({ side, z0, z1 }: { side: 'left' | 'right'; z0: number; z1: number }) {
  const density = useDensity();
  const x = side === 'left' ? LEFT_WALL_X : RIGHT_WALL_X;
  const inward = side === 'left' ? 1 : -1;
  const beams = useMemo(() => spread(z0, z1, 6, density), [z0, z1, density]);
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  return (
    <group>
      <mesh position={[x, CEILING_Y / 2, zc]} rotation-y={inward * Math.PI / 2} material={mat('pale')} receiveShadow>
        <planeGeometry args={[length, CEILING_Y]} />
      </mesh>
      <mesh position={[x + inward * 0.1, 7.5, zc]} material={mat('orange')}>
        <boxGeometry args={[0.2, 0.5, length]} />
      </mesh>
      <Instances range={beams.length} limit={80} castShadow>
        <boxGeometry args={[0.4, CEILING_Y, 0.5]} />
        <primitive object={mat('navy')} attach="material" />
        {beams.map((z) => <Instance key={z} position={[x + inward * 0.2, CEILING_Y / 2, z]} />)}
      </Instances>
    </group>
  );
}
```

`src/world/props/Pillars.tsx`:
```tsx
import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { CEILING_Y } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Navy columns with an orange band, instanced every 10 units along x. */
export function Pillars({ z0, z1, x }: { z0: number; z1: number; x: number }) {
  const density = useDensity();
  const zs = useMemo(() => spread(z0 - 5, z1 + 5, 10, density), [z0, z1, density]);
  return (
    <group>
      <Instances range={zs.length} limit={40} castShadow>
        <boxGeometry args={[0.8, CEILING_Y, 0.8]} />
        <primitive object={mat('navy')} attach="material" />
        {zs.map((z) => <Instance key={z} position={[x, CEILING_Y / 2, z]} />)}
      </Instances>
      <Instances range={zs.length} limit={40}>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
        <primitive object={mat('orange')} attach="material" />
        {zs.map((z) => <Instance key={z} position={[x, 3.2, z]} />)}
      </Instances>
    </group>
  );
}
```

- [ ] **Step 5: Write `Sign.tsx`, `TunnelMouth.tsx`, `street.tsx`**

`src/world/props/Sign.tsx`:
```tsx
import { Text } from '@react-three/drei';
import { PALETTE, type PaletteName } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export interface SignProps {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  plate?: PaletteName;
  ink?: PaletteName;
  size?: number;
}

/** A pale plate with Bungee text — station signage. */
export function Sign({ text, position, rotation = [0, 0, 0], width = 4, height = 1, plate = 'pale', ink = 'navy', size = 0.45 }: SignProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat(plate)} castShadow>
        <boxGeometry args={[width, height, 0.15]} />
      </mesh>
      <mesh position={[0, 0, 0.08]} material={mat('navy')}>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.1]} material={mat(plate)}>
        <boxGeometry args={[width, height, 0.02]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={size} color={PALETTE[ink]} anchorX="center" anchorY="middle" position={[0, 0, 0.12]} maxWidth={width - 0.3}>
        {text}
      </Text>
    </group>
  );
}
```

`src/world/props/TunnelMouth.tsx`:
```tsx
import { TRACK_X } from '../layout';
import { mat } from '../materials';

/** Navy portal frame around the track where trains enter the hall. */
export function TunnelMouth({ z }: { z: number }) {
  return (
    <group position={[TRACK_X, 0, z]}>
      {[-2.6, 2.6].map((dx) => (
        <mesh key={dx} position={[dx, 2.5, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.8, 5, 1]} />
        </mesh>
      ))}
      <mesh position={[0, 5.3, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[6, 0.8, 1]} />
      </mesh>
      <mesh position={[0, 5.3, 0.55]} material={mat('yellow')}>
        <boxGeometry args={[5.2, 0.3, 0.05]} />
      </mesh>
      <mesh position={[0, 2.4, -6]} material={mat('navy')}>
        <boxGeometry args={[5.5, 4.8, 12]} />
      </mesh>
    </group>
  );
}
```

`src/world/props/street.tsx`:
```tsx
import { Text } from '@react-three/drei';
import type { GroupProps } from '@react-three/fiber';
import { PALETTE, type PaletteName } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export function Cone(props: GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} material={mat('orange')} castShadow>
        <coneGeometry args={[0.3, 0.9, 12]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={mat('pale')}>
        <cylinderGeometry args={[0.2, 0.24, 0.12, 12]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={mat('navy')}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
      </mesh>
    </group>
  );
}

export function Barrier(props: GroupProps) {
  return (
    <group {...props}>
      {[-0.9, 0.9].map((dx) => (
        <mesh key={dx} position={[dx, 0.5, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.12, 1, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} material={mat('yellow')} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.1]} />
      </mesh>
      {[-0.55, 0, 0.55].map((dx) => (
        <mesh key={dx} position={[dx, 0.85, 0.06]} material={mat('navy')}>
          <boxGeometry args={[0.2, 0.3, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

export function SprayCan({ cap = 'cyan', ...props }: GroupProps & { cap?: PaletteName }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} material={mat('navy')} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 12]} />
      </mesh>
      <mesh position={[0, 0.66, 0]} material={mat(cap)}>
        <cylinderGeometry args={[0.1, 0.12, 0.12, 12]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={mat('pale')}>
        <cylinderGeometry args={[0.165, 0.165, 0.2, 12]} />
      </mesh>
    </group>
  );
}

export function Poster({ word, accent = 'orange', ...props }: GroupProps & { word: string; accent?: PaletteName }) {
  return (
    <group {...props}>
      <mesh material={mat('pale')}>
        <planeGeometry args={[1.6, 2.2]} />
      </mesh>
      <mesh position={[0.6, 0.9, 0.01]} material={mat(accent)}>
        <planeGeometry args={[0.4, 0.4]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.36} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, -0.2, 0.02]} maxWidth={1.4}>
        {word}
      </Text>
    </group>
  );
}

export function Sneaker({ color = 'yellow', ...props }: GroupProps & { color?: PaletteName }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.14, 0]} material={mat(color)} castShadow>
        <boxGeometry args={[0.5, 0.22, 0.26]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={mat('pale')}>
        <boxGeometry args={[0.54, 0.06, 0.3]} />
      </mesh>
      <mesh position={[0.05, 0.28, 0]} material={mat('navy')}>
        <boxGeometry args={[0.3, 0.06, 0.28]} />
      </mesh>
    </group>
  );
}

export function Skateboard(props: GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 0.16, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.32]} />
      </mesh>
      {[-0.35, 0.35].flatMap((dx) => [-0.14, 0.14].map((dz) => (
        <mesh key={`${dx}${dz}`} position={[dx, 0.08, dz]} rotation-x={Math.PI / 2} material={mat('yellow')}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 10]} />
        </mesh>
      )))}
    </group>
  );
}
```

- [ ] **Step 6: Compose the structure in `src/world/World.tsx`**

```tsx
import { ZONES, PLATFORM_X1, RIGHT_WALL_X, WORLD_Z_END } from './layout';
import { Floor } from './props/Floor';
import { Pillars } from './props/Pillars';
import { Platform } from './props/Platform';
import { Rails } from './props/Rails';
import { Barrier, Cone, Poster, Skateboard, Sneaker, SprayCan } from './props/street';
import { TunnelMouth } from './props/TunnelMouth';
import { Wall } from './props/Wall';

/** Everything that spans the whole hall lives here; zone-specific set pieces are added as zones. */
export function World() {
  return (
    <group>
      <Floor />
      <Rails z0={ZONES.TRACKS.z0 + 20} z1={WORLD_Z_END} />
      <Platform z0={ZONES.HALL.z0} z1={WORLD_Z_END} />
      <Wall side="left" z0={ZONES.TRACKS.z0} z1={WORLD_Z_END} />
      <Wall side="right" z0={ZONES.TRACKS.z0} z1={WORLD_Z_END} />
      <Pillars z0={ZONES.HALL.z0} z1={WORLD_Z_END} x={PLATFORM_X1 - 1.2} />
      <TunnelMouth z={ZONES.TRACKS.z0 - 2} />

      {/* HALL dressing */}
      <Poster word="RUN" position={[RIGHT_WALL_X - 0.05, 3.2, -28]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="GO!" accent="cyan" position={[RIGHT_WALL_X - 0.05, 3.2, -34]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="HACK" accent="red" position={[RIGHT_WALL_X - 0.05, 3.2, -44]} rotation={[0, -Math.PI / 2, 0]} />
      <Cone position={[5.5, 0.6, -27]} />
      <Cone position={[6.2, 0.6, -27.9]} />
      <Barrier position={[2, 0.6, -46]} rotation={[0, 0.3, 0]} />
      <SprayCan position={[7.5, 0.6, -31]} cap="cyan" />
      <SprayCan position={[7.9, 0.6, -31.3]} cap="red" />
      <Skateboard position={[4.5, 0.6, -38]} rotation={[0, 0.8, 0]} />
      <Sneaker position={[6.8, 0.6, -41]} rotation={[0, -0.5, 0]} color="cyan" />
      <Sneaker position={[7.3, 0.6, -41.2]} rotation={[0, 0.2, 0]} color="yellow" />
    </group>
  );
}
```

- [ ] **Step 7: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: start the dev server, open `/`. Expect: yellow rails on the left, pale platform with a yellow safety line, pale walls with navy beams and an orange trim, navy pillars, three posters, cones and spray cans on the platform; the tunnel frame behind. Everything pale/navy/yellow/orange — nothing dark. No console errors. Stop the server.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): procedural station structure — rails, platform, walls, pillars, street props

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 13: Graffiti painter, graffiti walls and the train

**Files:**
- Create: `src/lib/graffiti.ts`, `src/world/props/GraffitiWall.tsx`, `src/world/props/Train.tsx`, `src/world/cinematic/introBus.ts`
- Modify: `src/world/World.tsx`
- Test: `tests/lib/graffiti.test.ts`

**Interfaces:**
- `graffiti.ts`: `GraffitiSpec { words: string[]; base: PaletteName; ink: PaletteName; accents: PaletteName[]; seed: number }`, `layoutGraffiti(spec, w, h): GraffitiItem[]` (pure, deterministic per seed), `paintGraffiti(ctx: CanvasRenderingContext2D, items, w, h, reveal, base)`, `seededRandom(seed)`.
- `GraffitiWall({ spec, position, rotation, width, height, revealFrom?: 'intro' | 'always' })` — paints to a `CanvasTexture`; when `revealFrom='intro'` it re-paints while `introBus.reveal` changes.
- `Train({ cars, z, speed?, doorsOpen?, ... })` — navy cars with a yellow band, pale windows, wheels that spin with `speed`; exposes a `ref` to the group for the cinematic.
- `introBus`: `{ active: boolean; t: number; trainZ: number; reveal: number }` mutable shared object.

- [ ] **Step 1: Write the failing test**

`tests/lib/graffiti.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { layoutGraffiti, seededRandom, type GraffitiSpec } from '@/lib/graffiti';

const spec: GraffitiSpec = { words: ['RUN', 'HACK'], base: 'pale', ink: 'yellow', accents: ['cyan', 'red'], seed: 7 };

describe('graffiti layout', () => {
  it('is deterministic for a seed and uses only palette names', () => {
    const a = layoutGraffiti(spec, 1024, 512);
    const b = layoutGraffiti(spec, 1024, 512);
    expect(a).toEqual(b);
    expect(a.filter((i) => i.kind === 'word').map((i) => i.text)).toEqual(['RUN', 'HACK']);
    for (const i of a) expect(['yellow', 'cyan', 'red', 'navy']).toContain(i.color);
    expect(a.every((i) => i.x >= 0 && i.x <= 1024 && i.y >= 0 && i.y <= 512)).toBe(true);
  });
  it('seeded random is repeatable in [0,1)', () => {
    const r1 = seededRandom(3); const r2 = seededRandom(3);
    const v = [r1(), r1(), r1()];
    expect(v).toEqual([r2(), r2(), r2()]);
    for (const x of v) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(1); }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/graffiti.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/graffiti.ts`**

```ts
import { PALETTE, type PaletteName } from '@/theme/palette';

export interface GraffitiSpec {
  words: string[];
  base: PaletteName;
  ink: PaletteName;
  accents: PaletteName[];
  seed: number;
}

export type GraffitiItem =
  | { kind: 'word'; text: string; x: number; y: number; size: number; rot: number; color: PaletteName; outline: PaletteName }
  | { kind: 'splat'; x: number; y: number; r: number; color: PaletteName }
  | { kind: 'arrow'; x: number; y: number; len: number; rot: number; color: PaletteName }
  | { kind: 'drip'; x: number; y: number; len: number; color: PaletteName };

/** mulberry32 — tiny deterministic PRNG so walls look the same every visit. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function layoutGraffiti(spec: GraffitiSpec, w: number, h: number): GraffitiItem[] {
  const rnd = seededRandom(spec.seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const items: GraffitiItem[] = [];
  for (let i = 0; i < 6; i++) items.push({ kind: 'splat', x: rnd() * w, y: rnd() * h, r: 30 + rnd() * 90, color: pick(spec.accents) });
  spec.words.forEach((text, i) => {
    const size = Math.min(h * 0.5, (w / spec.words.length) * 0.32);
    items.push({
      kind: 'word', text,
      x: ((i + 0.5) / spec.words.length) * w + (rnd() - 0.5) * w * 0.08,
      y: h * (0.4 + rnd() * 0.25),
      size, rot: (rnd() - 0.5) * 0.25, color: spec.ink, outline: 'navy',
    });
    for (let d = 0; d < 3; d++) items.push({ kind: 'drip', x: ((i + 0.3 + rnd() * 0.4) / spec.words.length) * w, y: h * 0.55, len: 20 + rnd() * 80, color: spec.ink });
  });
  for (let i = 0; i < 4; i++) items.push({ kind: 'arrow', x: rnd() * w, y: rnd() * h, len: 60 + rnd() * 120, rot: rnd() * Math.PI * 2, color: pick(spec.accents) });
  return items;
}

/** Paints `items` onto a 2D context; `reveal` ∈ [0,1] clips the paint left→right for the intro wipe. */
export function paintGraffiti(ctx: CanvasRenderingContext2D, items: GraffitiItem[], w: number, h: number, reveal: number, base: PaletteName) {
  ctx.save();
  ctx.fillStyle = PALETTE[base];
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.rect(0, 0, Math.max(0, Math.min(1, reveal)) * w, h);
  ctx.clip();
  for (const it of items) {
    ctx.fillStyle = PALETTE[it.color];
    ctx.strokeStyle = PALETTE.navy;
    if (it.kind === 'splat') {
      ctx.beginPath();
      for (let k = 0; k < 9; k++) {
        const ang = (k / 9) * Math.PI * 2;
        const rr = it.r * (k % 2 ? 0.6 : 1);
        ctx.lineTo(it.x + Math.cos(ang) * rr, it.y + Math.sin(ang) * rr);
      }
      ctx.closePath(); ctx.fill();
    } else if (it.kind === 'drip') {
      ctx.fillRect(it.x - 6, it.y, 12, it.len);
      ctx.beginPath(); ctx.arc(it.x, it.y + it.len, 9, 0, Math.PI * 2); ctx.fill();
    } else if (it.kind === 'arrow') {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      ctx.lineWidth = 14; ctx.strokeStyle = PALETTE[it.color]; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(it.len, 0); ctx.moveTo(it.len - 30, -26); ctx.lineTo(it.len, 0); ctx.lineTo(it.len - 30, 26); ctx.stroke();
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      ctx.font = `${it.size}px Bungee, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(6, it.size * 0.12); ctx.lineJoin = 'round';
      ctx.strokeStyle = PALETTE[it.outline]; ctx.strokeText(it.text, 0, 0);
      ctx.fillStyle = PALETTE[it.color]; ctx.fillText(it.text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}
```

- [ ] **Step 4: Write `src/world/cinematic/introBus.ts` and `src/world/props/GraffitiWall.tsx`**

`src/world/cinematic/introBus.ts`:
```ts
/** Mutable per-frame state shared between the intro driver, the cinematic train and graffiti walls. */
export const introBus = { active: false, t: 0, trainZ: 30, reveal: 1 };
```

`src/world/props/GraffitiWall.tsx`:
```tsx
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { layoutGraffiti, paintGraffiti, type GraffitiSpec } from '@/lib/graffiti';
import { introBus } from '../cinematic/introBus';

export interface GraffitiWallProps {
  spec: GraffitiSpec;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  revealFrom?: 'intro' | 'always';
}

const PX_PER_UNIT = 64;

export function GraffitiWall({ spec, position, rotation = [0, 0, 0], width, height, revealFrom = 'always' }: GraffitiWallProps) {
  const w = Math.round(width * PX_PER_UNIT);
  const h = Math.round(height * PX_PER_UNIT);
  const items = useMemo(() => layoutGraffiti(spec, w, h), [spec, w, h]);
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return { canvas: c, texture: t };
  }, [w, h]);
  const painted = useRef(-1);

  const paint = (reveal: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    paintGraffiti(ctx, items, w, h, reveal, spec.base);
    texture.needsUpdate = true;
    painted.current = reveal;
  };

  useEffect(() => {
    const initial = () => paint(revealFrom === 'intro' && introBus.active ? introBus.reveal : 1);
    initial();
    // Repaint once Bungee has loaded so the canvas text uses the display face, not the fallback.
    document.fonts?.ready.then(() => { painted.current = -1; initial(); });
  }, [items, revealFrom]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (revealFrom !== 'intro') return;
    const r = introBus.active ? introBus.reveal : 1;
    if (Math.abs(r - painted.current) > 0.02) paint(r);
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
```

- [ ] **Step 5: Write `src/world/props/Train.tsx`**

```tsx
import { forwardRef, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { TRACK_X } from '../layout';
import { mat } from '../materials';

export interface TrainProps {
  cars?: number;
  z?: number;
  x?: number;
  rotationY?: number;  // π turns the headlamp to face −Z (the direction trains travel in the intro)
  speed?: number;      // world units / s, used only to spin wheels
  doorsOpen?: number;  // 0..1 (static)
  doorsRef?: RefObject<{ v: number }>; // 0..1, read every frame — overrides doorsOpen when given
  band?: 'yellow' | 'cyan' | 'orange' | 'red';
}

const CAR_LEN = 7.6;
const GAP = 0.4;

/** Navy subway cars with a coloured band, pale windows, yellow-hub wheels and sliding doors. Car 0 carries the headlamp on its +Z face. */
export const Train = forwardRef<Group, TrainProps>(function Train({ cars = 3, z = 0, x = TRACK_X, rotationY = 0, speed = 0, doorsOpen = 0, doorsRef, band = 'yellow' }, ref) {
  const wheels = useRef<Mesh[]>([]);
  const doors = useRef<{ mesh: Mesh; dir: number }[]>([]);
  useFrame((_, delta) => {
    for (const w of wheels.current) if (w) w.rotation.x -= speed * delta / 0.45;
    const open = doorsRef?.current?.v ?? doorsOpen;
    for (const d of doors.current) if (d) d.mesh.position.z = d.dir * (1.3 + open * 1.0);
  });

  return (
    <group ref={ref} position={[x, 0, z]} rotation-y={rotationY}>
      {Array.from({ length: cars }, (_, i) => {
        const cz = -i * (CAR_LEN + GAP);
        return (
          <group key={i} position={[0, 0, cz]}>
            <mesh position={[0, 2.0, 0]} material={mat('navy')} castShadow>
              <boxGeometry args={[2.6, 2.6, CAR_LEN]} />
            </mesh>
            <mesh position={[0, 3.4, 0]} material={mat('navy')}>
              <boxGeometry args={[2.2, 0.3, CAR_LEN - 0.6]} />
            </mesh>
            {[-1.31, 1.31].map((dx, side) => (
              <group key={dx}>
                <mesh position={[dx, 1.5, 0]} material={mat(band)}>
                  <boxGeometry args={[0.04, 0.5, CAR_LEN - 0.2]} />
                </mesh>
                {[-2.6, 0, 2.6].map((wz) => (
                  <mesh key={wz} position={[dx, 2.5, wz]} material={mat('pale')}>
                    <boxGeometry args={[0.04, 0.9, 1.6]} />
                  </mesh>
                ))}
                {[1, -1].map((dir, d) => (
                  <mesh
                    key={dir}
                    ref={(m) => { if (m) doors.current[i * 4 + side * 2 + d] = { mesh: m, dir }; }}
                    position={[dx, 1.7, dir * (1.3 + doorsOpen * 1.0)]}
                    material={mat('pale')}
                  >
                    <boxGeometry args={[0.06, 2.0, 1.0]} />
                  </mesh>
                ))}
              </group>
            ))}
            {[-2.6, 2.6].flatMap((wz, a) => [-1.0, 1.0].map((dx, b) => (
              <mesh key={`${wz}${dx}`} ref={(m) => { if (m) wheels.current[i * 4 + a * 2 + b] = m; }} position={[dx, 0.45, wz]} rotation-z={Math.PI / 2} material={mat('navy')}>
                <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
              </mesh>
            )))}
            {[-2.6, 2.6].flatMap((wz) => [-1.16, 1.16].map((dx) => (
              <mesh key={`h${wz}${dx}`} position={[dx, 0.45, wz]} rotation-z={Math.PI / 2} material={mat('yellow')}>
                <cylinderGeometry args={[0.18, 0.18, 0.04, 10]} />
              </mesh>
            )))}
            {i === 0 && (
              <mesh position={[0, 1.6, CAR_LEN / 2 + 0.02]} material={mat('yellow', 'emissive')}>
                <boxGeometry args={[1.2, 0.3, 0.05]} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
});
```

- [ ] **Step 6: Add graffiti walls and a parked train to `src/world/World.tsx`**

Add imports:
```tsx
import { GraffitiWall } from './props/GraffitiWall';
import { Train } from './props/Train';
import { LEFT_WALL_X } from './layout';
```
Inside the `HALL dressing` block add:
```tsx
      <GraffitiWall
        spec={{ words: ['RUN', 'THE', 'LINE'], base: 'pale', ink: 'yellow', accents: ['cyan', 'red', 'orange'], seed: 11 }}
        position={[LEFT_WALL_X + 0.06, 4.2, -36]} rotation={[0, Math.PI / 2, 0]} width={22} height={6} revealFrom="intro"
      />
      <GraffitiWall
        spec={{ words: ['AI EXPO'], base: 'pale', ink: 'cyan', accents: ['yellow', 'red'], seed: 23 }}
        position={[RIGHT_WALL_X - 0.06, 5.2, -60]} rotation={[0, -Math.PI / 2, 0]} width={14} height={4} revealFrom="intro"
      />
      <Train cars={2} z={-66} doorsOpen={0} band="cyan" />
```

- [ ] **Step 7: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: on `/`, the left hall wall shows big yellow `RUN THE LINE` letters with navy outlines, cyan/red splats and drips; a two-car navy train with a cyan band sits down the line. Stop the server.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): runtime-painted graffiti walls and procedural train

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 14: Route doors, kiosk, departure boards, coin prop and the ROUTES/LINE/BOARD/CHECKIN zones

**Files:**
- Create: `src/world/props/RouteDoor.tsx`, `src/world/props/Kiosk.tsx`, `src/world/props/DepartureBoard.tsx`, `src/world/props/Coin.tsx`, `src/world/props/CheckinArch.tsx`, `src/world/zones/Routes.tsx`, `src/world/zones/Line.tsx`, `src/world/zones/Board.tsx`, `src/world/zones/Checkin.tsx`, `src/hooks/useWorldEvents.ts`
- Modify: `src/store/world.ts` (door mode/selection/handler), `src/world/World.tsx`
- Test: `tests/store/world.test.ts` (extend), `tests/hooks/useWorldEvents.test.ts`

**Interfaces:**
- `useWorld` additions: `doorMode: 'showcase' | 'select'`, `selectedDomain: DomainId | null`, `doorHandler: ((id: DomainId) => void) | null`, `setDoorMode`, `setSelectedDomain`, `setDoorHandler`.
- `useWorldEvents(type, handler)` — in-canvas hook: calls `handler(event)` once per new event of `type` (drains in `useFrame`). `consumeEvents(events, type, seen: Set<number>)` pure helper.
- `RouteDoor({ domain, z })` reads hover/selection from the store; `Kiosk({ position })` + `ZoneLight({ position, zones, color? })` (exported from `Kiosk.tsx`, reused by the locker); `DepartureBoard({ position, rotation, width, height, title, live? })`; `Coin({ position, spin? })`; `CheckinArch({ z })`.
- Door z positions: `DOOR_Z: Record<DomainId, number>` = `{ ai: -56, data: -63, cyber: -70, future: -77 }` — defined in `src/world/layout.ts` (DOM-safe) and used by the zone and the domain page.

- [ ] **Step 1: Write the failing tests**

Append to `tests/store/world.test.ts`:
```ts
  it('tracks door mode, selection and a click handler', () => {
    const calls: string[] = [];
    useWorld.getState().setDoorMode('select');
    useWorld.getState().setSelectedDomain('cyber');
    useWorld.getState().setDoorHandler((id) => calls.push(id));
    useWorld.getState().doorHandler?.('ai');
    expect(useWorld.getState().doorMode).toBe('select');
    expect(useWorld.getState().selectedDomain).toBe('cyber');
    expect(calls).toEqual(['ai']);
    useWorld.getState().setDoorHandler(null);
  });
```

`tests/hooks/useWorldEvents.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { consumeEvents } from '@/hooks/useWorldEvents';
import type { WorldEvent } from '@/store/world';

describe('consumeEvents', () => {
  it('returns each matching event once', () => {
    const seen = new Set<number>();
    const events: WorldEvent[] = [
      { id: 1, type: 'burst', at: 0 }, { id: 2, type: 'pulse', at: 0 }, { id: 3, type: 'burst', at: 0 },
    ];
    expect(consumeEvents(events, 'burst', seen).map((e) => e.id)).toEqual([1, 3]);
    expect(consumeEvents(events, 'burst', seen)).toEqual([]);
    expect(consumeEvents([...events, { id: 4, type: 'burst', at: 0 }], 'burst', seen).map((e) => e.id)).toEqual([4]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/store/world.test.ts tests/hooks`
Expected: FAIL — `setDoorMode` undefined; hook module not found.

- [ ] **Step 3: Extend `src/store/world.ts`**

Add to the imports: `import type { DomainId } from '@/config/event';`
Add to `WorldState`:
```ts
  doorMode: 'showcase' | 'select';
  selectedDomain: DomainId | null;
  doorHandler: ((id: DomainId) => void) | null;
  setDoorMode(mode: 'showcase' | 'select'): void;
  setSelectedDomain(id: DomainId | null): void;
  setDoorHandler(fn: ((id: DomainId) => void) | null): void;
```
Add to the store object:
```ts
  doorMode: 'showcase',
  selectedDomain: null,
  doorHandler: null,
  setDoorMode: (doorMode) => set({ doorMode }),
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setDoorHandler: (doorHandler) => set({ doorHandler }),
```

- [ ] **Step 4: Write `src/hooks/useWorldEvents.ts`**

```ts
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorld, type WorldEvent, type WorldEventType } from '@/store/world';

export function consumeEvents(events: WorldEvent[], type: WorldEventType, seen: Set<number>): WorldEvent[] {
  const out: WorldEvent[] = [];
  for (const e of events) {
    if (e.type !== type || seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  if (seen.size > 500) { const keep = events.map((e) => e.id); seen.forEach((id) => { if (!keep.includes(id)) seen.delete(id); }); }
  return out;
}

/** Inside the canvas: run `handler` once for every new world event of `type`. Also prunes stale events. */
export function useWorldEvents(type: WorldEventType, handler: (e: WorldEvent) => void) {
  const seen = useRef(new Set<number>());
  useFrame(() => {
    const w = useWorld.getState();
    for (const e of consumeEvents(w.events, type, seen.current)) handler(e);
    if (w.events.length && Date.now() - w.events[0].at > 3000) w.prune(Date.now());
  });
}
```

- [ ] **Step 5: Write `src/world/props/RouteDoor.tsx`**

```tsx
import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Group, Mesh } from 'three';
import type { DomainConfig, DomainId } from '@/config/event';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { LEFT_WALL_X } from '../layout';
import { mat } from '../materials';

const W = 4.4, H = 5.2, DEPTH = 3;

function Interior({ id }: { id: DomainId }) {
  const g = useRef<Group>(null);
  useFrame((s) => { if (g.current) { g.current.rotation.y = s.clock.elapsedTime * 0.6; g.current.position.y = 2.4 + Math.sin(s.clock.elapsedTime * 1.4) * 0.15; } });
  return (
    <group ref={g} position={[-1.2, 2.4, 0]}>
      {id === 'ai' && (<><mesh material={mat('yellow')} position={[0, 0, 0]}><octahedronGeometry args={[0.55]} /></mesh><mesh material={mat('yellow')} position={[0.8, 0.5, 0.3]}><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh><mesh material={mat('yellow')} position={[-0.7, -0.4, -0.3]}><tetrahedronGeometry args={[0.45]} /></mesh></>)}
      {id === 'data' && [0.3, 0.7, 1.1, 0.5].map((h, i) => (<mesh key={i} material={mat('cyan')} position={[-0.9 + i * 0.6, h / 2 - 0.6, 0]}><boxGeometry args={[0.4, h, 0.4]} /></mesh>))}
      {id === 'cyber' && (<><mesh material={mat('red')} position={[0, -0.2, 0]}><boxGeometry args={[1.1, 0.9, 0.5]} /></mesh><mesh material={mat('red')} position={[0, 0.55, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.4, 0.12, 8, 16]} /></mesh></>)}
      {id === 'future' && [0.9, 0.6, 0.3].map((r, i) => (<mesh key={i} material={mat('orange')} rotation-x={Math.PI / 2 + i * 0.5}><torusGeometry args={[r, 0.08, 8, 24]} /></mesh>))}
    </group>
  );
}

/** A subway-door portal set into the left wall. Hover/select/dim states come from the world store. */
export function RouteDoor({ domain, z }: { domain: DomainConfig; z: number }) {
  const hovered = useWorld((s) => s.hovered === `door:${domain.id}`);
  const selected = useWorld((s) => s.selectedDomain === domain.id);
  const mode = useWorld((s) => s.doorMode);
  const anySelected = useWorld((s) => s.selectedDomain != null);
  const dimmed = mode === 'select' && anySelected && !selected;
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const root = useRef<Group>(null);

  useFrame((_, delta) => {
    const open = selected ? 1.7 : hovered ? 0.35 : 0;
    if (left.current) damp(left.current.position, 'z', -0.95 - open, 0.25, delta);
    if (right.current) damp(right.current.position, 'z', 0.95 + open, 0.25, delta);
    if (root.current) damp(root.current.position, 'x', LEFT_WALL_X + (hovered && !selected ? 0.25 : 0), 0.2, delta);
  });

  const panel = dimmed ? mat('navy') : mat(domain.color);
  const strip = hovered || selected ? mat('cyan', 'emissive') : mat('pale');
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  const w = useWorld.getState();

  return (
    <group
      ref={root}
      position={[LEFT_WALL_X, 0, z]}
      onPointerOver={(e) => { stop(e); w.setHovered(`door:${domain.id}`); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { stop(e); if (useWorld.getState().hovered === `door:${domain.id}`) useWorld.getState().setHovered(null); document.body.style.cursor = ''; }}
      onClick={(e) => { stop(e); useWorld.getState().doorHandler?.(domain.id); }}
    >
      {/* portal box protruding into the hall; open front face at x = DEPTH */}
      <mesh position={[DEPTH / 2, H / 2 + 0.6, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[DEPTH, H + 0.6, W + 0.6]} />
      </mesh>
      <mesh position={[DEPTH / 2 + 0.01, H / 2 + 0.6, 0]} material={dimmed ? mat('navy') : mat(domain.color, 'emissive')}>
        <boxGeometry args={[DEPTH - 0.4, H - 0.2, W - 0.2]} />
      </mesh>
      <group position={[DEPTH + 0.05, 0, 0]}>
        <Interior id={domain.id} />
      </group>
      <mesh ref={left} position={[DEPTH + 0.02, H / 2 + 0.6, -0.95]} material={panel} castShadow>
        <boxGeometry args={[0.12, H - 0.2, 1.9]} />
      </mesh>
      <mesh ref={right} position={[DEPTH + 0.02, H / 2 + 0.6, 0.95]} material={panel} castShadow>
        <boxGeometry args={[0.12, H - 0.2, 1.9]} />
      </mesh>
      <mesh position={[DEPTH + 0.1, H + 0.75, 0]} material={strip}>
        <boxGeometry args={[0.15, 0.2, W]} />
      </mesh>
      <group position={[DEPTH + 0.12, H + 1.5, 0]} rotation-y={Math.PI / 2}>
        <mesh material={dimmed ? mat('navy') : mat('pale')}>
          <boxGeometry args={[W, 1.0, 0.12]} />
        </mesh>
        <Text font={BUNGEE_URL} fontSize={0.5} color={dimmed ? PALETTE.pale : PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 0, 0.08]}>
          {`${domain.number} ${domain.name}`}
        </Text>
      </group>
    </group>
  );
}
```

- [ ] **Step 6: Write `Kiosk.tsx`, `DepartureBoard.tsx`, `Coin.tsx`, `CheckinArch.tsx`**

`src/world/props/Kiosk.tsx`:
```tsx
import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { PointLight } from 'three';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

/** Accent light that flares on `pulse`/`burst` events addressed to any of its `zones`, then decays. */
export function ZoneLight({ position, zones, color = 'cyan' }: { position: [number, number, number]; zones: string[]; color?: 'cyan' | 'yellow' }) {
  const light = useRef<PointLight>(null);
  const target = useRef(0.8);
  const hit = (zone?: string) => { if (!zone || zones.includes(zone)) target.current = 6; };
  useWorldEvents('pulse', (e) => hit(e.zone));
  useWorldEvents('burst', (e) => hit(e.zone));
  useFrame((_, delta) => {
    if (!light.current) return;
    damp(light.current, 'intensity', target.current, 0.12, delta);
    target.current = Math.max(0.8, target.current - delta * 9);
  });
  return <pointLight ref={light} color={PALETTE[color]} intensity={0.8} distance={14} position={position} />;
}

export function Kiosk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[2.4, 2.6, 1]} />
      </mesh>
      <mesh position={[0, 1.7, 0.52]} rotation-x={-0.18} material={mat('pale', 'emissive')}>
        <boxGeometry args={[2.0, 1.3, 0.06]} />
      </mesh>
      {[-0.6, 0, 0.6].map((dx) => (
        <mesh key={dx} position={[dx, 0.8, 0.52]} material={mat('yellow')}>
          <boxGeometry args={[0.4, 0.2, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, 2.95, 0]} material={mat('orange')} castShadow>
        <boxGeometry args={[2.6, 0.6, 1.1]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.32} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 2.95, 0.58]}>
        CHECK-IN
      </Text>
      <ZoneLight position={[0, 3.6, 2]} zones={['kiosk', 'checkin']} />
    </group>
  );
}
```

`src/world/props/DepartureBoard.tsx`:
```tsx
import { Text } from '@react-three/drei';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export interface DepartureBoardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  title: string;
  live?: boolean;
  rows?: number;
}

/** Navy board with a yellow header and pale flap rows. Row text is rendered by the DOM overlay. */
export function DepartureBoard({ position, rotation = [0, 0, 0], width = 8, height = 4, title, live, rows = 5 }: DepartureBoardProps) {
  const rowH = (height - 1) / rows;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat('navy')} castShadow>
        <boxGeometry args={[width, height, 0.3]} />
      </mesh>
      <mesh position={[0, height / 2 - 0.45, 0.16]} material={mat('yellow')}>
        <boxGeometry args={[width - 0.3, 0.7, 0.04]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.4} color={PALETTE.navy} anchorX="left" anchorY="middle" position={[-width / 2 + 0.4, height / 2 - 0.45, 0.2]}>
        {title}
      </Text>
      {live && (
        <group position={[width / 2 - 0.9, height / 2 - 0.45, 0.2]}>
          <mesh material={mat('red')}><boxGeometry args={[1.2, 0.45, 0.04]} /></mesh>
          <Text font={BUNGEE_URL} fontSize={0.26} color={PALETTE.white} anchorX="center" anchorY="middle" position={[0, 0, 0.03]}>LIVE</Text>
        </group>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <mesh key={i} position={[0, height / 2 - 1.1 - rowH * (i + 0.5), 0.16]} material={mat('pale')}>
          <boxGeometry args={[width - 0.5, rowH - 0.12, 0.04]} />
        </mesh>
      ))}
    </group>
  );
}
```

`src/world/props/Coin.tsx`:
```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { mat } from '../materials';

export function Coin({ position, spin = 1.6 }: { position: [number, number, number]; spin?: number }) {
  const g = useRef<Group>(null);
  useFrame((s, delta) => { if (g.current) { g.current.rotation.y += spin * delta; g.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[2]) * 0.08; } });
  return (
    <group ref={g} position={position}>
      <mesh rotation-x={Math.PI / 2} material={mat('yellow', 'emissive')} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.08, 20]} />
      </mesh>
      <mesh material={mat('navy')}>
        <torusGeometry args={[0.24, 0.03, 6, 20]} />
      </mesh>
    </group>
  );
}
```

`src/world/props/CheckinArch.tsx`:
```tsx
import { PLATFORM_X0, PLATFORM_X1, PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Sign } from './Sign';

/** Painted navy arch across the platform with the RUNNER CHECK-IN sign. */
export function CheckinArch({ z }: { z: number }) {
  const xc = (PLATFORM_X0 + PLATFORM_X1) / 2;
  const span = PLATFORM_X1 - PLATFORM_X0 - 1;
  return (
    <group position={[xc, PLATFORM_Y, z]}>
      {[-span / 2, span / 2].map((dx) => (
        <mesh key={dx} position={[dx, 2.6, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.7, 5.2, 0.7]} />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[span + 0.7, 0.8, 0.7]} />
      </mesh>
      {[-span / 2, span / 2].map((dx) => (
        <mesh key={`b${dx}`} position={[dx, 1.2, 0]} material={mat('orange')}>
          <boxGeometry args={[0.75, 0.5, 0.75]} />
        </mesh>
      ))}
      <Sign text="RUNNER CHECK-IN" position={[0, 6.4, 0.1]} width={7} height={1.2} plate="yellow" ink="navy" size={0.6} />
    </group>
  );
}
```

- [ ] **Step 7: Write the four zone files and mount them**

Append to `src/world/layout.ts`:
```ts
import type { DomainId } from '@/config/event';
/** Z position of each route door on the left wall (ROUTES zone). */
export const DOOR_Z: Record<DomainId, number> = { ai: -56, data: -63, cyber: -70, future: -77 };
```
(Put the import at the top of the file.)

`src/world/zones/Routes.tsx`:
```tsx
import { DOMAINS } from '@/config/event';
import { DOOR_Z } from '../layout';
import { RouteDoor } from '../props/RouteDoor';

export function Routes() {
  return <group>{DOMAINS.map((d) => <RouteDoor key={d.id} domain={d} z={DOOR_Z[d.id]} />)}</group>;
}
```

`src/world/zones/Line.tsx`:
```tsx
import { RIGHT_WALL_X } from '../layout';
import { DepartureBoard } from '../props/DepartureBoard';
import { Poster } from '../props/street';

export function Line() {
  return (
    <group>
      <DepartureBoard title="THE LINE" position={[RIGHT_WALL_X - 0.35, 4.2, -91]} rotation={[0, -Math.PI / 2, 0]} width={10} height={4.5} rows={6} />
      <Poster word="36H" accent="red" position={[RIGHT_WALL_X - 0.05, 3, -84]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="BUILD" accent="cyan" position={[RIGHT_WALL_X - 0.05, 3, -98]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}
```

`src/world/zones/Board.tsx`:
```tsx
import { RIGHT_WALL_X } from '../layout';
import { DepartureBoard } from '../props/DepartureBoard';

export function Board() {
  return (
    <group>
      <DepartureBoard title="THE RUNNERS" live position={[RIGHT_WALL_X - 0.35, 4.6, -111]} rotation={[0, -Math.PI / 2, 0]} width={12} height={5.5} rows={6} />
    </group>
  );
}
```

`src/world/zones/Checkin.tsx`:
```tsx
import { PLATFORM_Y } from '../layout';
import { CheckinArch } from '../props/CheckinArch';
import { Kiosk } from '../props/Kiosk';
import { Cone, SprayCan } from '../props/street';

export function Checkin() {
  return (
    <group>
      <CheckinArch z={-130} />
      <Kiosk position={[4, PLATFORM_Y, -135]} />
      <Cone position={[0.5, PLATFORM_Y, -132]} />
      <SprayCan position={[7.5, PLATFORM_Y, -133]} cap="yellow" />
      <SprayCan position={[7.9, PLATFORM_Y, -133.4]} cap="red" />
    </group>
  );
}
```

In `src/world/World.tsx` add imports and mount after the HALL dressing:
```tsx
import { Routes } from './zones/Routes';
import { Line } from './zones/Line';
import { Board } from './zones/Board';
import { Checkin } from './zones/Checkin';
…
      <Routes />
      <Line />
      <Board />
      <Checkin />
```

- [ ] **Step 8: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: navigate to `/signin` (camera dollies to the kiosk with the yellow RUNNER CHECK-IN sign on a navy arch); then `/register/identity` shows nothing new yet (wall zone is Task 22) — fine. Temporarily check doors by opening `/` and scrolling is not wired yet, so set the shot by visiting `/register/domain` after calling `useRegistration.getState().complete('identity')` in the console: four portal doors with coloured panels and signs `01 AI … 04 FUTURE TECH`; hover a door → cyan strip lights and the door nudges. Stop the server.

- [ ] **Step 9: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): route doors, kiosk, departure boards, coin prop and mid-hall zones

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 15: Landing scroll — Lenis, scroll progress, section skeleton

**Files:**
- Create: `src/hooks/useLenis.ts`, `src/pages/Landing/sections.ts`, `src/pages/Landing/Section.tsx`
- Modify: `src/pages/Landing/index.tsx`, `src/App.tsx` (mount `LenisRoot`)
- Test: `tests/pages/landing/sections.test.ts`

**Interfaces:**
- `useLenis.ts`: `LenisRoot()` component (mounts Lenis only on `/`, streams progress into `useWorld.scrollT`, honours `scrollLocked`, smooth-scrolls same-page anchors), `getLenis(): Lenis | null`, `scrollToId(id)`.
- `sections.ts`: `LANDING_SECTIONS: { id; label }[]` (hero, domains, challenge, leaderboard, checkin, footer), `sectionWindow(index)` → `{ start, end }` in scroll-t, `activeSection(t)`.
- `Section({ id, children, className? })` — a `min-h-dvh` snap section with `whileInView` fade-in.

- [ ] **Step 1: Write the failing test**

`tests/pages/landing/sections.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { activeSection, LANDING_SECTIONS, sectionWindow } from '@/pages/Landing/sections';

describe('landing sections', () => {
  it('has six sections in order', () => {
    expect(LANDING_SECTIONS.map((s) => s.id)).toEqual(['hero', 'domains', 'challenge', 'leaderboard', 'checkin', 'footer']);
  });
  it('splits scroll progress evenly', () => {
    expect(sectionWindow(0)).toEqual({ start: 0, end: 0.2 });
    expect(sectionWindow(5)).toEqual({ start: 1, end: 1 });
    expect(activeSection(0)).toBe('hero');
    expect(activeSection(0.45)).toBe('challenge');
    expect(activeSection(1)).toBe('footer');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/pages/Landing/sections.ts`**

```ts
export const LANDING_SECTIONS = [
  { id: 'hero', label: 'RUN' },
  { id: 'domains', label: 'DOMAINS' },
  { id: 'challenge', label: 'CHALLENGE' },
  { id: 'leaderboard', label: 'LEADERBOARD' },
  { id: 'checkin', label: 'CHECK-IN' },
  { id: 'footer', label: 'END OF LINE' },
] as const;

export type SectionId = (typeof LANDING_SECTIONS)[number]['id'];

const N = LANDING_SECTIONS.length;

/** Scroll-t window during which the camera travels from section i to i+1 (6 sections → 5 intervals). */
export function sectionWindow(i: number): { start: number; end: number } {
  const start = i / (N - 1);
  return { start, end: Math.min(1, (i + 1) / (N - 1)) };
}

export function activeSection(t: number): SectionId {
  const i = Math.min(N - 1, Math.round(Math.min(1, Math.max(0, t)) * (N - 1)));
  return LANDING_SECTIONS[i].id;
}
```

- [ ] **Step 4: Write `src/hooks/useLenis.ts`**

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';
import { useWorld } from '@/store/world';

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { immediate, offset: 0 });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
}

/** Mount once in the Shell. Runs Lenis only on the landing route and mirrors progress into the world store. */
export function LenisRoot() {
  const { pathname, hash } = useLocation();
  const locked = useWorld((s) => s.scrollLocked);

  useEffect(() => {
    if (pathname !== '/') { useWorld.getState().setScrollT(0); return; }
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    instance = lenis;
    let raf = requestAnimationFrame(function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop); });
    lenis.on('scroll', (l: Lenis) => useWorld.getState().setScrollT(l.limit > 0 ? l.scroll / l.limit : 0));
    if (hash) requestAnimationFrame(() => scrollToId(hash.slice(1), true));
    return () => { cancelAnimationFrame(raf); lenis.destroy(); instance = null; };
  }, [pathname, hash]);

  useEffect(() => {
    if (!instance) return;
    if (locked) instance.stop(); else instance.start();
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }, [locked]);

  return null;
}
```

- [ ] **Step 5: Write `src/pages/Landing/Section.tsx` and the Landing skeleton**

`src/pages/Landing/Section.tsx`:
```tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Section({ id, children, className = '', align = 'start' }: { id: string; children: ReactNode; className?: string; align?: 'start' | 'end' | 'center' }) {
  const reduced = useReducedMotion();
  const justify = align === 'end' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  return (
    <section id={id} className={`pointer-none relative flex min-h-dvh snap-start items-center px-5 py-24 md:px-12 ${justify} ${className}`}>
      <motion.div
        className="w-full max-w-xl"
        initial={reduced ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.4, once: false }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
```

`src/pages/Landing/index.tsx`:
```tsx
import { LANDING_SECTIONS } from './sections';
import { Section } from './Section';

const HEADLINE: Record<string, string> = {
  hero: 'RUN THE HACKATHON.', domains: 'CHOOSE YOUR ROUTE', challenge: 'THE LINE', leaderboard: 'THE RUNNERS', checkin: 'RUNNER CHECK-IN', footer: 'END OF LINE',
};

export default function Landing() {
  return (
    <main className="relative z-10 snap-y snap-mandatory md:snap-none">
      {LANDING_SECTIONS.map((s, i) => (
        <Section key={s.id} id={s.id} align={i % 2 ? 'end' : 'start'}>
          <h1 className="pointer-auto font-display text-4xl text-navy md:text-6xl">{HEADLINE[s.id]}</h1>
        </Section>
      ))}
    </main>
  );
}
```

- [ ] **Step 6: Mount `LenisRoot` in `Shell` (`src/App.tsx`)**

Add `import { LenisRoot } from '@/hooks/useLenis';` and render `<LenisRoot />` right after `<RouteShotSync />`.

- [ ] **Step 7: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: on `/`, scrolling is smooth and the camera runs down the hall: hero view → the four doors slide past on the left → THE LINE board on the right → THE RUNNERS board → the check-in arch and kiosk → footer. The HUD mini-track dot moves with scroll. Section headlines fade in. Stop the server.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): landing scroll with Lenis-driven camera spline and section skeleton

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 16: Intro cinematic

**Files:**
- Create: `src/lib/intro.ts`, `src/world/cinematic/Intro.tsx`, `src/pages/Landing/SkipIntro.tsx`
- Modify: `src/world/World.tsx` (mount `<Intro/>`), `src/pages/Landing/index.tsx` (mount `<SkipIntro/>`)
- Test: `tests/lib/intro.test.ts`

**Interfaces:**
- `intro.ts`: `INTRO_DURATION = 4.2`, `IntroFrame { position; lookAt; fov; trainZ; reveal; shake; done }`, `introAt(t): IntroFrame`, `smoothstep(x)`.
- `Intro` (canvas): plays once per session on `/` unless reduced motion or `?nointro=1`; drives camera + `introBus` + a 4-car train; on finish sets `introPlayed`, unlocks scroll.
- `SkipIntro` (DOM): `SKIP ▶` chip visible while `introRunning`; click or `Escape` jumps `introBus.t` to the end.

- [ ] **Step 1: Write the failing test**

`tests/lib/intro.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { INTRO_DURATION, introAt, smoothstep } from '@/lib/intro';
import { SHOTS } from '@/world/shots';

describe('introAt', () => {
  it('starts at rail level with the train behind the camera and nothing painted', () => {
    const f = introAt(0);
    expect(f.position).toEqual([-4, 0.6, -2]);
    expect(f.trainZ).toBe(30);
    expect(f.reveal).toBe(0);
    expect(f.done).toBe(false);
  });
  it('shakes only while the train passes', () => {
    expect(introAt(0.9).shake).toBeGreaterThan(0);
    expect(introAt(3.0).shake).toBe(0);
  });
  it('moves the train forward monotonically and paints the walls by 3.6 s', () => {
    let prev = Infinity;
    for (let t = 0; t <= INTRO_DURATION; t += 0.1) { const z = introAt(t).trainZ; expect(z).toBeLessThanOrEqual(prev); prev = z; }
    expect(introAt(3.6).reveal).toBeCloseTo(1, 5);
    expect(introAt(2.6).reveal).toBeCloseTo(0, 5);
  });
  it('ends exactly on the hero shot', () => {
    const f = introAt(INTRO_DURATION);
    expect(f.position).toEqual(SHOTS.hero.position);
    expect(f.lookAt).toEqual(SHOTS.hero.lookAt);
    expect(f.fov).toBe(SHOTS.hero.fov);
    expect(f.done).toBe(true);
    expect(introAt(99).done).toBe(true);
  });
  it('smoothstep clamps and eases', () => {
    expect(smoothstep(-1)).toBe(0); expect(smoothstep(2)).toBe(1); expect(smoothstep(0.5)).toBe(0.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/intro.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/intro.ts`**

```ts
import { SHOTS } from '@/world/shots';

export const INTRO_DURATION = 4.2;

export interface IntroFrame {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  trainZ: number;
  reveal: number;
  shake: number;
  done: boolean;
}

type V3 = [number, number, number];

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const lerp3 = (a: V3, b: V3, f: number): V3 => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];

const RAIL_POS: V3 = [-4, 0.6, -2];
const RAIL_LOOK: V3 = [-6, 0.8, -20];
const FOLLOW_POS: V3 = [-2, 1.6, -30];
const FOLLOW_LOOK: V3 = [-6, 1.6, -60];
const CAMERA_Z = -2;
const TRAIN_SPEED = 36; // units per second

/**
 * Beats: 0–1.2 train roars past the rail-level camera · 1.2–2.6 camera follows into the hall ·
 * 2.6–3.6 graffiti wipes on · 3.6–4.2 pull back to the hero shot.
 */
export function introAt(t: number): IntroFrame {
  const c = Math.min(INTRO_DURATION, Math.max(0, t));
  const trainZ = 30 - TRAIN_SPEED * c;
  const shake = c < 1.4 && Math.abs(trainZ - CAMERA_Z) < 14 ? 0.03 : 0;

  let position: V3 = RAIL_POS;
  let lookAt: V3 = RAIL_LOOK;
  let fov = 60;
  if (c >= 1.2 && c < 2.6) {
    const f = smoothstep((c - 1.2) / 1.4);
    position = lerp3(RAIL_POS, FOLLOW_POS, f);
    lookAt = lerp3(RAIL_LOOK, FOLLOW_LOOK, f);
  } else if (c >= 2.6 && c < 3.6) {
    position = FOLLOW_POS;
    lookAt = FOLLOW_LOOK;
  } else if (c >= 3.6) {
    const f = smoothstep((c - 3.6) / 0.6);
    position = lerp3(FOLLOW_POS, SHOTS.hero.position, f);
    lookAt = lerp3(FOLLOW_LOOK, SHOTS.hero.lookAt, f);
    fov = lerp(60, SHOTS.hero.fov, f);
  }
  const reveal = c < 2.6 ? 0 : smoothstep((c - 2.6) / 1.0);
  const done = t >= INTRO_DURATION;
  if (done) { position = SHOTS.hero.position; lookAt = SHOTS.hero.lookAt; fov = SHOTS.hero.fov; }
  return { position, lookAt, fov, trainZ, reveal, shake, done };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/intro.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `src/world/cinematic/Intro.tsx`**

```tsx
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, PerspectiveCamera } from 'three';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { introAt } from '@/lib/intro';
import { useWorld } from '@/store/world';
import { mat } from '../materials';
import { Train } from '../props/Train';
import { introBus } from './introBus';

function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/') return false;
  if (new URLSearchParams(window.location.search).has('nointro')) return false;
  if (prefersReducedMotion()) return false;
  return !useWorld.getState().introPlayed;
}

/** Cyan speed streaks trailing the last car (the train is turned to face −Z, so its tail is on +Z). */
function Trail() {
  return (
    <group position={[0, 1.8, 3 * 8 + 6]}>
      {[0, 0.8, -0.8].map((dy, i) => (
        <mesh key={i} position={[i === 0 ? 0 : i === 1 ? -1.4 : 1.4, dy, 2 + i]} material={mat('cyan', 'flat')}>
          <boxGeometry args={[0.15, 0.15, 6 - i]} />
        </mesh>
      ))}
    </group>
  );
}

export function Intro() {
  const camera = useThree((s) => s.camera);
  const train = useRef<Group>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!shouldPlayIntro()) { introBus.active = false; introBus.reveal = 1; return; }
    const w = useWorld.getState();
    introBus.active = true; introBus.t = 0; introBus.reveal = 0; introBus.trainZ = 30;
    w.setIntroRunning(true);
    w.lockScroll(true);
    setPlaying(true);
    return () => { introBus.active = false; w.setIntroRunning(false); w.lockScroll(false); };
  }, []);

  useFrame((_, delta) => {
    if (!introBus.active) return;
    introBus.t += Math.min(delta, 0.05);
    const f = introAt(introBus.t);
    introBus.trainZ = f.trainZ;
    introBus.reveal = f.reveal;
    camera.position.set(
      f.position[0] + (Math.random() - 0.5) * f.shake * 2,
      f.position[1] + (Math.random() - 0.5) * f.shake * 2,
      f.position[2],
    );
    camera.lookAt(f.lookAt[0], f.lookAt[1], f.lookAt[2]);
    if (camera instanceof PerspectiveCamera && camera.fov !== f.fov) { camera.fov = f.fov; camera.updateProjectionMatrix(); }
    if (train.current) train.current.position.z = f.trainZ;
    if (f.done) {
      introBus.active = false;
      introBus.reveal = 1;
      const w = useWorld.getState();
      w.setIntroRunning(false);
      w.setIntroPlayed(true);
      w.lockScroll(false);
      setPlaying(false);
    }
  });

  if (!playing) return null;
  return (
    <group>
      <Train ref={train} cars={4} z={30} rotationY={Math.PI} speed={36} band="yellow" />
      <group position={[-6, 0, 0]}>
        <TrailFollower target={train} />
      </group>
    </group>
  );
}

function TrailFollower({ target }: { target: RefObject<Group | null> }) {
  const g = useRef<Group>(null);
  useFrame(() => { if (g.current && target.current) g.current.position.z = target.current.position.z; });
  return <group ref={g}><Trail /></group>;
}
```

- [ ] **Step 6: Write `src/pages/Landing/SkipIntro.tsx` and mount things**

`src/pages/Landing/SkipIntro.tsx`:
```tsx
import { useEffect } from 'react';
import { INTRO_DURATION } from '@/lib/intro';
import { useWorld } from '@/store/world';
import { introBus } from '@/world/cinematic/introBus';

export function skipIntro() { if (introBus.active) introBus.t = INTRO_DURATION; }

export function SkipIntro() {
  const running = useWorld((s) => s.introRunning);
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') skipIntro(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);
  if (!running) return null;
  return (
    <button type="button" onClick={skipIntro} className="pointer-auto fixed bottom-5 right-5 z-30 border-[3px] border-navy bg-yellow px-4 py-2 font-display text-sm text-navy shadow-bevel-sm">
      SKIP ▶
    </button>
  );
}
```

In `src/world/World.tsx`: `import { Intro } from './cinematic/Intro';` and render `<Intro />` as the last child of the root group.
In `src/pages/Landing/index.tsx`: `import { SkipIntro } from './SkipIntro';` and render `<SkipIntro />` inside `<main>` before the sections.

- [ ] **Step 7: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: open `/` in a fresh tab (or run `sessionStorage.clear()` then reload): camera sits at rail height, a four-car train with a yellow band thunders past with cyan streaks and a slight shake, the camera follows into the hall, `RUN THE LINE` graffiti wipes onto the left wall, then the camera pulls back to the hero shot and scrolling unlocks. `SKIP ▶` works; reload → intro does not replay; `?nointro=1` skips. Stop the server.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): intro cinematic — train pass, follow, graffiti wipe, pull back

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 17: Hero section, START RUNNING auto-run, SIGN IN

**Files:**
- Create: `src/pages/Landing/Hero.tsx`
- Modify: `src/pages/Landing/index.tsx`
- Test: `tests/pages/landing/Hero.test.tsx`

**Interfaces:**
- `Hero()` — renders the event chip, headline, subhead, `▶ START RUNNING` (auto-run) and `SIGN IN` (→ `/signin`), plus the scroll hint. `startAutoRun()` exported for tests: uses Lenis when present, else jumps to `#checkin`.

- [ ] **Step 1: Write the failing test**

`tests/pages/landing/Hero.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '@/pages/Landing/Hero';
import { useWorld } from '@/store/world';

describe('Hero', () => {
  beforeEach(() => { useWorld.setState({ introRunning: false, events: [] }); });

  it('shows the headline, event chip and CTAs', () => {
    render(<MemoryRouter><Hero /></MemoryRouter>);
    expect(screen.getByText('RUN THE HACKATHON.')).toBeInTheDocument();
    expect(screen.getByText('BUILD. COMPETE. CREATE YOUR OWN RUN.')).toBeInTheDocument();
    expect(screen.getByText(/AI EXPO · 14–15 NOV 2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SIGN IN' })).toHaveAttribute('href', '/signin');
  });

  it('START RUNNING falls back to jumping to check-in without Lenis', () => {
    const target = document.createElement('div');
    target.id = 'checkin';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    render(<MemoryRouter><Hero /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: '▶ START RUNNING' }));
    expect(target.scrollIntoView).toHaveBeenCalled();
    target.remove();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/landing/Hero.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/pages/Landing/Hero.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT, formatEventDates } from '@/config/event';
import { getLenis, scrollToId } from '@/hooks/useLenis';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** "The run": ride the whole line to the check-in over ~9 s. Returns false when it fell back to a jump. */
export function startAutoRun(onDone?: () => void): boolean {
  const lenis = getLenis();
  if (!lenis || prefersReducedMotion()) { scrollToId('checkin', true); onDone?.(); return false; }
  lenis.scrollTo(lenis.limit, {
    duration: 9,
    easing: easeInOutCubic,
    onComplete: () => { onDone?.(); document.getElementById('checkin-cta')?.focus(); },
  });
  return true;
}

export function cancelAutoRun() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(lenis.animatedScroll, { immediate: true });
}

export function Hero() {
  const introRunning = useWorld((s) => s.introRunning);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const cancel = () => { cancelAutoRun(); setRunning(false); };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    return () => {
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [running]);

  const onStart = () => { if (startAutoRun(() => setRunning(false))) setRunning(true); };

  return (
    <motion.div
      className="pointer-auto"
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={introRunning ? { opacity: 0, y: 60, scale: 0.94 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: introRunning ? 0 : 0.1 }}
    >
      <p className="mb-4 inline-block border-[3px] border-navy bg-navy px-3 py-1 font-display text-xs tracking-wider text-pale shadow-bevel-yellow">
        {`${EVENT.name} · ${formatEventDates()} · ${EVENT.venue}`}
      </p>
      <h1
        className="font-display text-[clamp(2.6rem,8.5vw,7.5rem)] leading-[0.92] text-navy"
        style={{ textShadow: `0.06em 0.06em 0 ${PALETTE.yellow}` }}
      >
        RUN THE HACKATHON.
      </h1>
      <p className="mt-4 font-display text-base text-navy md:text-2xl">BUILD. COMPETE. CREATE YOUR OWN RUN.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ArcadeButton size="lg" onClick={onStart} aria-pressed={running}>▶ START RUNNING</ArcadeButton>
        <ArcadeButton size="lg" variant="secondary" to="/signin">SIGN IN</ArcadeButton>
      </div>
      <p className="mt-8 font-ui text-sm font-bold tracking-widest text-navy">{running ? 'RUNNING THE LINE — SCROLL TO TAKE OVER' : 'SCROLL TO RIDE THE LINE ↓'}</p>
    </motion.div>
  );
}
```

- [ ] **Step 4: Update `src/pages/Landing/index.tsx`**

```tsx
import { Hero } from './Hero';
import { LANDING_SECTIONS } from './sections';
import { Section } from './Section';
import { SkipIntro } from './SkipIntro';

const HEADLINE: Record<string, string> = {
  domains: 'CHOOSE YOUR ROUTE', challenge: 'THE LINE', leaderboard: 'THE RUNNERS', checkin: 'RUNNER CHECK-IN', footer: 'END OF LINE',
};

export default function Landing() {
  return (
    <main className="relative z-10 snap-y snap-mandatory md:snap-none">
      <SkipIntro />
      {LANDING_SECTIONS.map((s, i) => (
        <Section key={s.id} id={s.id} align={i % 2 ? 'end' : 'start'}>
          {s.id === 'hero' ? <Hero /> : <h2 className="pointer-auto font-display text-4xl text-navy md:text-6xl">{HEADLINE[s.id]}</h2>}
        </Section>
      ))}
    </main>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: after the intro, the navy headline with a yellow offset shadow springs in over the pale hall; `▶ START RUNNING` rides the camera down the whole line over ~9 s and stops at the check-in arch; any scroll takes over immediately. `SIGN IN` dollies to the kiosk. Stop the server.

- [ ] **Step 6: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): hero typography, START RUNNING auto-run and SIGN IN

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 18: Split-flap text, ROUTES cards and THE LINE section

**Files:**
- Create: `src/lib/flap.ts`, `src/ui/SplitFlap.tsx`, `src/pages/Landing/RoutesSection.tsx`, `src/pages/Landing/DomainDetail.tsx`, `src/pages/Landing/LineSection.tsx`
- Modify: `src/pages/Landing/index.tsx`
- Test: `tests/lib/flap.test.ts`, `tests/pages/landing/RoutesSection.test.tsx`, `tests/pages/landing/LineSection.test.tsx`

**Interfaces:**
- `flap.ts`: `FLAP_GLYPHS`, `flapFrame(target, progress, rng)` — chars with index `< progress * length` are settled, others show a random glyph; spaces always settle.
- `SplitFlap({ text, active?, duration?, className? })` — animates from scrambled glyphs to `text` over `duration` ms (default 900); reduced motion → renders `text` directly. Renders `<span aria-label={text}>`.
- `RoutesSection()` — four cards; hover mirrors to `world.hovered = 'door:<id>'`; click (card or in-world door) opens `DomainDetail`.
- `DomainDetail({ domain, onClose })` — theme + problems + `RUN THIS ROUTE` (→ `/register/identity`).
- `LineSection()` — SVG subway map of `TIMELINE_STOPS` + three flap panels (WHAT TO BUILD / JUDGING / PRIZES).

- [ ] **Step 1: Write the failing tests**

`tests/lib/flap.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { FLAP_GLYPHS, flapFrame } from '@/lib/flap';

describe('flapFrame', () => {
  it('settles fully at progress 1 and scrambles at 0 (except spaces)', () => {
    expect(flapFrame('RUN THE LINE', 1, () => 0)).toBe('RUN THE LINE');
    const scrambled = flapFrame('AB CD', 0, () => 0.5);
    expect(scrambled).toHaveLength(5);
    expect(scrambled[2]).toBe(' ');
    for (const ch of scrambled.replace(/ /g, '')) expect(FLAP_GLYPHS).toContain(ch);
  });
  it('settles from the left as progress grows', () => {
    expect(flapFrame('ABCD', 0.5, () => 0).slice(0, 2)).toBe('AB');
  });
});
```

`tests/pages/landing/RoutesSection.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoutesSection } from '@/pages/Landing/RoutesSection';
import { useWorld } from '@/store/world';

describe('RoutesSection', () => {
  beforeEach(() => useWorld.setState({ hovered: null, doorHandler: null, doorMode: 'showcase' }));

  it('renders the four routes and mirrors hover to the world', () => {
    render(<MemoryRouter><RoutesSection /></MemoryRouter>);
    for (const t of ['MAKE MACHINES THINK.', 'FIND THE PATTERN.', 'BREAK IT. SECURE IT.', "BUILD WHAT'S NEXT."]) expect(screen.getByText(t)).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByRole('button', { name: /02 DATA/ }));
    expect(useWorld.getState().hovered).toBe('door:data');
    fireEvent.mouseLeave(screen.getByRole('button', { name: /02 DATA/ }));
    expect(useWorld.getState().hovered).toBeNull();
  });
  it('opens the detail panel from a card or from the in-world door', () => {
    render(<MemoryRouter><RoutesSection /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /03 CYBER/ }));
    expect(screen.getByText(/Find the gap, then close it/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }));
    useWorld.getState().doorHandler?.('ai');
    expect(screen.getByText(/Build systems that learn/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RUN THIS ROUTE' })).toHaveAttribute('href', '/register/identity');
  });
});
```

`tests/pages/landing/LineSection.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LineSection } from '@/pages/Landing/LineSection';

describe('LineSection', () => {
  it('shows every timeline stop, the criteria and the prizes', () => {
    render(<LineSection />);
    for (const t of ['REGISTRATION OPENS', 'KICKOFF', '36H BUILD', 'SUBMISSION DEADLINE', 'JUDGING', 'FINALS']) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.getByText('GRAND PRIZE')).toBeInTheDocument();
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument();
    expect(screen.getByText('Technical depth')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/flap.test.ts tests/pages/landing`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/lib/flap.ts` and `src/ui/SplitFlap.tsx`**

`src/lib/flap.ts`:
```ts
export const FLAP_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+-';

/** Departure-board reveal: characters settle left→right as progress goes 0→1. */
export function flapFrame(target: string, progress: number, rng: () => number = Math.random): string {
  const settled = Math.floor(Math.min(1, Math.max(0, progress)) * target.length + 1e-9);
  let out = '';
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out += ch === ' ' || i < settled ? ch : FLAP_GLYPHS[Math.floor(rng() * FLAP_GLYPHS.length)];
  }
  return out;
}
```

`src/ui/SplitFlap.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { flapFrame } from '@/lib/flap';

export function SplitFlap({ text, active = true, duration = 900, className = '' }: { text: string; active?: boolean; duration?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(() => (reduced ? text : flapFrame(text, 0)));

  useEffect(() => {
    if (reduced || !active) { setShown(text); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(flapFrame(text, p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, duration, reduced]);

  return <span aria-label={text} className={`font-display tabular-nums ${className}`}>{shown}</span>;
}
```

- [ ] **Step 4: Write `src/pages/Landing/DomainDetail.tsx` and `src/pages/Landing/RoutesSection.tsx`**

`src/pages/Landing/DomainDetail.tsx`:
```tsx
import { motion } from 'framer-motion';
import type { DomainConfig } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';

export function DomainDetail({ domain, onClose }: { domain: DomainConfig; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="pointer-auto">
      <Panel title={`ROUTE ${domain.number} — ${domain.name}`} tone="white">
        <p
          className={`mb-3 inline-block border-[3px] border-navy px-2 py-0.5 font-display text-xs ${domain.color === 'red' ? 'text-white' : 'text-navy'}`}
          style={{ background: PALETTE[domain.color] }}
        >
          {domain.line}
        </p>
        <p className="font-ui text-sm leading-relaxed">{domain.theme}</p>
        <h3 className="mt-4 font-display text-sm tracking-widest">EXAMPLE PROBLEM STATEMENTS</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-ui text-sm">
          {domain.problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <ArcadeButton to="/register/identity">RUN THIS ROUTE</ArcadeButton>
          <ArcadeButton variant="ghost" burst={false} onClick={onClose}>CLOSE</ArcadeButton>
        </div>
      </Panel>
    </motion.div>
  );
}
```

`src/pages/Landing/RoutesSection.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DOMAINS, domainById, type DomainId } from '@/config/event';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { DomainDetail } from './DomainDetail';

export function RoutesSection() {
  const [open, setOpen] = useState<DomainId | null>(null);
  const setHovered = useWorld((s) => s.setHovered);

  useEffect(() => {
    const w = useWorld.getState();
    w.setDoorMode('showcase');
    w.setDoorHandler((id) => setOpen(id));
    return () => w.setDoorHandler(null);
  }, []);

  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">CHOOSE YOUR ROUTE</h2>
      <p className="mt-2 font-ui text-sm font-bold text-navy">Four lines. One station. Pick the one you'll run.</p>
      <ul className="mt-6 grid gap-3">
        {DOMAINS.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onMouseEnter={() => setHovered(`door:${d.id}`)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(`door:${d.id}`)}
              onBlur={() => setHovered(null)}
              onClick={() => setOpen(d.id)}
              className="flex w-full items-center gap-4 border-4 border-navy bg-white p-3 text-left shadow-bevel transition-transform hover:-translate-y-1 hover:bg-cyan"
            >
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-navy font-display text-xl text-navy" style={{ background: PALETTE[d.color] }}>{d.number}</span>
              <span>
                <span className="block font-display text-xl text-navy">{`${d.number} ${d.name}`}</span>
                <span className="block font-ui text-sm font-bold text-navy">{d.line}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <div className="mt-4">
            <DomainDetail key={open} domain={domainById(open)} onClose={() => setOpen(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/pages/Landing/LineSection.tsx`**

```tsx
import { EVENT, TIMELINE_STOPS } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { Panel } from '@/ui/Panel';
import { SplitFlap } from '@/ui/SplitFlap';

function stopDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short' }).format(new Date(iso)).toUpperCase();
}

export function LineSection() {
  const n = TIMELINE_STOPS.length;
  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">THE LINE</h2>
      <p className="mt-2 font-ui text-sm font-bold text-navy">{`${EVENT.timeline.buildHours} hours. One route. Every stop matters.`}</p>

      <svg viewBox={`0 0 ${n * 120} 110`} className="mt-6 w-full" role="img" aria-label="Event timeline">
        <line x1="40" y1="40" x2={n * 120 - 80} y2="40" stroke={PALETTE.yellow} strokeWidth="10" strokeLinecap="round" />
        {TIMELINE_STOPS.map((s, i) => (
          <g key={s.id} transform={`translate(${40 + i * 120}, 40)`}>
            <circle r="13" fill={s.alert ? PALETTE.red : PALETTE.pale} stroke={PALETTE.navy} strokeWidth="5" />
            <text y="42" textAnchor="middle" fontSize="11" fontFamily="Bungee" fill={PALETTE.navy}>{s.label}</text>
            <text y="60" textAnchor="middle" fontSize="10" fontFamily="Rubik" fontWeight="700" fill={s.alert ? PALETTE.red : PALETTE.navy}>{stopDate(s.at)}</text>
          </g>
        ))}
      </svg>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="WHAT TO BUILD" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">{EVENT.rules.map((r) => <li key={r}>• {r}</li>)}</ul>
        </Panel>
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="JUDGING" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">{EVENT.judging.map((j) => <li key={j}>• {j}</li>)}</ul>
        </Panel>
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="PRIZES" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">
            {EVENT.prizes.map((p) => (
              <li key={p.label} className="flex justify-between gap-2"><span>{p.label}</span><span className="font-display text-yellow">{p.amount}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Mount the sections in `src/pages/Landing/index.tsx`**

Replace the section body expression with:
```tsx
import { LineSection } from './LineSection';
import { RoutesSection } from './RoutesSection';
…
          {s.id === 'hero' ? <Hero /> : s.id === 'domains' ? <RoutesSection /> : s.id === 'challenge' ? <LineSection /> : (
            <h2 className="pointer-auto font-display text-4xl text-navy md:text-6xl">{HEADLINE[s.id]}</h2>
          )}
```
and remove `domains`/`challenge` from `HEADLINE`. Give the `challenge` section a wider container — in `src/pages/Landing/Section.tsx` change the signature and the inner class:
```tsx
export function Section({ id, children, className = '', align = 'start', wide = false }: { id: string; children: ReactNode; className?: string; align?: 'start' | 'end' | 'center'; wide?: boolean }) {
  …
      <motion.div
        className={`w-full ${wide ? 'max-w-4xl' : 'max-w-xl'}`}
```
and pass `wide={s.id === 'challenge'}` from `Landing`.

- [ ] **Step 7: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: scrolling into ROUTES shows four cards on the right while the doors pass on the left; hovering a card lights that door cyan; clicking opens the detail panel; clicking a 3D door does the same. THE LINE shows the yellow subway map with a red deadline stop and three navy flap panels whose headings flap in. Stop the server.

- [ ] **Step 8: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): route cards with door sync, domain detail, THE LINE timeline and split-flap text

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 19: THE RUNNERS teaser, CHECK-IN section and footer

**Files:**
- Create: `src/pages/Landing/RunnersSection.tsx`, `src/pages/Landing/CheckinSection.tsx`, `src/pages/Landing/Footer.tsx`
- Modify: `src/pages/Landing/index.tsx`
- Test: `tests/pages/landing/RunnersSection.test.tsx`, `tests/pages/landing/CheckinSection.test.tsx`

**Interfaces:**
- `RunnersSection()` — loads the board, starts the ticker while mounted, shows top 3 with medal glyphs, `LIVE`, `SEE THE FULL BOARD`.
- `CheckinSection()` — `CREATE YOUR RUNNER` (`id="checkin-cta"`) and `SIGN IN`.
- `Footer()`.

- [ ] **Step 1: Write the failing tests**

`tests/pages/landing/RunnersSection.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RunnersSection } from '@/pages/Landing/RunnersSection';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { api } from '@/api';

describe('RunnersSection', () => {
  beforeEach(() => { api.reset(); useSession.setState({ user: null }); useLeaderboard.setState({ rows: [], deltas: {}, running: false }); });
  afterEach(() => useLeaderboard.getState().stop());

  it('shows the top three with medals and the board link to sign-in when signed out', async () => {
    render(<MemoryRouter><RunnersSection /></MemoryRouter>);
    expect(await screen.findByText('PIXEL RAIDERS')).toBeInTheDocument();
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SEE THE FULL BOARD' })).toHaveAttribute('href', '/signin');
    expect(useLeaderboard.getState().running).toBe(true);
  });
});
```

`tests/pages/landing/CheckinSection.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CheckinSection } from '@/pages/Landing/CheckinSection';

describe('CheckinSection', () => {
  it('links to registration and sign-in', () => {
    render(<MemoryRouter><CheckinSection /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'CREATE YOUR RUNNER' })).toHaveAttribute('href', '/register/identity');
    expect(screen.getByRole('link', { name: 'CREATE YOUR RUNNER' })).toHaveAttribute('id', 'checkin-cta');
    expect(screen.getByRole('link', { name: 'SIGN IN' })).toHaveAttribute('href', '/signin');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/pages/landing/RunnersSection.test.tsx tests/pages/landing/CheckinSection.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the three section components**

`src/pages/Landing/RunnersSection.tsx`:
```tsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { SplitFlap } from '@/ui/SplitFlap';

const MEDALS = ['🥇', '🥈', '🥉'];

export function RunnersSection() {
  const rows = useLeaderboard((s) => s.rows);
  const user = useSession((s) => s.user);

  useEffect(() => {
    const lb = useLeaderboard.getState();
    if (lb.rows.length === 0) void lb.load();
    lb.start();
    return () => lb.stop();
  }, []);

  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">THE RUNNERS</h2>
      <Panel tone="navy" className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs tracking-widest text-yellow">DEPARTURES · TOP CREWS</span>
          <span className="border-2 border-white bg-red px-2 py-0.5 font-display text-xs text-white">LIVE</span>
        </div>
        <ol className="space-y-2">
          {rows.slice(0, 3).map((r, i) => (
            <motion.li layout key={r.teamId} className="flex items-center gap-3 border-[3px] border-navy bg-pale px-3 py-2 text-navy">
              <span className="text-xl" aria-label={`rank ${r.rank}`}>{MEDALS[i]}</span>
              <span className="font-display text-xs">{`#${String(r.rank).padStart(2, '0')}`}</span>
              <span className="flex-1 font-display text-sm">{r.team}</span>
              <span aria-hidden className="h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domainById(r.domain).color] }} />
              <SplitFlap text={String(r.score)} className="text-sm" />
            </motion.li>
          ))}
        </ol>
        <div className="mt-4">
          <ArcadeButton to={user ? '/station/leaderboard' : '/signin'} variant="secondary" burst={false}>SEE THE FULL BOARD</ArcadeButton>
        </div>
      </Panel>
    </div>
  );
}
```

`src/pages/Landing/CheckinSection.tsx`:
```tsx
import { ArcadeButton } from '@/ui/ArcadeButton';

export function CheckinSection() {
  return (
    <div className="pointer-auto">
      <p className="font-display text-xs tracking-[0.3em] text-navy">PLATFORM 9 · GATES OPEN</p>
      <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">RUNNER CHECK-IN</h2>
      <p className="mt-3 max-w-md font-ui text-sm font-bold text-navy">The line is open. Create your runner, pick a route, build your crew, and grab your Hack Pass.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <ArcadeButton id="checkin-cta" size="lg" to="/register/identity">CREATE YOUR RUNNER</ArcadeButton>
        <ArcadeButton size="lg" variant="secondary" to="/signin">SIGN IN</ArcadeButton>
      </div>
    </div>
  );
}
```

`src/pages/Landing/Footer.tsx`:
```tsx
import { EVENT } from '@/config/event';

export function Footer() {
  return (
    <footer className="pointer-auto border-4 border-navy bg-navy p-5 text-pale shadow-bevel-yellow">
      <p className="font-display text-2xl">AI EXPO</p>
      <p className="font-ui text-xs font-bold tracking-widest">{`${EVENT.organizer} · ${EVENT.city}`}</p>
      <nav aria-label="Social" className="mt-3 flex gap-3 font-display text-xs">
        <a href={EVENT.socials.instagram} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">INSTAGRAM</a>
        <a href={EVENT.socials.linkedin} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">LINKEDIN</a>
        <a href={EVENT.socials.discord} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">DISCORD</a>
      </nav>
      <p className="mt-4 font-display text-[10px] tracking-[0.3em] text-yellow">BUILT ON THE LINE</p>
    </footer>
  );
}
```

- [ ] **Step 4: Finish `src/pages/Landing/index.tsx`**

```tsx
import type { ComponentType } from 'react';
import { CheckinSection } from './CheckinSection';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { LineSection } from './LineSection';
import { RoutesSection } from './RoutesSection';
import { RunnersSection } from './RunnersSection';
import { LANDING_SECTIONS } from './sections';
import { Section } from './Section';
import { SkipIntro } from './SkipIntro';

const BODY: Record<string, ComponentType> = {
  hero: Hero, domains: RoutesSection, challenge: LineSection, leaderboard: RunnersSection, checkin: CheckinSection, footer: Footer,
};

export default function Landing() {
  return (
    <main className="relative z-10 snap-y snap-mandatory md:snap-none">
      <SkipIntro />
      {LANDING_SECTIONS.map((s, i) => {
        const Body = BODY[s.id];
        return (
          <Section key={s.id} id={s.id} align={i % 2 ? 'end' : 'start'} wide={s.id === 'challenge'}>
            <Body />
          </Section>
        );
      })}
    </main>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: THE RUNNERS panel shows three medal rows whose scores flap; after ~20 s a row may swap. CHECK-IN section shows the two CTAs in front of the arch; footer sits at the end of the line. Stop the server.

- [ ] **Step 6: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): leaderboard teaser, check-in CTA section and footer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 20: Coins along the line and section-visit rewards

**Files:**
- Create: `src/lib/coins.ts`, `src/world/props/Coins.tsx`
- Modify: `src/world/World.tsx`, `src/pages/Landing/Section.tsx`
- Test: `tests/lib/coins.test.ts`

**Interfaces:**
- `coins.ts`: `LANDING_COINS: { id: string; t: number }[]` (12), `coinWorldPosition(t): [x,y,z]` (spline point offset right/down/forward), `dueCoins(scrollT, collected: string[]): string[]`.
- `Coins()` (canvas, landing only): renders uncollected coins; collects when scroll passes them, spawning a DOM fly-in at the projected screen position.
- `Section` gains `onViewportEnter` → `useGame.visit('landing:<id>')`.

- [ ] **Step 1: Write the failing test**

`tests/lib/coins.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { coinWorldPosition, dueCoins, LANDING_COINS } from '@/lib/coins';
import { sampleLanding } from '@/lib/landingPath';

describe('landing coins', () => {
  it('defines twelve coins with increasing t inside (0,1)', () => {
    expect(LANDING_COINS).toHaveLength(12);
    for (let i = 1; i < LANDING_COINS.length; i++) expect(LANDING_COINS[i].t).toBeGreaterThan(LANDING_COINS[i - 1].t);
    expect(LANDING_COINS[0].t).toBeGreaterThan(0);
    expect(LANDING_COINS[11].t).toBeLessThan(1);
  });
  it('places coins ahead of and below the camera path', () => {
    const p = sampleLanding(0.5).position;
    const c = coinWorldPosition(0.5);
    expect(c[1]).toBeLessThan(p[1]);
    expect(c[2]).toBeLessThan(p[2]);
  });
  it('returns coins the scroll has passed and not yet collected', () => {
    expect(dueCoins(0, [])).toEqual([]);
    const due = dueCoins(0.3, []);
    expect(due.length).toBeGreaterThan(0);
    expect(dueCoins(0.3, due)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/coins.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/coins.ts`**

```ts
import { sampleLanding } from './landingPath';

export const LANDING_COINS = [0.06, 0.12, 0.2, 0.28, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9].map((t, i) => ({ id: `coin_${i}`, t }));

/** A coin floats a little right, lower and ahead of the camera position at its scroll-t. */
export function coinWorldPosition(t: number): [number, number, number] {
  const p = sampleLanding(t).position;
  const side = t * 100 % 2 < 1 ? 1.6 : -1.2;
  return [p[0] + side, p[1] - 0.9, p[2] - 7];
}

export function dueCoins(scrollT: number, collected: string[]): string[] {
  return LANDING_COINS.filter((c) => scrollT >= c.t - 0.01 && !collected.includes(c.id)).map((c) => c.id);
}
```

- [ ] **Step 4: Write `src/world/props/Coins.tsx`**

```tsx
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { coinWorldPosition, dueCoins, LANDING_COINS } from '@/lib/coins';
import { useGame } from '@/store/game';
import { useWorld } from '@/store/world';
import { Coin } from './Coin';

const v = new Vector3();

export function Coins() {
  const collected = useGame((s) => s.collectedCoins);
  const shot = useWorld((s) => s.shot);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const positions = useMemo(() => Object.fromEntries(LANDING_COINS.map((c) => [c.id, coinWorldPosition(c.t)])), []);

  useFrame(() => {
    if (shot !== 'landing') return;
    const w = useWorld.getState();
    if (w.introRunning) return;
    for (const id of dueCoins(w.scrollT, useGame.getState().collectedCoins)) {
      const p = positions[id];
      v.set(p[0], p[1], p[2]).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      useGame.getState().collectCoin(id, x, y);
      w.emit({ type: 'coin', position: p, color: 'yellow' });
    }
  });

  if (shot !== 'landing') return null;
  return (
    <group>
      {LANDING_COINS.filter((c) => !collected.includes(c.id)).map((c) => (
        <Coin key={c.id} position={positions[c.id]} />
      ))}
    </group>
  );
}
```

Mount in `src/world/World.tsx`: `import { Coins } from './props/Coins';` and add `<Coins />` next to `<Intro />`.

- [ ] **Step 5: Section-visit rewards in `src/pages/Landing/Section.tsx`**

Add `import { useGame } from '@/store/game';` and on the `motion.div` add:
```tsx
        onViewportEnter={() => useGame.getState().visit(`landing:${id}`)}
```

- [ ] **Step 6: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: yellow coins hover along the route; scrolling past one pops it, a DOM coin flies to the HUD (visible once signed in — the counter is in the runner chip; when signed out the toast `+10` still appears bottom-right). Reload: collected coins stay gone. Entering each section shows `+10 NEW STOP` once. Stop the server.

- [ ] **Step 7: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): collectable coins along the landing line and section-visit rewards

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 21: WRONG PLATFORM (404)

**Files:**
- Create: `src/world/zones/Hall404.tsx`
- Modify: `src/pages/NotFound.tsx`, `src/world/World.tsx`
- Test: `tests/pages/NotFound.test.tsx`

- [ ] **Step 1: Write the failing test**

`tests/pages/NotFound.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import NotFound from '@/pages/NotFound';

describe('NotFound', () => {
  it('shows the wrong-platform sign and a train back home', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('WRONG PLATFORM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'TRAIN BACK HOME' })).toHaveAttribute('href', '/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/NotFound.test.tsx`
Expected: FAIL — no `TRAIN BACK HOME` link.

- [ ] **Step 3: Write the page and the in-world sign**

`src/pages/NotFound.tsx`:
```tsx
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';

export default function NotFound() {
  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-5">
      <Panel title="WRONG PLATFORM" tone="navy" className="max-w-md">
        <p className="font-ui text-sm">This line does not exist, runner. The train home leaves now.</p>
        <div className="mt-5"><ArcadeButton to="/">TRAIN BACK HOME</ArcadeButton></div>
      </Panel>
    </main>
  );
}
```

`src/world/zones/Hall404.tsx`:
```tsx
import { useWorld } from '@/store/world';
import { Sign } from '../props/Sign';
import { Barrier } from '../props/street';

/** Only present while the 404 shot is active: a red warning sign and barriers across the platform. */
export function Hall404() {
  const active = useWorld((s) => s.shot === 'hall404');
  if (!active) return null;
  return (
    <group>
      <Sign text="WRONG PLATFORM" position={[3, 3.4, -36]} width={6} height={1.3} plate="red" ink="white" size={0.55} />
      <Barrier position={[1.5, 0.6, -34]} />
      <Barrier position={[4.5, 0.6, -34]} />
    </group>
  );
}
```
Mount `<Hall404 />` in `src/world/World.tsx`.

- [ ] **Step 4: Run tests, lint; visual check `/nowhere`; commit**

Run: `npx vitest run && npm run lint`
Expected: PASS / clean. Visual: `/nowhere` shows the navy panel and, in the hall behind it, a red `WRONG PLATFORM` sign with barriers.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): wrong-platform 404 with in-world sign

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

## Phase 3 — Sign-in & Registration

### Task 22: Particles and the kiosk sign-in page

**Files:**
- Create: `src/lib/particles.ts`, `src/world/props/Particles.tsx`
- Modify: `src/world/layout.ts` (`ZONE_ANCHORS`), `src/world/World.tsx`, `src/pages/SignIn.tsx`
- Test: `tests/lib/particles.test.ts`, `tests/pages/SignIn.test.tsx`

**Interfaces:**
- `layout.ts`: `ZONE_ANCHORS: Record<string, [number, number, number]>` — world positions for zone-addressed events (`kiosk`, `checkin`, `wall`, `locker`, `crew`, `station`).
- `particles.ts`: `Particle { x,y,z,vx,vy,vz,life }`, `spawnBurst(pool, origin, count, rng)`, `stepParticles(pool, dt)`; pool size `POOL = 64`.
- `Particles()` (canvas) — instanced cyan cubes; consumes `burst` and `coin` world events; disabled on `low` tier or reduced motion.
- `SignIn` page — the kiosk panel; on success sets the session and navigates to `/station`.

- [ ] **Step 1: Write the failing tests**

`tests/lib/particles.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { POOL, makePool, spawnBurst, stepParticles } from '@/lib/particles';

describe('particles', () => {
  it('spawns into free slots with upward velocity and steps them under gravity', () => {
    const pool = makePool();
    expect(pool).toHaveLength(POOL);
    spawnBurst(pool, [1, 2, 3], 10, () => 0.5);
    const live = pool.filter((p) => p.life > 0);
    expect(live).toHaveLength(10);
    expect(live[0].x).toBe(1);
    expect(live[0].vy).toBeGreaterThan(0);
    stepParticles(pool, 0.5);
    expect(pool.filter((p) => p.life > 0)[0].life).toBeLessThan(1);
    stepParticles(pool, 5);
    expect(pool.filter((p) => p.life > 0)).toHaveLength(0);
  });
  it('never exceeds the pool', () => {
    const pool = makePool();
    spawnBurst(pool, [0, 0, 0], 500, Math.random);
    expect(pool.filter((p) => p.life > 0)).toHaveLength(POOL);
  });
});
```

`tests/pages/SignIn.test.tsx`:
```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import SignIn from '@/pages/SignIn';
import { useSession } from '@/store/session';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/signin']}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/station" element={<p>THE RUNNER STATION</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SignIn', () => {
  beforeEach(() => { api.reset(); useSession.setState({ user: null }); });

  it('renders the kiosk copy', () => {
    mount();
    expect(screen.getByText('WELCOME, RUNNER.')).toBeInTheDocument();
    expect(screen.getByText('Ready to enter the race?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CREATE ACCOUNT' })).toHaveAttribute('href', '/register/identity');
  });
  it('signs in the demo runner through a provider', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(await screen.findByText('THE RUNNER STATION')).toBeInTheDocument();
    expect(useSession.getState().user?.id).toBe('#0100');
  });
  it('shows inline errors for unknown runners and wrong passwords', async () => {
    mount();
    fireEvent.change(screen.getByLabelText('EMAIL / USERNAME'), { target: { value: 'ghost@x.io' } });
    fireEvent.change(screen.getByLabelText('PASSWORD'), { target: { value: 'whatever1' } });
    fireEvent.click(screen.getByRole('button', { name: 'RUN IN' }));
    expect(await screen.findByText('No runner found on this line.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('EMAIL / USERNAME'), { target: { value: 'demo@aiexpo.run' } });
    fireEvent.click(screen.getByRole('button', { name: 'RUN IN' }));
    await waitFor(() => expect(screen.getByText('Wrong password, runner.')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/particles.test.ts tests/pages/SignIn.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/lib/particles.ts` and add `ZONE_ANCHORS` to `src/world/layout.ts`**

`src/lib/particles.ts`:
```ts
export const POOL = 64;
export interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number }

export function makePool(): Particle[] {
  return Array.from({ length: POOL }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }));
}

export function spawnBurst(pool: Particle[], origin: [number, number, number], count: number, rng: () => number) {
  let spawned = 0;
  for (const p of pool) {
    if (spawned >= count) break;
    if (p.life > 0) continue;
    p.x = origin[0]; p.y = origin[1]; p.z = origin[2];
    p.vx = (rng() - 0.5) * 4; p.vy = 2 + rng() * 3; p.vz = (rng() - 0.5) * 4;
    p.life = 1;
    spawned++;
  }
}

export function stepParticles(pool: Particle[], dt: number) {
  for (const p of pool) {
    if (p.life <= 0) continue;
    p.vy -= 9 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    p.life = Math.max(0, p.life - dt * 1.4);
  }
}
```

Append to `src/world/layout.ts`:
```ts
/** World positions that zone-addressed events (pulse/burst/look) resolve to. */
export const ZONE_ANCHORS: Record<string, [number, number, number]> = {
  kiosk: [4, 2.4, -134.4],
  checkin: [4, 2.4, -134.4],
  wall: [-6, 3, -147],
  locker: [3, 1.6, -163],
  crew: [3, 1.6, -178],
  station: [3, 1.6, -205],
};
```

- [ ] **Step 4: Write `src/world/props/Particles.tsx` and mount it**

```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { makePool, POOL, spawnBurst, stepParticles } from '@/lib/particles';
import { useWorld } from '@/store/world';
import { ZONE_ANCHORS } from '../layout';
import { mat } from '../materials';
import { qualitySettings } from '../quality';

const dummy = new Object3D();

export function Particles() {
  const enabled = useWorld((s) => qualitySettings(s.qualityTier, 1).particles) && !prefersReducedMotion();
  const mesh = useRef<InstancedMesh>(null);
  const pool = useMemo(makePool, []);

  const burst = (position: [number, number, number] | undefined, zone: string | undefined, n: number) => {
    const origin = position ?? (zone ? ZONE_ANCHORS[zone] : undefined);
    if (origin) spawnBurst(pool, origin, n, Math.random);
  };
  useWorldEvents('burst', (e) => burst(e.position, e.zone, 10));
  useWorldEvents('coin', (e) => burst(e.position, e.zone, 6));

  useFrame((_, delta) => {
    if (!mesh.current) return;
    stepParticles(pool, Math.min(delta, 0.05));
    pool.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      const s = p.life > 0 ? 0.12 * p.life : 0;
      dummy.scale.set(s, s, s);
      dummy.rotation.set(p.life * 6, p.life * 4, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, POOL]} material={mat('cyan', 'flat')} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}
```
Mount `<Particles />` in `src/world/World.tsx` beside `<Coins />`.

- [ ] **Step 5: Write `src/pages/SignIn.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '@/api';
import { ApiError } from '@/api/types';
import { hasErrors, validateSignIn } from '@/lib/validation';
import { useSession } from '@/store/session';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';

export default function SignIn() {
  const navigate = useNavigate();
  const setUser = useSession((s) => s.setUser);
  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const finish = (runner: Awaited<ReturnType<typeof api.signIn>>) => { setUser(runner); navigate('/station'); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSignIn(values);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try {
      finish(await api.signIn(values));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_RUNNER') setErrors({ identifier: err.message });
      else if (err instanceof ApiError && err.code === 'BAD_PASSWORD') setErrors({ password: err.message });
      else setErrors({ form: 'The kiosk jammed. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const provider = async (p: 'google' | 'github') => {
    setBusy(true);
    try { finish(await api.signInWithProvider(p)); } finally { setBusy(false); }
  };

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="WELCOME, RUNNER." className="w-full max-w-md">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Ready to enter the race?</p>
        <form onSubmit={submit} noValidate>
          <Field label="EMAIL / USERNAME" name="identifier" zone="kiosk" autoComplete="username" value={values.identifier}
            onChange={(e) => setValues({ ...values, identifier: e.target.value })} error={errors.identifier} />
          <Field label="PASSWORD" name="password" type="password" zone="kiosk" autoComplete="current-password" value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })} error={errors.password} />
          {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
          <ArcadeButton type="submit" size="lg" className="w-full" disabled={busy}>RUN IN</ArcadeButton>
        </form>
        <div className="mt-4 grid gap-2">
          <ArcadeButton variant="secondary" burst={false} disabled={busy} onClick={() => provider('google')}>Continue with Google</ArcadeButton>
          <ArcadeButton variant="secondary" burst={false} disabled={busy} onClick={() => provider('github')}>Continue with GitHub</ArcadeButton>
        </div>
        <p className="mt-5 font-ui text-sm font-bold">
          New runner? <Link to="/register/identity" className="underline decoration-4 underline-offset-4 hover:bg-cyan">CREATE ACCOUNT</Link>
        </p>
      </Panel>
    </main>
  );
}
```

- [ ] **Step 6: Run tests, lint, build; visual check**

Run: `npx vitest run && npm run lint && npx vite build`
Expected: PASS / clean / built.

Visual: `/signin` — the camera sits at the kiosk; the panel overlays the screen area; focusing a field scales it, turns its border cyan, the kiosk light flares and cyan cubes burst by the kiosk. `Continue with Google` lands in the station (stub). Stop the server.

- [ ] **Step 7: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): kiosk sign-in with focus reactions and particle bursts

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 23: Identity step and the CREATE YOUR RUNNER wall

**Files:**
- Create: `src/world/zones/Wall.tsx`
- Modify: `src/pages/Register/Identity.tsx`, `src/world/World.tsx`
- Test: `tests/pages/register/Identity.test.tsx`

- [ ] **Step 1: Write the failing test**

`tests/pages/register/Identity.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import Identity from '@/pages/Register/Identity';
import { useRegistration } from '@/store/registration';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/register/identity']}>
      <Routes>
        <Route path="/register/identity" element={<Identity />} />
        <Route path="/register/domain" element={<p>CHOOSE YOUR DOMAIN</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('Identity step', () => {
  beforeEach(() => { api.reset(); window.localStorage.clear(); useRegistration.getState().reset(); });

  it('blocks invalid input and a taken email', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'NEXT: CHOOSE YOUR DOMAIN' }));
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    fill('FULL NAME', 'Demo Two'); fill('EMAIL', 'demo@aiexpo.run'); fill('COLLEGE / ORGANIZATION', 'X');
    fill('PASSWORD', 'longpassword'); fill('CONFIRM PASSWORD', 'longpassword');
    fireEvent.click(screen.getByRole('button', { name: 'NEXT: CHOOSE YOUR DOMAIN' }));
    expect(screen.getByText('That email already has a runner.')).toBeInTheDocument();
  });
  it('saves the draft, completes the step and moves on', () => {
    mount();
    fill('FULL NAME', 'Asha Rao'); fill('EMAIL', 'asha@example.com'); fill('COLLEGE / ORGANIZATION', 'RV College');
    fill('PHONE', '+919876543210'); fill('PASSWORD', 'longpassword'); fill('CONFIRM PASSWORD', 'longpassword');
    fireEvent.click(screen.getByRole('button', { name: 'NEXT: CHOOSE YOUR DOMAIN' }));
    expect(screen.getByText('CHOOSE YOUR DOMAIN')).toBeInTheDocument();
    expect(useRegistration.getState().completed.identity).toBe(true);
    expect(useRegistration.getState().identity?.email).toBe('asha@example.com');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/register/Identity.test.tsx`
Expected: FAIL — no form fields.

- [ ] **Step 3: Write `src/pages/Register/Identity.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/api';
import { hasErrors, validateIdentity, type IdentityValues } from '@/lib/validation';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';

const EMPTY: IdentityValues = { name: '', email: '', org: '', phone: '', password: '', confirm: '' };

export default function Identity() {
  const navigate = useNavigate();
  const draft = useRegistration((s) => s.identity);
  const [values, setValues] = useState<IdentityValues>({ ...EMPTY, ...draft, password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof IdentityValues, string>>>({});
  const set = (k: keyof IdentityValues) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validateIdentity(values);
    if (!v.email && api.isEmailTaken(values.email)) v.email = 'That email already has a runner.';
    setErrors(v);
    if (hasErrors(v)) return;
    const reg = useRegistration.getState();
    reg.setIdentity(values);
    if (!reg.completed.identity) useGame.getState().awardCoins(25, 'IDENTITY LOCKED');
    reg.complete('identity');
    navigate('/register/domain');
  };

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="CREATE YOUR RUNNER" className="w-full max-w-md">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 1 of 5 — who's running?</p>
        <form onSubmit={submit} noValidate>
          <Field label="FULL NAME" name="name" zone="wall" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
          <Field label="EMAIL" name="email" type="email" zone="wall" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="COLLEGE / ORGANIZATION" name="org" zone="wall" autoComplete="organization" value={values.org} onChange={set('org')} error={errors.org} />
          <Field label="PHONE" name="phone" type="tel" zone="wall" autoComplete="tel" value={values.phone} onChange={set('phone')} error={errors.phone} hint="Optional" />
          <Field label="PASSWORD" name="password" type="password" zone="wall" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} hint="At least 8 characters" />
          <Field label="CONFIRM PASSWORD" name="confirm" type="password" zone="wall" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} />
          <ArcadeButton type="submit" size="lg" className="w-full">NEXT: CHOOSE YOUR DOMAIN</ArcadeButton>
        </form>
      </Panel>
    </main>
  );
}
```

- [ ] **Step 4: Write `src/world/zones/Wall.tsx` and mount it**

```tsx
import { LEFT_WALL_X, PLATFORM_Y } from '../layout';
import { GraffitiWall } from '../props/GraffitiWall';
import { Skateboard, SprayCan } from '../props/street';

export function Wall() {
  return (
    <group>
      <GraffitiWall
        spec={{ words: ['CREATE', 'YOUR', 'RUNNER'], base: 'pale', ink: 'yellow', accents: ['cyan', 'red', 'orange'], seed: 42 }}
        position={[LEFT_WALL_X + 0.06, 4.4, -147.5]} rotation={[0, Math.PI / 2, 0]} width={14} height={6}
      />
      <SprayCan position={[-1, PLATFORM_Y, -145]} cap="yellow" />
      <SprayCan position={[-0.6, PLATFORM_Y, -145.3]} cap="cyan" />
      <SprayCan position={[-1.4, PLATFORM_Y, -145.4]} cap="red" />
      <Skateboard position={[1, PLATFORM_Y, -150]} rotation={[0, -0.4, 0]} />
    </group>
  );
}
```
Mount `<Wall />` in `src/world/World.tsx` after `<Checkin />`.

- [ ] **Step 5: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — expect PASS / clean / built. Visual: `/register/identity` shows the giant yellow `CREATE YOUR RUNNER` graffiti on the left wall behind the form.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): identity registration step with graffiti wall

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 24: Domain selection step

**Files:**
- Modify: `src/pages/Register/Domain.tsx`
- Test: `tests/pages/register/Domain.test.tsx`

**Interfaces:**
- `Domain` page: puts doors into `select` mode, mirrors selection both ways (DOM list ⇄ 3D doors), arrow keys move, Enter confirms, `LOCK IN ROUTE` saves `registration.domain`, completes the step, navigates to `/register/runner`.

- [ ] **Step 1: Write the failing test**

`tests/pages/register/Domain.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import Domain from '@/pages/Register/Domain';
import { useRegistration } from '@/store/registration';
import { useWorld } from '@/store/world';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/register/domain']}>
      <Routes>
        <Route path="/register/domain" element={<Domain />} />
        <Route path="/register/runner" element={<p>YOUR RUN. YOUR IDENTITY.</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Domain step', () => {
  beforeEach(() => { window.localStorage.clear(); useRegistration.getState().reset(); useWorld.setState({ selectedDomain: null, doorMode: 'showcase', doorHandler: null }); });

  it('enters select mode and syncs selection from the 3D doors', () => {
    mount();
    expect(useWorld.getState().doorMode).toBe('select');
    useWorld.getState().doorHandler?.('cyber');
    expect(screen.getByRole('radio', { name: /03 CYBER/ })).toBeChecked();
  });
  it('moves with arrow keys, locks in and advances', () => {
    mount();
    fireEvent.click(screen.getByRole('radio', { name: /01 AI/ }));
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
    expect(useWorld.getState().selectedDomain).toBe('data');
    fireEvent.click(screen.getByRole('button', { name: 'LOCK IN ROUTE' }));
    expect(screen.getByText('YOUR RUN. YOUR IDENTITY.')).toBeInTheDocument();
    expect(useRegistration.getState().domain).toBe('data');
    expect(useRegistration.getState().completed.domain).toBe(true);
  });
  it('requires a selection', () => {
    mount();
    expect(screen.getByRole('button', { name: 'LOCK IN ROUTE' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/register/Domain.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/pages/Register/Domain.tsx`**

```tsx
import { useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { DOMAINS, type DomainId } from '@/config/event';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { DOOR_Z } from '@/world/layout';

export default function Domain() {
  const navigate = useNavigate();
  const selected = useWorld((s) => s.selectedDomain);
  const setSelected = useWorld((s) => s.setSelectedDomain);
  const initial = useRegistration((s) => s.domain);

  useEffect(() => {
    const w = useWorld.getState();
    w.setDoorMode('select');
    w.setSelectedDomain(initial);
    w.setDoorHandler((id) => w.setSelectedDomain(id));
    return () => { w.setDoorMode('showcase'); w.setSelectedDomain(null); w.setDoorHandler(null); };
  }, [initial]);

  const move = (delta: number) => {
    const i = DOMAINS.findIndex((d) => d.id === selected);
    const next = DOMAINS[(i < 0 ? 0 : i + delta + DOMAINS.length) % DOMAINS.length];
    setSelected(next.id);
    useWorld.getState().emit({ type: 'burst', position: [-8, 3, DOOR_Z[next.id]], color: 'cyan' });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'Enter' && selected) lockIn();
  };

  const lockIn = () => {
    if (!selected) return;
    const reg = useRegistration.getState();
    reg.setDomain(selected as DomainId);
    if (!reg.completed.domain) useGame.getState().awardCoins(25, 'ROUTE LOCKED');
    reg.complete('domain');
    navigate('/register/runner');
  };

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="CHOOSE YOUR DOMAIN" className="w-full max-w-md">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 2 of 5 — pick the door you'll run through. Click a door or use the arrows.</p>
        <div role="radiogroup" aria-label="Domain" tabIndex={0} onKeyDown={onKey} className="grid gap-3 outline-none focus-visible:ring-4 focus-visible:ring-cyan">
          {DOMAINS.map((d) => {
            const on = selected === d.id;
            return (
              <button
                key={d.id} type="button" role="radio" aria-checked={on}
                onClick={() => { setSelected(d.id); useWorld.getState().emit({ type: 'burst', zone: 'wall', color: 'cyan' }); }}
                className={`flex items-center gap-4 border-4 border-navy p-3 text-left shadow-bevel transition-transform hover:-translate-y-0.5 ${on ? 'bg-cyan' : 'bg-white'}`}
              >
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-navy font-display text-lg text-navy" style={{ background: PALETTE[d.color] }}>{d.number}</span>
                <span>
                  <span className="block font-display text-lg text-navy">{`${d.number} ${d.name}`}</span>
                  <span className="block font-ui text-xs font-bold text-navy">{d.line}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-5">
          <ArcadeButton size="lg" className="w-full" disabled={!selected} onClick={lockIn}>LOCK IN ROUTE</ArcadeButton>
        </div>
      </Panel>
    </main>
  );
}
```

- [ ] **Step 4: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — expect PASS / clean / built. Visual: after identity, the four doors face the camera; clicking a door opens it, floods its interior with the route colour and sinks the other three to navy; the DOM list mirrors it; arrows move the selection; LOCK IN ROUTE advances.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): domain selection step synced with 3D route doors

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 25: The runner avatar — animation state machine, parts and `Runner`

**Files:**
- Create: `src/world/runner/animations.ts`, `src/world/runner/parts.tsx`, `src/world/runner/Runner.tsx`
- Test: `tests/world/runner/animations.test.ts`

**Interfaces:**
- `animations.ts`: `RunnerMode = 'idle'|'look'|'celebrate'|'run'`, `RunnerAnim`, `createAnim(now)`, `trigger(anim, mode, now, extra?)`, `step(anim, now, rng)`, `pose(anim, now, facingYaw, position): Pose`, constants `CELEBRATE_DURATION = 0.8`, `LOOK_DURATION = 1.5`.
- `parts.tsx`: `RunnerParts({ config, refs })` — the meshes; `PartRefs` (head, hair, torso, leftArm, rightArm, leftLeg, rightLeg, leftFoot, rightFoot, root) filled with `Object3D`s.
- `Runner({ config, position, rotationY?, scale?, zone?, celebrateKey?, runTo? })` — animated avatar; reacts to `look` events addressed to `zone` and to `celebrate` events; `celebrateKey` change triggers a celebration; `runTo = { from, to, duration }` plays a run.

- [ ] **Step 1: Write the failing test**

`tests/world/runner/animations.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CELEBRATE_DURATION, createAnim, LOOK_DURATION, pose, step, trigger } from '@/world/runner/animations';

const rng = () => 0.5;

describe('runner animation state machine', () => {
  it('starts idle with a micro action scheduled 3–6 s out', () => {
    const a = createAnim(10);
    expect(a.mode).toBe('idle');
    expect(a.nextMicroAt).toBeGreaterThanOrEqual(13);
    expect(a.nextMicroAt).toBeLessThanOrEqual(16);
  });
  it('plays a micro action and returns to plain idle', () => {
    let a = createAnim(0);
    a = step(a, a.nextMicroAt + 0.01, rng);
    expect(a.micro).not.toBeNull();
    const p = pose(a, a.micro!.start + a.micro!.duration / 2, 0, [0, 0, 0]);
    expect(Math.abs(p.headYaw) + Math.abs(p.footTap) + Math.abs(p.rightArm) + Math.abs(p.hipSway)).toBeGreaterThan(0);
    a = step(a, a.micro!.start + a.micro!.duration + 0.01, rng);
    expect(a.micro).toBeNull();
    expect(a.nextMicroAt).toBeGreaterThan(a.since);
  });
  it('celebrates with a hop and a full spin, then idles', () => {
    let a = trigger(createAnim(0), 'celebrate', 5);
    const mid = pose(a, 5 + CELEBRATE_DURATION / 2, 0, [0, 0, 0]);
    expect(mid.bodyY).toBeGreaterThan(0.5);
    expect(mid.spin).toBeCloseTo(Math.PI, 3);
    a = step(a, 5 + CELEBRATE_DURATION + 0.01, rng);
    expect(a.mode).toBe('idle');
  });
  it('looks toward a target then returns', () => {
    let a = trigger(createAnim(0), 'look', 1, { lookAt: [5, 1, 0] });
    const p = pose(a, 1.4, 0, [0, 0, 0]);
    expect(p.headYaw).toBeGreaterThan(0.5);
    a = step(a, 1 + LOOK_DURATION + 0.01, rng);
    expect(a.mode).toBe('idle');
  });
  it('runs between two points', () => {
    let a = trigger(createAnim(0), 'run', 0, { from: [0, 0, 0], to: [4, 0, 0], duration: 2 });
    const p = pose(a, 1, 0, [0, 0, 0]);
    expect(p.offset[0]).toBeCloseTo(2, 5);
    expect(Math.abs(p.leftLeg)).toBeGreaterThan(0);
    a = step(a, 2.01, rng);
    expect(a.mode).toBe('idle');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/world/runner`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/world/runner/animations.ts`**

```ts
export type RunnerMode = 'idle' | 'look' | 'celebrate' | 'run';
export type MicroKind = 'lookLeft' | 'lookRight' | 'footTap' | 'strapTug' | 'weightShift';
type V3 = [number, number, number];

export interface MicroAction { kind: MicroKind; start: number; duration: number }

export interface RunnerAnim {
  mode: RunnerMode;
  since: number;
  lookAt: V3 | null;
  runFrom: V3 | null;
  runTo: V3 | null;
  runDuration: number;
  micro: MicroAction | null;
  nextMicroAt: number;
}

export interface Pose {
  bodyY: number; spin: number; headYaw: number; headPitch: number;
  leftArm: number; rightArm: number; leftLeg: number; rightLeg: number;
  footTap: number; hipSway: number; offset: V3;
}

export const CELEBRATE_DURATION = 0.8;
export const LOOK_DURATION = 1.5;
const MICRO: MicroKind[] = ['lookLeft', 'lookRight', 'footTap', 'strapTug', 'weightShift'];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

export function scheduleMicro(now: number, rng: () => number): number {
  return now + 3 + rng() * 3;
}

export function createAnim(now: number): RunnerAnim {
  return { mode: 'idle', since: now, lookAt: null, runFrom: null, runTo: null, runDuration: 1.2, micro: null, nextMicroAt: scheduleMicro(now, Math.random) };
}

export function trigger(anim: RunnerAnim, mode: 'celebrate' | 'look' | 'run', now: number, extra: { lookAt?: V3; from?: V3; to?: V3; duration?: number } = {}): RunnerAnim {
  return {
    ...anim, mode, since: now, micro: null,
    lookAt: mode === 'look' ? extra.lookAt ?? anim.lookAt : anim.lookAt,
    runFrom: mode === 'run' ? extra.from ?? null : anim.runFrom,
    runTo: mode === 'run' ? extra.to ?? null : anim.runTo,
    runDuration: mode === 'run' ? extra.duration ?? 1.2 : anim.runDuration,
  };
}

/** Advance timers; returns a new anim when something changed, otherwise the same object. */
export function step(anim: RunnerAnim, now: number, rng: () => number): RunnerAnim {
  const elapsed = now - anim.since;
  if (anim.mode === 'celebrate' && elapsed >= CELEBRATE_DURATION) return { ...anim, mode: 'idle', since: now, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'look' && elapsed >= LOOK_DURATION) return { ...anim, mode: 'idle', since: now, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'run' && elapsed >= anim.runDuration) return { ...anim, mode: 'idle', since: now, runFrom: null, runTo: null, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'idle') {
    if (anim.micro && now >= anim.micro.start + anim.micro.duration) return { ...anim, micro: null, nextMicroAt: scheduleMicro(now, rng) };
    if (!anim.micro && now >= anim.nextMicroAt) {
      const kind = MICRO[Math.floor(rng() * MICRO.length)];
      return { ...anim, micro: { kind, start: now, duration: kind === 'footTap' ? 1.2 : 0.9 } };
    }
  }
  return anim;
}

export function pose(anim: RunnerAnim, now: number, facingYaw: number, position: V3): Pose {
  const p: Pose = { bodyY: Math.sin(now * 2) * 0.03, spin: 0, headYaw: 0, headPitch: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, footTap: 0, hipSway: 0, offset: [0, 0, 0] };
  const elapsed = now - anim.since;

  if (anim.mode === 'celebrate') {
    const t = clamp01(elapsed / CELEBRATE_DURATION);
    p.bodyY = Math.sin(t * Math.PI) * 0.8;
    p.spin = t * Math.PI * 2;
    p.leftArm = p.rightArm = -2.6 * Math.sin(t * Math.PI);
    return p;
  }
  if (anim.mode === 'look' && anim.lookAt) {
    const dx = anim.lookAt[0] - position[0];
    const dz = anim.lookAt[2] - position[2];
    const yaw = Math.atan2(dx, dz) - facingYaw;
    const wrapped = Math.atan2(Math.sin(yaw), Math.cos(yaw));
    const amount = ease(elapsed / 0.25) * (elapsed > LOOK_DURATION - 0.3 ? ease((LOOK_DURATION - elapsed) / 0.3) : 1);
    p.headYaw = Math.max(-1, Math.min(1, wrapped)) * amount;
    p.headPitch = -0.1 * amount;
    return p;
  }
  if (anim.mode === 'run' && anim.runFrom && anim.runTo) {
    const t = clamp01(elapsed / anim.runDuration);
    p.offset = [
      anim.runFrom[0] + (anim.runTo[0] - anim.runFrom[0]) * t - position[0],
      anim.runFrom[1] + (anim.runTo[1] - anim.runFrom[1]) * t - position[1],
      anim.runFrom[2] + (anim.runTo[2] - anim.runFrom[2]) * t - position[2],
    ];
    const s = Math.sin(now * 14);
    p.leftLeg = s * 0.9; p.rightLeg = -s * 0.9; p.leftArm = -s * 0.8; p.rightArm = s * 0.8;
    p.bodyY = Math.abs(s) * 0.06;
    return p;
  }
  if (anim.micro) {
    const t = clamp01((now - anim.micro.start) / anim.micro.duration);
    const bump = Math.sin(t * Math.PI);
    switch (anim.micro.kind) {
      case 'lookLeft': p.headYaw = 0.7 * bump; break;
      case 'lookRight': p.headYaw = -0.7 * bump; break;
      case 'footTap': p.footTap = Math.max(0, Math.sin(t * Math.PI * 4)) * 0.45; break;
      case 'strapTug': p.rightArm = -1.3 * bump; p.headPitch = 0.15 * bump; break;
      case 'weightShift': p.hipSway = 0.09 * bump; break;
    }
  }
  return p;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/world/runner`
Expected: PASS.

- [ ] **Step 5: Write `src/world/runner/parts.tsx`**

```tsx
import type { RefObject } from 'react';
import type { Group, Object3D } from 'three';
import type { AvatarConfig } from '@/api/types';
import { mat } from '../materials';

export interface PartRefs {
  head: RefObject<Object3D | null>;
  torso: RefObject<Object3D | null>;
  leftArm: RefObject<Object3D | null>;
  rightArm: RefObject<Object3D | null>;
  leftLeg: RefObject<Object3D | null>;
  rightLeg: RefObject<Object3D | null>;
  leftFoot: RefObject<Object3D | null>;
  body: RefObject<Group | null>;
}

const BUILD = { slim: 0.5, regular: 0.62, chunky: 0.78 };

function Hair({ config }: { config: AvatarConfig }) {
  const m = mat(config.hairColor);
  switch (config.hair) {
    case 'buzz': return <mesh position={[0, 0.27, 0]} material={m}><boxGeometry args={[0.52, 0.08, 0.52]} /></mesh>;
    case 'spike': return (<group position={[0, 0.3, 0]}>{[-0.15, 0, 0.15].map((x, i) => <mesh key={i} position={[x, 0.12, 0]} rotation-z={(i - 1) * 0.35} material={m}><boxGeometry args={[0.12, 0.3, 0.3]} /></mesh>)}</group>);
    case 'bob': return (<group><mesh position={[0, 0.2, -0.05]} material={m}><boxGeometry args={[0.58, 0.2, 0.58]} /></mesh><mesh position={[0, -0.05, -0.2]} material={m}><boxGeometry args={[0.58, 0.45, 0.18]} /></mesh></group>);
    case 'afro': return <mesh position={[0, 0.2, 0]} material={m}><dodecahedronGeometry args={[0.42, 0]} /></mesh>;
    case 'cap': return (<group position={[0, 0.26, 0]}><mesh material={m}><boxGeometry args={[0.54, 0.14, 0.54]} /></mesh><mesh position={[0, -0.02, 0.36]} material={m}><boxGeometry args={[0.5, 0.05, 0.28]} /></mesh></group>);
  }
}

function Shoe({ config, side }: { config: AvatarConfig; side: -1 | 1 }) {
  const h = config.shoes.style === 'low' ? 0.12 : config.shoes.style === 'high' ? 0.2 : 0.28;
  return (
    <group position={[side * 0.16, 0, 0.04]}>
      <mesh position={[0, h / 2, 0]} material={mat(config.shoes.color)} castShadow><boxGeometry args={[0.26, h, 0.42]} /></mesh>
      {config.shoes.style === 'boot' && <mesh position={[0, 0.03, 0]} material={mat('navy')}><boxGeometry args={[0.28, 0.06, 0.44]} /></mesh>}
    </group>
  );
}

function Backpack({ config }: { config: AvatarConfig }) {
  if (config.backpack === 'none') return null;
  const m = mat(config.teamColor);
  return config.backpack === 'daypack'
    ? <mesh position={[0, 0.05, -0.32]} material={m} castShadow><boxGeometry args={[0.44, 0.5, 0.22]} /></mesh>
    : <mesh position={[0, 0.1, -0.3]} rotation-z={Math.PI / 2} material={m} castShadow><cylinderGeometry args={[0.13, 0.13, 0.6, 12]} /></mesh>;
}

function Board({ config }: { config: AvatarConfig }) {
  if (config.board === 'none') return null;
  if (config.board === 'hover') return (
    <group position={[0, 0.06, 0]}>
      <mesh material={mat(config.teamColor)} castShadow><boxGeometry args={[0.9, 0.08, 0.5]} /></mesh>
      <mesh position={[0, -0.05, 0]} material={mat('yellow', 'emissive')}><boxGeometry args={[0.7, 0.03, 0.36]} /></mesh>
    </group>
  );
  return (
    <group position={[0, 0.08, 0]}>
      <mesh material={mat('navy')} castShadow><boxGeometry args={[1.0, 0.06, 0.32]} /></mesh>
      {[-0.32, 0.32].flatMap((x) => [-0.13, 0.13].map((z) => <mesh key={`${x}${z}`} position={[x, -0.06, z]} rotation-x={Math.PI / 2} material={mat('yellow')}><cylinderGeometry args={[0.07, 0.07, 0.05, 8]} /></mesh>))}
    </group>
  );
}

/** Blocky toy-figure runner. Pivots: arms at shoulders, legs at hips, head at neck. Feet rest at y=0 (+ board). */
export function RunnerParts({ config, refs }: { config: AvatarConfig; refs: PartRefs }) {
  const w = BUILD[config.body];
  const boardLift = config.board === 'none' ? 0 : config.board === 'hover' ? 0.12 : 0.14;
  const tone = mat(config.tone);
  const outfit = mat(config.outfit.color);
  return (
    <group>
      <Board config={config} />
      <group ref={refs.body} position={[0, boardLift, 0]}>
        {/* legs pivot at hip height */}
        {([-1, 1] as const).map((side) => (
          <group key={side} ref={side === -1 ? refs.leftLeg : refs.rightLeg} position={[side * 0.16, 0.9, 0]}>
            <mesh position={[0, -0.42, 0]} material={mat('navy')} castShadow><boxGeometry args={[0.24, 0.8, 0.26]} /></mesh>
            <group ref={side === -1 ? refs.leftFoot : undefined} position={[-side * 0.16, -0.9, 0]}>
              <Shoe config={config} side={side} />
            </group>
          </group>
        ))}
        <group ref={refs.torso} position={[0, 0.9, 0]}>
          <mesh position={[0, 0.4, 0]} material={outfit} castShadow><boxGeometry args={[w, 0.8, 0.4]} /></mesh>
          {config.outfit.pattern === 'stripe' && <mesh position={[0, 0.4, 0.21]} material={mat('pale')}><boxGeometry args={[w + 0.02, 0.16, 0.02]} /></mesh>}
          {config.outfit.pattern === 'block' && <mesh position={[0, 0.2, 0]} material={mat('navy')}><boxGeometry args={[w + 0.01, 0.4, 0.41]} /></mesh>}
          <mesh position={[w / 2 - 0.08, 0.62, 0.21]} material={mat(config.teamColor)}><boxGeometry args={[0.14, 0.14, 0.02]} /></mesh>
          <Backpack config={config} />
          {([-1, 1] as const).map((side) => (
            <group key={side} ref={side === -1 ? refs.leftArm : refs.rightArm} position={[side * (w / 2 + 0.12), 0.75, 0]}>
              <mesh position={[0, -0.32, 0]} material={outfit} castShadow><boxGeometry args={[0.2, 0.64, 0.2]} /></mesh>
              <mesh position={[0, -0.7, 0]} material={tone}><boxGeometry args={[0.18, 0.14, 0.18]} /></mesh>
            </group>
          ))}
          <group ref={refs.head} position={[0, 0.85, 0]}>
            <mesh position={[0, 0.25, 0]} material={tone} castShadow><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>
            <mesh position={[-0.12, 0.3, 0.26]} material={mat('navy')}><boxGeometry args={[0.07, 0.09, 0.02]} /></mesh>
            <mesh position={[0.12, 0.3, 0.26]} material={mat('navy')}><boxGeometry args={[0.07, 0.09, 0.02]} /></mesh>
            <group position={[0, 0.25, 0]}><Hair config={config} /></group>
          </group>
        </group>
      </group>
    </group>
  );
}
```

- [ ] **Step 6: Write `src/world/runner/Runner.tsx`**

```tsx
import { forwardRef, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';
import type { AvatarConfig } from '@/api/types';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { ZONE_ANCHORS } from '../layout';
import { createAnim, pose, step, trigger, type RunnerAnim } from './animations';
import { RunnerParts, type PartRefs } from './parts';

export interface RunnerProps {
  config: AvatarConfig;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  zone?: string;
  celebrateKey?: number;
  runTo?: { from: [number, number, number]; to: [number, number, number]; duration?: number } | null;
}

export const Runner = forwardRef<Group, RunnerProps>(function Runner({ config, position, rotationY = 0, scale = 1, zone, celebrateKey = 0, runTo = null }, ref) {
  const anim = useRef<RunnerAnim>(createAnim(performance.now() / 1000));
  const inner = useRef<Group>(null);
  const refs: PartRefs = {
    head: useRef<Object3D | null>(null), torso: useRef<Object3D | null>(null),
    leftArm: useRef<Object3D | null>(null), rightArm: useRef<Object3D | null>(null),
    leftLeg: useRef<Object3D | null>(null), rightLeg: useRef<Object3D | null>(null),
    leftFoot: useRef<Object3D | null>(null), body: useRef<Group | null>(null),
  };

  useWorldEvents('look', (e) => {
    if (zone && e.zone !== zone) return;
    const target = e.position ?? (e.zone ? ZONE_ANCHORS[e.zone] : undefined);
    if (target) anim.current = trigger(anim.current, 'look', performance.now() / 1000, { lookAt: target });
  });
  useWorldEvents('celebrate', () => { anim.current = trigger(anim.current, 'celebrate', performance.now() / 1000); });

  useEffect(() => { if (celebrateKey > 0) anim.current = trigger(anim.current, 'celebrate', performance.now() / 1000); }, [celebrateKey]);
  useEffect(() => { if (runTo) anim.current = trigger(anim.current, 'run', performance.now() / 1000, { from: runTo.from, to: runTo.to, duration: runTo.duration }); }, [runTo]);

  useFrame(() => {
    const now = performance.now() / 1000;
    anim.current = step(anim.current, now, Math.random);
    const p = pose(anim.current, now, rotationY, position);
    if (inner.current) {
      inner.current.position.set(p.offset[0], p.offset[1] + p.bodyY, p.offset[2]);
      inner.current.rotation.y = p.spin + p.hipSway;
    }
    if (refs.head.current) { refs.head.current.rotation.y = p.headYaw; refs.head.current.rotation.x = p.headPitch; }
    if (refs.leftArm.current) refs.leftArm.current.rotation.x = p.leftArm;
    if (refs.rightArm.current) refs.rightArm.current.rotation.x = p.rightArm;
    if (refs.leftLeg.current) refs.leftLeg.current.rotation.x = p.leftLeg;
    if (refs.rightLeg.current) refs.rightLeg.current.rotation.x = p.rightLeg;
    if (refs.leftFoot.current) refs.leftFoot.current.rotation.x = -p.footTap;
    if (refs.torso.current) refs.torso.current.rotation.z = p.hipSway * 0.5;
  });

  return (
    <group ref={ref} position={position} rotation-y={rotationY} scale={scale}>
      <group ref={inner}>
        <RunnerParts config={config} refs={refs} />
      </group>
    </group>
  );
});
```

- [ ] **Step 7: Temporarily verify in the world, then lint and commit**

Add to `src/world/World.tsx` (kept — the Locker zone in Task 26 replaces this with the customizer's runner):
```tsx
import { Runner } from './runner/Runner';
import { DEFAULT_AVATAR } from '@/api/types';
…
      <Runner config={DEFAULT_AVATAR} position={[3, 0.6, -163]} rotationY={0} zone="locker" />
```
Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: at `/register/runner` (complete identity+domain first) a blocky runner with spiky hair, yellow top, cyan high-tops, a cyan daypack and a skateboard stands on the platform, breathing, occasionally looking left/right, tapping a foot or tugging a strap. Stop the server.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): procedural runner avatar with idle/look/celebrate/run animations

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 26: Runner customizer and the LOCKER zone

**Files:**
- Create: `src/world/zones/Locker.tsx`, `src/pages/Register/avatarOptions.ts`, `src/pages/Register/Customizer.tsx`
- Modify: `src/pages/Register/RunnerStep.tsx`, `src/world/World.tsx` (replace the temporary runner with `<Locker/>`), `src/store/world.ts` (`lockerCelebrate` counter)
- Test: `tests/pages/register/RunnerStep.test.tsx`

**Interfaces:**
- `avatarOptions.ts`: `PART_GROUPS` — ordered groups `{ key, label, options: { value, label }[] }` for body, tone, hair, hairColor, outfit.color, outfit.pattern, shoes.style, shoes.color, backpack, board, teamColor; `applyOption(config, key, value): AvatarConfig`.
- `Customizer({ value, onChange, onSave, saving, saveLabel })` — the chip panel + name field; on chip hover emits `look` (zone `locker`); on change increments `world.lockerCelebrate`.
- `useWorld` additions: `lockerCelebrate: number; bumpLockerCelebrate()`; `lockerAvatar: AvatarConfig | null; setLockerAvatar()` — the Locker zone renders whatever avatar the current page publishes.
- `RunnerStep` (register mode): publishes `registration.avatar` to the locker; `SAVE RUNNER` → `api.register` → session → `+25` coins → step complete → `/register/crew`.

- [ ] **Step 1: Write the failing test**

`tests/pages/register/RunnerStep.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import RunnerStep from '@/pages/Register/RunnerStep';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/register/runner']}>
      <Routes>
        <Route path="/register/runner" element={<RunnerStep />} />
        <Route path="/register/crew" element={<p>BUILD YOUR CREW.</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RunnerStep', () => {
  beforeEach(() => {
    api.reset(); window.localStorage.clear(); useSession.setState({ user: null });
    const reg = useRegistration.getState(); reg.reset();
    reg.setIdentity({ name: 'Asha Rao', email: 'asha@example.com', org: 'RV', phone: '', password: 'longpassword', confirm: 'longpassword' });
    reg.setDomain('data'); reg.complete('identity'); reg.complete('domain');
    useWorld.setState({ lockerCelebrate: 0, lockerAvatar: null, events: [] });
  });

  it('changes parts, celebrates, and publishes the avatar to the locker', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'AFRO' }));
    expect(useRegistration.getState().avatar.hair).toBe('afro');
    expect(useWorld.getState().lockerCelebrate).toBe(1);
    expect(useWorld.getState().lockerAvatar?.hair).toBe('afro');
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'HOVER' }));
    expect(useWorld.getState().events.some((e) => e.type === 'look' && e.zone === 'locker')).toBe(true);
  });
  it('validates the runner name and registers on save', async () => {
    mount();
    fireEvent.change(screen.getByLabelText('RUNNER NAME'), { target: { value: '!' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RUNNER' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('RUNNER NAME'), { target: { value: 'ASHA' } });
    fireEvent.click(screen.getByRole('button', { name: 'SAVE RUNNER' }));
    expect(await screen.findByText('BUILD YOUR CREW.')).toBeInTheDocument();
    expect(useSession.getState().user?.id).toBe('#0247');
    expect(useSession.getState().user?.avatar.name).toBe('ASHA');
    expect(useRegistration.getState().completed.runner).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/register/RunnerStep.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Extend `src/store/world.ts`**

Add `import type { AvatarConfig } from '@/api/types';`, then to `WorldState`:
```ts
  lockerCelebrate: number;
  lockerAvatar: AvatarConfig | null;
  bumpLockerCelebrate(): void;
  setLockerAvatar(a: AvatarConfig | null): void;
```
and to the store object:
```ts
  lockerCelebrate: 0,
  lockerAvatar: null,
  bumpLockerCelebrate: () => set((s) => ({ lockerCelebrate: s.lockerCelebrate + 1 })),
  setLockerAvatar: (lockerAvatar) => set({ lockerAvatar }),
```

- [ ] **Step 4: Write `src/pages/Register/avatarOptions.ts`**

```ts
import type { AvatarConfig } from '@/api/types';
import { SWATCH_NAMES, type PaletteName } from '@/theme/palette';

export type PartKey = 'body' | 'tone' | 'hair' | 'hairColor' | 'outfitColor' | 'outfitPattern' | 'shoeStyle' | 'shoeColor' | 'backpack' | 'board' | 'teamColor';

export interface PartGroup { key: PartKey; label: string; swatch?: boolean; options: { value: string; label: string }[] }

const swatches = SWATCH_NAMES.map((c) => ({ value: c, label: c.toUpperCase() }));

export const PART_GROUPS: PartGroup[] = [
  { key: 'body', label: 'BODY', options: [{ value: 'slim', label: 'SLIM' }, { value: 'regular', label: 'REGULAR' }, { value: 'chunky', label: 'CHUNKY' }] },
  { key: 'tone', label: 'TONE', swatch: true, options: [{ value: 'orange', label: 'ORANGE' }, { value: 'pale', label: 'PALE' }, { value: 'yellow', label: 'YELLOW' }] },
  { key: 'hair', label: 'HAIR', options: [{ value: 'buzz', label: 'BUZZ' }, { value: 'spike', label: 'SPIKE' }, { value: 'bob', label: 'BOB' }, { value: 'afro', label: 'AFRO' }, { value: 'cap', label: 'CAP' }] },
  { key: 'hairColor', label: 'HAIR COLOUR', swatch: true, options: swatches },
  { key: 'outfitColor', label: 'OUTFIT', swatch: true, options: swatches },
  { key: 'outfitPattern', label: 'PATTERN', options: [{ value: 'solid', label: 'SOLID' }, { value: 'stripe', label: 'STRIPE' }, { value: 'block', label: 'BLOCK' }] },
  { key: 'shoeStyle', label: 'SHOES', options: [{ value: 'low', label: 'LOW' }, { value: 'high', label: 'HIGH' }, { value: 'boot', label: 'BOOT' }] },
  { key: 'shoeColor', label: 'SHOE COLOUR', swatch: true, options: swatches },
  { key: 'backpack', label: 'BACKPACK', options: [{ value: 'none', label: 'NONE' }, { value: 'daypack', label: 'DAYPACK' }, { value: 'tube', label: 'TUBE' }] },
  { key: 'board', label: 'BOARD', options: [{ value: 'skate', label: 'SKATE' }, { value: 'hover', label: 'HOVER' }, { value: 'none', label: 'NONE' }] },
  { key: 'teamColor', label: 'TEAM COLOUR', swatch: true, options: swatches },
];

export function currentValue(config: AvatarConfig, key: PartKey): string {
  switch (key) {
    case 'outfitColor': return config.outfit.color;
    case 'outfitPattern': return config.outfit.pattern;
    case 'shoeStyle': return config.shoes.style;
    case 'shoeColor': return config.shoes.color;
    default: return config[key];
  }
}

export function applyOption(config: AvatarConfig, key: PartKey, value: string): AvatarConfig {
  const c = value as PaletteName;
  switch (key) {
    case 'outfitColor': return { ...config, outfit: { ...config.outfit, color: c } };
    case 'outfitPattern': return { ...config, outfit: { ...config.outfit, pattern: value as AvatarConfig['outfit']['pattern'] } };
    case 'shoeStyle': return { ...config, shoes: { ...config.shoes, style: value as AvatarConfig['shoes']['style'] } };
    case 'shoeColor': return { ...config, shoes: { ...config.shoes, color: c } };
    case 'hairColor': case 'teamColor': return { ...config, [key]: c };
    case 'tone': return { ...config, tone: value as AvatarConfig['tone'] };
    case 'body': return { ...config, body: value as AvatarConfig['body'] };
    case 'hair': return { ...config, hair: value as AvatarConfig['hair'] };
    case 'backpack': return { ...config, backpack: value as AvatarConfig['backpack'] };
    case 'board': return { ...config, board: value as AvatarConfig['board'] };
  }
}
```

- [ ] **Step 5: Write `src/pages/Register/Customizer.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { AvatarConfig } from '@/api/types';
import { validateRunnerName } from '@/lib/validation';
import { useWorld } from '@/store/world';
import type { PaletteName } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Chip } from '@/ui/Chip';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';
import { applyOption, currentValue, PART_GROUPS } from './avatarOptions';

export interface CustomizerProps {
  title: string;
  subtitle: string;
  value: AvatarConfig;
  onChange(next: AvatarConfig): void;
  onSave(): void | Promise<void>;
  saving?: boolean;
  saveLabel: string;
}

export function Customizer({ title, subtitle, value, onChange, onSave, saving, saveLabel }: CustomizerProps) {
  const [nameError, setNameError] = useState<string>();

  useEffect(() => { useWorld.getState().setLockerAvatar(value); }, [value]);
  useEffect(() => () => useWorld.getState().setLockerAvatar(null), []);

  const pick = (key: (typeof PART_GROUPS)[number]['key'], v: string) => {
    onChange(applyOption(value, key, v));
    useWorld.getState().bumpLockerCelebrate();
    useWorld.getState().emit({ type: 'burst', zone: 'locker', color: 'cyan' });
  };
  const glance = () => useWorld.getState().emit({ type: 'look', zone: 'locker' });

  const save = () => {
    const err = validateRunnerName(value.name);
    setNameError(err);
    if (!err) void onSave();
  };

  return (
    <Panel title={title} className="w-full max-w-lg max-h-[88dvh] overflow-y-auto">
      <p className="-mt-2 mb-4 font-ui text-sm font-bold">{subtitle}</p>
      <Field label="RUNNER NAME" name="runnerName" zone="locker" value={value.name} maxLength={16}
        onChange={(e) => onChange({ ...value, name: e.target.value.toUpperCase() })} error={nameError} hint="2–16 letters, digits or spaces — printed on your Hack Pass" />
      {PART_GROUPS.map((g) => (
        <fieldset key={g.key} className="mb-4">
          <legend className="mb-2 font-display text-xs tracking-widest">{g.label}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map((o) => (
              <Chip key={o.value} selected={currentValue(value, g.key) === o.value} swatch={g.swatch ? (o.value as PaletteName) : undefined}
                onClick={() => pick(g.key, o.value)} onMouseEnter={glance} title={o.label}>
                {g.swatch ? '' : o.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      ))}
      <ArcadeButton size="lg" className="w-full" disabled={saving} onClick={save}>{saveLabel}</ArcadeButton>
    </Panel>
  );
}
```
`Chip` must expose the option label to assistive tech when it renders only a swatch: in `src/ui/Chip.tsx` add `aria-label={title}` to the `<button>`.

- [ ] **Step 6: Write `src/pages/Register/RunnerStep.tsx` and `src/world/zones/Locker.tsx`**

`src/pages/Register/RunnerStep.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/api';
import { ApiError } from '@/api/types';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';
import { Customizer } from './Customizer';

export default function RunnerStep() {
  const navigate = useNavigate();
  const avatar = useRegistration((s) => s.avatar);
  const setAvatar = useRegistration((s) => s.setAvatar);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const reg = useRegistration.getState();
    if (!reg.identity || !reg.domain) { navigate('/register/identity'); return; }
    setSaving(true);
    try {
      const runner = await api.register({
        name: reg.identity.name, email: reg.identity.email, org: reg.identity.org, phone: reg.identity.phone,
        password: reg.identity.password, domain: reg.domain, avatar: reg.avatar,
      });
      useSession.getState().setUser(runner);
      if (!reg.completed.runner) useGame.getState().awardCoins(25, 'RUNNER CREATED');
      reg.complete('runner');
      navigate('/register/crew');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') {
        useToasts.getState().push({ kind: 'error', title: 'EMAIL TAKEN', body: 'That email already has a runner — sign in or use another.' });
        navigate('/register/identity');
      } else if (err instanceof ApiError && err.code === 'NOT_SIGNED_IN') {
        useToasts.getState().push({ kind: 'error', title: 'SESSION EXPIRED', body: 'Your password was not kept across the refresh. Enter it again.' });
        navigate('/register/identity');
      } else {
        useToasts.getState().push({ kind: 'error', title: 'KIOSK JAMMED', body: 'Try saving again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[6vw]">
      <Customizer title="YOUR RUN. YOUR IDENTITY." subtitle="Step 3 of 5 — dress your runner. Every part is a tap." value={avatar} onChange={setAvatar} onSave={save} saving={saving} saveLabel="SAVE RUNNER" />
    </main>
  );
}
```
Note: the identity draft drops the password on refresh (never persisted). If `reg.identity.password` is empty, `register` would store an empty password; guard it: at the top of `save`, `if (!reg.identity.password) { navigate('/register/identity'); useToasts.getState().push({ kind: 'info', title: 'ONE MORE TIME', body: 'Re-enter your password to continue.' }); return; }`.

`src/world/zones/Locker.tsx`:
```tsx
import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Group } from 'three';
import { DEFAULT_AVATAR } from '@/api/types';
import { useWorld } from '@/store/world';
import { PLATFORM_Y, RIGHT_WALL_X } from '../layout';
import { mat } from '../materials';
import { ZoneLight } from '../props/Kiosk';
import { Sign } from '../props/Sign';
import { Runner } from '../runner/Runner';

const PAD: [number, number, number] = [3, PLATFORM_Y, -163];

export function Locker() {
  const avatar = useWorld((s) => s.lockerAvatar);
  const celebrateKey = useWorld((s) => s.lockerCelebrate);
  const active = useWorld((s) => s.shot === 'locker');
  const turntable = useRef<Group>(null);
  const [drag, setDrag] = useState<{ x: number; rot: number } | null>(null);
  const targetRot = useRef(0);

  useFrame((_, delta) => {
    if (!turntable.current) return;
    if (!drag) targetRot.current = 0;
    damp(turntable.current.rotation, 'y', targetRot.current, drag ? 0.05 : 0.6, delta);
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setDrag({ x: e.clientX, rot: turntable.current?.rotation.y ?? 0 }); };
  const onMove = (e: ThreeEvent<PointerEvent>) => { if (drag) targetRot.current = drag.rot + (e.clientX - drag.x) * 0.01; };
  const onUp = () => setDrag(null);

  return (
    <group>
      {[-2, 0, 2, 4].map((dz) => (
        <group key={dz} position={[RIGHT_WALL_X - 0.6, PLATFORM_Y, -160 + dz]}>
          <mesh position={[0, 1.1, 0]} material={mat('navy')} castShadow><boxGeometry args={[0.8, 2.2, 1.6]} /></mesh>
          <mesh position={[-0.42, 1.1, 0]} material={mat('pale')}><boxGeometry args={[0.04, 2.0, 1.4]} /></mesh>
          <mesh position={[-0.45, 1.3, 0.4]} material={mat('yellow')}><boxGeometry args={[0.03, 0.2, 0.1]} /></mesh>
        </group>
      ))}
      <Sign text="YOUR RUN. YOUR IDENTITY." position={[RIGHT_WALL_X - 0.4, 4.6, -163]} rotation={[0, -Math.PI / 2, 0]} width={8} height={1.1} size={0.5} />
      {/* picking a part bursts at the locker; this light flashes the runner cyan for a beat (spec §7.4) */}
      <ZoneLight position={[3, 3.4, -161]} zones={['locker']} />
      <group ref={turntable} position={PAD} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <mesh position={[0, 0.1, 0]} material={mat('yellow')} receiveShadow>
          <cylinderGeometry args={[1.6, 1.7, 0.2, 32]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={mat('navy')}>
          <torusGeometry args={[1.3, 0.04, 6, 40]} />
        </mesh>
        {/* the runner's eyes are on its +Z face; the locker camera looks down −Z, so rotationY 0 faces the camera */}
        {active && <Runner config={avatar ?? DEFAULT_AVATAR} position={[0, 0.2, 0]} rotationY={0} zone="locker" celebrateKey={celebrateKey} />}
      </group>
    </group>
  );
}
```
In `src/world/World.tsx`: remove the temporary `<Runner …/>` from Task 25 and its imports; add `import { Locker } from './zones/Locker';` and mount `<Locker />` after `<Wall />`.

- [ ] **Step 7: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: `/register/runner` shows the runner on a yellow turntable in front of navy lockers; hovering chips makes the runner glance at the panel; picking a chip changes the part and the runner hops and spins; dragging the pad rotates the runner and it eases back. SAVE RUNNER moves to the crew step and the HUD now shows the runner chip with coins.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): runner customizer with locker zone and registration on save

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 27: Team store, badge sync, crew step and the CREW zone

**Files:**
- Create: `src/store/team.ts`, `src/store/badgeSync.ts`, `src/world/zones/Crew.tsx`, `src/pages/Register/CrewForms.tsx`
- Modify: `src/pages/Register/Crew.tsx`, `src/world/World.tsx`
- Test: `tests/store/team.test.ts`, `tests/pages/register/Crew.test.tsx`

**Interfaces:**
- `useTeam`: `{ team: Team | null; loading: boolean; load(): Promise<void>; create(name, maxMembers): Promise<Team>; join(code): Promise<Team>; leave(): Promise<void> }` — every mutation re-hydrates the session (the runner's `teamId` changes) and calls `syncBadges()`.
- `badgeSync.ts`: `syncBadges(extra?: { hasSubmission?: boolean; submittedAtMs?: number | null; rank?: number | null; judging?: boolean }): BadgeId[]` — evaluates `evaluateBadges` from live stores and awards new ones through `useGame`.
- `CrewForms.tsx`: `CreateTeamForm({ onDone })`, `JoinTeamForm({ onDone })`, `CrewCards({ team })` — reused by the station's Team section.
- `Crew` page: choose → create/join/solo → `YOUR CREW` → `CONTINUE TO CHECK-IN`.
- `Crew` zone: renders each member as a `Runner` on painted team markers while the `crew` shot is active.

- [ ] **Step 1: Write the failing tests**

`tests/store/team.test.ts`:
```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEFAULT_AVATAR } from '@/api/types';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';

describe('team store', () => {
  beforeEach(async () => {
    api.reset(); window.localStorage.clear(); useGame.getState().reset(); useTeam.setState({ team: null, loading: false });
    useSession.setState({ user: await api.register({ name: 'A', email: 'a@x.io', org: 'X', phone: '', password: 'longpassword', domain: 'ai', avatar: DEFAULT_AVATAR }) });
  });

  it('creates, re-hydrates the session and awards TEAM BUILDER only at two members', async () => {
    const t = await useTeam.getState().create('NEW CREW', 3);
    expect(useTeam.getState().team?.id).toBe(t.id);
    expect(useSession.getState().user?.teamId).toBe(t.id);
    expect(useGame.getState().badges.TEAM_BUILDER).toBeUndefined();
    await useTeam.getState().leave();
    expect(useSession.getState().user?.teamId).toBeNull();
    await useTeam.getState().join('RAIL-7K2Q');
    expect(useGame.getState().badges.TEAM_BUILDER).toBeDefined();
  });
});
```

`tests/pages/register/Crew.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEFAULT_AVATAR } from '@/api/types';
import Crew from '@/pages/Register/Crew';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/register/crew']}>
      <Routes>
        <Route path="/register/crew" element={<Crew />} />
        <Route path="/register/pass" element={<p>YOU'RE IN.</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Crew step', () => {
  beforeEach(async () => {
    api.reset(); window.localStorage.clear(); useRegistration.getState().reset(); useTeam.setState({ team: null, loading: false });
    useSession.setState({ user: await api.register({ name: 'Asha', email: 'asha@x.io', org: 'X', phone: '', password: 'longpassword', domain: 'data', avatar: { ...DEFAULT_AVATAR, name: 'ASHA' } }) });
  });

  it('joins a crew by code and shows the crew before continuing', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'JOIN TEAM' }));
    fireEvent.change(screen.getByLabelText('ENTER TEAM CODE'), { target: { value: 'rail-7k2q' } });
    fireEvent.click(screen.getByRole('button', { name: 'JOIN CREW' }));
    expect(await screen.findByText('YOUR CREW')).toBeInTheDocument();
    expect(screen.getByText('PIXEL RAIDERS')).toBeInTheDocument();
    expect(screen.getAllByText(/ASHA|DEMO|MIRA/).length).toBeGreaterThanOrEqual(3);
    fireEvent.click(screen.getByRole('button', { name: 'CONTINUE TO CHECK-IN' }));
    expect(screen.getByText("YOU'RE IN.")).toBeInTheDocument();
    expect(useRegistration.getState().completed.crew).toBe(true);
  });
  it('creates a crew with a code and rejects bad input', async () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'CREATE TEAM' }));
    fireEvent.click(screen.getByRole('button', { name: 'CREATE CREW' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('TEAM NAME'), { target: { value: 'NEW CREW' } });
    fireEvent.click(screen.getByRole('button', { name: 'CREATE CREW' }));
    expect(await screen.findByText(/RAIL-[A-Z2-9]{4}/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'COPY' })).toBeInTheDocument();
  });
  it('can run solo', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'RUN SOLO FOR NOW' }));
    expect(screen.getByText("YOU'RE IN.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/store/team.test.ts tests/pages/register/Crew.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/store/badgeSync.ts` and `src/store/team.ts`**

`src/store/badgeSync.ts`:
```ts
import { EVENT } from '@/config/event';
import { evaluateBadges, type BadgeId } from '@/lib/badges';
import { now } from '@/lib/time';
import { useGame } from './game';
import { useSession } from './session';
import { useTeam } from './team';

export interface BadgeExtra { hasSubmission?: boolean; submittedAtMs?: number | null; rank?: number | null; judging?: boolean }

/** Evaluate every badge rule against live state and award the new ones. Returns the newly awarded ids. */
export function syncBadges(extra: BadgeExtra = {}): BadgeId[] {
  const user = useSession.getState().user;
  const team = useTeam.getState().team;
  const earned = evaluateBadges({
    registered: !!user,
    teamSize: team?.members.length ?? 0,
    hasSubmission: extra.hasSubmission ?? false,
    localHour: new Date(now()).getHours(),
    registeredAtMs: user ? Date.parse(user.registeredAt) : null,
    submittedAtMs: extra.submittedAtMs ?? null,
    rank: extra.rank ?? null,
    judging: extra.judging ?? now() >= Date.parse(EVENT.timeline.submissionDeadline),
  });
  return earned.filter((id) => useGame.getState().awardBadge(id));
}
```

`src/store/team.ts`:
```ts
import { create } from 'zustand';
import { api } from '@/api';
import type { Team } from '@/api/types';
import { syncBadges } from './badgeSync';
import { useSession } from './session';

interface TeamState {
  team: Team | null;
  loading: boolean;
  load(): Promise<void>;
  create(name: string, maxMembers: number): Promise<Team>;
  join(code: string): Promise<Team>;
  leave(): Promise<void>;
}

export const useTeam = create<TeamState>()((set) => {
  const settle = (team: Team | null) => { set({ team, loading: false }); useSession.getState().hydrate(); syncBadges(); };
  return {
    team: null,
    loading: false,
    async load() { set({ loading: true }); settle(await api.getTeam()); },
    async create(name, maxMembers) { const t = await api.createTeam({ name, maxMembers }); settle(t); return t; },
    async join(code) { const t = await api.joinTeam(code); settle(t); return t; },
    async leave() { await api.leaveTeam(); settle(null); },
  };
});
```
(`badgeSync.ts` imports `useTeam` and `team.ts` imports `syncBadges`. Both only reference the other's export inside function bodies, never at module top level, so the ES-module cycle is safe.)

- [ ] **Step 4: Write `src/pages/Register/CrewForms.tsx`**

```tsx
import { useState, type FormEvent } from 'react';
import { ApiError, type Team } from '@/api/types';
import { EVENT, domainById } from '@/config/event';
import { hasErrors, validateTeamCode, validateTeamCreate } from '@/lib/validation';
import { useTeam } from '@/store/team';
import { useToasts } from '@/store/toasts';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';

export function CreateTeamForm({ onDone }: { onDone: (t: Team) => void }) {
  const [name, setName] = useState('');
  const [max, setMax] = useState(EVENT.team.max);
  const [errors, setErrors] = useState<{ name?: string; maxMembers?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateTeamCreate({ name, maxMembers: max }, EVENT.team.max);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try { onDone(await useTeam.getState().create(name.trim().toUpperCase(), max)); }
    catch (err) { setErrors({ form: err instanceof ApiError ? err.message : 'The crew board jammed.' }); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="TEAM NAME" name="teamName" zone="crew" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} maxLength={24} />
      <label htmlFor="field-maxMembers" className="mb-1 block font-display text-xs tracking-widest">MAXIMUM MEMBERS</label>
      <select id="field-maxMembers" value={max} onChange={(e) => setMax(Number(e.target.value))}
        className="pointer-auto mb-4 block w-full border-[3px] border-navy bg-white px-3 py-3 font-ui text-navy focus:border-cyan focus:outline-none">
        {Array.from({ length: EVENT.team.max - 1 }, (_, i) => i + 2).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      {errors.maxMembers && <p role="alert" className="mb-2 text-sm font-bold text-red">{errors.maxMembers}</p>}
      <p className="mb-4 font-ui text-xs font-bold">TEAM LEADER: you.</p>
      {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
      <ArcadeButton type="submit" className="w-full" disabled={busy}>CREATE CREW</ArcadeButton>
    </form>
  );
}

export function JoinTeamForm({ onDone }: { onDone: (t: Team) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateTeamCode(code);
    setError(v);
    if (v) return;
    setBusy(true);
    try { onDone(await useTeam.getState().join(code)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'The crew board jammed.'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="ENTER TEAM CODE" name="teamCode" zone="crew" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} error={error} placeholder="RAIL-7K2Q" maxLength={9} />
      <ArcadeButton type="submit" className="w-full" disabled={busy}>JOIN CREW</ArcadeButton>
    </form>
  );
}

export function CrewCards({ team }: { team: Team }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(team.code); useToasts.getState().push({ kind: 'info', title: 'CODE COPIED', body: team.code }); }
    catch { useToasts.getState().push({ kind: 'info', title: 'TEAM CODE', body: team.code }); }
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-xl">{team.name}</p>
        <p className="flex items-center gap-2 font-display text-sm">
          <span className="border-[3px] border-navy bg-yellow px-2 py-0.5">{team.code}</span>
          <button type="button" onClick={copy} className="pointer-auto border-[3px] border-navy bg-white px-2 py-0.5 shadow-bevel-sm hover:bg-cyan">COPY</button>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {team.members.map((m) => (
          <li key={m.runnerId} className="flex items-center gap-3 border-[3px] border-navy bg-white p-2">
            <span aria-hidden className="grid h-10 w-10 place-items-center border-2 border-navy font-display text-xs" style={{ background: PALETTE[m.avatar.teamColor] }}>{m.avatar.name.slice(0, 2)}</span>
            <span>
              <span className="block font-display text-sm">{m.avatar.name}</span>
              <span className="block font-ui text-xs font-bold">{`${m.role === 'leader' ? 'LEADER' : 'RUNNER'} · ${domainById(m.domain).name}`}</span>
            </span>
          </li>
        ))}
        {Array.from({ length: team.maxMembers - team.members.length }, (_, i) => (
          <li key={`open-${i}`} className="grid place-items-center border-[3px] border-dashed border-navy p-2 font-display text-xs">OPEN SEAT</li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/pages/Register/Crew.tsx` and `src/world/zones/Crew.tsx`**

`src/pages/Register/Crew.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useTeam } from '@/store/team';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { CreateTeamForm, CrewCards, JoinTeamForm } from './CrewForms';

type View = 'choose' | 'create' | 'join';

export default function Crew() {
  const navigate = useNavigate();
  const team = useTeam((s) => s.team);
  const [view, setView] = useState<View>('choose');

  useEffect(() => { void useTeam.getState().load(); }, []);

  const finish = () => {
    const reg = useRegistration.getState();
    if (!reg.completed.crew) useGame.getState().awardCoins(25, 'CREW STEP');
    reg.complete('crew');
    navigate('/register/pass');
  };

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="BUILD YOUR CREW." className="w-full max-w-lg">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 4 of 5 — teams of 1–4. Create a crew, join one with a code, or run solo.</p>
        {team ? (
          <>
            <h3 className="mb-3 font-display text-xs tracking-widest">YOUR CREW</h3>
            <CrewCards team={team} />
            <div className="mt-5"><ArcadeButton size="lg" className="w-full" onClick={finish}>CONTINUE TO CHECK-IN</ArcadeButton></div>
          </>
        ) : view === 'choose' ? (
          <div className="grid gap-3">
            <ArcadeButton size="lg" onClick={() => setView('create')}>CREATE TEAM</ArcadeButton>
            <ArcadeButton size="lg" variant="secondary" onClick={() => setView('join')}>JOIN TEAM</ArcadeButton>
            <ArcadeButton variant="ghost" burst={false} onClick={finish}>RUN SOLO FOR NOW</ArcadeButton>
          </div>
        ) : view === 'create' ? (
          <>
            <CreateTeamForm onDone={() => undefined} />
            <button type="button" onClick={() => setView('choose')} className="pointer-auto mt-3 font-ui text-xs font-bold underline">← BACK</button>
          </>
        ) : (
          <>
            <JoinTeamForm onDone={() => undefined} />
            <button type="button" onClick={() => setView('choose')} className="pointer-auto mt-3 font-ui text-xs font-bold underline">← BACK</button>
          </>
        )}
      </Panel>
    </main>
  );
}
```

`src/world/zones/Crew.tsx`:
```tsx
import { useTeam } from '@/store/team';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Runner } from '../runner/Runner';

const SLOTS = [1.5, 3, 4.5, 6];

/** Team markers painted on the platform; members stand on them while the crew shot is active. */
export function Crew() {
  const team = useTeam((s) => s.team);
  const user = useSession((s) => s.user);
  const active = useWorld((s) => s.shot === 'crew');
  const members = team?.members ?? (user ? [{ runnerId: user.id, avatar: user.avatar }] : []);
  return (
    <group>
      {SLOTS.map((x, i) => (
        <mesh key={x} position={[x, PLATFORM_Y + 0.01, -178]} rotation-x={-Math.PI / 2} material={mat(members[i] ? members[i].avatar.teamColor : 'pale')}>
          <circleGeometry args={[0.7, 24]} />
        </mesh>
      ))}
      {active && members.slice(0, 4).map((m, i) => (
        <Runner key={m.runnerId} config={m.avatar} position={[SLOTS[i], PLATFORM_Y, -178]} rotationY={0} zone="crew" />
      ))}
    </group>
  );
}
```
Mount `<Crew />` in `src/world/World.tsx` after `<Locker />`.

- [ ] **Step 6: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: `/register/crew` shows painted markers; after joining PIXEL RAIDERS three runners stand together on the platform; the cards show the code with COPY.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): crew step with team store, badge sync and crew zone

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 28: The STATION zone — six trains, platform lights, arrival sequence

**Files:**
- Create: `src/config/trains.ts`, `src/world/zones/Station.tsx`, `src/world/props/StationTrain.tsx`, `src/lib/arrival.ts`
- Modify: `src/store/world.ts` (`trainHandler`, `arrivalAt`), `src/world/World.tsx`
- Test: `tests/lib/arrival.test.ts`

**Interfaces:**
- `useWorld` additions: `trainHandler: ((i: number) => void) | null; setTrainHandler()`, `arrivalAt: number | null; startArrival(); clearArrival()`.
- `arrival.ts`: `ARRIVAL_DURATION = 2.5`, `arrivalAt(t): { trainZ: number; doors: number; lightsOn: number }` (lightsOn = count of 8 lights lit), `ARRIVAL_STOP_Z = -186`.
- `TRAIN_LABELS: { n: string; name: string; path: string }[]` (01 MY PROFILE … 06 ANNOUNCEMENTS) in `src/config/trains.ts` (DOM-safe; the zone, the station layout and the platform page all import it from there).
- `StationTrain({ index, hovered, selected, onHover, onClick, unread? })` — one parked car with a roof sign, strip and doors.

- [ ] **Step 1: Write the failing test**

`tests/lib/arrival.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ARRIVAL_DURATION, ARRIVAL_STOP_Z, arrivalAt } from '@/lib/arrival';

describe('arrivalAt', () => {
  it('rolls the train in, lights up in sequence and opens the doors at the end', () => {
    expect(arrivalAt(0).trainZ).toBeGreaterThan(ARRIVAL_STOP_Z + 40);
    expect(arrivalAt(0).lightsOn).toBe(0);
    expect(arrivalAt(0).doors).toBe(0);
    expect(arrivalAt(1.2).lightsOn).toBeGreaterThan(0);
    expect(arrivalAt(ARRIVAL_DURATION).trainZ).toBeCloseTo(ARRIVAL_STOP_Z, 5);
    expect(arrivalAt(ARRIVAL_DURATION).lightsOn).toBe(8);
    expect(arrivalAt(ARRIVAL_DURATION).doors).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/arrival.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `src/lib/arrival.ts` and extend the world store**

`src/lib/arrival.ts`:
```ts
export const ARRIVAL_DURATION = 2.5;
export const ARRIVAL_STOP_Z = -186;
const START_Z = -120;

const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - t, 3); };

/** Lights flick on over the first 1.5 s; the train decelerates in over 2 s; doors open in the last 0.5 s. */
export function arrivalAt(t: number): { trainZ: number; doors: number; lightsOn: number } {
  const c = Math.min(ARRIVAL_DURATION, Math.max(0, t));
  const lightsOn = Math.min(8, Math.floor((c / 1.5) * 8 + 1e-9));
  const trainZ = START_Z + (ARRIVAL_STOP_Z - START_Z) * ease(c / 2.0);
  const doors = c < 2.0 ? 0 : (c - 2.0) / 0.5;
  return { trainZ, doors: Math.min(1, doors), lightsOn };
}
```

Add to `WorldState` in `src/store/world.ts`:
```ts
  trainHandler: ((i: number) => void) | null;
  setTrainHandler(fn: ((i: number) => void) | null): void;
  arrivalAt: number | null;
  startArrival(): void;
  clearArrival(): void;
```
and to the store object:
```ts
  trainHandler: null,
  setTrainHandler: (trainHandler) => set({ trainHandler }),
  arrivalAt: null,
  startArrival: () => set({ arrivalAt: Date.now() }),
  clearArrival: () => set({ arrivalAt: null }),
```

- [ ] **Step 4: Write `src/world/props/StationTrain.tsx`**

```tsx
import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Group } from 'three';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { TRACK_X } from '../layout';
import { mat } from '../materials';
import { Train } from './Train';

export interface StationTrainProps {
  index: number;            // 1..6
  z: number;
  label: string;            // "01 MY PROFILE"
  hovered: boolean;
  selected: boolean;
  unread?: number;
  onHover(h: boolean): void;
  onClick(): void;
}

export function StationTrain({ index, z, label, hovered, selected, unread = 0, onHover, onClick }: StationTrainProps) {
  const doors = useRef({ v: 0 });
  useFrame((_, delta) => { damp(doors.current, 'v', selected ? 1 : hovered ? 0.3 : 0, 0.2, delta); });
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  return (
    <group
      onPointerOver={(e) => { stop(e); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { stop(e); onHover(false); document.body.style.cursor = ''; }}
      onClick={(e) => { stop(e); onClick(); }}
    >
      <Train cars={1} z={z} doorsRef={doors} />
      <group position={[TRACK_X + 1.5, 4.2, z]} rotation-y={Math.PI / 2}>
        <mesh material={hovered || selected ? mat('cyan', 'emissive') : mat('pale')}><boxGeometry args={[5.5, 0.9, 0.12]} /></mesh>
        <mesh position={[-2.3, 0, 0.07]} material={mat('yellow')}><boxGeometry args={[0.8, 0.7, 0.02]} /></mesh>
        <Text font={BUNGEE_URL} fontSize={0.34} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[-2.3, 0, 0.09]}>{String(index).padStart(2, '0')}</Text>
        <Text font={BUNGEE_URL} fontSize={0.34} color={PALETTE.navy} anchorX="left" anchorY="middle" position={[-1.7, 0, 0.09]}>{label.replace(/^\d+ /, '')}</Text>
        {unread > 0 && (
          <group position={[2.4, 0.55, 0.1]}>
            <mesh material={mat('red')}><cylinderGeometry args={[0.32, 0.32, 0.06, 16]} /></mesh>
            <Text font={BUNGEE_URL} fontSize={0.28} color={PALETTE.white} anchorX="center" anchorY="middle" position={[0, 0, 0.05]}>{String(unread)}</Text>
          </group>
        )}
      </group>
    </group>
  );
}
```
(Remove the unused `Group` import from `three` in this file.)

- [ ] **Step 5: Write `src/config/trains.ts`, `src/world/zones/Station.tsx` and mount it**

`src/config/trains.ts`:
```ts
export const TRAIN_LABELS = [
  { n: '01', name: 'MY PROFILE', path: '/station/profile' },
  { n: '02', name: 'MY TEAM', path: '/station/team' },
  { n: '03', name: 'CHALLENGE', path: '/station/challenge' },
  { n: '04', name: 'SUBMISSIONS', path: '/station/submissions' },
  { n: '05', name: 'LEADERBOARD', path: '/station/leaderboard' },
  { n: '06', name: 'ANNOUNCEMENTS', path: '/station/announcements' },
] as const;
```

`src/world/zones/Station.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, PointLight } from 'three';
import { api } from '@/api';
import { ARRIVAL_DURATION, arrivalAt } from '@/lib/arrival';
import { TRAIN_LABELS } from '@/config/trains';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { PLATFORM_Y } from '../layout';
import { StationTrain } from '../props/StationTrain';
import { Train } from '../props/Train';
import { Runner } from '../runner/Runner';
import { TRAIN_Z } from '../shots';

function PlatformLights() {
  const lights = useRef<PointLight[]>([]);
  useFrame(() => {
    const at = useWorld.getState().arrivalAt;
    const t = at == null ? ARRIVAL_DURATION : (Date.now() - at) / 1000;
    const { lightsOn } = arrivalAt(t);
    lights.current.forEach((l, i) => { if (l) l.intensity = i < lightsOn ? 2.2 : 0; });
  });
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <pointLight key={i} ref={(l) => { if (l) lights.current[i] = l; }} color={PALETTE.yellow} intensity={2.2} distance={12} position={[3, 6, -190 - i * 7]} />
      ))}
    </>
  );
}

function ArrivalTrain() {
  const at = useWorld((s) => s.arrivalAt);
  const g = useRef<Group>(null);
  const [doors, setDoors] = useState(0);
  useFrame(() => {
    if (at == null || !g.current) return;
    const f = arrivalAt((Date.now() - at) / 1000);
    g.current.position.z = f.trainZ;
    if (Math.abs(f.doors - doors) > 0.05) setDoors(f.doors);
  });
  if (at == null) return null;
  return (
    <group ref={g}>
      <Train cars={1} z={0} rotationY={Math.PI} band="yellow" doorsOpen={doors} speed={at ? 8 : 0} />
    </group>
  );
}

export function Station() {
  const shot = useWorld((s) => s.shot);
  const hovered = useWorld((s) => s.hovered);
  const setHovered = useWorld((s) => s.setHovered);
  const user = useSession((s) => s.user);
  const active = shot === 'station' || shot === 'stationArrival' || shot.startsWith('train');
  const selectedIndex = shot.startsWith('train') ? Number(shot.slice(5)) : 0;
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (active) setUnread(api.unreadAnnouncementCount()); }, [active, shot]);

  return (
    <group>
      <PlatformLights />
      <ArrivalTrain />
      {TRAIN_LABELS.map((t, i) => (
        <StationTrain
          key={t.n} index={i + 1} z={TRAIN_Z(i + 1)} label={`${t.n} ${t.name}`}
          hovered={hovered === `train:${i + 1}`} selected={selectedIndex === i + 1}
          unread={i === 5 ? unread : 0}
          onHover={(h) => setHovered(h ? `train:${i + 1}` : null)}
          onClick={() => useWorld.getState().trainHandler?.(i + 1)}
        />
      ))}
      {active && user && <Runner config={user.avatar} position={[2, PLATFORM_Y, -206]} rotationY={0.6} zone="station" />}
    </group>
  );
}
```
Mount `<Station />` in `src/world/World.tsx` after `<Crew />`.

- [ ] **Step 6: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: sign in with the demo runner and open `/station`: six navy cars with pale roof signs `01 MY PROFILE … 06 ANNOUNCEMENTS` (06 carries a red unread badge), the demo runner idling on the platform; hovering a car cracks its doors and lights the sign cyan. Run `useWorld.getState().startArrival()` in the console: eight yellow platform lights flick on in sequence and a train rolls in from the tunnel side and opens its doors.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): runner station zone with six trains, platform lights and arrival sequence

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 29: YOU'RE IN — arrival, Hack Pass and QR

**Files:**
- Create: `src/ui/QrCode.tsx`, `src/ui/HackPass.tsx`
- Modify: `src/pages/Register/Pass.tsx`
- Test: `tests/ui/QrCode.test.tsx`, `tests/pages/register/Pass.test.tsx`

**Interfaces:**
- `QrCode({ value, size? })` — canvas QR, navy on pale.
- `HackPass({ runner, teamName, status })` — the travel-pass card; `qrValue(runnerId)` → `aiexpo:runner:#0247`.
- `Pass` page — starts the arrival, reveals `YOU'RE IN.` → details → pass; awards `FIRST RUN` + `+25` once; `ENTER THE STATION`.

- [ ] **Step 1: Write the failing tests**

`tests/ui/QrCode.test.tsx`:
```tsx
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn().mockResolvedValue(undefined) } }));

import QRCode from 'qrcode';
import { QrCode } from '@/ui/QrCode';

describe('QrCode', () => {
  it('draws navy on pale', () => {
    render(<QrCode value="aiexpo:runner:#0247" size={120} />);
    expect(QRCode.toCanvas).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 'aiexpo:runner:#0247', {
      width: 120, margin: 1, color: { dark: '#354093', light: '#C6FEFE' },
    });
  });
});
```

`tests/pages/register/Pass.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn().mockResolvedValue(undefined) } }));

import { api } from '@/api';
import { DEFAULT_AVATAR } from '@/api/types';
import Pass from '@/pages/Register/Pass';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';

describe('Pass step', () => {
  beforeEach(async () => {
    window.matchMedia = (() => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })) as unknown as typeof window.matchMedia;
    api.reset(); window.localStorage.clear(); useGame.getState().reset(); useRegistration.getState().reset(); useTeam.setState({ team: null, loading: false });
    useWorld.setState({ arrivalAt: null });
    const user = await api.register({ name: 'Asha Rao', email: 'asha@x.io', org: 'RV', phone: '', password: 'longpassword', domain: 'data', avatar: { ...DEFAULT_AVATAR, name: 'ASHA' } });
    useSession.setState({ user });
    await useTeam.getState().join('RAIL-7K2Q');
  });

  it('starts the arrival, shows the details and pass, and awards FIRST RUN once', async () => {
    render(<MemoryRouter><Pass /></MemoryRouter>);
    expect(useWorld.getState().arrivalAt).not.toBeNull();
    expect(screen.getByText("YOU'RE IN.")).toBeInTheDocument();
    expect(screen.getByText('RUNNER ID: #0247')).toBeInTheDocument();
    expect(screen.getByText('DOMAIN: DATA')).toBeInTheDocument();
    expect(await screen.findByText('TEAM: PIXEL RAIDERS')).toBeInTheDocument();
    expect(screen.getByText('STATUS: REGISTERED')).toBeInTheDocument();
    expect(screen.getByText('HACK PASS')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /QR code/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ENTER THE STATION' })).toHaveAttribute('href', '/station');
    expect(useGame.getState().badges.FIRST_RUN).toBeDefined();
    expect(useRegistration.getState().completed.pass).toBe(true);
    const coins = useGame.getState().coins;
    render(<MemoryRouter><Pass /></MemoryRouter>);
    expect(useGame.getState().coins).toBe(coins);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/ui/QrCode.test.tsx tests/pages/register/Pass.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/ui/QrCode.tsx` and `src/ui/HackPass.tsx`**

`src/ui/QrCode.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { PALETTE } from '@/theme/palette';

export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, { width: size, margin: 1, color: { dark: PALETTE.navy, light: PALETTE.pale } }).catch(() => undefined);
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} role="img" aria-label={`QR code ${value}`} className="border-[3px] border-navy bg-pale" />;
}
```

`src/ui/HackPass.tsx`:
```tsx
import type { Runner } from '@/api/types';
import { EVENT, domainById, formatEventDates } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { QrCode } from './QrCode';

export const qrValue = (runnerId: string) => `aiexpo:runner:${runnerId}`;

export function HackPass({ runner, teamName, status = 'PENDING' }: { runner: Runner; teamName: string | null; status?: string }) {
  const domain = domainById(runner.domain);
  return (
    <article aria-label="Hack Pass" className="w-full max-w-md border-4 border-navy bg-pale text-navy shadow-bevel-lg">
      <header className="flex items-center justify-between border-b-4 border-navy bg-yellow px-4 py-2">
        <span className="font-display text-lg">HACK PASS</span>
        <span className="font-display text-xs tracking-widest">{EVENT.name}</span>
      </header>
      <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
        <dl className="space-y-2 font-ui text-xs font-bold">
          <div><dt className="font-display text-[10px] tracking-widest">RUNNER</dt><dd className="font-display text-xl">{runner.avatar.name}</dd><dd>{runner.name}</dd></div>
          <div><dt className="font-display text-[10px] tracking-widest">RUNNER ID</dt><dd className="font-display text-base">{runner.id}</dd></div>
          <div><dt className="font-display text-[10px] tracking-widest">TEAM</dt><dd>{teamName ?? 'SOLO RUNNER'}</dd></div>
          <div className="flex items-center gap-2"><dt className="font-display text-[10px] tracking-widest">ROUTE</dt><dd className="flex items-center gap-1"><span aria-hidden className="inline-block h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domain.color] }} />{`${domain.number} ${domain.name}`}</dd></div>
        </dl>
        <div className="flex flex-col items-center gap-1">
          <QrCode value={qrValue(runner.id)} size={128} />
          <span className="font-display text-[10px] tracking-widest">SCAN AT GATE</span>
        </div>
      </div>
      <div className="mx-4 border-t-4 border-dashed border-navy" aria-hidden />
      <footer className="flex items-center justify-between px-4 py-3 font-ui text-xs font-bold">
        <span>{`${formatEventDates()} · ${EVENT.venue}`}</span>
        <span className={`border-2 border-navy px-2 py-0.5 font-display ${status === 'CHECKED IN' ? 'bg-cyan' : 'bg-white'}`}>{`CHECK-IN: ${status}`}</span>
      </footer>
    </article>
  );
}
```

- [ ] **Step 4: Write `src/pages/Register/Pass.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { syncBadges } from '@/store/badgeSync';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { HackPass } from '@/ui/HackPass';

export default function Pass() {
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const [beat, setBeat] = useState(prefersReducedMotion() ? 3 : 0);

  useEffect(() => {
    const w = useWorld.getState();
    w.startArrival();
    void useTeam.getState().load();
    const reg = useRegistration.getState();
    if (!reg.completed.pass) {
      useGame.getState().awardCoins(25, 'CHECKED IN');
      reg.complete('pass');
    }
    syncBadges();
    if (prefersReducedMotion()) return () => w.clearArrival();
    const t1 = setTimeout(() => setBeat(1), 600);
    const t2 = setTimeout(() => setBeat(2), 1400);
    const t3 = setTimeout(() => setBeat(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); w.clearArrival(); };
  }, []);

  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);

  return (
    <main className="pointer-none relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5 p-4 md:flex-row md:items-center md:justify-end md:gap-10 md:pr-[6vw]">
      <div className="pointer-auto max-w-md">
        <motion.h1 initial={{ scale: 0.6, opacity: 0 }} animate={beat >= 1 ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="font-display text-5xl text-navy md:text-7xl" style={{ textShadow: '0.06em 0.06em 0 #FDD013' }}>
          YOU'RE IN.
        </motion.h1>
        <motion.ul initial={{ opacity: 0, y: 20 }} animate={beat >= 2 ? { opacity: 1, y: 0 } : {}} className="mt-4 space-y-1 font-display text-sm text-navy md:text-base">
          <li>{`RUNNER ID: ${user.id}`}</li>
          <li>{`DOMAIN: ${domain.name}`}</li>
          <li>{`TEAM: ${team?.name ?? 'SOLO RUNNER'}`}</li>
          <li>STATUS: REGISTERED</li>
        </motion.ul>
        <motion.div initial={{ opacity: 0 }} animate={beat >= 3 ? { opacity: 1 } : {}} className="mt-6">
          <ArcadeButton size="lg" to="/station">ENTER THE STATION</ArcadeButton>
        </motion.div>
      </div>
      <motion.div className="pointer-auto" initial={{ y: 120, opacity: 0, rotate: -3 }} animate={beat >= 3 ? { y: 0, opacity: 1, rotate: 0 } : {}} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
        <HackPass runner={user} teamName={team?.name ?? null} />
      </motion.div>
    </main>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: after the crew step the camera drops to platform level, lights flick on, a yellow-band train rolls in and opens its doors; `YOU'RE IN.` punches in, the details follow, then the Hack Pass slides up with a real QR. `ENTER THE STATION` lands on the platform. The `FIRST RUN` badge toast flips in.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): arrival sequence, Hack Pass ticket and QR code

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

## Phase 4 — Runner Station

### Task 30: Station platform page, train navigation and section shell

**Files:**
- Create: `src/pages/Station/SectionPanel.tsx`
- Modify: `src/pages/Station/Layout.tsx`, `src/pages/Station/Platform.tsx`
- Test: `tests/pages/station/Platform.test.tsx`

**Interfaces:**
- `StationLayout` — registers `world.trainHandler` (train i → navigate to its path), loads team + leaderboard, renders `<Outlet/>`.
- `Platform` — the index view: a compact train picker (DOM mirror of the 3D trains, also the mobile list) + the run progress strip placeholder (Task 35 fills it).
- `SectionPanel({ title, train, children })` — the panel that "slides out of the car": heading with `0N`, `BACK TO PLATFORM` chip → `/station`.

- [ ] **Step 1: Write the failing test**

`tests/pages/station/Platform.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEMO_RUNNER } from '@/api/seed';
import StationLayout from '@/pages/Station/Layout';
import Platform from '@/pages/Station/Platform';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';

function mount() {
  return render(
    <MemoryRouter initialEntries={['/station']}>
      <Routes>
        <Route path="/station" element={<StationLayout />}>
          <Route index element={<Platform />} />
          <Route path="team" element={<p>MY TEAM PANEL</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Station platform', () => {
  beforeEach(() => { api.reset(); useSession.setState({ user: { ...DEMO_RUNNER } }); useWorld.setState({ trainHandler: null }); });

  it('lists the six trains and navigates from a card or from the 3D train', () => {
    mount();
    expect(screen.getByText('THE RUNNER STATION')).toBeInTheDocument();
    for (const t of ['MY PROFILE', 'MY TEAM', 'CHALLENGE', 'SUBMISSIONS', 'LEADERBOARD', 'ANNOUNCEMENTS']) expect(screen.getByRole('link', { name: new RegExp(t) })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /MY TEAM/ }));
    expect(screen.getByText('MY TEAM PANEL')).toBeInTheDocument();
  });
  it('routes 3D train clicks through the world handler', () => {
    mount();
    expect(useWorld.getState().trainHandler).not.toBeNull();
    useWorld.getState().trainHandler?.(2);
    expect(screen.getByText('MY TEAM PANEL')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/station/Platform.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/pages/Station/Layout.tsx`, `src/pages/Station/SectionPanel.tsx`, `src/pages/Station/Platform.tsx`**

`src/pages/Station/Layout.tsx`:
```tsx
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useLeaderboard } from '@/store/leaderboard';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';
import { TRAIN_LABELS } from '@/config/trains';

export default function StationLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    const w = useWorld.getState();
    w.setTrainHandler((i) => navigate(TRAIN_LABELS[i - 1].path));
    void useTeam.getState().load();
    const lb = useLeaderboard.getState();
    if (lb.rows.length === 0) void lb.load();
    lb.start();
    return () => { w.setTrainHandler(null); w.setHovered(null); lb.stop(); };
  }, [navigate]);

  return (
    <div className="pointer-none relative z-10 min-h-dvh">
      <Outlet />
    </div>
  );
}
```

`src/pages/Station/SectionPanel.tsx`:
```tsx
import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { useGame } from '@/store/game';
import { Panel } from '@/ui/Panel';

export function SectionPanel({ train, title, children, wide = false }: { train: number; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { useGame.getState().visit(`train:${train}`); }, [train]);   // +10 coins, first ride only
  return (
    <main className="flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[6vw]">
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <Panel className="max-h-[88dvh] overflow-y-auto">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl leading-none md:text-3xl"><span className="mr-2 inline-block border-[3px] border-navy bg-yellow px-2 py-0.5 text-base">{`0${train}`}</span>{title}</h2>
            <Link to="/station" className="pointer-auto shrink-0 border-[3px] border-navy bg-white px-3 py-1 font-display text-xs shadow-bevel-sm hover:bg-cyan">BACK TO PLATFORM</Link>
          </div>
          {children}
        </Panel>
      </motion.div>
    </main>
  );
}
```

`src/pages/Station/Platform.tsx`:
```tsx
import { Link } from 'react-router';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { TRAIN_LABELS } from '@/config/trains';

export default function Platform() {
  const user = useSession((s) => s.user);
  const setHovered = useWorld((s) => s.setHovered);
  return (
    <main className="flex min-h-dvh flex-col justify-end p-4 md:p-8">
      <div className="pointer-auto">
        <p className="font-display text-xs tracking-[0.3em] text-navy">{user ? `WELCOME BACK, ${user.avatar.name}` : 'PLATFORM'}</p>
        <h1 className="font-display text-3xl text-navy md:text-5xl">THE RUNNER STATION</h1>
        <p className="mt-1 font-ui text-sm font-bold text-navy">Board a train. Hover to peek, click to ride.</p>
      </div>
      <nav aria-label="Trains" className="pointer-auto mt-4 grid gap-2 md:grid-cols-6">
        {TRAIN_LABELS.map((t, i) => (
          <Link key={t.n} to={t.path}
            onMouseEnter={() => setHovered(`train:${i + 1}`)} onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-2 border-4 border-navy bg-pale px-3 py-2 font-display text-xs text-navy shadow-bevel transition-transform hover:-translate-y-1 hover:bg-cyan md:flex-col md:items-start">
            <span className="border-2 border-navy bg-yellow px-1.5">{t.n}</span>
            <span>{t.name}</span>
          </Link>
        ))}
      </nav>
      <div id="progress-strip" className="pointer-auto mt-3" />
    </main>
  );
}
```

- [ ] **Step 4: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: `/station` shows the six-train picker along the bottom; hovering a card cracks the matching 3D train's doors; clicking a train (3D or card) dollies the camera to it and slides the stub panel in with `BACK TO PLATFORM`.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): station platform page with train navigation and section panel

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 31: Profile, Team and Edit Runner

**Files:**
- Create: `src/pages/Station/EditRunner.tsx`, `src/ui/BadgeGrid.tsx`
- Modify: `src/pages/Station/Profile.tsx`, `src/pages/Station/Team.tsx`, `src/routes/index.tsx` (add `runner` child route), `src/world/shots.ts` (`/station/runner` → `locker`)
- Test: `tests/pages/station/Profile.test.tsx`, `tests/pages/station/Team.test.tsx`, `tests/world/shots.test.ts` (extend)

**Interfaces:**
- `BadgeGrid({ badges })` — six tiles; unlocked = yellow with the label; locked = navy silhouette with the rule as `title`.
- `EditRunner` page at `/station/runner` — `Customizer` seeded from the session avatar; save → `api.updateAvatar` → session + team refresh → `/station/profile`.
- `Profile` — runner card, `BadgeGrid`, `VIEW PASS` (inline modal with `HackPass`), `EDIT RUNNER`, `SIGN OUT`.
- `Team` — `CrewCards` + two-step `LEAVE CREW`, or create/join forms when solo.

- [ ] **Step 1: Write the failing tests**

Append to `tests/world/shots.test.ts` inside the first `it`:
```ts
    expect(shotForPath('/station/runner')).toBe('locker');
```

`tests/pages/station/Profile.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn().mockResolvedValue(undefined) } }));

import { api } from '@/api';
import { DEMO_RUNNER } from '@/api/seed';
import Profile from '@/pages/Station/Profile';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';

describe('Profile', () => {
  beforeEach(() => { api.reset(); window.localStorage.clear(); useGame.getState().reset(); useSession.setState({ user: { ...DEMO_RUNNER } }); useTeam.setState({ team: null, loading: false }); });

  it('shows the runner, badges and opens the pass', () => {
    useGame.getState().awardBadge('FIRST_RUN');
    render(<MemoryRouter><Profile /></MemoryRouter>);
    expect(screen.getByText('#0100')).toBeInTheDocument();
    expect(screen.getByText('FIRST RUN')).toBeInTheDocument();
    expect(screen.getByTitle('Submit a project.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EDIT RUNNER' })).toHaveAttribute('href', '/station/runner');
    fireEvent.click(screen.getByRole('button', { name: 'VIEW PASS' }));
    expect(screen.getByLabelText('Hack Pass')).toBeInTheDocument();
  });
});
```

`tests/pages/station/Team.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEFAULT_AVATAR } from '@/api/types';
import Team from '@/pages/Station/Team';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';

describe('Team section', () => {
  beforeEach(async () => {
    api.reset(); window.localStorage.clear(); useTeam.setState({ team: null, loading: false });
    useSession.setState({ user: await api.register({ name: 'A', email: 'a@x.io', org: 'X', phone: '', password: 'longpassword', domain: 'ai', avatar: DEFAULT_AVATAR }) });
  });

  it('offers create/join when solo, and a two-step leave when in a crew', async () => {
    render(<MemoryRouter><Team /></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'JOIN TEAM' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'JOIN TEAM' }));
    fireEvent.change(screen.getByLabelText('ENTER TEAM CODE'), { target: { value: 'RAIL-B8YT' } });
    fireEvent.click(screen.getByRole('button', { name: 'JOIN CREW' }));
    expect(await screen.findByText('LINE BREAKERS')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'LEAVE CREW' }));
    fireEvent.click(screen.getByRole('button', { name: 'CONFIRM LEAVE' }));
    expect(await screen.findByRole('button', { name: 'CREATE TEAM' })).toBeInTheDocument();
    expect(useSession.getState().user?.teamId).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/pages/station tests/world/shots.test.ts`
Expected: FAIL.

- [ ] **Step 3: Route and shot**

In `src/world/shots.ts` add before the station regex: `if (pathname === '/station/runner') return 'locker';`
In `src/routes/index.tsx` import `EditRunner from '@/pages/Station/EditRunner'` and add `<Route path="runner" element={<EditRunner />} />` inside the `/station` layout route.

- [ ] **Step 4: Write `src/ui/BadgeGrid.tsx` and `src/pages/Station/EditRunner.tsx`**

`src/ui/BadgeGrid.tsx`:
```tsx
import { BADGES, type BadgeId } from '@/lib/badges';

export function BadgeGrid({ badges }: { badges: Partial<Record<BadgeId, string>> }) {
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Badges">
      {BADGES.map((b) => {
        const on = !!badges[b.id];
        return (
          <li key={b.id} title={b.rule} className={`flex aspect-square flex-col items-center justify-center border-[3px] border-navy p-1 text-center ${on ? 'bg-yellow text-navy shadow-bevel-sm' : 'bg-navy text-pale opacity-70'}`}>
            <span aria-hidden className={`mb-1 h-6 w-6 rotate-45 border-2 ${on ? 'border-navy bg-cyan' : 'border-pale bg-navy'}`} />
            <span className="font-display text-[10px] leading-tight">{on ? b.label : '???'}</span>
            {on && <span className="sr-only">unlocked</span>}
          </li>
        );
      })}
    </ul>
  );
}
```

`src/pages/Station/EditRunner.tsx`:
```tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { api } from '@/api';
import type { AvatarConfig } from '@/api/types';
import { Customizer } from '@/pages/Register/Customizer';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { useToasts } from '@/store/toasts';

export default function EditRunner() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const [value, setValue] = useState<AvatarConfig | null>(user?.avatar ?? null);
  const [saving, setSaving] = useState(false);
  if (!user || !value) return <Navigate to="/signin" replace />;

  const save = async () => {
    setSaving(true);
    try {
      useSession.getState().setUser(await api.updateAvatar(value));
      await useTeam.getState().load();
      useToasts.getState().push({ kind: 'info', title: 'RUNNER UPDATED', body: value.name });
      navigate('/station/profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pointer-none flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[6vw]">
      <Customizer title="EDIT YOUR RUNNER" subtitle="Change anything. Your Hack Pass updates too." value={value} onChange={setValue} onSave={save} saving={saving} saveLabel="SAVE CHANGES" />
    </main>
  );
}
```

- [ ] **Step 5: Write `src/pages/Station/Profile.tsx` and `src/pages/Station/Team.tsx`**

`src/pages/Station/Profile.tsx`:
```tsx
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { domainById } from '@/config/event';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { BadgeGrid } from '@/ui/BadgeGrid';
import { HackPass } from '@/ui/HackPass';
import { SectionPanel } from './SectionPanel';

export default function Profile() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const badges = useGame((s) => s.badges);
  const coins = useGame((s) => s.coins);
  const [pass, setPass] = useState(false);
  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);

  return (
    <SectionPanel train={1} title="MY PROFILE">
      <div className="flex items-center gap-4">
        <span aria-hidden className="grid h-16 w-16 place-items-center border-4 border-navy font-display text-xl text-navy" style={{ background: PALETTE[user.avatar.teamColor] }}>{user.avatar.name.slice(0, 2)}</span>
        <div>
          <p className="font-display text-2xl">{user.avatar.name}</p>
          <p className="font-ui text-sm font-bold">{user.name} · {user.org}</p>
          <p className="font-display text-sm">{user.id}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 font-ui text-xs font-bold">
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">ROUTE</dt><dd>{`${domain.number} ${domain.name}`}</dd></div>
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">CREW</dt><dd>{team?.name ?? 'SOLO RUNNER'}</dd></div>
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">EMAIL</dt><dd className="break-all">{user.email}</dd></div>
        <div className="border-[3px] border-navy bg-yellow p-2"><dt className="font-display text-[10px]">COINS</dt><dd className="font-display text-lg">{coins}</dd></div>
      </dl>
      <h3 className="mb-2 mt-5 font-display text-xs tracking-widest">BADGES</h3>
      <BadgeGrid badges={badges} />
      <div className="mt-5 flex flex-wrap gap-3">
        <ArcadeButton onClick={() => setPass((p) => !p)} burst={false}>VIEW PASS</ArcadeButton>
        <Link to="/station/runner" className="pointer-auto inline-flex items-center border-4 border-navy bg-pale px-5 py-3 font-display text-navy shadow-bevel hover:bg-cyan">EDIT RUNNER</Link>
        <ArcadeButton variant="ghost" burst={false} onClick={async () => { await useSession.getState().signOut(); navigate('/'); }}>SIGN OUT</ArcadeButton>
      </div>
      {pass && <div className="mt-5"><HackPass runner={user} teamName={team?.name ?? null} /></div>}
    </SectionPanel>
  );
}
```

`src/pages/Station/Team.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useTeam } from '@/store/team';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { CreateTeamForm, CrewCards, JoinTeamForm } from '@/pages/Register/CrewForms';
import { SectionPanel } from './SectionPanel';

export default function Team() {
  const team = useTeam((s) => s.team);
  const loading = useTeam((s) => s.loading);
  const [view, setView] = useState<'choose' | 'create' | 'join'>('choose');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { void useTeam.getState().load(); }, []);

  return (
    <SectionPanel train={2} title="MY TEAM">
      {team ? (
        <>
          <CrewCards team={team} />
          <div className="mt-5 flex gap-3">
            {confirm ? (
              <>
                <ArcadeButton variant="danger" onClick={async () => { await useTeam.getState().leave(); setConfirm(false); setView('choose'); }}>CONFIRM LEAVE</ArcadeButton>
                <ArcadeButton variant="ghost" burst={false} onClick={() => setConfirm(false)}>STAY</ArcadeButton>
              </>
            ) : (
              <ArcadeButton variant="secondary" burst={false} onClick={() => setConfirm(true)}>LEAVE CREW</ArcadeButton>
            )}
          </div>
        </>
      ) : loading ? (
        <p className="font-display text-sm">CHECKING THE CREW BOARD…</p>
      ) : view === 'choose' ? (
        <div className="grid gap-3">
          <p className="font-ui text-sm font-bold">You are running solo. Build or join a crew of up to four.</p>
          <ArcadeButton size="lg" onClick={() => setView('create')}>CREATE TEAM</ArcadeButton>
          <ArcadeButton size="lg" variant="secondary" onClick={() => setView('join')}>JOIN TEAM</ArcadeButton>
        </div>
      ) : view === 'create' ? (
        <><CreateTeamForm onDone={() => setView('choose')} /><button type="button" className="pointer-auto mt-3 font-ui text-xs font-bold underline" onClick={() => setView('choose')}>← BACK</button></>
      ) : (
        <><JoinTeamForm onDone={() => setView('choose')} /><button type="button" className="pointer-auto mt-3 font-ui text-xs font-bold underline" onClick={() => setView('choose')}>← BACK</button></>
      )}
    </SectionPanel>
  );
}
```

- [ ] **Step 6: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: Train 01 shows the profile with the badge grid and the pass toggle; `EDIT RUNNER` dollies back to the locker with the current avatar and saving returns to the profile; Train 02 shows the crew with a two-step leave.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): profile with badges and pass, team section, edit runner

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 32: Challenge and Submissions

**Files:**
- Create: `src/store/submission.ts`
- Modify: `src/pages/Station/Challenge.tsx`, `src/pages/Station/Submissions.tsx`
- Test: `tests/store/submission.test.ts`, `tests/pages/station/Challenge.test.tsx`, `tests/pages/station/Submissions.test.tsx`

**Interfaces:**
- `useSubmission`: `{ submission: Submission | null; loaded: boolean; load(): Promise<void>; submit(input: SubmissionInput): Promise<Submission> }` — first successful submit awards `+50` coins and runs `syncBadges({ hasSubmission: true, submittedAtMs })`.
- `deadlinePassed(): boolean` from `lib/time` usage in the page (`now() >= Date.parse(EVENT.timeline.submissionDeadline)`).

- [ ] **Step 1: Write the failing tests**

`tests/store/submission.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEFAULT_AVATAR } from '@/api/types';
import { setTimeOffset } from '@/lib/time';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useSubmission } from '@/store/submission';
import { useTeam } from '@/store/team';

const input = { projectName: 'Metro Mind', repoUrl: 'https://github.com/x/y', demoUrl: '', description: 'Predicts crowding.', deckUrl: '' };

describe('submission store', () => {
  beforeEach(async () => {
    api.reset(); window.localStorage.clear(); useGame.getState().reset(); useTeam.setState({ team: null, loading: false });
    useSubmission.setState({ submission: null, loaded: false });
    useSession.setState({ user: await api.register({ name: 'A', email: 'a@x.io', org: 'X', phone: '', password: 'longpassword', domain: 'ai', avatar: DEFAULT_AVATAR }) });
  });
  afterEach(() => setTimeOffset(0));

  it('loads nothing, submits once with coins and CODE WARRIOR + SPEED BUILDER, edits without re-paying', async () => {
    await useSubmission.getState().load();
    expect(useSubmission.getState().submission).toBeNull();
    await useSubmission.getState().submit(input);
    expect(useGame.getState().coins).toBe(50);
    expect(useGame.getState().badges.CODE_WARRIOR).toBeDefined();
    expect(useGame.getState().badges.SPEED_BUILDER).toBeDefined();
    await useSubmission.getState().submit({ ...input, projectName: 'Metro Mind 2' });
    expect(useGame.getState().coins).toBe(50);
    expect(useSubmission.getState().submission?.projectName).toBe('Metro Mind 2');
  });
});
```

`tests/pages/station/Challenge.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import Challenge from '@/pages/Station/Challenge';
import { useSession } from '@/store/session';

describe('Challenge section', () => {
  beforeEach(async () => { api.reset(); useSession.setState({ user: await api.signInWithProvider('google') }); });

  it('shows the route challenge and marks it opened', async () => {
    render(<MemoryRouter><Challenge /></MemoryRouter>);
    expect(await screen.findByText('ROUTE 01 — AI')).toBeInTheDocument();
    expect(screen.getByText(/Build systems that learn/)).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
    await waitFor(() => expect(useSession.getState().user?.openedChallengeAt).not.toBeNull());
  });
});
```

`tests/pages/station/Submissions.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { EVENT } from '@/config/event';
import { setTimeOffset } from '@/lib/time';
import Submissions from '@/pages/Station/Submissions';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useSubmission } from '@/store/submission';
import { useTeam } from '@/store/team';

describe('Submissions section', () => {
  beforeEach(async () => {
    api.reset(); window.localStorage.clear(); useGame.getState().reset(); useTeam.setState({ team: null, loading: false });
    useSubmission.setState({ submission: null, loaded: false });
    useSession.setState({ user: await api.signInWithProvider('github') });
  });
  afterEach(() => setTimeOffset(0));

  it('validates, submits and shows the status card', async () => {
    render(<MemoryRouter><Submissions /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'SUBMIT RUN' }));
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('PROJECT NAME'), { target: { value: 'Metro Mind' } });
    fireEvent.change(screen.getByLabelText('REPOSITORY URL'), { target: { value: 'https://github.com/x/y' } });
    fireEvent.change(screen.getByLabelText('DESCRIPTION'), { target: { value: 'Predicts crowding at stations.' } });
    fireEvent.click(screen.getByRole('button', { name: 'SUBMIT RUN' }));
    expect(await screen.findByText('SUBMITTED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EDIT' })).toBeInTheDocument();
  });
  it('locks after the deadline', async () => {
    setTimeOffset(Date.parse(EVENT.timeline.submissionDeadline) - Date.now() + 60_000);
    render(<MemoryRouter><Submissions /></MemoryRouter>);
    expect(await screen.findByText('DEADLINE PASSED')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'SUBMIT RUN' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/store/submission.test.ts tests/pages/station/Challenge.test.tsx tests/pages/station/Submissions.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/store/submission.ts`**

```ts
import { create } from 'zustand';
import { api } from '@/api';
import type { Submission, SubmissionInput } from '@/api/types';
import { syncBadges } from './badgeSync';
import { useGame } from './game';

interface SubmissionState {
  submission: Submission | null;
  loaded: boolean;
  load(): Promise<void>;
  submit(input: SubmissionInput): Promise<Submission>;
}

export const useSubmission = create<SubmissionState>()((set, get) => ({
  submission: null,
  loaded: false,
  async load() { set({ submission: await api.getSubmission(), loaded: true }); },
  async submit(input) {
    const first = get().submission == null;
    const s = await api.submitProject(input);
    set({ submission: s, loaded: true });
    if (first) useGame.getState().awardCoins(50, 'RUN SUBMITTED');
    syncBadges({ hasSubmission: true, submittedAtMs: Date.parse(s.submittedAt) });
    return s;
  },
}));
```

- [ ] **Step 4: Write `src/pages/Station/Challenge.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { api } from '@/api';
import type { Challenge as ChallengeData } from '@/api/types';
import { EVENT, TIMELINE_STOPS, domainById } from '@/config/event';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';
import { SectionPanel } from './SectionPanel';

export default function Challenge() {
  const user = useSession((s) => s.user);
  const [data, setData] = useState<ChallengeData | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void api.getChallenge(user.domain).then((c) => { if (alive) setData(c); });
    if (!user.openedChallengeAt) void api.markChallengeOpened().then((r) => useSession.getState().setUser(r));
    return () => { alive = false; };
  }, [user?.domain]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);

  return (
    <SectionPanel train={3} title="CHALLENGE" wide>
      {!data ? <p className="font-display text-sm">LOADING THE ROUTE…</p> : (
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="inline-block border-[3px] border-navy px-2 py-0.5 font-display text-xs" style={{ background: PALETTE[domain.color], color: domain.color === 'red' ? PALETTE.white : PALETTE.navy }}>{domain.line}</p>
            <h3 className="mt-2 font-display text-xl">{data.title}</h3>
            <p className="mt-2 font-ui text-sm leading-relaxed">{data.statement}</p>
            <h4 className="mt-4 font-display text-xs tracking-widest">PROBLEM STATEMENTS</h4>
            <ol className="mt-1 list-decimal space-y-1 pl-5 font-ui text-sm">{data.problems.map((p) => <li key={p}>{p}</li>)}</ol>
            <h4 className="mt-4 font-display text-xs tracking-widest">RULES</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 font-ui text-sm">{data.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <aside className="space-y-4">
            <div className="border-[3px] border-navy bg-navy p-3 text-pale">
              <h4 className="font-display text-xs tracking-widest text-yellow">JUDGING</h4>
              <ul className="mt-1 font-ui text-xs">{EVENT.judging.map((j) => <li key={j}>• {j}</li>)}</ul>
            </div>
            <div className="border-[3px] border-navy bg-white p-3">
              <h4 className="font-display text-xs tracking-widest">TIMELINE</h4>
              <ul className="mt-1 space-y-1 font-ui text-xs font-bold">
                {TIMELINE_STOPS.map((s) => <li key={s.id} className={s.alert ? 'text-red' : ''}>{`${new Date(s.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: EVENT.timezone })} — ${s.label}`}</li>)}
              </ul>
            </div>
            <div className="border-[3px] border-navy bg-white p-3">
              <h4 className="font-display text-xs tracking-widest">RESOURCES</h4>
              <ul className="mt-1 font-ui text-xs font-bold">{data.resources.map((r) => <li key={r.label}><a className="underline decoration-2 underline-offset-2 hover:bg-cyan" href={r.url}>{r.label}</a></li>)}</ul>
            </div>
          </aside>
        </div>
      )}
    </SectionPanel>
  );
}
```

- [ ] **Step 5: Write `src/pages/Station/Submissions.tsx`**

```tsx
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, type SubmissionInput } from '@/api/types';
import { EVENT } from '@/config/event';
import { now } from '@/lib/time';
import { hasErrors, validateSubmission, wordCount } from '@/lib/validation';
import { useSubmission } from '@/store/submission';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { SectionPanel } from './SectionPanel';

const EMPTY: SubmissionInput = { projectName: '', repoUrl: '', demoUrl: '', description: '', deckUrl: '' };
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Submissions() {
  const submission = useSubmission((s) => s.submission);
  const loaded = useSubmission((s) => s.loaded);
  const [values, setValues] = useState<SubmissionInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionInput | 'form', string>>>({});
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = now() >= Date.parse(EVENT.timeline.submissionDeadline);

  useEffect(() => { void useSubmission.getState().load(); }, []);
  useEffect(() => { if (submission) setValues({ projectName: submission.projectName, repoUrl: submission.repoUrl, demoUrl: submission.demoUrl, description: submission.description, deckUrl: submission.deckUrl }); }, [submission]);

  const set = (k: keyof SubmissionInput) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSubmission(values);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try { await useSubmission.getState().submit(values); setEditing(false); }
    catch (err) { setErrors({ form: err instanceof ApiError ? err.message : 'The drop box jammed. Try again.' }); }
    finally { setBusy(false); }
  };

  const showForm = loaded && !locked && (!submission || editing);

  return (
    <SectionPanel train={4} title="SUBMISSIONS">
      {locked && (
        <p className="mb-4 inline-block border-4 border-navy bg-red px-3 py-1 font-display text-sm text-white shadow-bevel-sm">DEADLINE PASSED</p>
      )}
      {!loaded ? <p className="font-display text-sm">CHECKING THE DROP BOX…</p> : showForm ? (
        <form onSubmit={submit} noValidate>
          <Field label="PROJECT NAME" name="projectName" zone="station" value={values.projectName} onChange={set('projectName')} error={errors.projectName} />
          <Field label="REPOSITORY URL" name="repoUrl" type="url" zone="station" value={values.repoUrl} onChange={set('repoUrl')} error={errors.repoUrl} placeholder="https://github.com/…" />
          <Field label="DEMO URL" name="demoUrl" type="url" zone="station" value={values.demoUrl} onChange={set('demoUrl')} error={errors.demoUrl} hint="Optional" />
          <Field label="DESCRIPTION" name="description" multiline zone="station" value={values.description} onChange={set('description')} error={errors.description} hint={`${wordCount(values.description)} / 300 words`} />
          <Field label="DECK LINK" name="deckUrl" type="url" zone="station" value={values.deckUrl} onChange={set('deckUrl')} error={errors.deckUrl} hint="Optional" />
          {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
          <div className="flex gap-3">
            <ArcadeButton type="submit" size="lg" disabled={busy}>SUBMIT RUN</ArcadeButton>
            {submission && <ArcadeButton variant="ghost" burst={false} onClick={() => setEditing(false)}>CANCEL</ArcadeButton>}
          </div>
        </form>
      ) : submission ? (
        <div className="border-4 border-navy bg-white p-4">
          <p className="inline-block border-[3px] border-navy bg-cyan px-2 py-0.5 font-display text-xs">SUBMITTED</p>
          <h3 className="mt-2 font-display text-xl">{submission.projectName}</h3>
          <p className="font-ui text-sm">{submission.description}</p>
          <dl className="mt-3 grid gap-1 font-ui text-xs font-bold">
            <div><dt className="inline font-display text-[10px]">REPO </dt><dd className="inline break-all"><a className="underline" href={submission.repoUrl}>{submission.repoUrl}</a></dd></div>
            {submission.demoUrl && <div><dt className="inline font-display text-[10px]">DEMO </dt><dd className="inline break-all"><a className="underline" href={submission.demoUrl}>{submission.demoUrl}</a></dd></div>}
            <div><dt className="inline font-display text-[10px]">FIRST SUBMITTED </dt><dd className="inline">{fmt(submission.submittedAt)}</dd></div>
            <div><dt className="inline font-display text-[10px]">LAST UPDATED </dt><dd className="inline">{fmt(submission.updatedAt)}</dd></div>
          </dl>
          {!locked && <div className="mt-4"><ArcadeButton variant="secondary" burst={false} onClick={() => setEditing(true)}>EDIT</ArcadeButton></div>}
        </div>
      ) : (
        <p className="font-ui text-sm font-bold">No submission — the drop box is closed.</p>
      )}
    </SectionPanel>
  );
}
```

- [ ] **Step 6: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: Train 03 shows the route challenge; Train 04 accepts a submission and shows the status card with EDIT; the coin toast `+50 RUN SUBMITTED` and the `CODE WARRIOR` badge flip in.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): challenge section and submissions with deadline lock

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 33: The departure-board leaderboard

**Files:**
- Modify: `src/pages/Station/Leaderboard.tsx`, `src/store/leaderboard.ts` (badge sync on tick)
- Test: `tests/pages/station/Leaderboard.test.tsx`

**Interfaces:**
- `Leaderboard` section — all rows, `layout`-animated reordering, split-flap scores, Δ arrows, medal flaps for the top 3, the user's crew highlighted cyan, `LIVE` tag. Ticker keeps running (started by the station layout).
- `useLeaderboard.tick()` also calls `syncBadges({ rank: userRank() })` so `FINALIST` can unlock during judging.

- [ ] **Step 1: Write the failing test**

`tests/pages/station/Leaderboard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import Leaderboard from '@/pages/Station/Leaderboard';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';

describe('Leaderboard section', () => {
  beforeEach(async () => {
    api.reset();
    useSession.setState({ user: await api.signInWithProvider('google') });   // demo runner is in PIXEL RAIDERS
    useLeaderboard.setState({ rows: await api.getLeaderboard(), deltas: { team_pixel: 2, team_track: -1 }, running: false });
  });

  it('renders every crew with rank, medals, deltas and highlights mine', () => {
    render(<MemoryRouter><Leaderboard /></MemoryRouter>);
    expect(screen.getAllByRole('row')).toHaveLength(25); // header + 24
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('▲2')).toBeInTheDocument();
    expect(screen.getByText('▼1')).toBeInTheDocument();
    expect(screen.getByText('PIXEL RAIDERS').closest('tr')).toHaveAttribute('data-mine', 'true');
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/station/Leaderboard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Sync badges on tick**

In `src/store/leaderboard.ts` add `import { syncBadges } from './badgeSync';` and, at the end of `tick()` after the toasts: `syncBadges({ rank: get().userRank() });`. Also call it at the end of `load()`.

- [ ] **Step 4: Write `src/pages/Station/Leaderboard.tsx`**

```tsx
import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { useLeaderboard } from '@/store/leaderboard';
import { PALETTE } from '@/theme/palette';
import { SplitFlap } from '@/ui/SplitFlap';
import { SectionPanel } from './SectionPanel';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const rows = useLeaderboard((s) => s.rows);
  const deltas = useLeaderboard((s) => s.deltas);
  const mine = useLeaderboard((s) => s.userTeamId());

  return (
    <SectionPanel train={5} title="THE RUNNERS" wide>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs tracking-widest">DEPARTURES · ALL CREWS</p>
        <span className="border-2 border-navy bg-red px-2 py-0.5 font-display text-xs text-white">LIVE</span>
      </div>
      <div className="overflow-x-auto border-4 border-navy bg-navy p-2">
        <table className="w-full border-separate border-spacing-y-1 font-ui text-xs text-navy">
          <thead>
            <tr className="font-display text-[10px] tracking-widest text-yellow">
              <th className="px-2 text-left">RANK</th><th className="px-2 text-left">TEAM</th><th className="px-2 text-left">ROUTE</th><th className="px-2 text-right">SCORE</th><th className="px-2 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = deltas[r.teamId] ?? 0;
              const isMine = r.teamId === mine;
              return (
                <motion.tr layout key={r.teamId} data-mine={isMine ? 'true' : 'false'} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`${isMine ? 'bg-cyan' : 'bg-pale'} font-bold`}>
                  <td className="px-2 py-1.5 font-display">{r.rank <= 3 ? <span className="mr-1">{MEDALS[r.rank - 1]}</span> : null}{`#${String(r.rank).padStart(2, '0')}`}</td>
                  <td className="px-2 py-1.5 font-display">{r.team}</td>
                  <td className="px-2 py-1.5"><span className="inline-flex items-center gap-1"><span aria-hidden className="inline-block h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domainById(r.domain).color] }} />{domainById(r.domain).name}</span></td>
                  <td className="px-2 py-1.5 text-right"><SplitFlap text={String(r.score)} /></td>
                  <td className={`px-2 py-1.5 text-right font-display ${d > 0 ? 'text-navy' : d < 0 ? 'text-red' : 'text-navy/50'}`}>{d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: Train 05 shows the full board; wait ~20 s: rows re-order with a spring, scores flap, and when PIXEL RAIDERS climbs a yellow `+N POSITIONS` toast appears and the runner on the platform celebrates.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): live departure-board leaderboard with rank deltas

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 34: Announcements

**Files:**
- Modify: `src/pages/Station/Announcements.tsx`
- Test: `tests/pages/station/Announcements.test.tsx`

- [ ] **Step 1: Write the failing test**

`tests/pages/station/Announcements.test.tsx`:
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import Announcements from '@/pages/Station/Announcements';

describe('Announcements section', () => {
  beforeEach(() => api.reset());

  it('lists announcements newest first with tags and marks them read', async () => {
    render(<MemoryRouter><Announcements /></MemoryRouter>);
    const titles = await screen.findAllByRole('heading', { level: 3 });
    expect(titles[0]).toHaveTextContent('FINALS LINE-UP');
    expect(screen.getAllByText('LIVE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DEADLINE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TIP').length).toBeGreaterThan(0);
    await waitFor(() => expect(api.unreadAnnouncementCount()).toBe(0));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pages/station/Announcements.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `src/pages/Station/Announcements.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { Announcement } from '@/api/types';
import { EVENT } from '@/config/event';
import { SectionPanel } from './SectionPanel';

const TAG: Record<Announcement['tag'], string | null> = { none: null, live: 'LIVE', deadline: 'DEADLINE', tip: 'TIP' };
const TAG_CLASS: Record<Announcement['tag'], string> = { none: '', live: 'bg-red text-white', deadline: 'bg-red text-white', tip: 'bg-cyan text-navy' };
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short' });

export default function Announcements() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  useEffect(() => {
    let alive = true;
    void api.getAnnouncements().then((a) => { if (alive) { setItems(a); api.markAnnouncementsRead(); } });
    return () => { alive = false; };
  }, []);

  return (
    <SectionPanel train={6} title="ANNOUNCEMENTS">
      {!items ? <p className="font-display text-sm">TUNING THE PA…</p> : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="border-[3px] border-navy bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm">{a.title}</h3>
                {TAG[a.tag] && <span className={`border-2 border-navy px-2 py-0.5 font-display text-[10px] ${TAG_CLASS[a.tag]}`}>{TAG[a.tag]}</span>}
              </div>
              <p className="mt-1 font-ui text-sm">{a.body}</p>
              <p className="mt-1 font-ui text-[10px] font-bold tracking-widest">{fmt(a.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
```

- [ ] **Step 4: Run tests, lint; visual check; commit**

Run: `npx vitest run && npm run lint` — PASS / clean. Visual: Train 06's red unread badge disappears after opening the feed (go back to the platform to see the sign).

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): announcements feed with unread tracking

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 35: Run progress track, progress strip and the dev panel

**Files:**
- Create: `src/hooks/useStage.ts`, `src/ui/ProgressStrip.tsx`, `src/world/props/ProgressTrack.tsx`, `src/ui/DevPanel.tsx`
- Modify: `src/pages/Station/Platform.tsx`, `src/world/zones/Station.tsx`, `src/App.tsx` (mount `DevPanel`), `src/store/world.ts` (`stageIndex` mirror)
- Test: `tests/hooks/useStage.test.ts`, `tests/ui/DevPanel.test.tsx`

**Interfaces:**
- `useStage(): { stage: Stage | null; index: number }` — derives via `deriveStage` from session/team/submission/leaderboard/time; also mirrors `index` into `useWorld.stageIndex` so the canvas can react without React subscriptions to five stores.
- `useWorld` additions: `stageIndex: number; setStageIndex(i)`.
- `ProgressStrip()` — DOM six-stop strip with the runner dot; `aria-label="Run progress: <stage>"`.
- `ProgressTrack()` (canvas) — six markers along the platform edge with Bungee labels; a half-scale runner runs marker→marker when `stageIndex` increases.
- `DevPanel()` — visible only with `?dev=1`: `+1 DAY`, `JUMP TO JUDGING`, `RESET CLOCK`, `TICK BOARD`, `+100 COINS`, `RESET MOCK DATA`, plus draw-call readout (`useWorld.drawCalls`, wired in Task 38).

- [ ] **Step 1: Write the failing tests**

`tests/hooks/useStage.test.ts`:
```ts
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { DEMO_RUNNER } from '@/api/seed';
import { EVENT } from '@/config/event';
import { useStage } from '@/hooks/useStage';
import { setTimeOffset } from '@/lib/time';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useSubmission } from '@/store/submission';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';

describe('useStage', () => {
  beforeEach(async () => {
    api.reset(); setTimeOffset(0);
    useSession.setState({ user: null }); useTeam.setState({ team: null, loading: false }); useSubmission.setState({ submission: null, loaded: true });
    useLeaderboard.setState({ rows: await api.getLeaderboard(), deltas: {}, running: false });
  });
  afterEach(() => setTimeOffset(0));

  it('is null signed out, then walks the stages and mirrors the index into the world store', async () => {
    expect(renderHook(() => useStage()).result.current.stage).toBeNull();
    useSession.setState({ user: { ...DEMO_RUNNER, teamId: null, openedChallengeAt: null } });
    expect(renderHook(() => useStage()).result.current.stage).toBe('REGISTERED');
    useSession.setState({ user: { ...DEMO_RUNNER, openedChallengeAt: '2026-11-14T12:00:00+05:30' } });
    expect(renderHook(() => useStage()).result.current.stage).toBe('BUILDING');
    setTimeOffset(Date.parse(EVENT.timeline.submissionDeadline) - Date.now() + 1000);
    const r = renderHook(() => useStage());
    expect(r.result.current.stage).toBe('FINALIST');            // PIXEL RAIDERS is seeded at rank 1
    expect(useWorld.getState().stageIndex).toBe(5);
  });
});
```

`tests/ui/DevPanel.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DevPanel } from '@/ui/DevPanel';
import { getTimeOffset, setTimeOffset } from '@/lib/time';

describe('DevPanel', () => {
  afterEach(() => setTimeOffset(0));
  it('renders only with ?dev=1 and shifts the clock', () => {
    const { unmount } = render(<DevPanel search="" />);
    expect(screen.queryByText('DEV')).toBeNull();
    unmount();
    render(<DevPanel search="?dev=1" />);
    fireEvent.click(screen.getByRole('button', { name: '+1 DAY' }));
    expect(getTimeOffset()).toBe(86_400_000);
    fireEvent.click(screen.getByRole('button', { name: 'RESET CLOCK' }));
    expect(getTimeOffset()).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/hooks/useStage.test.ts tests/ui/DevPanel.test.tsx`
Expected: FAIL.

- [ ] **Step 3: World store fields and `src/hooks/useStage.ts`**

Add to `WorldState`: `stageIndex: number; setStageIndex(i: number): void; drawCalls: number; setDrawCalls(n: number): void;` and to the object: `stageIndex: -1, setStageIndex: (stageIndex) => set({ stageIndex }), drawCalls: 0, setDrawCalls: (drawCalls) => set({ drawCalls }),`.

`src/hooks/useStage.ts`:
```ts
import { useEffect } from 'react';
import { EVENT } from '@/config/event';
import { deriveStage, stageIndex, type Stage } from '@/lib/progress';
import { now } from '@/lib/time';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useSubmission } from '@/store/submission';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';

export function useStage(): { stage: Stage | null; index: number } {
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const submission = useSubmission((s) => s.submission);
  const rows = useLeaderboard((s) => s.rows);
  const rank = user?.teamId ? rows.find((r) => r.teamId === user.teamId)?.rank ?? null : null;
  const stage = deriveStage({
    signedIn: !!user,
    teamSize: team?.members.length ?? 0,
    openedChallenge: !!user?.openedChallengeAt,
    hasSubmission: !!submission,
    nowMs: now(),
    deadlineMs: Date.parse(EVENT.timeline.submissionDeadline),
    rank,
  });
  const index = stage ? stageIndex(stage) : -1;
  useEffect(() => { useWorld.getState().setStageIndex(index); }, [index]);
  return { stage, index };
}
```

- [ ] **Step 4: Write `src/ui/ProgressStrip.tsx` and `src/world/props/ProgressTrack.tsx`**

`src/ui/ProgressStrip.tsx`:
```tsx
import { useStage } from '@/hooks/useStage';
import { STAGES } from '@/lib/progress';

export function ProgressStrip() {
  const { stage, index } = useStage();
  return (
    <div aria-label={`Run progress: ${stage ?? 'not started'}`} className="border-4 border-navy bg-pale p-3 shadow-bevel">
      <p className="mb-2 font-display text-[10px] tracking-[0.3em] text-navy">RUN PROGRESS</p>
      <ol className="relative grid grid-cols-6 gap-1">
        <span aria-hidden className="absolute left-[8%] right-[8%] top-2 h-1.5 bg-navy" />
        <span aria-hidden className="absolute left-[8%] top-2 h-1.5 bg-yellow transition-[width] duration-700" style={{ width: `${Math.max(0, index) / 5 * 84}%` }} />
        {STAGES.map((s, i) => (
          <li key={s} className="relative flex flex-col items-center gap-1 text-center">
            <span aria-hidden className={`z-10 h-5 w-5 border-[3px] border-navy ${i <= index ? 'bg-yellow' : 'bg-white'} ${i === index ? 'ring-4 ring-cyan' : ''}`} />
            <span className={`font-display text-[9px] leading-tight ${i <= index ? 'text-navy' : 'text-navy/50'}`}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```
In `src/pages/Station/Platform.tsx` replace `<div id="progress-strip" className="pointer-auto mt-3" />` with `<div className="pointer-auto mt-3 max-w-2xl"><ProgressStrip /></div>` (import it).

In `src/pages/Station/Layout.tsx` call `useStage();` at the top of `StationLayout` (import from `@/hooks/useStage`) so `world.stageIndex` stays current on every station route, not only on the platform page — the 3D `ProgressTrack` reads it.

`src/world/props/ProgressTrack.tsx`:
```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { STAGES } from '@/lib/progress';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Runner } from '../runner/Runner';

const Z0 = -190, STEP = -8, X = 7.5;
const markerPos = (i: number): [number, number, number] => [X, PLATFORM_Y, Z0 + i * STEP];

/** Six station markers along the platform's back edge; the mini runner runs to the newest stage. */
export function ProgressTrack() {
  const user = useSession((s) => s.user);
  const index = useWorld((s) => s.stageIndex);
  const active = useWorld((s) => s.shot === 'station' || s.shot.startsWith('train'));
  const prev = useRef(index);
  const [runTo, setRunTo] = useState<{ from: [number, number, number]; to: [number, number, number]; duration: number } | null>(null);
  const standing = useMemo(() => markerPos(Math.max(0, index)), [index]);

  useEffect(() => {
    if (index > prev.current && prev.current >= 0) setRunTo({ from: markerPos(prev.current), to: markerPos(index), duration: 1.2 });
    prev.current = index;
  }, [index]);

  return (
    <group>
      <mesh position={[X, PLATFORM_Y + 0.02, Z0 + 2.5 * STEP]} material={mat('yellow')}>
        <boxGeometry args={[0.3, 0.02, -STEP * 5 + 1]} />
      </mesh>
      {STAGES.map((s, i) => (
        <group key={s} position={markerPos(i)}>
          <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} material={i <= index ? mat('yellow') : mat('pale')}>
            <circleGeometry args={[0.5, 20]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={mat('navy')}>
            <torusGeometry args={[0.5, 0.05, 6, 24]} />
          </mesh>
          <Text font={BUNGEE_URL} fontSize={0.28} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 1.2, 0]} rotation-y={-Math.PI / 2}>{s}</Text>
        </group>
      ))}
      {active && user && index >= 0 && (
        <Runner config={user.avatar} position={standing} rotationY={0} scale={0.5} runTo={runTo} />
      )}
    </group>
  );
}
```
Mount `<ProgressTrack />` inside `Station()` in `src/world/zones/Station.tsx` (after `<ArrivalTrain />`).

- [ ] **Step 5: Write `src/ui/DevPanel.tsx` and mount it**

```tsx
import { useState } from 'react';
import { api } from '@/api';
import { EVENT } from '@/config/event';
import { getTimeOffset, setTimeOffset } from '@/lib/time';
import { useGame } from '@/store/game';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';

const DAY = 86_400_000;

export function DevPanel({ search = typeof window === 'undefined' ? '' : window.location.search }: { search?: string }) {
  const [, force] = useState(0);
  const drawCalls = useWorld((s) => s.drawCalls);
  const tier = useWorld((s) => s.qualityTier);
  if (!new URLSearchParams(search).has('dev')) return null;
  const bump = () => force((n) => n + 1);
  const btn = 'pointer-auto border-2 border-navy bg-white px-2 py-1 font-display text-[10px] hover:bg-cyan';
  return (
    <aside className="pointer-auto fixed bottom-4 left-4 z-40 w-56 border-4 border-navy bg-yellow p-2 text-navy shadow-bevel">
      <p className="font-display text-xs">DEV</p>
      <p className="font-ui text-[10px] font-bold">{`clock +${Math.round(getTimeOffset() / 3600_000)}h · ${tier} · ${drawCalls} calls`}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={btn} onClick={() => { setTimeOffset(getTimeOffset() + DAY); bump(); }}>+1 DAY</button>
        <button type="button" className={btn} onClick={() => { setTimeOffset(Date.parse(EVENT.timeline.submissionDeadline) - Date.now() + 3600_000); bump(); }}>JUMP TO JUDGING</button>
        <button type="button" className={btn} onClick={() => { setTimeOffset(0); bump(); }}>RESET CLOCK</button>
        <button type="button" className={btn} onClick={() => useLeaderboard.getState().tick()}>TICK BOARD</button>
        <button type="button" className={btn} onClick={() => useGame.getState().awardCoins(100, 'DEV')}>+100 COINS</button>
        <button type="button" className={btn} onClick={() => { api.reset(); useSession.getState().hydrate(); useGame.getState().reset(); window.location.href = '/'; }}>RESET MOCK DATA</button>
      </div>
    </aside>
  );
}
```
Mount `<DevPanel />` in `Shell` (`src/App.tsx`) after `<Toasts />`.

- [ ] **Step 6: Run tests, lint, build; visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built. Visual: on `/station` the progress strip shows the current stage; along the platform's back edge six markers with labels and a half-size runner at the current one; open Train 03 (Challenge), return to the platform → the mini runner runs from REGISTERED/TEAM READY to BUILDING. `?dev=1` shows the panel; `JUMP TO JUDGING` moves the runner to JUDGING/FINALIST.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): run progress track with mini runner, progress strip and dev panel

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 36: Badge and coin polish — confetti, celebrations, night owl

**Files:**
- Create: `src/ui/Confetti.tsx`
- Modify: `src/store/game.ts` (emit `celebrate` on badge), `src/ui/Toasts.tsx` (confetti on badge toasts), `src/App.tsx` (`syncBadges()` on start for `NIGHT OWL`)
- Test: `tests/store/game.test.ts` (extend), `tests/ui/Confetti.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to `tests/store/game.test.ts`:
```ts
  it('emits a world celebrate event when a badge unlocks', () => {
    useWorld.setState({ events: [] });
    useGame.getState().awardBadge('CODE_WARRIOR');
    expect(useWorld.getState().events.some((e) => e.type === 'celebrate')).toBe(true);
  });
```
(add `import { useWorld } from '@/store/world';` at the top of that file.)

`tests/ui/Confetti.test.tsx`:
```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Confetti, confettiPieces } from '@/ui/Confetti';

describe('Confetti', () => {
  it('generates palette-only pieces deterministically and renders them', () => {
    const pieces = confettiPieces(24, () => 0.3);
    expect(pieces).toHaveLength(24);
    for (const p of pieces) expect(['yellow', 'cyan', 'orange', 'red']).toContain(p.color);
    const { container } = render(<Confetti />);
    expect(container.querySelectorAll('[data-confetti]').length).toBe(24);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/store/game.test.ts tests/ui/Confetti.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `src/store/game.ts` `awardBadge`, after pushing the badge toast add:
```ts
        useWorld.getState().emit({ type: 'celebrate' });
```
with `import { useWorld } from './world';` at the top.

`src/ui/Confetti.tsx`:
```tsx
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PALETTE, type PaletteName } from '@/theme/palette';

const COLORS: PaletteName[] = ['yellow', 'cyan', 'orange', 'red'];

export interface Piece { x: number; drift: number; delay: number; rot: number; color: PaletteName; size: number }

export function confettiPieces(n: number, rng: () => number = Math.random): Piece[] {
  return Array.from({ length: n }, (_, i) => ({
    x: (i / n) * 100 + rng() * 4, drift: (rng() - 0.5) * 60, delay: rng() * 0.3, rot: rng() * 720 - 360,
    color: COLORS[Math.floor(rng() * COLORS.length)], size: 6 + rng() * 8,
  }));
}

/** Palette-only paper squares falling over the toast column. Purely decorative. */
export function Confetti() {
  const reduced = useReducedMotion();
  const pieces = useMemo(() => confettiPieces(24), []);
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-none absolute inset-x-0 -top-40 h-40 overflow-visible">
      {pieces.map((p, i) => (
        <motion.span key={i} data-confetti className="absolute top-0 block border border-navy"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: PALETTE[p.color] }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 220, x: p.drift, rotate: p.rot, opacity: 0 }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeIn' }} />
      ))}
    </div>
  );
}
```

In `src/ui/Toasts.tsx`, inside `ToastItem`'s non-coin branch, render `{t.kind === 'badge' && <Confetti />}` as the first child of the `motion.div` and give that div `relative` in its class list. Import `Confetti`.

In `src/App.tsx` `Shell`, add:
```tsx
import { useEffect } from 'react';
import { syncBadges } from '@/store/badgeSync';
…
  useEffect(() => { syncBadges(); }, []);   // NIGHT OWL and anything else already earned
```

- [ ] **Step 4: Run tests, lint; visual check; commit**

Run: `npx vitest run && npm run lint` — PASS / clean. Visual: unlocking a badge flips the card in with palette confetti while the platform runner hops and spins. Set the machine clock (or use `?dev=1` — it does not shift local hours; instead temporarily test `NIGHT OWL` by asserting the rule in the unit test only).

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): badge confetti, runner celebrations and startup badge sync

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

## Phase 5 — Mobile, performance & polish

### Task 37: Mobile layouts

**Files:**
- Create: `src/ui/PinnedRunner.tsx`
- Modify: `src/pages/Landing/index.tsx`, `src/pages/Station/SectionPanel.tsx`, `src/pages/Station/Platform.tsx`, `src/pages/SignIn.tsx`, `src/pages/Register/Identity.tsx`, `src/pages/Register/Crew.tsx`, `src/ui/Toasts.tsx` (`coinsTarget` picks the visible counter)
- Test: `tests/ui/PinnedRunner.test.tsx`, `tests/ui/MobileNav.test.tsx`

**Interfaces:**
- `PinnedRunner()` — small fixed card (bottom-right, `md:hidden`) with the runner's team colour block, name and coins; rendered on `/` when signed in so the avatar "stays visible" on phones.
- `coinsTarget()` exported from `Toasts.tsx`: uses `#hud-coins` if it has a non-zero rect, else `#hud-coins-mobile`, else the top-right corner.

- [ ] **Step 1: Write the failing tests**

`tests/ui/PinnedRunner.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_RUNNER } from '@/api/seed';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { PinnedRunner } from '@/ui/PinnedRunner';

describe('PinnedRunner', () => {
  beforeEach(() => { window.localStorage.clear(); useGame.getState().reset(); });
  it('renders nothing signed out and the runner chip signed in', () => {
    useSession.setState({ user: null });
    const { container, unmount } = render(<MemoryRouter><PinnedRunner /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
    unmount();
    useSession.setState({ user: { ...DEMO_RUNNER } });
    useGame.setState({ coins: 30 });
    render(<MemoryRouter><PinnedRunner /></MemoryRouter>);
    expect(screen.getByText('DEMO')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/station');
  });
});
```

`tests/ui/MobileNav.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { MobileNav } from '@/ui/MobileNav';

describe('MobileNav', () => {
  it('lists items and closes', () => {
    const onClose = vi.fn();
    render(<MemoryRouter><MobileNav open items={[{ label: 'RUN', href: '#hero' }, { label: 'SIGN IN', to: '/signin', tone: 'yellow' }]} onClose={onClose} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'RUN' })).toHaveAttribute('href', '#hero');
    expect(screen.getByRole('link', { name: 'SIGN IN' })).toHaveAttribute('href', '/signin');
    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/ui/PinnedRunner.test.tsx tests/ui/MobileNav.test.tsx`
Expected: PinnedRunner FAIL (module not found); MobileNav PASS already (keep it as a regression test).

- [ ] **Step 3: Write `src/ui/PinnedRunner.tsx` and mount it**

```tsx
import { Link } from 'react-router';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';

export function PinnedRunner() {
  const user = useSession((s) => s.user);
  const coins = useGame((s) => s.coins);
  if (!user) return null;
  return (
    <Link to="/station" className="pointer-auto fixed bottom-4 right-4 z-20 flex items-center gap-2 border-[3px] border-navy bg-white px-2 py-1.5 shadow-bevel md:hidden">
      <span aria-hidden className="h-7 w-7 border-2 border-navy" style={{ background: PALETTE[user.avatar.teamColor] }} />
      <span className="font-display text-xs text-navy">{user.avatar.name}</span>
      <span className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>
    </Link>
  );
}
```
Mount `<PinnedRunner />` in `src/pages/Landing/index.tsx` next to `<SkipIntro />`.

- [ ] **Step 4: Mobile adjustments**

- `src/ui/Toasts.tsx`: replace `coinsTarget` with
```ts
export function coinsTarget(): { x: number; y: number } {
  for (const id of ['hud-coins', 'hud-coins-mobile']) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.width > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth - 40, y: 24 };
}
```
- `src/pages/Station/SectionPanel.tsx`: outer `<main>` classes → `flex min-h-dvh items-end justify-center p-3 md:items-center md:justify-end md:p-4 md:pr-[6vw]`; the `Panel` gets `max-h-[80dvh] md:max-h-[88dvh]`.
- `src/pages/Station/Platform.tsx`: heading `text-2xl md:text-5xl`; the trains grid `grid-cols-2 md:grid-cols-6`; card text `text-[11px] md:text-xs`.
- `src/pages/SignIn.tsx`, `src/pages/Register/Identity.tsx`, `src/pages/Register/Crew.tsx`: add `max-h-[90dvh] overflow-y-auto` to their `Panel` `className`.
- `src/pages/Landing/Section.tsx`: padding `px-4 py-20 md:px-12 md:py-24` so the hero headline fits at 375 px (`text-[clamp(2.6rem,8.5vw,7.5rem)]` already scales).

- [ ] **Step 5: Run tests, lint, build; mobile visual check; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built.

Visual at **mobile** (Browser pane → `resize_window` preset `mobile`, reload): the HUD collapses to brand + `MENU`; the menu sheet lists RUN/DOMAINS/CHALLENGE/LEADERBOARD/SIGN IN full-width; the landing snaps section by section; signed in, the pinned runner chip sits bottom-right; sign-in and registration panels fit without horizontal scroll and scroll internally; station trains show as a 2-column grid and section panels open as bottom sheets. Reset with preset `desktop`.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): mobile layouts — pinned runner, bottom sheets, scrollable panels

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 38: Performance tiers, reduced motion, no-WebGL fallback, accessibility

**Files:**
- Create: `src/world/StatsProbe.tsx`
- Modify: `src/world/WorldCanvas.tsx` (`?nowebgl=1`, probe), `src/App.tsx` (`MotionConfig`, skip link), `src/hooks/useLenis.ts` (no smoothing under reduced motion), `src/world/props/Rails.tsx` / `src/world/props/Wall.tsx` (density knobs if over budget)
- Test: `tests/world/webgl.test.ts`, `tests/a11y/shell.test.tsx`

**Interfaces:**
- `isWebGLAvailable(search?: string)` — returns `false` when `?nowebgl=1`.
- `StatsProbe()` (canvas) — every 30 frames writes `gl.info.render.calls` to `useWorld.drawCalls`.

- [ ] **Step 1: Write the failing tests**

`tests/world/webgl.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { isWebGLAvailable } from '@/world/WorldCanvas';

describe('isWebGLAvailable', () => {
  it('is forced off by ?nowebgl=1 and is false in jsdom anyway', () => {
    expect(isWebGLAvailable('?nowebgl=1')).toBe(false);
    expect(isWebGLAvailable('')).toBe(false);
  });
});
```

`tests/a11y/shell.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Shell } from '@/App';

describe('Shell accessibility', () => {
  it('has a skip link, a primary nav and a main landmark', () => {
    render(<MemoryRouter><Shell /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'SKIP TO CONTENT' })).toHaveAttribute('href', '#content');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/world/webgl.test.ts tests/a11y`
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/world/WorldCanvas.tsx`:
```ts
export function isWebGLAvailable(search: string = typeof window === 'undefined' ? '' : window.location.search): boolean {
  if (new URLSearchParams(search).has('nowebgl')) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
```
and render `<StatsProbe />` inside the `<Canvas>` after `<PerformanceMonitor … />`.

`src/world/StatsProbe.tsx`:
```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorld } from '@/store/world';

export function StatsProbe() {
  const n = useRef(0);
  useFrame(({ gl }) => { if (++n.current % 30 === 0) useWorld.getState().setDrawCalls(gl.info.render.calls); });
  return null;
}
```

`src/App.tsx` — wrap `Shell`'s content in framer's `MotionConfig` and add the skip link; the landing `main` and every page `main` should carry `id="content"` on the first `main` rendered (add `id="content"` to the `<main>` in `src/pages/Landing/index.tsx`, `src/pages/SignIn.tsx`, each register step, `src/pages/Station/SectionPanel.tsx`, `src/pages/Station/Platform.tsx`, `src/pages/NotFound.tsx`):
```tsx
import { MotionConfig } from 'framer-motion';
…
export function Shell() {
  useEffect(() => { syncBadges(); }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10">
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border-4 focus:border-navy focus:bg-yellow focus:px-4 focus:py-2 focus:font-display focus:text-navy">SKIP TO CONTENT</a>
        <RouteShotSync />
        <LenisRoot />
        <Hud />
        <AppRoutes />
        <Toasts />
        <DevPanel />
      </div>
    </MotionConfig>
  );
}
```

`src/hooks/useLenis.ts`: construct Lenis with `smoothWheel: !prefersReducedMotion()` (import from `useReducedMotion`).

- [ ] **Step 4: Draw-call audit**

Run the dev server with `?dev=1`, visit `/`, `/register/domain` (after completing identity), and `/station`. Read the `calls` figure in the dev panel on the `high` tier. If any view exceeds **150**, reduce until it fits, in this order: `Rails` tie spacing `1.2 → 1.6`; `Wall` beam spacing `6 → 8`; drop `Poster`s to the two nearest the hero. On the `low` tier (force it with Chrome DevTools → "Emulate CPU throttling" or `useWorld.getState().setQuality('low')` in the console) confirm < **80** and that shadows are off. Record the final numbers in the commit message.

- [ ] **Step 5: Reduced-motion and fallback checks**

- Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload `/`: no intro, camera cuts instead of dollies, no particles/confetti, `▶ START RUNNING` jumps to check-in, section text appears without slide-in.
- Open `/?nowebgl=1`: pale page with navy track lines, HUD, hero and all flows still work; sign in and reach the station.
- Keyboard-only pass: Tab from the top — skip link → brand → pills → hero buttons; complete sign-in with keyboard; domain step arrows; customizer chips; station train cards; no focus traps.

- [ ] **Step 6: Run tests, lint, build; commit**

Run: `npx vitest run && npm run lint && npx vite build` — PASS / clean / built.

```bash
cd C:/Users/araji/AI && git add Hackathon/src Hackathon/tests && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "feat(hackathon): draw-call probe, reduced-motion config, no-WebGL flag and skip link

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/src Hackathon/tests
```

---

### Task 39: README, final verification and walkthrough

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# AI EXPO — RUN THE HACKATHON

A subway-runner-inspired 3D hackathon site. One persistent React-Three-Fiber world, a locked six-colour
palette, mock data behind a swappable API.

## Run

    npm install
    npm run dev          # http://localhost:5173
    npm test             # vitest
    npm run lint         # eslint + palette guard
    npm run build

## Demo shortcuts

- **Sign in instantly:** `Continue with Google` / `Continue with GitHub` (demo runner `demo@aiexpo.run`, password `runner123`).
- **Seeded crew codes:** `RAIL-7K2Q` (PIXEL RAIDERS), `RAIL-B8YT` (LINE BREAKERS); `RAIL-M4XZ` is full.
- `?dev=1` — dev panel: shift the clock (JUDGING / FINALIST stages), tick the leaderboard, add coins, reset mock data, draw-call readout.
- `?nointro=1` — skip the intro cinematic. `?nowebgl=1` — force the no-WebGL fallback.

## The colour rule

Only `#FDD013 #6AEEFD #354093 #C6FEFE #F7BE76 #E31902 #FFFFFF` may appear in `src/`. Tailwind's default
palette is removed (`src/theme/theme.css`), 3D materials come from `src/world/materials.ts`, and
`scripts/check-palette.mjs` fails the build on anything else. The page background is pale (`#C6FEFE`);
navy is structure, never background.

## Where things live

- `src/config/event.ts` — every event fact (name, dates, venue, prizes, domains). Edit this first.
- `src/api/` — `HackathonApi` interface, `mock.ts` (localStorage), `seed.ts`. Implement the interface
  against a real backend and swap the export in `src/api/index.ts`.
- `src/world/` — canvas, camera rig (`shots.ts`), zones, procedural props, the runner avatar.
- `src/pages/` — landing sections, sign-in, five registration steps, the station and its six sections.
- `src/store/` — zustand slices; `lib/progress.ts` derives the run stage, `lib/badges.ts` the badges.

## Journey

DISCOVER (`/`) → SIGN IN (`/signin`) → CREATE RUNNER (`/register/identity`) → ROUTE (`/register/domain`)
→ RUNNER (`/register/runner`) → CREW (`/register/crew`) → HACK PASS (`/register/pass`) → STATION (`/station`).
```

- [ ] **Step 2: Full verification**

Run: `npm run lint && npx vitest run && npx vite build`
Expected: palette clean, eslint clean, all suites pass, build succeeds.

- [ ] **Step 3: Walkthrough (desktop 1440×900, then mobile 375×812)**

Clear site data, then in order:
1. `/` — intro plays; skip works; hero springs in; scroll rides the line; doors react to hover/click; coins collect; teaser board flaps; check-in CTAs.
2. `SIGN IN` → provider → `/station`; sign out from the profile.
3. `CREATE YOUR RUNNER` → identity (validation) → domain (door select) → runner (chips, hop/spin, name) → crew (join `RAIL-7K2Q`) → pass (arrival, `YOU'RE IN.`, Hack Pass with QR, `FIRST RUN` badge, coin toasts).
4. Station: all six trains; progress track advances after opening Challenge and after submitting; leaderboard climbs with `+N POSITIONS`; announcements clear the unread badge; edit runner round-trip.
5. `?dev=1` → `JUMP TO JUDGING` → progress reaches JUDGING/FINALIST; submissions lock with `DEADLINE PASSED`.
6. Reduced motion and `?nowebgl=1` as in Task 38.
7. Confirm no console errors and no off-palette colour anywhere on screen.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/araji/AI && git add Hackathon/README.md && git -c user.name="Rajiv Agarwal" -c user.email="workspace220106@gmail.com" commit -m "docs(hackathon): README with demo shortcuts, palette rule and project map

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" -- Hackathon/README.md
```

---

## Spec coverage map

| Spec section | Tasks |
|---|---|
| §2 palette, background, identity, originality | 1, 2, 11 (materials/lights), 38 (guard in lint), every UI task |
| §3 stack | 1 |
| §4.1–4.2 app shell, routes, guards | 1, 9, 10, 11, 31 (`/station/runner`) |
| §4.3 zones / layout | 11, 12, 14, 23, 26, 27, 28 |
| §4.4 camera rig, spline, intro hand-off | 11, 15, 16 |
| §4.5 DOM vs in-world, arcade buttons | 10, 12 (Sign), 18–19 |
| §4.6 stores | 8, 27 (team), 32 (submission), 14/26/28/35 (world additions) |
| §4.7 data layer | 4, 5 |
| §4.8 event config | 3 |
| §5 palette system | 1, 2, 11 |
| §6.1 intro cinematic | 16 |
| §6.2 landing sections, START RUNNING | 15, 17, 18, 19 |
| §6.3 coins | 20 |
| §6.4 HUD | 10, 37 |
| §7.1 kiosk sign-in + reactions | 14 (kiosk, light), 22 |
| §7.2 identity | 23 |
| §7.3 domain doors | 14, 24 |
| §7.4 customizer + avatar | 25, 26 |
| §7.5 crew | 27 |
| §7.6 pass / arrival / QR / FIRST RUN | 28, 29 |
| §8.1 platform + trains | 28, 30 |
| §8.2 six sections | 31, 32, 33, 34 |
| §8.3 progress track | 35 |
| §8.4 coins & badges | 8, 20, 27, 32, 33, 36 |
| §9 procedural props, runner | 12, 13, 14, 25 |
| §10.1 quality tiers | 11, 12 (density), 22 (particles), 38 |
| §10.2 mobile | 10 (mobile nav), 37 |
| §10.3 accessibility / reduced motion | 10, 16, 17, 18, 22, 36, 38 |
| §10.4 fallbacks | 4 (storage), 11, 38 |
| §11 testing | every task; visual checks per task |
| §12 error handling | 9 (guard toasts), 11 (boundaries), 21 (404), 22/23/27/32 (inline errors) |
| §14 phases | Phase headings 1–5 |

## Execution notes

- Tasks are strictly sequential; each assumes the previous commit.
- When a step says "Visual", start the dev server in the background (`npm run dev -- --port 5173`), use the Browser pane, then stop the server before committing.
- Never edit `docs/superpowers/specs/*` during execution; if the spec and this plan disagree, the spec wins — note the discrepancy in the commit body and follow the spec.
- If `npm install` resolves different major versions than listed (e.g. Vite 7), keep going unless the build breaks; pin only if needed and say so in the commit.
