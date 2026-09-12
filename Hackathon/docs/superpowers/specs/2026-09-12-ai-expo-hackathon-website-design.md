# AI EXPO — Subway-Runner Hackathon Website · Design Spec

**Date:** 2026-09-12
**Status:** Approved in brainstorming, awaiting written-spec review
**Project root:** `C:\Users\araji\AI\Hackathon` (greenfield; the git repo root is `C:\Users\araji\AI`)

---

## 1. Overview

A single-page, highly interactive 3D website for the **AI EXPO** hackathon, built around the visual
energy of an urban subway endless-runner: bright colour, graffiti, trains, coins, a playful runner
avatar, and game-like progression. The visitor discovers the event by *running through* a stylised
station, signs in at a kiosk, creates a runner identity, picks a domain route, builds a crew, receives
a Hack Pass, and then lives in a personal Runner Station where six trains lead to profile, team,
challenge, submissions, leaderboard and announcements.

**This round is front-end only with mocked data.** All accounts, teams, submissions and rankings live
in a mock API backed by `localStorage`. The API is an interface so a real backend (Supabase is the
likely candidate) can be swapped in later without touching UI code.

### Goals (in priority order)

1. Maximum first-impression wow — the 3D world and cinematic must land within seconds.
2. Maximum competitor engagement — coins, badges, progress track, animated leaderboard.
3. Minimum UI friction — every flow works with keyboard and touch; registration is short.
4. Strongest possible game identity — the palette alone should say "subway runner hackathon".

Visual hierarchy everywhere: **3D WORLD → CHARACTER → ACTION → INFORMATION → UI**.

### Non-goals (this round)

- Real authentication, database, email, OAuth.
- Admin/judging tooling.
- File uploads (deck/video are links only).
- Downloading the Hack Pass as an image.
- A separate mobile "vertical runner" scene composition (mobile is the same scene, responsive).

---

## 2. Hard constraints

### 2.1 Locked colour system (absolute)

Only these seven values may appear anywhere — CSS, Tailwind tokens, 3D materials, lights, fog,
particles, canvas-painted textures, QR codes, favicons:

| Token    | Hex       | Role |
|----------|-----------|------|
| `yellow` | `#FDD013` | **ACTION** — primary CTAs, coins, important numbers, progress, interactive targets, rails, signs |
| `cyan`   | `#6AEEFD` | **INTERACTION** — hover, active nav, selected domain, focus rings, motion trails, particles |
| `navy`   | `#354093` | **DEPTH** — structure, trains, pillars, tunnel interiors, panels, text, shadows. **Never the page or scene background.** |
| `pale`   | `#C6FEFE` | **LIGHT SURFACES + BACKGROUND** — the page background, scene background/sky, fog, walls, floors, kiosk screens, cards, forms, signage |
| `orange` | `#F7BE76` | **SECONDARY ENERGY** (sparingly) — warm lighting, secondary buttons, subway signs, transitions |
| `red`    | `#E31902` | **COMPETITION / ALERT** (strategically) — deadlines, LIVE, rank drop, warnings, final round |
| `white`  | `#FFFFFF` | Only for text readability or very small UI details |

Forbidden: purple, violet, magenta, pink, green, black, grey UI, metallic / rainbow / cyberpunk /
generic-blue gradients, any auto-generated accent. Gradients are allowed only between two palette
colours (e.g. `navy → cyan`, `yellow → orange`, `navy → pale`) and are used rarely; prefer large flat
surfaces + lighting + depth. Shading produced by lights is acceptable — it is derived from the palette —
but shaded sides must fall toward navy, never black (see §5.2).

**Background rule (user decision):** the world is a *bright* station. The `<body>`, the three.js
`scene.background`, the fog and the large wall/floor surfaces are `pale` — never `navy`. Navy provides
contrast and depth as objects (trains, pillars, beams, kiosk body, tunnel interiors, text, hard shadows),
so the page reads light with navy structure on top, not dark with light accents.

### 2.2 Visual identity

No cyberpunk, sci-fi neon city, hacker aesthetic, dark futuristic interfaces, holograms, neon-magenta
lighting, generic gaming RGB, black backgrounds, glassmorphism, or corporate dashboard styling.
Target: **colourful urban arcade × subway × graffiti × endless runner** — bright, playful, energetic,
competitive, youthful, urban, tactile.

### 2.3 Originality

No copyrighted characters, logos, UI assets or artwork. Every 3D object, the runner avatar and all
graffiti are generated procedurally in code (Option A). No external model or texture files.

### 2.4 Domain colour coding

| Route | Domain      | Dominant | Line |
|-------|-------------|----------|------|
| 01    | AI          | yellow   | MAKE MACHINES THINK. |
| 02    | DATA        | cyan     | FIND THE PATTERN. |
| 03    | CYBER       | red      | BREAK IT. SECURE IT. |
| 04    | FUTURE TECH | orange   | BUILD WHAT'S NEXT. |

All routes still use navy for depth and pale for light surfaces. (The original brief described
Future Tech as green/blue; the locked palette overrides that — Future Tech is orange-dominant.)

---

## 3. Stack

