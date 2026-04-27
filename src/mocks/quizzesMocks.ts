// src/mocks/quizzesMocks.ts
//
// Local implementations of the quiz endpoints. Each function returns a
// response shaped exactly like what axios would resolve with from the real
// backend, so the slices can read `response.data.data` / `response.data.message`
// without caring whether mock or real.

import { QuizType, IQuizInput } from "../types/QuizType";
import {
  getDB,
  commit,
  hydrateQuiz,
  currentUserId,
  uid,
  nowISO,
  StoredQuiz,
  delay,
  axiosError,
} from "./mockStore";

// GET /api/quizzes/public?page=&limit=
export async function mockFetchPublicQuizzes(page: number, limit: number) {
  await delay();
  const db = getDB();
  const publicQuizzes = db.quizzes.filter((q) => q.visibility === "public");
  const total = publicQuizzes.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = publicQuizzes.slice(start, start + limit);

  return {
    data: {
      data: {
        quizzes: slice.map((q) => hydrateQuiz(q, db)),
        totalQuizzes: total,
        totalPages,
        currentPage: page,
      },
    },
  };
}

// GET /api/quizzes/userQuiz — quizzes owned by the logged-in user
export async function mockFetchUserQuizzes() {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const mine = db.quizzes
    .filter((q) => q.userId === userId)
    .map((q) => hydrateQuiz(q, db));

  return { data: { data: mine } };
}

// GET /api/quizzes/:id
export async function mockFetchQuizById(quizId: string) {
  await delay();
  const db = getDB();
  const q = db.quizzes.find((x) => x._id === quizId);
  if (!q) throw axiosError("Quiz not found", 404);
  return { data: { data: hydrateQuiz(q, db) } };
}

// POST /api/quizzes/create
export async function mockCreateQuiz(input: Partial<QuizType> | IQuizInput) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  if (!input.title || !input.description) {
    throw axiosError("Title and description are required", 400);
  }
  if (!input.time || input.time <= 0) {
    throw axiosError("Quiz time must be greater than zero", 400);
  }

  const stored: StoredQuiz = {
    _id: uid("quiz"),
    title: input.title,
    description: input.description,
    time: input.time,
    visibility: (input.visibility as "public" | "private") || "public",
    userId,
    questionIds: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  db.quizzes.push(stored);
  commit();

  return {
    data: {
      message: "Quiz created (mock)",
      data: hydrateQuiz(stored, db),
    },
  };
}

// PUT /api/quizzes/:id
export async function mockUpdateQuiz(
  quizId: string,
  updates: Partial<QuizType>
) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const q = db.quizzes.find((x) => x._id === quizId);
  if (!q) throw axiosError("Quiz not found", 404);
  if (q.userId !== userId) throw axiosError("Not your quiz", 403);

  if (updates.title !== undefined) q.title = updates.title;
  if (updates.description !== undefined) q.description = updates.description;
  if (updates.time !== undefined) q.time = updates.time;
  if (updates.visibility !== undefined) q.visibility = updates.visibility;
  q.updatedAt = nowISO();

  commit();

  return {
    data: {
      message: "Quiz updated (mock)",
      data: hydrateQuiz(q, db),
    },
  };
}

// DELETE /api/quizzes/:id
export async function mockDeleteQuiz(quizId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const idx = db.quizzes.findIndex((x) => x._id === quizId);
  if (idx === -1) throw axiosError("Quiz not found", 404);
  if (db.quizzes[idx].userId !== userId)
    throw axiosError("Not your quiz", 403);

  // Cascade: remove this quiz's questions, any library entries, and any scores
  const removed = db.quizzes.splice(idx, 1)[0];
  db.questions = db.questions.filter(
    (qu) => !removed.questionIds.includes(qu._id)
  );
  db.library = db.library.filter((l) => l.quizId !== quizId);
  db.scores = db.scores.filter((s) => {
    const sQuizId = typeof s.quiz === "object" ? s.quiz._id : s.quiz;
    return sQuizId !== quizId;
  });

  commit();

  return { data: { message: "Quiz deleted (mock)" } };
}