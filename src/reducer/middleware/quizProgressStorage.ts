// src/reducer/middleware/quizProgressStorage.ts
//
// Pure helpers for reading/writing the quiz-progress section of
// localStorage. Kept free of action-creator imports so the module graph
// has no cycle between the slice and the persistence middleware.
//
// Storage keys are namespaced under `quizProgress:*` so a single prefix
// filter wipes every progress-related value.

/**
 * All quiz-progress localStorage keys, in one place. The slice reads these
 * at boot to rehydrate state; the middleware writes them after each action.
 */
export const QUIZ_PROGRESS_STORAGE_KEYS = {
  isInProgress: "quizProgress:isInProgress",
  currentQuizId: "quizProgress:currentQuizId",
  startTime: "quizProgress:startTime",
  initialTime: "quizProgress:initialTime",
  answers: "quizProgress:answers",
  currentQuestion: "quizProgress:currentQuestion",
} as const;

/**
 * Legacy unprefixed keys that earlier versions of the app wrote. Read
 * once on boot to preserve in-flight quizzes across the upgrade, then
 * cleared so they don't drift.
 */
const LEGACY_STORAGE_KEYS = {
  isInProgress: "isQuizInProgress",
  currentQuizId: "currentQuizId",
  startTime: "startTime",
  initialTime: "initialTime",
  answers: "answers",
  currentQuestion: "currentQuestion",
} as const;

// Wrap all storage access in try/catch. In private-browsing mode or when
// quota is exceeded, localStorage can throw — we'd rather skip persistence
// than crash the quiz flow.

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable — ignore */
  }
}

// ─── The state shape this module persists ────────────────────────────────
// Duplicated here rather than imported from the slice to keep this file
// free of slice imports. The shape is stable — it's the public surface of
// the quiz-progress feature.
//
// Note: `isSubmitting` is part of the in-memory state shape but is NOT
// written to localStorage. It's a session-local guard that would be a lie
// after a page reload (we can't know if the POST landed). The hydrator
// always returns false for it.

export interface PersistedQuizProgress {
  isQuizInProgress: boolean;
  currentQuizId: string | null;
  startTime: number | null;
  initialTime: number;
  answers: number[];
  currentQuestion: number;
  isSubmitting: boolean;
}

// ─── Write path ───────────────────────────────────────────────────────────

/**
 * Persist the quiz-progress section of state to localStorage. Called by the
 * listener middleware after any action that could have mutated it. Kept as
 * one function so that every write path serializes the same way and we
 * never forget a key.
 */
export function persistQuizProgress(state: PersistedQuizProgress): void {
  const {
    isQuizInProgress,
    currentQuizId,
    startTime,
    initialTime,
    answers,
    currentQuestion,
  } = state;

  safeSet(QUIZ_PROGRESS_STORAGE_KEYS.isInProgress, String(isQuizInProgress));

  if (currentQuizId != null) {
    safeSet(QUIZ_PROGRESS_STORAGE_KEYS.currentQuizId, currentQuizId);
  } else {
    safeRemove(QUIZ_PROGRESS_STORAGE_KEYS.currentQuizId);
  }

  if (startTime != null) {
    safeSet(QUIZ_PROGRESS_STORAGE_KEYS.startTime, String(startTime));
  } else {
    safeRemove(QUIZ_PROGRESS_STORAGE_KEYS.startTime);
  }

  if (initialTime > 0) {
    safeSet(QUIZ_PROGRESS_STORAGE_KEYS.initialTime, String(initialTime));
  } else {
    safeRemove(QUIZ_PROGRESS_STORAGE_KEYS.initialTime);
  }

  if (answers.length > 0) {
    safeSet(QUIZ_PROGRESS_STORAGE_KEYS.answers, JSON.stringify(answers));
  } else {
    safeRemove(QUIZ_PROGRESS_STORAGE_KEYS.answers);
  }

  safeSet(
    QUIZ_PROGRESS_STORAGE_KEYS.currentQuestion,
    String(currentQuestion)
  );
}

// ─── Read path ────────────────────────────────────────────────────────────

/**
 * Hydrate a quiz-progress state slice from localStorage. Called once by
 * the slice on module load. Reads the namespaced keys first; if nothing
 * is there, falls back to legacy unprefixed keys (and cleans them up) so
 * a user mid-quiz doesn't lose progress across the upgrade.
 */
export function hydrateQuizProgressFromStorage(): PersistedQuizProgress {
  const readJSONArray = (key: string): number[] => {
    const raw = safeGet(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const hasNamespaced =
    safeGet(QUIZ_PROGRESS_STORAGE_KEYS.isInProgress) !== null ||
    safeGet(QUIZ_PROGRESS_STORAGE_KEYS.currentQuizId) !== null ||
    safeGet(QUIZ_PROGRESS_STORAGE_KEYS.startTime) !== null;

  const keys = hasNamespaced
    ? QUIZ_PROGRESS_STORAGE_KEYS
    : LEGACY_STORAGE_KEYS;

  const isQuizInProgress = safeGet(keys.isInProgress) === "true";
  const currentQuizId = safeGet(keys.currentQuizId) || null;
  const startTimeRaw = safeGet(keys.startTime);
  const startTime = startTimeRaw ? Number(startTimeRaw) : null;
  const initialTimeRaw = safeGet(keys.initialTime);
  const initialTime = initialTimeRaw ? Number(initialTimeRaw) : 0;
  const answers = readJSONArray(keys.answers);
  const currentQuestion = Number(safeGet(keys.currentQuestion) || 0);

  // If we read from legacy keys, clean them up so we don't drift after
  // subsequent writes land under the new namespace.
  if (!hasNamespaced) {
    Object.values(LEGACY_STORAGE_KEYS).forEach(safeRemove);
  }

  return {
    isQuizInProgress,
    currentQuizId,
    startTime,
    initialTime,
    answers,
    currentQuestion,
    isSubmitting: false,
  };
}