| Concern | Choice |
|---|---|
| Build / framework | Vite 6, React 19, TypeScript (strict) |
| 3D | three, @react-three/fiber, @react-three/drei (Text, Instances, PerformanceMonitor) |
| Math / easing | maath (`damp3`, `damp`) |
| State | zustand (one slice per concern) |
| Routing | react-router v7 (`BrowserRouter`) |
| UI motion | framer-motion (DOM overlays), CSS for micro-interactions |
| Smooth scroll | lenis |
| Styling | Tailwind CSS v4 with a wiped default palette |
| QR | `qrcode` (renders to canvas, palette colours) |
| Fonts | `@fontsource/bungee` (display / signage), `@fontsource/rubik` (UI) — self-hosted |
| Tests | vitest, @testing-library/react, jsdom |
| Lint | eslint (typescript, react-hooks), `scripts/check-palette.mjs` |

Package manager: npm. Node ≥ 20.

---

## 4. Architecture

### 4.1 App shell

```
<BrowserRouter>
  <App>
    <WorldCanvas />        fixed, full-viewport R3F canvas — never unmounts
    <Hud />                floating game HUD (DOM), all routes
    <Routes>               DOM overlays per route (forms, panels, sections)
    <Toasts />             coin / badge / rank popups
    <DevPanel />           only when ?dev=1
```

The canvas sits at `z-index: 0`, page overlays at `z-index: 10`, HUD at `20`, toasts at `30`.
Overlays use `pointer-events: none` on their wrappers and re-enable it on interactive children, so
the 3D world stays hoverable/clickable between panels.

### 4.2 Routes

| Path | Zone shot | Overlay | Guard |
|---|---|---|---|
| `/` | scroll-driven spline TRACKS→CHECKIN | Landing sections | — |
| `/signin` | CHECKIN | Kiosk panel | redirect to `/station` if signed in |
| `/register/identity` | WALL | Identity form | — |
| `/register/domain` | ROUTES (selection mode) | Door selector | identity complete |
| `/register/runner` | LOCKER | Customizer | domain chosen |
| `/register/crew` | CREW | Team create/join | runner saved |
| `/register/pass` | STATION (arrival) | Hack Pass | crew step complete |
| `/station` | STATION (platform) | Train picker, progress track | signed in |
| `/station/profile` | STATION → train 01 | Profile panel | signed in |
| `/station/team` | STATION → train 02 | Team panel | signed in |
| `/station/challenge` | STATION → train 03 | Challenge panel | signed in |
| `/station/submissions` | STATION → train 04 | Submission form | signed in |
| `/station/leaderboard` | STATION → train 05 | Departure board | signed in |
| `/station/announcements` | STATION → train 06 | Feed | signed in |
| `*` | HALL | "WRONG PLATFORM" 404 | — |

Guards redirect (with a short toast) rather than render errors. Registration step gates read
`registration.completed[step]`; the draft persists in `localStorage` so a refresh mid-registration
returns the user to the furthest completed step.

### 4.3 World layout (zones)

One long station hall along the world **−Z** axis. Approximate ranges (world units; the plan may
adjust exact numbers but must keep the ordering):

| Zone | Z range | Contents |
|---|---|---|
| `TRACKS` | 0 → −20 | rails, ties, tunnel mouth; cinematic start |
| `HALL` | −20 → −50 | main hall: platform, pillars, graffiti walls, posters, cones, spray cans; hero shot |
| `ROUTES` | −50 → −80 | four route doors on the left wall |
| `LINE` | −80 → −100 | challenge/timeline departure board on the right wall |
| `BOARD` | −100 → −120 | leaderboard board across the far wall |
| `CHECKIN` | −120 → −140 | painted entrance arch "RUNNER CHECK-IN", kiosk |
| `WALL` | −140 → −155 | giant "CREATE YOUR RUNNER" graffiti wall |
| `LOCKER` | −155 → −170 | customization station: turntable pad, lockers, mirror sign |
| `CREW` | −170 → −185 | crew platform with painted team markers |
| `STATION` | −185 → −240 | Runner Station: long platform, six train cars, progress track |

Everything is inside one `<group>` so zones share lighting and fog. Zones outside the camera's
frustum are culled automatically; heavy zones (STATION) additionally mount their props lazily when
the route or scroll progress is within range (`world.activeZones`).

### 4.4 Camera rig

`CameraRig` owns the camera. It reads `world.shot` (a `{ position, lookAt, fov }`) and damps toward
it every frame with `maath/easing.damp3` (λ ≈ 3–4 for dollies). Shots are named constants in
`world/shots.ts`, one per zone plus per-train shots for the station.

- On non-landing routes the route→shot mapping sets `world.shot`.
- On `/` the shot is sampled from a `CatmullRomCurve3` (positions) and a parallel look-at curve, both
  parameterised by scroll progress `t ∈ [0, 1]` from `useScrollProgress` (Lenis). Six control points,
  one per landing section.
- The intro cinematic (§6.1) takes over the rig for its duration, then hands control to scroll.
- `prefers-reduced-motion`: damping is replaced by an instant cut.

### 4.5 DOM overlays vs in-world UI

- **DOM (Tailwind):** all forms, panels, HUD, toasts, Hack Pass, leaderboard rows, hero typography
  and CTAs. Styled as kiosk screens, tickets and subway signage (thick navy borders, pale surfaces,
  hard offset shadows, zero blur).
- **In-world (drei `Text` with the Bungee woff):** train names, route numbers and names on doors,
  "RUNNER CHECK-IN" arch, progress-track station names, graffiti words (painted to canvas textures).
