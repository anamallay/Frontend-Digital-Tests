// src/mocks/usersMocks.ts
//
// Local implementations of the public-users endpoints. These power the
// /users and /users/:id pages, which are publicly browsable (no login
// required) — so the response shape must not include any sensitive
// fields like email or activation state. See `PublicUserType` in
// types/UserType.ts.
//
// `publicQuizzesCount` and the per-user quiz list are derived from the
// persisted mock store (mockStore.ts) so newly-created public quizzes
// immediately appear on the authoring user's profile.

import { PublicUserType, UserType } from "../types/UserType";
import { QuizType } from "../types/QuizType";
import { MOCK_USERS } from "./authMocks";
import { getDB, hydrateQuiz, delay, axiosError } from "./mockStore";

/**
 * Strip a MockUser / UserType down to the public shape, attaching a
 * count of the user's authored public quizzes from the store.
 */
function toPublicUser(
  user: Omit<UserType, "library" | "quizzes"> & { _id: string },
  publicQuizzesCount: number
): PublicUserType {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    library: [],
    quizzes: [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    publicQuizzesCount,
  };
}

/**
 * Count how many public quizzes a given user has authored, from the
 * current persisted mock store.
 */
function countPublicQuizzes(userId: string): number {
  const db = getDB();
  return db.quizzes.filter(
    (q) => q.userId === userId && q.visibility === "public"
  ).length;
}

// GET /api/users/public — all registered users, public shape
export async function mockFetchPublicUsers() {
  // No artificial delay for the list — we want snappy browsing.
  const users: PublicUserType[] = MOCK_USERS.map((u) =>
    toPublicUser(u, countPublicQuizzes(u._id))
  );
  return {
    data: { message: "Public users retrieved (mock)", data: users },
  };
}

// GET /api/users/public/:id — one user + their authored public quizzes
export async function mockFetchPublicUserById(userId: string) {
  await delay();
  const mockUser = MOCK_USERS.find((u) => u._id === userId);
  if (!mockUser) throw axiosError("User not found", 404);

  const db = getDB();
  const authoredPublicQuizzes: QuizType[] = db.quizzes
    .filter((q) => q.userId === userId && q.visibility === "public")
    .map((q) => hydrateQuiz(q, db));

  const user = toPublicUser(mockUser, authoredPublicQuizzes.length);

  return {
    data: {
      message: "Public user retrieved (mock)",
      data: {
        user,
        publicQuizzes: authoredPublicQuizzes,
      },
    },
  };
}