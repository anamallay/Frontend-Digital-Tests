import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserType, LoginResponse } from "../../types/UserType";
import { t } from "i18next";
import { authApi } from "@/api/authApi";
import { ACCESS_TOKEN_KEY } from "@/api/http";
import { readError } from "@/lib/readError";

// ─── localStorage contract ────────────────────────────────────────────────
//
// localStorage stores two things related to auth:
//   - `access_token` — the JWT, sent as `Authorization: Bearer <token>` by
//     the axios interceptor in api/http.ts. This is the cross-domain
//     workaround for the SameSite=None cookie not surviving between PSL
//     siblings (different *.vercel.app subdomains).
//   - `auth:isLoggedIn` — a single-bit hint so the boot effect knows
//     whether to attempt `getUserData()`. Kept for backwards compat with
//     existing sessions; could be derived from token presence in future.
//
// No user data is persisted. The actual `UserType` only lives in Redux
// memory and is refetched from the server via `getUserData()` on mount.
// If an attacker tampers with the flag, the worst that happens is a
// pointless `getUserData()` request that 401s and logs them out. Token
// theft via XSS is the real exposure here — mitigated by CSP and input
// sanitization, not by storage choice.

const AUTH_STORAGE_KEY = "auth:isLoggedIn";

function writeToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    /* private browsing / quota exceeded — Authorization header just
       won't be sent; cookie auth still works for same-site setups. */
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* nothing to do — storage was unavailable to begin with */
  }
}

function readLoginFlag(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeLoginFlag(isLoggedIn: boolean): void {
  try {
    if (isLoggedIn) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    /* private browsing / quota exceeded — the app still works, just
       without the boot-time refetch hint on next load. */
  }
}

// Migrate from the old `user` key if present. Previous versions of the
// app stored the whole user object here; we now store only the flag.
// Read the old key ONCE at module load, seed the new flag from it, then
// delete it so we don't leave PII sitting in storage.
(function migrateLegacyUserKey(): void {
  try {
    const legacy = localStorage.getItem("user");
    if (legacy == null) return;
    try {
      const parsed = JSON.parse(legacy);
      if (parsed?.isLoggedIn) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
      }
    } catch {
      /* malformed legacy payload — just drop it */
    }
    localStorage.removeItem("user");
  } catch {
    /* storage unavailable — nothing to migrate */
  }
})();

const bootLoginFlag = readLoginFlag();

export interface UserState {
  isLoading: boolean;
  error: string | Error | null;
  isLoggedIn: boolean;
  userData: UserType | null;
  /**
   * True while the app is refetching the user on boot. ProtectedRoute
   * waits on this flag so a logged-in user who refreshes doesn't get
   * bounced to /login in the brief window before userData arrives.
   */
  isHydrating: boolean;
}

const initialState: UserState = {
  isLoading: false,
  error: null,
  // Trust the localStorage hint for the initial boolean; the boot effect
  // in App.tsx will verify by fetching userData.
  isLoggedIn: bootLoginFlag,
  userData: null,
  // Only hydrate if the hint says we're logged in. Anonymous users skip
  // the boot fetch entirely.
  isHydrating: bootLoginFlag,
};

/**
 * Helper — normalize an auth response into a clean UserType.
 * The wire format is `{ message, data: <user> }` from login/register/etc.
 * This strips the wrapper so Redux only ever holds the user itself.
 */
function unwrapUser(payload: unknown): UserType {
  const p = payload as Partial<LoginResponse> & Partial<UserType>;
  if (p && typeof p === "object" && "data" in p && p.data) {
    return (p as LoginResponse).data;
  }
  return p as UserType;
}

// ─── Thunks ───────────────────────────────────────────────────────────────
//
// Every thunk here goes through `authApi`, which routes through `USE_MOCK`.
// No thunk calls `axios` directly, no thunk hardcodes a backend URL, and no
// thunk calls `toast()` — user-facing notifications are the component's
// responsibility.

// Login — accepts either an email or a username identifier.
export const loginUser = createAsyncThunk<
  UserType,
  { email?: string; username?: string; password: string },
  { rejectValue: string }
>("user/loginUser", async (loginData, { rejectWithValue }) => {
  try {
    const response = await authApi.login(loginData);
    const body = response.data as Partial<LoginResponse>;
    if (body?.token) writeToken(body.token);
    const user = unwrapUser(response.data);
    writeLoginFlag(true);
    return user;
  } catch (error: unknown) {
    return rejectWithValue(readError(error, t("ReduxMessage.User.loginFailed")));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      writeLoginFlag(false);
      clearToken();
    } catch (error: unknown) {
      return rejectWithValue(
        readError(error, t("ReduxMessage.User.logoutFailed"))
      );
    }
  }
);

export const forgetPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("user/forgetPassword", async ({ email }, { rejectWithValue }) => {
  try {
    await authApi.forgetPassword(email);
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.User.forgetPasswordFailed"))
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: string }
>("user/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    await authApi.resetPassword(token, password);
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.User.resetPasswordFailed"))
    );
  }
});