- **Arcade buttons** (`ArcadeButton`): DOM buttons that look like physical arcade objects — solid
  fill, 4–6 px navy offset "bevel" shadow, `translateY` press with shadow collapse, hover bounce.
  Pressing a primary arcade button also emits a world event (`world.burst`) so the scene reacts.

### 4.6 State (zustand slices)

| Slice | Holds | Persist |
|---|---|---|
| `session` | `user: Runner \| null`, `signIn`, `signOut` | localStorage |
| `registration` | draft fields per step, `completed: Record<Step, boolean>` | localStorage |
| `runner` | profile, `AvatarConfig`, runnerId, `openedChallengeAt` | via api |
| `team` | team, members, code | via api |
| `progress` | derived stage (see §8.3) — selector, not stored | — |
| `game` | coins, badges (with unlockedAt), visitedZones, collectedCoinIds | localStorage |
| `leaderboard` | rows, lastDeltas, ticker running flag | memory (seeded) |
| `world` | `shot`, `activeZones`, `qualityTier`, `introPlayed`, transient events (`pulse`, `burst`, `look`) | sessionStorage for introPlayed |

Transient world events are stored as `{ id, type, position?, color?, at }` in a short-lived array
consumed by scene components on the next frame, so DOM code never touches three objects directly.

### 4.7 Data layer

`src/api/types.ts`:

```ts
export interface HackathonApi {
  signIn(input: { identifier: string; password: string }): Promise<Runner>;
  signInWithProvider(provider: 'google' | 'github'): Promise<Runner>;
  register(input: RegistrationInput): Promise<Runner>;          // returns runnerId like "#0247"
  updateAvatar(runnerId: string, avatar: AvatarConfig): Promise<Runner>;
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

`src/api/mock.ts` implements it with:
- seeded data from `src/api/seed.ts` (demo runner, 24 leaderboard teams, 3 joinable teams, 8 announcements, 4 challenges);
- persistence under a single `localStorage` key `aiexpo.mock.v1` (in-memory fallback if storage throws);
- `delay(180–420 ms)` fake latency;
- deterministic runner IDs: counter seeded at 246 so the first registration is `#0247`;
- team codes `RAIL-XXXX` from the alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no ambiguous chars).

Errors are thrown as `ApiError { code, message }` with codes `NO_RUNNER`, `BAD_PASSWORD`,
`EMAIL_TAKEN`, `TEAM_NOT_FOUND`, `TEAM_FULL`, `ALREADY_IN_TEAM`, `DEADLINE_PASSED`.

### 4.8 Event configuration

`src/config/event.ts` is the single editable source of event facts. Mock values for this round:

```ts
export const EVENT = {
  name: 'AI EXPO',
  tagline: 'RUN THE HACKATHON',
  mode: 'In-person',
  venue: 'Innovation Hall, Platform 9',          // mock
  city: 'Bengaluru',                              // mock
  organizer: 'AI EXPO Organising Committee',      // mock
  timezone: 'Asia/Kolkata',
  timeline: {
    registrationOpens: '2026-10-01T00:00:00+05:30',
    kickoff:           '2026-11-14T10:00:00+05:30',
    buildHours: 36,
    submissionDeadline:'2026-11-15T22:00:00+05:30',
    judging:           '2026-11-16T10:00:00+05:30',
    finals:            '2026-11-17T15:00:00+05:30',
  },
  team: { min: 1, max: 4 },
  prizes: [
    { place: 1, label: 'GRAND PRIZE', amount: '₹1,00,000' },
    { place: 2, label: 'RUNNER-UP',   amount: '₹50,000' },
    { place: 3, label: 'THIRD',       amount: '₹25,000' },
    { place: 0, label: 'BEST IN EACH ROUTE', amount: '₹10,000 × 4' },
  ],
  judging: ['Innovation', 'Technical depth', 'Impact', 'Demo & pitch'],
  domains: [
    // one entry per route, in this shape; mock theme/problem text is written in the plan
    { id: 'ai', number: '01', name: 'AI', line: 'MAKE MACHINES THINK.', color: 'yellow',
      theme: '…one paragraph…', problems: ['…', '…', '…'] },
    // 'data' (cyan) · 'cyber' (red) · 'future' (orange)
  ],
  socials: { instagram: '#', linkedin: '#', discord: '#' },   // mock
};
```

Every displayed date, prize, venue and challenge text reads from this file. `DomainId` is
`'ai' | 'data' | 'cyber' | 'future'`.

---

## 5. Palette & material system

### 5.1 Tokens

`src/theme/palette.ts`:

```ts
export const PALETTE = {
  yellow: '#FDD013', cyan: '#6AEEFD', navy: '#354093', pale: '#C6FEFE',
  orange: '#F7BE76', red: '#E31902', white: '#FFFFFF',
} as const;
export type PaletteName = keyof typeof PALETTE;
```

`src/theme/theme.css` (Tailwind v4):

```css
@import "tailwindcss";
@theme {
  --color-*: initial;             /* wipe every default colour */
  --color-yellow: #FDD013; --color-cyan: #6AEEFD; --color-navy: #354093;
  --color-pale: #C6FEFE;   --color-orange: #F7BE76; --color-red: #E31902;
  --color-white: #FFFFFF;
  --font-display: "Bungee", system-ui, sans-serif;
  --font-ui: "Rubik", system-ui, sans-serif;
}
```

