// src/api/usersApi.ts
//
// Switch layer for public-users endpoints. Used by `publicUsersSlice.ts`
// to list all registered users and to fetch a single user's profile
// together with their authored public quizzes.
//
// These endpoints are publicly accessible — no auth cookie required —
// so the response shape intentionally omits email, activation state,
// and any other PII. See `PublicUserType` in types/UserType.ts.

import { USE_MOCK } from "./useMockFlag";
import {
  mockFetchPublicUsers,
  mockFetchPublicUserById,
} from "@/mocks/usersMocks";
import { http } from "./http";

export const usersApi = {
  // GET /api/users/public — all registered users, stripped to public shape
  fetchPublic() {
    if (USE_MOCK) return mockFetchPublicUsers();
    return http.get("/api/users/public");
  },

  // GET /api/users/public/:id — one user + their authored public quizzes
  fetchPublicById(userId: string) {
    if (USE_MOCK) return mockFetchPublicUserById(userId);
    return http.get(`/api/users/public/${userId}`);
  },
};