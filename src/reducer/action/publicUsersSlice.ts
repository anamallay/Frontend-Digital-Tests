import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { t } from "i18next";
import { PublicUserType } from "../../types/UserType";
import { QuizType } from "../../types/QuizType";
import { usersApi } from "@/api/usersApi";
import { readError } from "@/lib/readError";

export interface PublicUsersState {
  users: PublicUserType[];
  isLoadingList: boolean;
  errorList: string | null;

  currentUser: PublicUserType | null;
  publicQuizzes: QuizType[];
  isLoadingProfile: boolean;
  errorProfile: string | null;
}

const initialState: PublicUsersState = {
  users: [],
  isLoadingList: false,
  errorList: null,

  currentUser: null,
  publicQuizzes: [],
  isLoadingProfile: false,
  errorProfile: null,
};

export const fetchPublicUsers = createAsyncThunk<
  PublicUserType[],
  void,
  { rejectValue: string }
>("publicUsers/fetchPublicUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await usersApi.fetchPublic();
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.PublicUsers.fetchUsers"))
    );
  }
});

export const fetchPublicUserById = createAsyncThunk<
  { user: PublicUserType; publicQuizzes: QuizType[] },
  string,
  { rejectValue: string }
>("publicUsers/fetchPublicUserById", async (userId, { rejectWithValue }) => {
  try {
    const response = await usersApi.fetchPublicById(userId);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.PublicUsers.fetchUserProfile"))
    );
  }
});

const publicUsersSlice = createSlice({
  name: "publicUsers",
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.publicQuizzes = [];
      state.isLoadingProfile = false;
      state.errorProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicUsers.pending, (state) => {
        state.isLoadingList = true;
        state.errorList = null;
      })
      .addCase(
        fetchPublicUsers.fulfilled,
        (state, action: PayloadAction<PublicUserType[]>) => {
          state.isLoadingList = false;
          state.users = action.payload;
        }
      )
      .addCase(
        fetchPublicUsers.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingList = false;
          state.errorList =
            action.payload || t("ReduxMessage.PublicUsers.fetchUsers");
        }
      )
      .addCase(fetchPublicUserById.pending, (state) => {
        state.isLoadingProfile = true;
        state.errorProfile = null;
      })
      .addCase(
        fetchPublicUserById.fulfilled,
        (
          state,
          action: PayloadAction<{
            user: PublicUserType;
            publicQuizzes: QuizType[];
          }>
        ) => {
          state.isLoadingProfile = false;
          state.currentUser = action.payload.user;
          state.publicQuizzes = action.payload.publicQuizzes;
        }
      )
      .addCase(
        fetchPublicUserById.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingProfile = false;
          state.errorProfile =
            action.payload || t("ReduxMessage.PublicUsers.fetchUserProfile");
        }
      );
  },
});

export const { clearCurrentUser } = publicUsersSlice.actions;
export default publicUsersSlice.reducer;