Result: classes like `bg-gray-500` or `text-purple-600` do not exist; only the seven tokens compile.
Opacity modifiers (`bg-navy/60`) are allowed — they are the same hue composited over palette surfaces.

### 5.2 Materials & lighting

`src/world/materials.ts` exposes `mat(name: PaletteName, variant?: 'toon' | 'flat' | 'emissive')`
returning shared, cached `MeshToonMaterial` (default) / `MeshBasicMaterial` instances. Components
never construct materials with arbitrary colours. Toon shading uses a 3-step gradient map.

Lighting rig (`world/lights.tsx`):
- `scene.background = pale` and `<fog attach="fog" color={pale} near far />` — distance fades into
  bright haze, never darkness. The `<body>` behind the canvas is also `pale`.
- `hemisphereLight` sky = `pale`, ground = `navy`, intensity ≈ 1.1 — lit sides stay bright, shaded
  sides fall toward navy.
- `directionalLight` key, colour `orange`, intensity ≈ 1.2, casting soft shadows on `high` tier only;
  shadow colour is navy at ≈ 35 % opacity (`ShadowMaterial` on the floor), so shadows read as depth
  without darkening the world.
- Zone accent lights: point/spot lights coloured `cyan` or `yellow` near doors, kiosk and trains;
  they are the targets of `world.pulse` events.
- Large surfaces (walls, platform tops, floor) use `pale`; structure (pillars, beams, trains, kiosk
  body, tunnel interiors) uses `navy`. This keeps the frame light with strong navy silhouettes.
- No post-processing, no bloom.

### 5.3 Guard

`scripts/check-palette.mjs` scans `src/**/*.{ts,tsx,css,html}` for `#[0-9a-f]{3,8}` and `rgb(`/`hsl(`
literals and fails if any value is not in the allowed set (case-insensitive; 3-digit forms of the
seven are also allowed). Wired into `npm run lint`. Has a vitest test with a fixture containing an
off-palette hex.

---

## 6. Landing (`/`)

Page height = 6 sections × 100 vh. Section overlays are absolutely positioned DOM blocks that fade/slide
in while `t` is within their window; the camera runs the spline continuously.

### 6.1 Intro cinematic

Runs once per browser session (`world.introPlayed` in sessionStorage). Skipped entirely under
`prefers-reduced-motion` or when `?nointro=1`. A `SKIP ▶` arcade chip sits bottom-right throughout.
Scrolling is locked during playback.

| t (s) | Beat |
|---|---|
| 0.0–1.2 | camera at rail height (y ≈ 0.6) looking down −Z; a 4-car navy train with yellow stripe roars past from behind camera; cyan motion-trail sprites; wheel spin; camera shake ±0.03 |
| 1.2–2.6 | camera accelerates to follow the train into the hall |
| 2.6–3.6 | graffiti wipes onto hall walls: canvas textures repainted with an expanding clip so words/splats appear left→right |
| 3.6–4.2 | camera pulls back and up to the HERO shot |
| 4.2 | hero typography springs in; CTAs pop; scroll unlocks |

### 6.2 Sections

1. **HERO** — `RUN THE HACKATHON.` (Bungee, ~clamp(3rem, 9vw, 8rem), navy text with a hard yellow
   offset shadow — reads on the pale background), subhead `BUILD. COMPETE. CREATE YOUR OWN RUN.` in navy,
   event chip `AI EXPO · 14–15 NOV 2026 · Innovation Hall` (navy chip, pale text).
   CTAs: `▶ START RUNNING` (yellow primary) and `SIGN IN` (pale secondary).
   - **START RUNNING** starts *the run*: Lenis scrolls the page to the bottom over ≈ 9 s with an
     ease-in-out; coins along the route are collected as they pass; any wheel/touch/keyboard scroll
     cancels the auto-run. It ends with the CHECK-IN CTAs focused.
   - **SIGN IN** → `/signin`.
   - Below the CTAs: `SCROLL TO RIDE THE LINE ↓` hint.
2. **ROUTES** — four `RouteDoor`s on the left wall; as each door passes the camera its DOM card slides
   in from the right: route number, name, line, dominant colour. Hover (pointer) lights the door strip
   cyan and nudges the door forward; click opens a side panel with the domain theme + example problem
   statements from `EVENT.domains`. Cards stack vertically on mobile.
3. **THE LINE** — the challenge as a subway map: stops `REGISTRATION OPENS → KICKOFF → 36H BUILD →
   SUBMISSION DEADLINE → JUDGING → FINALS` drawn as a yellow line with station dots; the deadline stop
   is red. Beneath: three departure-board flaps — WHAT TO BUILD, JUDGING (criteria), PRIZES — with
   split-flap reveal animation on entry.
4. **THE RUNNERS** — leaderboard teaser: a board panel with the top 3 (🥇🥈🥉 as text glyphs), a red
   `LIVE` tag, split-flap number animation, and `SEE THE FULL BOARD` (→ `/station/leaderboard` if
   signed in, else `/signin`).
5. **CHECK-IN** — the painted arch `RUNNER CHECK-IN` fills the frame; CTAs `CREATE YOUR RUNNER`
   (→ `/register/identity`) and `SIGN IN`.
6. **FOOTER** — compact signage strip: `AI EXPO`, organizer, socials, `BUILT ON THE LINE`.