export const registerUser = createAsyncThunk<
  UserType,
  {
    name: string;
    username: string;
    email?: string;
    password: string;
  },
  {
    rejectValue: {
      message: string;
      errors?: { field: string; message: string }[];
    };
  }
>("user/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(userData);
    return unwrapUser(response.data);
  } catch (error: unknown) {
    const message = readError(
      error,
      t("ReduxMessage.User.registerFailed")
    );
    const data = (error as {
      response?: {
        data?: { errors?: { field: string; message: string }[] };
      };
    })?.response?.data;
    const errors = Array.isArray(data?.errors) ? data.errors : undefined;
    return rejectWithValue({ message, errors });
  }
});

export const activateAccount = createAsyncThunk<
  UserType,
  { token: string },
  { rejectValue: { message: string; status?: number } }
>("user/activateAccount", async ({ token }, { rejectWithValue }) => {
  try {
    const response = await authApi.activate(token);
    return unwrapUser(response.data);
  } catch (error: unknown) {
    const message = readError(
      error,
      t("ReduxMessage.User.activateAccountFailed")
    );
    const status = (error as { response?: { status?: number } } | undefined)
      ?.response?.status;
    return rejectWithValue({ message, status });
  }
});

export const updateUser = createAsyncThunk<
  UserType,
  { name?: string; username?: string; email?: string },
  { rejectValue: string }
>("user/updateUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await authApi.updateUser(userData);
    return unwrapUser(response.data);
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.User.updateUserFailed"))
    );
  }
});

export const resendActivationEmail = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>(
  "user/resendActivationEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      await authApi.resendActivation(email);
    } catch (error: unknown) {
      return rejectWithValue(
        readError(error, t("ReduxMessage.User.resendActivationEmailFailed"))
      );
    }
  }
);

export const deleteAccount = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("user/deleteAccount", async (_, { rejectWithValue }) => {
  try {
    await authApi.deleteAccount();
    writeLoginFlag(false);
    clearToken();
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.User.deleteAccountFailed"))
    );
  }
});

export const getUserData = createAsyncThunk<
  UserType,
  void,
  { rejectValue: string }
>("user/getUserData", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getUserData();
    return unwrapUser(response.data);
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.User.getUserDataFailed"))
    );
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Clear all auth state. Used by the boot effect when `getUserData()`
     * fails on mount (session expired) and anywhere else the app needs to
     * force-logout the client without making a network call.
     */
    clearAuth(state) {
      state.isLoggedIn = false;
      state.userData = null;
      state.isHydrating = false;
      writeLoginFlag(false);
      clearToken();
    },
    /**
     * Mark the boot-time hydration as complete. Called from the boot
     * effect once `getUserData()` resolves, so ProtectedRoute can make
     * its decision.
     */
    setHydrated(state) {
      state.isHydrating = false;
    },
    /**
     * Clear `state.error`. Screens that read it (Login, etc.) call this on
     * mount so a stale error from a previous flow (activation, registration,
     * password reset) doesn't render on a fresh screen.
     */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.userData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        registerUser.rejected,
        (
          state,
          action: PayloadAction<
            | {
                message: string;
                errors?: { field: string; message: string }[];
              }
            | undefined
          >
        ) => {
          state.isLoading = false;
          state.error =
            action.payload?.message ||
            t("ReduxMessage.User.registerFailed");
        }
      )
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.isLoggedIn = true;
          state.userData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        loginUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.User.loginFailed");
        }
      )
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.userData = null;
      })
      .addCase(
        logoutUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.User.logoutFailed");
        }
      )
      // Forget password
      .addCase(forgetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        forgetPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.forgetPasswordFailed");
        }
      )
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        resetPassword.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.resetPasswordFailed");
        }
      )
      // Activate account
      .addCase(activateAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        activateAccount.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.error = null;
          state.userData = action.payload;
        }
      )
      .addCase(
        activateAccount.rejected,
        (
          state,
          action: PayloadAction<
            { message: string; status?: number } | undefined
          >
        ) => {
          state.isLoading = false;
          // 409 = "already active" is a benign re-click, not a user-facing
          // error. Skip writing to state.error so it doesn't leak into other
          // screens (Login reads state.error on mount).
          if (action.payload?.status === 409) {
            state.error = null;
            return;
          }
          state.error =
            action.payload?.message ||
            t("ReduxMessage.User.activateAccountFailed");
        }
      )
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.userData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        updateUser.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.updateUserFailed");
        }
      )
      // Resend activation email
      .addCase(resendActivationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendActivationEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(
        resendActivationEmail.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload ||
            t("ReduxMessage.User.resendActivationEmailFailed");
        }
      )
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.userData = null;
        state.error = null;
      })
      .addCase(
        deleteAccount.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.deleteAccountFailed");
        }
      )
      // Get user data
      .addCase(getUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUserData.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.userData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        getUserData.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.getUserDataFailed");
        }
      );
  },
});

export const { clearAuth, setHydrated, clearError } = userSlice.actions;
export default userSlice.reducer;