// src/api/quizzesApi.ts
//
// Switch layer for quiz CRUD endpoints. Redux thunks in `quizzesSlice.ts`
// call these methods and never need to know whether a real axios request
// was made or a local mock resolved.

import { QuizType, IQuizInput } from "../types/QuizType";
import { USE_MOCK } from "./useMockFlag";
import {
  mockFetchPublicQuizzes,
  mockFetchUserQuizzes,
  mockFetchQuizById,
  mockCreateQuiz,
  mockUpdateQuiz,
  mockDeleteQuiz,
} from "@/mocks/quizzesMocks";
import { http } from "./http";

export const quizzesApi = {
  // GET /api/quizzes/public?page=&limit=
  fetchPublic(page: number, limit: number) {
    if (USE_MOCK) return mockFetchPublicQuizzes(page, limit);
    return http.get("/api/quizzes/public", {
      params: { page, limit },
    });
  },

  // GET /api/quizzes/userQuiz
  fetchUserQuizzes() {
    if (USE_MOCK) return mockFetchUserQuizzes();
    return http.get("/api/quizzes/userQuiz");
  },

  // GET /api/quizzes/:id
  fetchById(quizId: string) {
    if (USE_MOCK) return mockFetchQuizById(quizId);
    return http.get(`/api/quizzes/${quizId}`);
  },

  // POST /api/quizzes/create
  create(data: Partial<QuizType> | IQuizInput) {
    if (USE_MOCK) return mockCreateQuiz(data);
    return http.post("/api/quizzes/create", data);
  },

  // PUT /api/quizzes/:id
  update(quizId: string, updates: Partial<QuizType>) {
    if (USE_MOCK) return mockUpdateQuiz(quizId, updates);
    return http.put(`/api/quizzes/${quizId}`, updates);
  },

  // DELETE /api/quizzes/:id
  remove(quizId: string) {
    if (USE_MOCK) return mockDeleteQuiz(quizId);
    return http.delete(`/api/quizzes/${quizId}`);
  },
};