### 6.3 Coins on the landing

Twelve rotating yellow coins (`InstancedMesh`) are placed at fixed `t` offsets along the spline.
When scroll `t` passes a coin's `t` for the first time (`game.collectedCoinIds`), the coin pops, a DOM
coin sprite spawns at its projected screen position and tweens to the HUD counter, and `+10` floats up.
Collected coins stay collected across visits.

### 6.4 HUD

- **Top-left:** `AI EXPO` (Bungee) with `// RUN THE HACKATHON` beneath in Rubik. Click → `/`.
- **Top-right pills** (subway-line badges: pale with navy text; active = cyan): `RUN`, `DOMAINS`,
  `CHALLENGE`, `LEADERBOARD`, then `SIGN IN` (yellow) or, when signed in, a chip with the mini avatar
  colour block, runner name and coin count (→ `/station`) and a `STATION` pill.
  On `/` the first four smooth-scroll to their sections; elsewhere they navigate to `/#section`.
- **Bottom-left on `/`:** a mini track with a runner dot showing scroll position.
- **Mobile (< 768 px):** brand + hamburger; the sheet lists the same pills full-width.

---

## 7. Sign-in & registration

### 7.1 `/signin` — the kiosk

Camera dollies to CHECKIN. The kiosk is a navy body with a pale screen, a yellow button row and an
orange marquee sign. The DOM panel aligns over the screen region (centered card on mobile).

Content: `WELCOME, RUNNER.` / `Ready to enter the race?` / `EMAIL / USERNAME` / `PASSWORD` /
`[RUN IN]` (yellow) / `Continue with Google` · `Continue with GitHub` (pale secondary) /
`New runner? CREATE ACCOUNT` (link → `/register/identity`).

Field interaction (shared `Field` component, also used in registration):
- focus → scale 1.02, border cyan, label lifts; emits `world.pulse({ zone, color: 'cyan' })` so the
  kiosk/zone accent lights ramp up then decay over ≈ 600 ms; emits `world.burst` (8–12 cyan particles)
  at the kiosk; if a runner avatar exists in the zone it emits `world.look` so the avatar glances at
  the kiosk.
- error → border red, message in red below, small shake.

Mock rules: Google/GitHub sign in the seeded demo runner immediately (demo path). Email + password
signs in a runner registered on this device; unknown email → `No runner found on this line.` with a
create link; wrong password → `Wrong password, runner.`

### 7.2 `/register/identity`

WALL zone: a giant canvas-painted `CREATE YOUR RUNNER` graffiti across the wall (yellow letters, navy
outline, cyan drips). Form on a pale panel: Full Name, Email, College / Organization, Phone, Password,
Confirm Password. Validation: name ≥ 2 chars; email format; phone 8–15 digits (optional `+`);
password ≥ 8 chars; confirm matches; email not already registered (mock). CTA
`NEXT: CHOOSE YOUR DOMAIN`. *Team Name is intentionally not asked here — it is collected in the Crew step.*

### 7.3 `/register/domain`

ROUTES zone in selection mode. `CHOOSE YOUR DOMAIN` headline. Clicking a door: panels slide open,
the interior floods with the dominant colour, route props float out (AI: yellow geometric solids;
DATA: cyan bar blocks; CYBER: red lock/gate shapes; FUTURE: orange drone rings), the sign strip lights
cyan, and the other three doors sink to navy shade (materials swap to `navy` toon). Keyboard: arrow
keys move selection, Enter confirms. CTA `LOCK IN ROUTE`.

### 7.4 `/register/runner` — customizer

LOCKER zone, headline `YOUR RUN. YOUR IDENTITY.` The runner stands on a yellow turntable pad; the pad
rotates on pointer/touch drag and eases back to front when released.

`AvatarConfig`:

```ts
type AvatarConfig = {
  body: 'slim' | 'regular' | 'chunky';
  tone: 'orange' | 'pale' | 'yellow';                       // stylised skin tone from the palette
  hair: 'buzz' | 'spike' | 'bob' | 'afro' | 'cap';
  hairColor: PaletteName;
  outfit: { color: PaletteName; pattern: 'solid' | 'stripe' | 'block' };
  shoes: { style: 'low' | 'high' | 'boot'; color: PaletteName };
  backpack: 'none' | 'daypack' | 'tube';
  board: 'skate' | 'hover' | 'none';
  teamColor: PaletteName;
  name: string;                                             // 2–16 chars, shown on the pass and HUD
};
```

Side panel of tactile option chips grouped by part; colour pickers show the six palette swatches
(white excluded). Behaviours: hover a chip → runner glances toward the panel; select → runner hops and
spins 360° (0.8 s) and the changed part flashes cyan for 300 ms. CTA `SAVE RUNNER`.

### 7.5 `/register/crew`

CREW zone, headline `BUILD YOUR CREW.` Two arcade buttons: `CREATE TEAM` / `JOIN TEAM`.
- Create: Team Name (2–24 chars), Max Members (2–`EVENT.team.max`), Team Leader = you (read-only),
  generated Team Code shown with `COPY`.
- Join: `ENTER TEAM CODE` (format `RAIL-XXXX`); errors: not found / full / already in a team.
- After either: `YOUR CREW` — a row of runner cards (name, role, domain) and the teammates' 3D runners
  standing together on the platform (seeded teammates have preset `AvatarConfig`s).
