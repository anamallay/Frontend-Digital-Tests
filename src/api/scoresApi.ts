// src/api/scoresApi.ts
//
// Switch layer for score endpoints. Used by `scoresSlice.ts` for fetching
// user scores, examiner scores (scores on quizzes you own), a single score
// by ID, submitting a completed quiz, and deleting a score.

import { USE_MOCK } from "./useMockFlag";
import {
  mockFetchUserScores,
  mockFetchSingleScore,
  mockFetchExaminerScores,
  mockSubmitQuiz,
  mockDeleteScore,
} from "@/mocks/scoresMocks";
import { http } from "./http";

export const scoresApi = {
  // GET /api/scores — scores for the current user
  fetchUserScores() {
    if (USE_MOCK) return mockFetchUserScores();
    return http.get("/api/scores");
  },

  // GET /api/scores/:id
  fetchSingle(scoreId: string) {
    if (USE_MOCK) return mockFetchSingleScore(scoreId);
    return http.get(`/api/scores/${scoreId}`);
  },

  // GET /api/scores/examiner — scores on quizzes created by the current user
  fetchExaminer() {
    if (USE_MOCK) return mockFetchExaminerScores();
    return http.get("/api/scores/examiner");
  },

  // POST /api/scores/submit  body: { quizId, answers }
  submit(quizId: string, answers: number[]) {
    if (USE_MOCK) return mockSubmitQuiz(quizId, answers);
    return http.post("/api/scores/submit", { quizId, answers });
  },

  // DELETE /api/scores/delete-score  body: { scoreId }
  remove(scoreId: string) {
    if (USE_MOCK) return mockDeleteScore(scoreId);
    return http.delete("/api/scores/delete-score", {
      data: { scoreId },
    });
  },
};