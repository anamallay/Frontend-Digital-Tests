// src/api/authApi.ts
//
// Redux thunks call authApi.login(...) / authApi.logout() and never need to
// know whether the response came from the real backend or from the local mock.
// The switch lives in `useMockFlag.ts` — when USE_MOCK is true the mock
// functions are called, otherwise axios hits the real backend.

import axios from "axios";
import { backendUrl } from "../reducer/baseUrl";
import { mockLogin, mockLogout } from "./authMocks";
import { USE_MOCK, warnOnce } from "../api/useMockFlag";

warnOnce();

type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

export const authApi = {
  login(data: LoginPayload) {
    if (USE_MOCK) return mockLogin(data);
    return axios.post(`${backendUrl}/api/auths/login`, data, {
      withCredentials: true,
    });
  },

  logout() {
    if (USE_MOCK) return mockLogout();
    return axios.post(
      `${backendUrl}/api/auths/logout`,
      {},
      { withCredentials: true }
    );
  },
};