- Skipping is allowed (`RUN SOLO FOR NOW`) since `EVENT.team.min` is 1. CTA `CONTINUE TO CHECK-IN`.

### 7.6 `/register/pass`

STATION zone arrival sequence (≈ 2.5 s, cut under reduced motion): platform lights flick on in
sequence, a train pulls in and stops, doors open. Overlay: `YOU'RE IN.` then
`RUNNER ID: #0247 · DOMAIN: AI · TEAM: PIXEL RAIDERS · STATUS: REGISTERED`, then the **HACK PASS**
slides up — a pale travel-pass card with navy type, yellow header band, perforated edge, fields:
runner name, runner ID, team, domain, QR (encodes `aiexpo:runner:#0247`, navy on pale), event dates,
`CHECK-IN: PENDING`. CTA `ENTER THE STATION` → `/station`. Registration completion awards the
`FIRST RUN` badge and `+25` coins per completed step (issued once).

---

## 8. Runner Station (`/station`)

### 8.1 The platform

Six navy train cars parked nose-to-tail along one platform, each with a pale roof sign, a yellow route
number and a drei-Text name: `01 MY PROFILE`, `02 MY TEAM`, `03 CHALLENGE`, `04 SUBMISSIONS`,
`05 LEADERBOARD`, `06 ANNOUNCEMENTS`. The user's runner stands mid-platform running idle animations.
Hover a car → doors crack open and the sign strip lights cyan. Click → navigate to the sub-route: the
camera dollies to that car, doors slide fully open, and the section panel slides out of the car. A
`BACK TO PLATFORM` chip returns to `/station`. Train 06 shows an unread count badge (red) when there
are unread announcements.

### 8.2 Sections

- **01 Profile** — runner card (avatar render, name, ID, domain, college), badges grid, `VIEW PASS`
  (modal with the Hack Pass), `EDIT RUNNER` (opens the customizer in place; saving returns here).
- **02 Team** — crew cards, team code with `COPY`, leader tag, `LEAVE CREW` (confirm). Empty state:
  `CREATE TEAM` / `JOIN TEAM` (reuses the crew step components).
- **03 Challenge** — full domain statement, example problem statements, rules, judging criteria,
  timeline, resource links (mock). First open sets `runner.openedChallengeAt` → stage BUILDING.
- **04 Submissions** — Project Name, Repository URL, Demo URL, Description (≤ 300 words, live count),
  Deck link. `SUBMIT RUN` (yellow). After submitting: status card with timestamp and `EDIT` until the
  deadline. Past the deadline: fields disabled, red `DEADLINE PASSED` sign, submission remains visible.
- **05 Leaderboard** — the giant departure board: columns RANK · TEAM · ROUTE · SCORE · Δ. Top 3 rows
  carry medal flaps. Rows re-order with layout animation; numbers use split-flap transitions.
  The user's team row is highlighted cyan. When the user's team climbs, a yellow `+N POSITIONS` bursts
  above the runner and the runner celebrates; a fall shows a small red `RANK DROP −N`.
  Ticker (mock): every 20 s, 3–6 random teams get ±(5–40) points, with a mild positive bias for the
  user's team so climbs are seen during a demo. Pauses when the tab is hidden.
- **06 Announcements** — feed of cards (title, body, time, tag). Tags: none, `LIVE` (red), `DEADLINE`
  (red), `TIP` (cyan). Opening the section marks all as read.

### 8.3 Run progress track

An in-world track segment runs along the front edge of the platform with six station markers and
drei-Text labels: `REGISTERED → TEAM READY → BUILDING → SUBMITTED → JUDGING → FINALIST`. A half-scale
copy of the user's runner stands at the current station and *runs* to the next marker when it unlocks
(legs swing, 1.2 s). A DOM strip mirrors the same stages for mobile/screen readers.

Stage is a pure selector over state (never set by hand):

```
registered  = session.user != null
teamReady   = team && team.members.length >= 2
building    = runner.openedChallengeAt != null
submitted   = submission != null
judging     = now >= EVENT.timeline.submissionDeadline
finalist    = leaderboard rank of user's team <= 10 && judging
stage       = highest stage whose predicate is true, evaluated in order
```

`now` comes from `lib/time.ts`, which the dev panel (`?dev=1`) can offset to demo JUDGING/FINALIST.

### 8.4 Coins & badges

Coins (yellow counter in the HUD): `+10` first visit to each landing section and each train; `+25`
per completed registration step; `+50` on submission. Coins are never spent; they are a progress signal.

Badges (each awarded once, stored with `unlockedAt`):

| Badge | Rule |
|---|---|
| `FIRST RUN` | registration completed |
| `TEAM BUILDER` | crew has ≥ 2 members |
| `CODE WARRIOR` | submission created |
| `NIGHT OWL` | site opened between 00:00 and 05:00 local time |
| `SPEED BUILDER` | submission within 24 h of registration |
| `FINALIST` | team in leaderboard top 10 during judging |

Unlock: a card-flip toast, palette-only confetti (yellow/cyan/orange/red squares), and the runner
celebrates. Badges appear on the Profile card and, when locked, as navy silhouettes with the rule as
tooltip.

---

## 9. World construction (procedural)

All geometry from primitives (`box`, `cylinder`, `plane`, `extrude`, `torus`), instanced where
repeated. Components in `src/world/props/`:

