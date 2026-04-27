// src/mocks/scoresMocks.ts
//
// Local implementations of the score endpoints. The grading logic for
// submitQuiz lives here: compare submitted answers against each question's
// correctOption, compute percentage, and persist.

import { ScoreType, IAnswer } from "../types/ScoreType";
import {
  getDB,
  commit,
  hydrateQuiz,
  currentUserId,
  getUserById,
  uid,
  delay,
  axiosError,
} from "./mockStore";

// GET /api/scores — scores belonging to the current user
export async function mockFetchUserScores() {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const mine = db.scores.filter((s) => {
    const sUserIds = Array.isArray(s.user)
      ? s.user.map((u: any) => u?._id ?? u)
      : [];
    return sUserIds.includes(userId);
  });

  return {
    data: { message: "Scores retrieved (mock)", data: mine },
  };
}

// GET /api/scores/:id
export async function mockFetchSingleScore(scoreId: string) {
  await delay();
  const db = getDB();
  const s = db.scores.find((x) => x._id === scoreId);
  if (!s) throw axiosError("Score not found", 404);
  return {
    data: { message: "Score retrieved (mock)", data: s },
  };
}

// GET /api/scores/examiner — scores on quizzes the current user owns
export async function mockFetchExaminerScores() {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const myQuizIds = new Set(
    db.quizzes.filter((q) => q.userId === userId).map((q) => q._id)
  );

  const scores = db.scores.filter((s) => {
    const sQuizId = typeof s.quiz === "object" ? s.quiz._id : s.quiz;
    return sQuizId && myQuizIds.has(sQuizId);
  });

  return {
    data: { message: "Examiner scores retrieved (mock)", data: scores },
  };
}

// POST /api/scores/submit  body: { quizId, answers }
export async function mockSubmitQuiz(quizId: string, answers: number[]) {
  await delay(500);
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);

  const questions = db.questions.filter((q) =>
    quiz.questionIds.includes(q._id)
  );
  if (questions.length === 0)
    throw axiosError("This quiz has no questions", 400);

  // Grade each question: map answers[i] onto questions[i]; missing answers
  // are stored as -1 and count as incorrect.
  const scoredAnswers: IAnswer[] = questions.map((q, i) => {
    const selectedOption = typeof answers[i] === "number" ? answers[i] : -1;
    return {
      question: q,
      selectedOption,
      isCorrect: selectedOption === q.correctOption,
    };
  });

  const correct = scoredAnswers.filter((a) => a.isCorrect).length;
  const total = questions.length;
  const percentage = Math.round((correct / total) * 100);

  const hydratedQuiz = hydrateQuiz(quiz, db);
  const user = getUserById(userId);

  // If the user already submitted this quiz, overwrite the previous score.
  // Matches most real backends — one score per user per quiz.
  const existingIdx = db.scores.findIndex((s) => {
    const sQuizId = typeof s.quiz === "object" ? s.quiz._id : s.quiz;
    const sUserIds = Array.isArray(s.user)
      ? s.user.map((u: any) => u?._id ?? u)
      : [];
    return sQuizId === quizId && sUserIds.includes(userId);
  });

  const newScore: ScoreType = {
    _id: existingIdx >= 0 ? db.scores[existingIdx]._id : uid("score"),
    quiz: hydratedQuiz,
    user: [user] as any,
    score: percentage,
    totalQuestions: total,
    correctAnswers: correct,
    answers: scoredAnswers,
  };

  if (existingIdx >= 0) db.scores[existingIdx] = newScore;
  else db.scores.push(newScore);
  commit();

  return {
    data: { message: "Quiz submitted (mock)", data: newScore },
  };
}

// DELETE /api/scores/delete-score  body: { scoreId }
export async function mockDeleteScore(scoreId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const before = db.scores.length;
  db.scores = db.scores.filter((s) => s._id !== scoreId);
  if (db.scores.length === before) throw axiosError("Score not found", 404);
  commit();

  return { data: { message: "Score deleted (mock)" } };
}