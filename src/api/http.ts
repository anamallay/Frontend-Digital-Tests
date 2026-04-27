// src/api/http.ts
//
// One configured axios instance for every API module in the app.
//
// Configured at construction:
//   - `baseURL` from VITE_API_URL (falls back to localhost:8080 for local dev)
//   - `withCredentials: true` so the auth cookie still rides along when
//     frontend and backend share an eTLD+1 (custom domain or local dev)
//   - Per-request interceptors for `Accept-Language` and
//     `Authorization: Bearer <token>` (token sourced from localStorage)
//
// Nothing else should `import axios from "axios"` directly. API modules
// import `http` from here; that's the only surface. Attaching interceptors
// to the default export of `axios` would leak into any third-party library
// that transitively imports axios — this is the safe alternative.

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const ACCESS_TOKEN_KEY = "access_token";

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

// Reading from localStorage on each request (rather than at construction)
// means token rotation and language changes take effect on the next request
// without rebuilding the instance.
http.interceptors.request.use((config) => {
  try {
    const lang = localStorage.getItem("language") || "ar";
    config.headers["Accept-Language"] = lang;
  } catch {
    /* localStorage unavailable — skip the header, request still works */
  }
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    /* localStorage unavailable — fall back to cookie auth */
  }
  return config;
});