// src/api/questionsApi.ts
//
// Switch layer for question CRUD endpoints. Used by `questionsSlice.ts`
// for listing quiz questions, adding/editing/deleting, and fetching a
// library quiz's questions for the quiz-taking flow.

import { QuestionType } from "../types/QuestionType";
import { USE_MOCK } from "./useMockFlag";
import {
  mockFetchQuestionsByQuizId,
  mockFetchQuestionById,
  mockAddQuestion,
  mockUpdateQuestion,
  mockDeleteQuestion,
  mockFetchQuizFromLibrary,
} from "@/mocks/questionsMocks";
import { http } from "./http";

export const questionsApi = {
  // GET /api/questions/quiz/:quizId
  fetchByQuiz(quizId: string) {
    if (USE_MOCK) return mockFetchQuestionsByQuizId(quizId);
    return http.get(`/api/questions/quiz/${quizId}`);
  },

  // GET /api/questions/question/:id
  fetchById(questionId: string) {
    if (USE_MOCK) return mockFetchQuestionById(questionId);
    return http.get(`/api/questions/question/${questionId}`);
  },

  // POST /api/questions/add
  add(data: Partial<QuestionType>) {
    if (USE_MOCK) return mockAddQuestion(data);
    return http.post("/api/questions/add", data);
  },

  // PUT /api/questions/:id
  update(questionId: string, data: Partial<QuestionType>) {
    if (USE_MOCK) return mockUpdateQuestion(questionId, data);
    return http.put(`/api/questions/${questionId}`, data);
  },

  // DELETE /api/questions/:quizId/:questionId
  remove(quizId: string, questionId: string) {
    if (USE_MOCK) return mockDeleteQuestion(quizId, questionId);
    return http.delete(`/api/questions/${quizId}/${questionId}`);
  },

  // GET /api/quizzes/library/:quizId — returns the quiz + its questions
  fetchFromLibrary(quizId: string) {
    if (USE_MOCK) return mockFetchQuizFromLibrary(quizId);
    return http.get(`/api/quizzes/library/${quizId}`);
  },
};