# Digital Exams

A production-grade React + TypeScript web application for creating, sharing, and taking online exams. Built with Arabic-first RTL support, a clean Redux architecture, and a full mock backend for offline development.

**🔗 [Live Demo](#)** &nbsp;•&nbsp; **📖 [Architecture Highlights](#architecture-highlights)** &nbsp;•&nbsp; **🛠 [Tech Stack](#tech-stack)**

---

## Screenshots

> ```html
> <p align="center">
>   <img src="/public/image/one.png" width="48%" alt="English LTR view" />
>   <img src="/public/image/two.png" width="48%" alt="Arabic RTL view" />
> </p>
> ```

---

## What this project demonstrates

This isn't a tutorial-follow-along quiz app. It's a ~6,000-line codebase where I worked through real architectural problems that don't come up in toy projects. Four specific pieces worth looking at:

### 1. An API layer with a runtime switch between real and mock backends

All HTTP goes through a single configured `axios` instance (`src/api/http.ts`) with centralized credentials handling and an `Accept-Language` interceptor. Every API module (`authApi`, `quizzesApi`, `scoresApi`, …) is a thin switch that checks a `USE_MOCK` flag and either hits the real backend or calls an in-memory mock handler.

The mock layer is **wire-compatible** with the real backend — same response envelopes, same error shapes — so the Redux slices don't know or care which is active. The `USE_MOCK` flag is guarded by `import.meta.env.DEV`, which means mock code is dead-stripped from production builds by Vite's tree-shaker. You can develop the entire app without a running backend.

See: `src/api/`, `src/mocks/`.

### 2. A quiz timer that survives page refreshes and handles duplicate-submit races

The quiz-progress state machine has to handle: user navigates away mid-quiz, user refreshes, user's laptop sleeps during a timed exam, user double-clicks Submit, and the global timer firing auto-submit while a manual submit is already in flight. Each of these used to produce its own bug.

The current design:
- **Pure reducers** in `quizProgressSlice` handle state transitions. No side effects.
- **Redux listener middleware** (`quizProgressPersistence.ts`) persists state to `localStorage` after every relevant action. The slice doesn't know about storage.
- **A derived selector** (`selectRemainingTime`) computes time-remaining from `startTime + initialTime`, so no interval can drift.
- **A single global `GlobalTimer` component** owns the "did time run out?" check. The quiz page renders only a decorative countdown ring whose `onComplete` is a no-op.
- **A single `isSubmitting` flag** in the slice prevents any caller (button, timer, or future code) from triggering duplicate submissions.

Comments throughout the code reference the specific bugs that motivated each decision.

See: `src/reducer/action/quizProgressSlice.ts`, `src/reducer/middleware/quizProgressPersistence.ts`, `src/layout/GlobalTimer.tsx`.

### 3. Auth hydration without flash-of-redirect

A logged-in user who refreshes the page should *not* be briefly bounced to `/login` while the app refetches their user data. The naive approach (check `isLoggedIn` from `localStorage` → render `ProtectedRoute` → refetch in effect) produces exactly this flash.

The fix: localStorage stores only a one-bit `auth:isLoggedIn` hint — **not** the user object. The boot effect in `App.tsx` dispatches `getUserData()` to verify against the backend. An `isHydrating` flag in the Redux state causes `ProtectedRoute` to render nothing (not redirect) until hydration completes. On failure, a `clearAuth` action flips the hint and the user is routed to login normally.

A legacy-key migration reads the old `user` localStorage key once and seeds the new boolean, then deletes the old key — so existing users aren't logged out by the upgrade.

See: `src/reducer/action/usersSlice.ts` (top-of-file comment block), `src/router/ProtectedRoute.tsx`, `src/App.tsx`.

### 4. Production-grade RTL and i18n

Arabic is a first-class language, not a translation afterthought. The implementation:

- `<html lang>` and `<html dir>` are set **before React mounts** (in `src/utils/i18n.ts`) so the very first paint is already RTL — no flash of LTR for Arabic users on cold loads.
- `App.tsx` keeps `<html lang>`, `<html dir>`, and `<title>` in sync with the active locale via a single effect.
- Every component that renders layout checks `isRTL` and flips margins, arrow directions, and dropdown alignment.
- Translation files (`src/translation/en/global.json`, `src/translation/ar/global.json`) are symmetric — equal key coverage in both languages.
- Language changes via the Header dropdown persist to `localStorage` and take effect immediately, with no reload.

Most "internationalized" React apps do LTR + a language toggle. Correct RTL — where the UI genuinely mirrors — is rarer than it should be.

See: `src/utils/i18n.ts`, `src/App.tsx`.

---

## Tech stack

**Runtime:** React 18 • TypeScript (strict mode) • Vite • Redux Toolkit • React Router v6 • axios • i18next • Tailwind CSS • shadcn/ui (radix primitives) • framer-motion • lucide-react

**Testing:** (to be added — see "Roadmap" below.)

**Deployment:** Vercel.

---

## Running locally

```bash
# Clone and install
git clone https://github.com/anamallay/Frontend-Digital-Tests
cd Frontend-Digital-Tests
npm install

# Run with the mock backend (no backend required)
VITE_USE_MOCK=true npm run dev

# Run against a real backend
VITE_API_URL=https://your-backend.example.com npm run dev

# Build for production
npm run build
```

### Mock credentials

With `VITE_USE_MOCK=true`, the following users are seeded:

| Role          | Email                | Username   | Password      |
| ------------- | -------------------- | ---------- | ------------- |
| Active user   | `user@test.com`      | `user`     | `password123` |
| Active user   | `admin@test.com`     | `admin`    | `admin123`    |
| Inactive user | `inactive@test.com`  | `inactive` | `password123` |

---

## Roadmap & known limitations

I believe in being honest about what's incomplete. Current gaps, prioritized:

- **No automated tests yet.** Manual QA only. Next planned work is a vitest suite against the `quizProgress` state machine, the `selectRemainingTime` selector, and the mock layer integration path — the three areas where subtle bugs can silently ship.
- **No error boundary.** A single component render error crashes the whole tree to a blank screen. Fix is trivial; scheduled.
- **No code splitting.** All routes are statically imported, so first paint ships the full dashboard bundle even for logged-out users. Fix via `React.lazy` on protected routes; scheduled.
- **Limited question types.** Only 4-option multiple choice. Adding other types (true/false, short answer, ordering) would require schema work on both frontend and backend.

---

## Project structure

```
src/
├── api/              # Thin HTTP + mock-switch layer (one file per resource)
├── components/       # UI — grouped by feature area, modals in a subfolder
├── layout/           # App-level layout (Header, Error, GlobalTimer)
├── lib/              # Shared utilities (readError, cn)
├── mocks/            # Mock backend — wire-compatible with the real one
├── reducer/
│   ├── action/       # Redux slices (one file per resource)
│   ├── middleware/   # Custom middleware (quiz-progress persistence)
│   └── store/        # Store configuration
├── router/           # Route definitions + protected-route guard
├── translation/      # i18n files (en/, ar/)
├── types/            # TypeScript type definitions
└── utils/            # i18n initialization
```

---

## License

MIT. See [LICENSE](./LICENSE).