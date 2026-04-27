// src/mocks/questionsMocks.ts
//
// Local implementations of the question endpoints. Questions belong to a
// quiz — ownership is enforced via the parent quiz's userId, so you can
// only add/edit/delete questions on quizzes you own.

import { QuestionType } from "../types/QuestionType";
import {
  getDB,
  commit,
  hydrateQuiz,
  currentUserId,
  uid,
  delay,
  axiosError,
} from "./mockStore";

// GET /api/questions/quiz/:quizId
export async function mockFetchQuestionsByQuizId(quizId: string) {
  await delay();
  const db = getDB();
  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);
  const qs = db.questions.filter((q) => quiz.questionIds.includes(q._id));
  return { data: { data: qs } };
}

// GET /api/questions/question/:id
export async function mockFetchQuestionById(questionId: string) {
  await delay();
  const db = getDB();
  const q = db.questions.find((x) => x._id === questionId);
  if (!q) throw axiosError("Question not found", 404);
  return { data: { data: q } };
}

// POST /api/questions/add
// EditQuestionsModal sends: { quizId, question, options, correctOption }
// The `quiz` / `quizId` / array-of-quizzes variants are all tolerated.
export async function mockAddQuestion(
  payload: Partial<QuestionType> & { quiz?: unknown; quizId?: unknown }
) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  // Accept `quizId` (what the component actually sends), `quiz` as a string ID,
  // or `quiz` as an array (matches the `QuestionType.quiz: QuizType[]` type).
  let quizId: string | undefined;
  if (typeof payload.quizId === "string") {
    quizId = payload.quizId;
  } else if (typeof payload.quiz === "string") {
    quizId = payload.quiz;
  } else if (Array.isArray(payload.quiz) && payload.quiz[0]) {
    const first = payload.quiz[0] as { _id?: string } | string;
    quizId = typeof first === "string" ? first : first._id;
  }

  if (!quizId) throw axiosError("Quiz id is required", 400);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);
  if (quiz.userId !== userId) throw axiosError("Not your quiz", 403);

  if (
    !payload.question ||
    !Array.isArray(payload.options) ||
    payload.options.length < 2
  ) {
    throw axiosError(
      "Question and at least two options are required",
      400
    );
  }
  // Reject empty option strings — otherwise you can submit a question with
  // 4 blank options that the scoring pass silently accepts
  if (payload.options.some((opt) => !opt || !opt.trim())) {
    throw axiosError("All options must be non-empty", 400);
  }
  if (
    typeof payload.correctOption !== "number" ||
    payload.correctOption < 0 ||
    payload.correctOption >= payload.options.length
  ) {
    throw axiosError("Valid correctOption index is required", 400);
  }

  const newQuestion: QuestionType = {
    _id: uid("question"),
    question: payload.question,
    options: payload.options,
    correctOption: payload.correctOption,
    quiz: [],
  };

  db.questions.push(newQuestion);
  quiz.questionIds.push(newQuestion._id);
  commit();

  return { data: { message: "Question added (mock)", data: newQuestion } };
}

// PUT /api/questions/:id
export async function mockUpdateQuestion(
  questionId: string,
  updates: Partial<QuestionType>
) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const q = db.questions.find((x) => x._id === questionId);
  if (!q) throw axiosError("Question not found", 404);

  // Check ownership via parent quiz
  const parent = db.quizzes.find((x) => x.questionIds.includes(questionId));
  if (parent && parent.userId !== userId)
    throw axiosError("Not your question", 403);

  if (updates.question !== undefined) q.question = updates.question;
  if (updates.options !== undefined) q.options = updates.options;
  if (updates.correctOption !== undefined)
    q.correctOption = updates.correctOption;
  commit();

  return { data: { message: "Question updated (mock)", data: q } };
}

// DELETE /api/questions/:quizId/:questionId
export async function mockDeleteQuestion(quizId: string, questionId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);
  if (quiz.userId !== userId) throw axiosError("Not your quiz", 403);

  quiz.questionIds = quiz.questionIds.filter((id) => id !== questionId);
  db.questions = db.questions.filter((q) => q._id !== questionId);
  commit();

  return { data: { message: "Question deleted (mock)", data: questionId } };
}

// GET /api/quizzes/library/:quizId — returns the quiz + its questions
// Used when a user opens a quiz from their library to take it.
export async function mockFetchQuizFromLibrary(quizId: string) {
  await delay();
  const db = getDB();
  const userId = currentUserId();
  if (!userId) throw axiosError("Not authenticated", 401);

  const quiz = db.quizzes.find((q) => q._id === quizId);
  if (!quiz) throw axiosError("Quiz not found", 404);

  const hydrated = hydrateQuiz(quiz, db);
  return {
    data: { message: "Quiz retrieved from library (mock)", data: hydrated },
  };
}