- `Rails`, `Ties` — yellow rails, navy ties, instanced along a zone length; the track bed is `pale`.
- `Platform` — pale slab with a yellow safety edge line, navy tactile strip and a navy front face.
- `Wall` — pale wall panels with navy beams and orange trim; graffiti walls are painted onto them.
- `Pillar` — navy column with an orange band and a pale number plate.
- `GraffitiWall` — a plane whose `CanvasTexture` is painted at runtime (`lib/graffiti.ts`): big Bungee
  words, arrows, stars, splats and drips in palette colours; supports a `reveal ∈ [0,1]` clip for the
  cinematic wipe. Word sets are configurable per wall (`RUN`, `HACK`, `AI EXPO`, `01–04`, `GO`).
- `Poster` — pale rectangle with navy type and an orange corner, slight tilt.
- `Cone`, `Barrier`, `SprayCan`, `Sneaker`, `Skateboard` — small props scattered in HALL and CHECKIN.
- `Train` — navy body, yellow stripe band, pale windows, navy wheels with yellow hubs, roof rail, headlamp
  (yellow emissive); props `cars`, `speed`, `stopped`, `doorsOpen`; wheels spin with speed.
- `RouteDoor` — navy frame, dominant-colour panels, pale sign with number/name, cyan light strip;
  states `idle | hover | selected | dimmed`; opening animation; interior props per domain.
- `Kiosk` — navy body, pale screen, yellow button row, orange marquee.
- `DepartureBoard` — navy board with pale flap rows (DOM handles the actual text).
- `Coin` — yellow cylinder with an embossed ring; rotates; instanced.
- `Particles` — pool of 64 cyan sprites; `burst(position, n)`.
- `Sign` — pale plate + navy text via drei `Text`.

`src/world/runner/Runner.tsx` — the avatar: a group of boxes (head, torso, two arms, two legs, feet),
hair variant meshes, backpack variants, board under feet. Materials resolve from `AvatarConfig` via
`mat()`. Animation state machine in `animations.ts` driven by `useFrame` time:
- `idle` — breathing bob; every 3–6 s a random micro-action: look left/right (head yaw), foot tap
  (foot pitch), strap tug (arm raise), weight shift (hip sway).
- `look(target)` — head/torso yaw toward a world position, eased, returns to idle after 1.5 s.
- `celebrate` — hop (y arc) + 360° spin over 0.8 s, then idle.
- `run` — leg/arm swing while translating between two points (progress track).
Scale factor and `mini` flag for the progress marker and crew cards.

---

## 10. Mobile, performance, accessibility

### 10.1 Quality tiers (`world/quality.ts`)

| Tier | DPR | Shadows | Instanced prop density | Particles | Fog |
|---|---|---|---|---|---|
| `high` | min(devicePixelRatio, 2) | soft | 100 % | on | far |
| `low` | 1 | off | 50 % | off | near |

Initial tier: `low` if `pointer: coarse` or `hardwareConcurrency ≤ 4` or `deviceMemory ≤ 4`; else
`high`. drei `PerformanceMonitor` steps `high → low` if frame time degrades; never steps back up
within a session (avoids flicker). Budget: < 150 draw calls on `high`, < 80 on `low`.

### 10.2 Mobile layout (< 768 px)

- HUD: brand + hamburger sheet.
- Landing: sections use `scroll-snap-type: y mandatory`; the user's mini avatar (if signed in) is pinned
  bottom-right in a small DOM card so the runner stays visible; domain cards stack.
- Registration: one pale card per step, inputs ≥ 48 px tall, full-width arcade buttons, sticky CTA.
- Station: trains still 3D, but the picker is a vertical list of tappable train cards; selecting zooms
  the camera and opens a bottom sheet.

### 10.3 Accessibility

- All flows are DOM: labelled inputs, visible focus (cyan ring), logical tab order, `aria-live` for
  toasts and rank changes, buttons not divs.
- `prefers-reduced-motion`: no cinematic, camera cuts, no particles/confetti, no auto-run scroll.
- Contrast: navy text on pale/yellow/cyan/orange surfaces; white text on navy/red. No pale-on-yellow
  or cyan-on-pale text.
- 3D world is decorative for assistive tech (`aria-hidden` canvas); every in-world label has a DOM
  equivalent.

### 10.4 Fallbacks

- WebGL unavailable or canvas creation throws → `<WorldCanvas>` renders nothing; the flat pale
  body background with a subtle navy track-line pattern stands in; all DOM flows keep working.
- `localStorage` throws → in-memory store for the session.

---

## 11. Testing

Vitest (jsdom) covers everything that can be wrong without a GPU:

- `api/mock` — sign-in rules, provider demo sign-in, registration + email uniqueness, runner ID
  sequence (`#0247` first), team create/join/leave/full/already-in-team, submission create/edit/lock
  after deadline, leaderboard seed shape.
- `lib/validation` — every form rule.
- `lib/progress` — stage derivation table (each predicate on/off, ordering).
- `lib/badges` + `game` store — each badge rule, awarded once, coin totals.
- `store/leaderboard` — ticker delta math and rank-change events.
- Route guards — redirects for unauthenticated and out-of-order registration.
- `scripts/check-palette` — passes on the allowed set, fails on an off-palette fixture.
- `world/runner/animations` — state machine transitions (pure functions of time).

