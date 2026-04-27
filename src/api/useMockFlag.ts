// src/api/useMockFlag.ts
//
// Single source of truth for the mock flag. Import this from every api module
// so the switch is consistent and a single env flag controls everything.
//
// Activated when BOTH are true:
//   1. import.meta.env.DEV  → Vite sets this to true during `vite dev` only;
//                              dead-stripped from production builds.
//   2. VITE_USE_MOCK === "true"  → opt-in from .env
//
// Even if someone sets VITE_USE_MOCK=true in a production .env, the mock
// code is physically unreachable because of the DEV guard.

export const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true";

let warned = false;
export function warnOnce() {
  if (!USE_MOCK || warned) return;
  warned = true;
  // eslint-disable-next-line no-console
  console.warn(
    "%c[mock] MOCK API ENABLED — all backend calls are local and fake. " +
      "Unset VITE_USE_MOCK in .env to use the real backend.",
    "background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-weight:bold"
  );
}