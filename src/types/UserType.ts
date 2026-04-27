import { QuizType } from "./QuizType";

/**
 * The user object as it lives in Redux state, localStorage, and is passed
 * around components. This is the CLEAN user — no wire-format wrapper.
 *
 * Read fields directly: `userData.email`, `userData.active`, `userData.username`.
 */
export type UserType = {
  _id: string;
  name: string;
  username: string;
  email?: string;
  active: boolean;
  library: QuizType[];
  quizzes: QuizType[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * The wire-format response from auth endpoints (login, register, activate).
 * The backend wraps the user in `{ message, data: user }`. The slice
 * unwraps this into a plain `UserType` before storing in Redux, so this
 * type only appears inside API modules and slice thunks — never in
 * components or selectors.
 */
export type LoginResponse = {
  message: string;
  data: UserType;
  token?: string;
};

/**
 * Shape used when registering — what the caller provides, without fields
 * the server generates (`_id`, `library`, `quizzes`).
 */
export type IUserInput = Omit<UserType, "_id" | "library" | "quizzes"> & {
  password: string;
};


/**
 * The user shape exposed through public-browse endpoints (`/api/users`,
 * `/api/users/:id`). Intentionally omits fields that should not leak to
 * unauthenticated viewers:
 *   - `email`  (PII)
 *   - `active` (internal activation state)
 *
 * Adds a `publicQuizzesCount` convenience field so the list view can show
 * "N public exams" next to each user without fetching every quiz.
 *
 * Derived from `UserType` via `Omit` so new fields added to the canonical
 * user type won't silently appear here; you'll have to explicitly decide
 * whether each new field is public-safe.
 */
export type PublicUserType = Omit<UserType, "email" | "active"> & {
  publicQuizzesCount: number;
};