// src/mocks/librariesMocks.ts
//
// Local implementations of the user-library endpoints. The library is a
// simple junction table: { userId, quizId } entries. Sharing creates a
// token that, when redeemed, adds the referenced quiz to the redeemer's library.

import {
  getDB,
  commit,
  hydrateQuiz,
  currentUserId,
  uid,
  delay,
  axiosError,
} from "./mockStore";

// Shared helper — returns the current user's library as hydrated QuizTypes.
function currentLibraryQuizzes() {
  const db = getDB();
  const userId = currentUserId();
  if (!userId) {
    return {
      db,
      userId: null as string | null,
      list: [] as ReturnType<typeof hydrateQuiz>[],
    };
  }
  const entries = db.library.filter((l) => l.userId === userId);
  const list = entries
    .map((l) => db.quizzes.find((q) => q._id === l.quizId))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => hydrateQuiz(q, db));
  return { db, userId, list };
}

// GET /api/quizzes/library
export async function mockFetchUserLibrary() {
  await delay();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);
  const { list } = currentLibraryQuizzes();
  return { data: { data: list } };
}

// POST /api/quizzes/library/add-public-quiz  body: { quizId }
export async function mockAddPublicQuizToLibrary(quizId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);
  if (quiz.visibility !== "public")
    throw axiosError("Only public quizzes can be added", 403);

  const already = db.library.some(
    (l) => l.userId === userId && l.quizId === quizId
  );
  if (!already) {
    db.library.push({ userId, quizId });
    commit();
  }

  const { list } = currentLibraryQuizzes();
  return { data: { message: "Added to library (mock)", data: list } };
}

// POST /api/quizzes/add-to-library  body: { token }
export async function mockAddQuizToLibraryUsingToken(token: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const share = db.shareTokens.find((t) => t.token === token);
  if (!share) throw axiosError("Invalid or expired link", 404);

  const quiz = db.quizzes.find((q) => q._id === share.quizId);
  if (!quiz) throw axiosError("Quiz no longer exists", 404);

  const already = db.library.some(
    (l) => l.userId === userId && l.quizId === share.quizId
  );
  if (!already) {
    db.library.push({ userId, quizId: share.quizId });
    commit();
  }

  const { list } = currentLibraryQuizzes();
  return { data: { message: "Added to library via token (mock)", data: list } };
}

// DELETE /api/quizzes/library/:quizId
export async function mockRemoveQuizFromLibrary(quizId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  db.library = db.library.filter(
    (l) => !(l.userId === userId && l.quizId === quizId)
  );
  // Also wipe any score attached to this library entry for this user
  db.scores = db.scores.filter((s) => {
    const sQuizId = typeof s.quiz === "object" ? s.quiz._id : s.quiz;
    const sUserIds = Array.isArray(s.user)
      ? s.user.map((u: any) => u?._id ?? u)
      : [];
    return !(sQuizId === quizId && sUserIds.includes(userId));
  });
  commit();

  const { list } = currentLibraryQuizzes();
  // NOTE: the slice reads `response.data.library` for this one endpoint
  return { data: { library: list } };
}

// POST /api/quizzes/share-quiz  body: { quizId }
export async function mockShareQuizWithCandidate(quizId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);
  if (quiz.userId !== userId) throw axiosError("Not your quiz", 403);

  const token = uid("share");
  db.shareTokens.push({
    token,
    quizId,
    createdAt: new Date().toISOString(),
  });
  commit();

  const quizLink = `${window.location.origin}/dashboard/add-quiz-via-token/${token}`;
  return {
    data: {
      message: "Share link created (mock)",
      data: { quizLink },
    },
  };
}