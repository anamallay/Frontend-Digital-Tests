import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { QuizType } from "../../types/QuizType";
import { t } from "i18next";
import { backendUrl } from "../baseURl";

interface LibraryState {
  library: QuizType[];
  isLoading: boolean;
  error: string | Error | null;
}

const initialLibraryState: LibraryState = {
  library: [],
  isLoading: false,
  error: null,
};

// Async action to fetch user library
export const fetchUserLibrary = createAsyncThunk<
  QuizType[],
  void,
  { rejectValue: string }
>("library/fetchUserLibrary", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/quizzes/library`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Library.fetchUserLibrary"));
  }
});

// Async action to add a public quiz to the library
export const addPublicQuizToLibrary = createAsyncThunk<
  QuizType[],
  string,
  { rejectValue: string }
>("library/addPublicQuizToLibrary", async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/quizzes/library/add-public-quiz`,
      { quizId }
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Library.addPublicQuizToLibrary"));
  }
});

// Async action to add a quiz to the library using a token
export const addQuizToLibraryUsingToken = createAsyncThunk<
  QuizType[],
  string,
  { rejectValue: string }
>("library/addQuizToLibraryUsingToken", async (token, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/quizzes/add-to-library`,
      { token }
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(
      t("ReduxMessage.Library.addQuizToLibraryUsingToken")
    );
  }
});

// Async action to remove a quiz from the library
export const removeQuizFromLibrary = createAsyncThunk<
  QuizType[],
  string,
  { rejectValue: string }
>("library/removeQuizFromLibrary", async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(
      `${backendUrl}/api/quizzes/library/${quizId}`
    );
    return response.data.library;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Library.removeQuizFromLibrary"));
  }
});

// Async action to share a quiz with a candidate
export const shareQuizWithCandidate = createAsyncThunk<
  { quizLink: string },
  { quizId: string },
  { rejectValue: string }
>("library/shareQuizWithCandidate", async ({ quizId }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${backendUrl}/api/quizzes/share-quiz`, {
      quizId,
    });
    return { quizLink: response.data.data.quizLink };
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Library.shareQuizWithCandidate"));
  }
});

const librarySlice = createSlice({
  name: "library",
  initialState: initialLibraryState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserLibrary.fulfilled,
        (state, action: PayloadAction<QuizType[]>) => {
          state.isLoading = false;
          state.library = action.payload;
        }
      )
      .addCase(
        fetchUserLibrary.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.Library.fetchUserLibrary");
        }
      )
      .addCase(addPublicQuizToLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addPublicQuizToLibrary.fulfilled,
        (state, action: PayloadAction<QuizType[]>) => {
          state.isLoading = false;
          state.library = action.payload;
        }
      )
      .addCase(
        addPublicQuizToLibrary.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.Library.addPublicQuizToLibrary");
        }
      )
      .addCase(removeQuizFromLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        removeQuizFromLibrary.fulfilled,
        (state, action: PayloadAction<QuizType[]>) => {
          state.isLoading = false;
          state.library = action.payload;
        }
      )
      .addCase(
        removeQuizFromLibrary.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.Library.removeQuizFromLibrary");
        }
      )
      .addCase(addQuizToLibraryUsingToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addQuizToLibraryUsingToken.fulfilled,
        (state, action: PayloadAction<QuizType[]>) => {
          state.isLoading = false;
          state.library = action.payload;
        }
      )
      .addCase(
        addQuizToLibraryUsingToken.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload ||
            t("ReduxMessage.Library.addQuizToLibraryUsingToken");
        }
      )
      .addCase(shareQuizWithCandidate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        shareQuizWithCandidate.fulfilled,
        (state, action: PayloadAction<{ quizLink: string }>) => {
          state.isLoading = false;
          console.log("Quiz link shared:", action.payload.quizLink);
        }
      )
      .addCase(
        shareQuizWithCandidate.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.Library.shareQuizWithCandidate");
        }
      );
  },
});

export default librarySlice.reducer;
