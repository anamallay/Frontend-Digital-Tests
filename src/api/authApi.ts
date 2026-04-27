// src/api/authApi.ts
//
// Switch layer for every auth-related endpoint. Redux thunks call
// authApi.<method>(...) and never need to know whether the response came
// from the real backend or from a local mock. The switch lives in
// `useMockFlag.ts` — when USE_MOCK is true the mock functions are called,
// otherwise axios hits the real backend.
//
// This module owns ALL authentication endpoints, not just login/logout.
// Before the Priority-1 refactor, only login/logout were routed through
// here; every other auth thunk talked to axios directly and bypassed the
// mock layer entirely. That's fixed now: register, activate, forget/reset
// password, update user, resend activation, delete account, and getUserData
// all go through this single switch.

import { http } from "./http";
import {
  mockLogin,
  mockLogout,
  mockRegister,
  mockActivate,
  mockForgetPassword,
  mockResetPassword,
  mockUpdateUser,
  mockResendActivation,
  mockDeleteAccount,
  mockGetUserData,
} from "../mocks/authMocks";
import { USE_MOCK, warnOnce } from "./useMockFlag";

warnOnce();

type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  username: string;
  email?: string;
  password: string;
};

type UpdateUserPayload = {
  name?: string;
  username?: string;
  email?: string;
};

export const authApi = {
  // POST /api/auths/login
  login(data: LoginPayload) {
    if (USE_MOCK) return mockLogin(data);
    return http.post("/api/auths/login", data);
  },

  // POST /api/auths/logout
  logout() {
    if (USE_MOCK) return mockLogout();
    return http.post("/api/auths/logout", {});
  },

  // POST /api/users/register
  register(data: RegisterPayload) {
    if (USE_MOCK) return mockRegister(data);
    return http.post("/api/users/register", data);
  },

  // GET /api/users/activate?token=...
  activate(token: string) {
    if (USE_MOCK) return mockActivate(token);
    return http.get("/api/users/activate", { params: { token } });
  },

  // POST /api/auths/forget-password
  forgetPassword(email: string) {
    if (USE_MOCK) return mockForgetPassword(email);
    return http.post("/api/auths/forget-password", { email });
  },

  // PUT /api/auths/reset-password
  resetPassword(token: string, password: string) {
    if (USE_MOCK) return mockResetPassword(token, password);
    return http.put("/api/auths/reset-password", { token, password });
  },

  // PUT /api/users/update-user
  updateUser(data: UpdateUserPayload) {
    if (USE_MOCK) return mockUpdateUser(data);
    return http.put("/api/users/update-user", data);
  },

  // POST /api/users/resend-activation-email
  resendActivation(email: string) {
    if (USE_MOCK) return mockResendActivation(email);
    return http.post("/api/users/resend-activation-email", { email });
  },

  // DELETE /api/users/delete-account
  deleteAccount() {
    if (USE_MOCK) return mockDeleteAccount();
    return http.delete("/api/users/delete-account");
  },

  // GET /api/users/user — current authenticated user
  getUserData() {
    if (USE_MOCK) return mockGetUserData();
    return http.get("/api/users/user");
  },
};