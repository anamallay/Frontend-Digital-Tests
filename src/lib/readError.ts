// src/lib/readError.ts
//
// One helper to extract a user-facing string from an unknown caught error.
// Used by every Redux slice in the codebase so that error-handling is
// consistent across thunks, whether the error came from a real axios
// request or from a mock handler that manufactured an axios-shaped error.
//
// The returned string follows this precedence:
//   1. `error.response.data.message` (typical real-backend envelope)
//   2. `error.response.data` if it's a string (some backends return plain
//      text on 4xx/5xx)
//   3. `error.message` (axios / network errors, plus any plain Error)
//   4. the provided `fallback` (usually a translated i18n key)
//
// Never throws. Never reads `.response` off a non-object. Safe to call
// with literally anything.

import { AxiosError } from "axios";

export function readError(err: unknown, fallback: string): string {
  // Real axios error first — narrow via the class check.
  if (err instanceof AxiosError && err.response?.data) {
    const d = err.response.data as { message?: string } | string;
    if (typeof d === "string") return d;
    if (d && typeof d === "object" && d.message) return d.message;
  }

  // Mock-thrown errors have a `response` shape too, but aren't instances
  // of AxiosError. Duck-type them.
  const maybe = err as {
    response?: { data?: { message?: string } | string };
    message?: string;
  };
  if (maybe?.response?.data) {
    const d = maybe.response.data;
    if (typeof d === "string") return d;
    if (d && typeof d === "object" && d.message) return d.message;
  }

  if (maybe?.message) return maybe.message;

  return fallback;
}