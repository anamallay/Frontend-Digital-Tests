import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { UserType } from "../../types/UserType";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { t } from "i18next";
import { backendUrl } from "../baseURl";

axios.defaults.withCredentials = true;
const loginData = localStorage.getItem("user");

export interface UserState {
  users: UserType[];
  isLoading: boolean;
  error: string | Error | null;
  isLoggedIn: boolean;
  userData: UserType | null;
}

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
  isLoggedIn: loginData ? JSON.parse(loginData).isLoggedIn : false,
  userData: loginData ? JSON.parse(loginData).userData : null,
};

// Login user
export const loginUser = createAsyncThunk<
  UserType,
  { email: string; password: string },
  { rejectValue: string }
>("user/loginUser", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/auths/login`,
      loginData,
      {
        withCredentials: true,
      }
    );

    localStorage.setItem(
      "user",
      JSON.stringify({ isLoggedIn: true, userData: response.data })
    );
    toast(response.data.message);
    return response.data;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.loginFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Login with username
export const loginWithUsername = createAsyncThunk<
  UserType,
  { username: string; password: string },
  { rejectValue: string }
>("user/loginWithUsername", async (loginData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/auths/login`,
      loginData,
      {
        withCredentials: true,
      }
    );

    localStorage.setItem(
      "user",
      JSON.stringify({ isLoggedIn: true, userData: response.data })
    );
    toast(response.data.message);

    return response.data;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.loginFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Logout User
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auths/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.removeItem("user");
      toast(response.data.message);
    } catch (error) {
      let errorMessage = t("ReduxMessage.User.logoutFailed");
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data;
      }
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Forget Password
export const forgetPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("user/forgetPassword", async (emailData, { rejectWithValue }) => {
  try {
    await axios.post(`${backendUrl}/api/auths/forget-password`, emailData);
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.forgetPasswordFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Reset Password
export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: string }
>("user/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    await axios.put(`${backendUrl}/api/auths/reset-password`, {
      token,
      password,
    });
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.resetPasswordFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Register user
export const registerUser = createAsyncThunk<
  UserType,
  {
    name: string;
    username: string;
    email: string;
    password: string;
  },
  { rejectValue: string }
>("user/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/users/register`,
      userData,
      {
        withCredentials: true,
      }
    );
    return response.data as UserType;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.registerFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Activate account
export const activateAccount = createAsyncThunk<
  UserType,
  { token: string },
  { rejectValue: string }
>("user/activateAccount", async ({ token }, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/users/activate`, {
      params: { token },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.activateAccountFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Update user
export const updateUser = createAsyncThunk<
  UserType,
  { name?: string; username?: string; email?: string },
  { rejectValue: string }
>("user/updateUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/users/update-user`,
      userData,
      {
        withCredentials: true,
      }
    );
    const existingUser = localStorage.getItem("user");
    if (existingUser) {
      const updatedUser = {
        ...JSON.parse(existingUser),
        userData: response.data,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    toast(response.data.message);
    return response.data;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.updateUserFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Resend activation email
export const resendActivationEmail = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("user/resendActivationEmail", async (emailData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/users/resend-activation-email`,
      emailData,
      {
        withCredentials: true,
      }
    );
    toast(response.data.message);
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.resendActivationEmailFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Delete account
export const deleteAccount = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("user/deleteAccount", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/users/delete-account`,
      {
        withCredentials: true,
      }
    );

    localStorage.removeItem("user");
    toast(response.data.message);
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.deleteAccountFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Fetch user data action
export const getUserData = createAsyncThunk<
  UserType,
  void,
  { rejectValue: string }
>("user/getUserData", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/users/user`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    let errorMessage = t("ReduxMessage.User.getUserDataFailed");
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data.message || error.response.data;
    }
    return rejectWithValue(errorMessage);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register User
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
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.User.registerFailed");
        }
      )
      // Login User
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
      // login username user
      .addCase(loginWithUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginWithUsername.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.isLoading = false;
          state.isLoggedIn = true;
          state.userData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        loginWithUsername.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.User.loginFailed");
        }
      )
      // Logout User
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
      // Forget Password
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
      // Reset Password
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
      // Activate Account
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
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.User.activateAccountFailed");
        }
      )
      // Update User
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
      // Resend Activation Email
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
      // Delete Account
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
      // Get User Data
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

export default userSlice.reducer;
