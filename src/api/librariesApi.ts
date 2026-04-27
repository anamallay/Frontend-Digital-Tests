// src/api/librariesApi.ts
//
// Switch layer for user-library endpoints. Used by `librariesSlice.ts`
// for fetching, adding (public or via share token), removing, and sharing
// quizzes from a user's personal library.

import { USE_MOCK } from "./useMockFlag";
import {
  mockFetchUserLibrary,
  mockAddPublicQuizToLibrary,
  mockAddQuizToLibraryUsingToken,
  mockRemoveQuizFromLibrary,
  mockShareQuizWithCandidate,
} from "@/mocks/librariesMocks";
import { http } from "./http";

export const librariesApi = {
  // GET /api/quizzes/library
  fetchUserLibrary() {
    if (USE_MOCK) return mockFetchUserLibrary();
    return http.get("/api/quizzes/library");
  },

  // POST /api/quizzes/library/add-public-quiz  body: { quizId }
  addPublic(quizId: string) {
    if (USE_MOCK) return mockAddPublicQuizToLibrary(quizId);
    return http.post("/api/quizzes/library/add-public-quiz", {
      quizId,
    });
  },

  // POST /api/quizzes/add-to-library  body: { token }
  addViaToken(token: string) {
    if (USE_MOCK) return mockAddQuizToLibraryUsingToken(token);
    return http.post("/api/quizzes/add-to-library", { token });
  },

  // DELETE /api/quizzes/library/:quizId
  remove(quizId: string) {
    if (USE_MOCK) return mockRemoveQuizFromLibrary(quizId);
    return http.delete(`/api/quizzes/library/${quizId}`);
  },

  // POST /api/quizzes/share-quiz  body: { quizId }
  share(quizId: string) {
    if (USE_MOCK) return mockShareQuizWithCandidate(quizId);
    return http.post("/api/quizzes/share-quiz", { quizId });
  },
};