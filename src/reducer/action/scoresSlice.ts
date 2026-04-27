import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ScoreType } from "../../types/ScoreType";
import { t } from "i18next";
import { scoresApi } from "@/api/scoresApi";
import { readError } from "@/lib/readError";

export interface ScoresState {
  userScores: ScoreType[];
  examinerScores: ScoreType[];
  singleScore: ScoreType | null;

  isLoadingUser: boolean;
  isLoadingExaminer: boolean;
  isLoadingSingleScore: boolean;

  errorUser: string | null;
  errorExaminer: string | null;
  errorSingleScore: string | null;
  // Submit and delete have their own error fields so a failure in one
  // action doesn't light up a "my scores failed to load" banner elsewhere.
  errorSubmit: string | null;
  errorDelete: string | null;
}

// Initial state
const initialState: ScoresState = {
  userScores: [],
  examinerScores: [],
  singleScore: null,

  isLoadingUser: false,
  isLoadingExaminer: false,
  isLoadingSingleScore: false,

  errorUser: null,
  errorExaminer: null,
  errorSingleScore: null,
  errorSubmit: null,
  errorDelete: null,
};

// Async thunk to fetch user scores
export const fetchUserScores = createAsyncThunk<
  ScoreType[],
  void,
  { rejectValue: string }
>("scores/fetchUserScores", async (_, { rejectWithValue }) => {
  try {
    const response = await scoresApi.fetchUserScores();
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.Score.fetchUserScores"))
    );
  }
});

// Async thunk to fetch a single score by ID
export const fetchSingleScore = createAsyncThunk<
  ScoreType,
  string,
  { rejectValue: string }
>("scores/fetchSingleScore", async (scoreId, { rejectWithValue }) => {
  try {
    const response = await scoresApi.fetchSingle(scoreId);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.Score.fetchSingleScore"))
    );
  }
});

// Async thunk to fetch examiner scores
export const fetchExaminerQuizScores = createAsyncThunk<
  ScoreType[],
  void,
  { rejectValue: string }
>("scores/fetchExaminerQuizScores", async (_, { rejectWithValue }) => {
  try {
    const response = await scoresApi.fetchExaminer();
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.Score.fetchExaminerScores"))
    );
  }
});

// Async thunk to submit a quiz
export const submitQuiz = createAsyncThunk<
  ScoreType,
  { quizId: string; answers: number[] },
  { rejectValue: string }
>("scores/submitQuiz", async ({ quizId, answers }, { rejectWithValue }) => {
  try {
    const response = await scoresApi.submit(quizId, answers);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.Score.submitQuiz"))
    );
  }
});

// Async thunk to delete a score by quizId
export const deleteScore = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("scores/deleteScore", async (scoreId, { rejectWithValue }) => {
  try {
    await scoresApi.remove(scoreId);
    return scoreId;
  } catch (error: unknown) {
    return rejectWithValue(
      readError(error, t("ReduxMessage.Score.deleteScore"))
    );
  }
});

const scoresSlice = createSlice({
  name: "scores",
  initialState,
  reducers: {
    // Actions to clear scores
    clearUserScores: (state) => {
      state.userScores = [];
      state.isLoadingUser = false;
      state.errorUser = null;
    },
    clearExaminerScores: (state) => {
      state.examinerScores = [];
      state.isLoadingExaminer = false;
      state.errorExaminer = null;
    },
    clearSingleScore: (state) => {
      state.singleScore = null;
      state.isLoadingSingleScore = false;
      state.errorSingleScore = null;
    },
    clearSubmitError: (state) => {
      state.errorSubmit = null;
    },
    clearDeleteError: (state) => {
      state.errorDelete = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle user scores
      .addCase(fetchUserScores.pending, (state) => {
        state.isLoadingUser = true;
        state.errorUser = null;
      })
      .addCase(
        fetchUserScores.fulfilled,
        (state, action: PayloadAction<ScoreType[]>) => {
          state.isLoadingUser = false;
          state.userScores = action.payload;
        }
      )
      .addCase(
        fetchUserScores.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingUser = false;
          state.errorUser =
            action.payload || t("ReduxMessage.Score.fetchUserScores");
        }
      )
      // Handle fetchSingleScore
      .addCase(fetchSingleScore.pending, (state) => {
        state.isLoadingSingleScore = true;
        state.errorSingleScore = null;
      })
      .addCase(
        fetchSingleScore.fulfilled,
        (state, action: PayloadAction<ScoreType>) => {
          state.isLoadingSingleScore = false;
          state.singleScore = action.payload;
        }
      )
      .addCase(
        fetchSingleScore.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingSingleScore = false;
          state.errorSingleScore =
            action.payload || t("ReduxMessage.Score.fetchSingleScore");
        }
      )
      // Handle examiner scores
      .addCase(fetchExaminerQuizScores.pending, (state) => {
        state.isLoadingExaminer = true;
        state.errorExaminer = null;
      })
      .addCase(
        fetchExaminerQuizScores.fulfilled,
        (state, action: PayloadAction<ScoreType[]>) => {
          state.isLoadingExaminer = false;
          state.examinerScores = action.payload;
        }
      )
      .addCase(
        fetchExaminerQuizScores.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoadingExaminer = false;
          state.errorExaminer =
            action.payload || t("ReduxMessage.Score.fetchExaminerScores");
        }
      )
      // Handle submitQuiz
      .addCase(submitQuiz.pending, (state) => {
        state.errorSubmit = null;
      })
      .addCase(
        submitQuiz.fulfilled,
        (state, action: PayloadAction<ScoreType>) => {
          const index = state.userScores.findIndex(
            (score) => score.quiz._id === action.payload.quiz._id
          );

          if (index !== -1) {
            state.userScores[index] = action.payload;
          } else {
            state.userScores.push(action.payload);
          }
        }
      )
      .addCase(
        submitQuiz.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.errorSubmit =
            action.payload || t("ReduxMessage.Score.submitQuiz");
        }
      )
      // Handle deleteScore
      .addCase(deleteScore.pending, (state) => {
        state.errorDelete = null;
      })
      .addCase(
        deleteScore.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.userScores = state.userScores.filter(
            (score) => score._id !== action.payload
          );
          state.examinerScores = state.examinerScores.filter(
            (score) => score._id !== action.payload
          );
        }
      )
      .addCase(
        deleteScore.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.errorDelete =
            action.payload || t("ReduxMessage.Score.deleteScore");
        }
      );
  },
});

export const {
  clearUserScores,
  clearExaminerScores,
  clearSingleScore,
  clearSubmitError,
  clearDeleteError,
} = scoresSlice.actions;
export default scoresSlice.reducer;