The 3D scene is verified visually in the Browser pane after each phase at desktop (1440×900) and
mobile (375×812) sizes, checking: cinematic, scroll spline, door hover/select, kiosk focus reactions,
avatar customization, station train transitions, progress marker run, leaderboard burst.

---

## 12. Error handling

- API errors → inline red message on the relevant field or panel; shake; never a modal.
- Guard redirects → toast `Wrong platform, runner — heading back.`
- Unknown route → in-world `WRONG PLATFORM` sign in HALL with `TRAIN BACK HOME` (→ `/`).
- Uncaught render errors → an error boundary above the routes shows a navy panel with `RESTART RUN`
  (reload); the canvas has its own boundary so a scene crash never takes the DOM flows down.

---

## 13. Project structure

```
Hackathon/
  index.html · package.json · vite.config.ts · tsconfig.json · eslint.config.js · vitest.config.ts
  scripts/check-palette.mjs
  public/favicon.svg                     (navy/yellow, palette only)
  src/
    main.tsx · App.tsx
    config/event.ts
    theme/palette.ts · theme.css
    api/types.ts · mock.ts · seed.ts · index.ts
    store/session.ts · registration.ts · runner.ts · team.ts · game.ts · leaderboard.ts · world.ts
    lib/validation.ts · progress.ts · badges.ts · ids.ts · time.ts · graffiti.ts · qr.ts
    hooks/useScrollProgress.ts · useLenis.ts · useQualityTier.ts · useReducedMotion.ts · useWorldEvent.ts
    routes/index.tsx · guards.tsx
    world/
      WorldCanvas.tsx · CameraRig.tsx · shots.ts · layout.ts · materials.ts · lights.tsx · quality.ts
      cinematic/Intro.tsx
      props/…  (see §9)
      runner/Runner.tsx · parts.tsx · animations.ts
      zones/Tracks.tsx · Hall.tsx · Routes.tsx · Line.tsx · Board.tsx · Checkin.tsx · Wall.tsx · Locker.tsx · Crew.tsx · Station.tsx
    ui/ArcadeButton.tsx · Field.tsx · Chip.tsx · Pill.tsx · KioskPanel.tsx · Toast.tsx · Badge.tsx · HackPass.tsx · QrCode.tsx · Hud.tsx · MobileNav.tsx · SplitFlap.tsx · DevPanel.tsx
    pages/
      Landing/index.tsx · Hero.tsx · RoutesSection.tsx · LineSection.tsx · RunnersSection.tsx · CheckinSection.tsx · Footer.tsx
      SignIn.tsx
      Register/Identity.tsx · Domain.tsx · RunnerStep.tsx · Crew.tsx · Pass.tsx
      Station/Platform.tsx · Profile.tsx · Team.tsx · Challenge.tsx · Submissions.tsx · Leaderboard.tsx · Announcements.tsx
      NotFound.tsx
  tests/…                                (mirrors src/)
  docs/superpowers/specs/2026-09-12-ai-expo-hackathon-website-design.md
```

---

## 14. Implementation phases

Each phase ends with a runnable app, passing tests, and a visual check in the browser.

1. **Foundation** — scaffold (Vite/React/TS/Tailwind v4), palette tokens + wiped Tailwind colours,
   palette guard script + test, fonts, `WorldCanvas` + lights + fog + `CameraRig` + shots, route
   skeleton with guards, zustand slices, mock API + seed + tests, HUD shell, `ArcadeButton`/`Field`/`Pill`,
   error boundaries, quality tier detection.
2. **World & Landing** — zone geometry (TRACKS→CHECKIN), props, `Train`, graffiti painter, intro
   cinematic, scroll spline + Lenis, six landing sections, route doors (showcase mode), coins + fly-to-HUD,
   404 page.
3. **Sign-in & Registration** — kiosk + focus reactions + particles, identity form, doors in selection
   mode, `Runner` avatar + animations + customizer, crew create/join, pass arrival sequence + Hack Pass + QR.
4. **Runner Station** — platform + six trains + dolly shots, all six sections, progress track + mini
   runner, leaderboard ticker + bursts, announcements, submissions with deadline lock, coins/badges + toasts.
5. **Mobile, performance & polish** — mobile layouts, snap sections, bottom sheets, low tier, reduced
   motion, no-WebGL fallback, a11y pass, draw-call audit, final palette guard run, README.

---

## 15. Decisions resolved during brainstorming

- Backend: **mocked**, behind a swappable interface (Supabase later).
- Scope: **full journey** (landing → station) in one project, phased.
- Mobile: **same scene, responsive**, adaptive quality — not a separate vertical-runner scene.
- Event: **AI EXPO**; all other facts are mock values in `config/event.ts`.
- 3D production: **procedural (Option A)**, no external assets.
- HUD brand: **AI EXPO // RUN THE HACKATHON** (the brief's "SUBWAY // HACK" is the theme, not the name).
- Team Name asked **once**, in the Crew step.
- Hero **START RUNNING** performs the auto-run through the line; **CREATE YOUR RUNNER** at Check-In
  starts registration.
- Future Tech domain is **orange** (palette overrides the brief's green/blue).
- **Background is light:** `pale` (`#C6FEFE`) is the page, scene, fog and large-surface colour.
  `navy` (`#354093`) is never used as a page or scene background — only for structure, trains,
  panels, text and shadows. (User decision on spec review, overriding the brief's "navy as dominant
  background".)
