# AI EXPO — Subway Runner Hackathon Platform 🚇🏃

An immersive, high-energy 3D Hackathon platform inspired by Subway Surfers and arcade rail shooters. Built with React 19, Vite, Three.js / React Three Fiber, Tailwind CSS, and Zustand.

🎮 **Live Demo:** [https://ai-expo-hackathon.vercel.app](https://ai-expo-hackathon.vercel.app)  
📦 **Repository:** [https://github.com/workspace220106/AI-EXPO-Hackathon](https://github.com/workspace220106/AI-EXPO-Hackathon)

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Installation & Running

```bash
# Navigate to the Hackathon directory
cd Hackathon

# Install dependencies
npm install

# Start development server
npm run dev

# Run test suite (66 tests)
npm test

# Check linting & strict palette guard
npm run lint

# Build for production
npm run build
```

The app will be available locally at `http://localhost:5173`.

---

## 🔑 Demo Access & Login

You can sign in and explore the full platform immediately using any of these options on the **[Sign In Page](https://ai-expo-hackathon.vercel.app/signin)**:

1. **One-Click Demo Buttons:**
   - Click **`Continue with Google`** or **`Continue with GitHub`** for instant access without credentials.
2. **Pre-Seeded Demo Runner:**
   - **Email:** `demo@aiexpo.run`
   - **Password:** `runner123`
3. **Interactive 5-Step Registration:**
   - Or start fresh at `/register` to choose your track, customize your 3D runner avatar, create/join a crew, and claim your digital Hack Pass with QR code.

---

## 👥 Seeded Crew Codes (Team Join)

During Step 4 of Registration (or from the Station Team panel), you can join pre-existing squads using these seeded crew codes:

| Team Name | Crew Code | Track | Capacity |
| :--- | :--- | :--- | :--- |
| **PIXEL RAIDERS** | `RAIL-7K2Q` | AI | 4 Members |
| **TRACK HACKERS** | `RAIL-M4XZ` | FinTech | 3 Members |
| **LINE BREAKERS** | `RAIL-B8YT` | Cyber | 4 Members |

*(Or select "RUN SOLO FOR NOW" to participate individually).*

---

## 🛠️ Secret Demo Panel (`?dev=1`)

For judges, presenters, and reviewers, an in-app **Dev Control Panel** is available by appending `?dev=1` to any URL:

🔗 **[https://ai-expo-hackathon.vercel.app/station?dev=1](https://ai-expo-hackathon.vercel.app/station?dev=1)**

### Available Dev Controls:
- **`+1 DAY`**: Advances event simulation clock by 24 hours.
- **`JUMP TO JUDGING`**: Instantly jumps time ahead to the submission deadline + judging phase.
- **`RESET CLOCK`**: Resets simulated clock back to the current real time.
- **`TICK BOARD`**: Simulates live activity score changes and coin updates on the leaderboard.
- **`+100 COINS`**: Grants 100 arcade coins directly to the active runner.
- **`RESET MOCK DATA`**: Wipes local storage state and re-seeds mock runners and teams.

---

## ♿ Accessibility & Device Support ("Kind to Everyone")

- **No-WebGL / Low-End Device Fallback:**  
  Append `?nowebgl=1` to test the graceful 2D fallback mode:  
  `https://ai-expo-hackathon.vercel.app/?nowebgl=1`  
  Renders the complete experience with clean SVG track markers and full accessibility.
- **Reduced Motion:**  
  Respects `prefers-reduced-motion: reduce`. Automatically skips camera gliding and train fly-ins in favor of instant cuts.
- **Keyboard Navigation:**  
  Full `Tab` focus rings on all buttons, forms, and station car doors.
- **Responsive Mobile Layout:**  
  Optimized down to 360px width with touch-friendly drawer menus, bottom sheets, and zero horizontal scroll.

---

## 🎨 Event Configuration & Theming

All hackathon metadata, dates, venue, tracks, prizes, and schedule are organized in a single configuration file:
- [`src/config/event.ts`](file:///c:/Users/araji/AI/Hackathon/src/config/event.ts)

To customize dates, venue, or prizes, edit `EVENT` in `src/config/event.ts` and changes reflect across all 3D signs, timeline flappers, and rules automatically.

---

## 🏗️ Architecture & Tech Stack

- **UI Framework:** React 19 + TypeScript + Vite
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **State Management:** Zustand with local persistence
- **Routing:** React Router v7
- **Styling & Theme:** Tailwind CSS v4 with custom strict retro-arcade palette guard
- **Testing:** Vitest + React Testing Library (17 suites, 66 tests)
- **Deployment:** Vercel Static Hosting (`vercel.json` SPA routing)
