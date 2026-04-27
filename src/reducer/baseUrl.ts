// src/reducer/baseUrl.ts
//
// Backend base URL — sourced from the `VITE_API_URL` environment variable
// defined in `.env` (or `.env.production`, etc.). The fallback is a local
// dev server, which keeps the app functional if someone clones the repo
// and forgets to set up their env file.
//
// Note: this URL is only hit when `VITE_USE_MOCK` is false. In mock mode,
// the api modules short-circuit to local handlers and never touch the
// network. See `src/api/useMockFlag.ts`.

export const backendUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";