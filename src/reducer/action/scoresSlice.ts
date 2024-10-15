import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { ScoreType } from "../../types/ScoreType";
import { t } from "i18next";
import { backendUrl } from "../baseURl";

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
};

// Async thunk to fetch user scores
export const fetchUserScores = createAsyncThunk<
  ScoreType[],
  void,
  { rejectValue: string }
>("scores/fetchUserScores", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/scores`);
    return response.data.scores;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || t("ReduxMessage.Score.fetchUserScores")
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
    const response = await axios.get(`${backendUrl}/api/scores/${scoreId}`);
    return response.data.score;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || t("ReduxMessage.Score.fetchSingleScore")
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
    const response = await axios.get(`${backendUrl}/api/scores/examiner`);
    if (response.status === 200 && response.data.scores) {
      return response.data.scores;
    } else {
      return rejectWithValue(t("ReduxMessage.Score.noScoresAvailable"));
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      t("ReduxMessage.Score.fetchExaminerScores");
    return rejectWithValue(errorMessage);
  }
});

// Async thunk to submit a quiz
export const submitQuiz = createAsyncThunk<
  ScoreType,
  { quizId: string; answers: number[] },
  { rejectValue: string }
>("scores/submitQuiz", async ({ quizId, answers }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${backendUrl}/api/scores/submit`, {
      quizId,
      answers,
    });
    return response.data.score;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || t("ReduxMessage.Score.submitQuiz")
    );
  }
});

// Async thunk to delete a score by quizId
export const deleteScore = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("scores/deleteScore", async (scoreId, { rejectWithValue }) => {
  console.log("Inside deleteScore thunk, scoreId:", scoreId); // Debugging

  try {
    await axios.delete(`${backendUrl}/api/scores/delete-score`, {
      data: { scoreId },
    });
    return scoreId;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || t("ReduxMessage.Score.deleteScore")
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
      .addCase(submitQuiz.pending, () => {})
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
          state.errorUser =
            action.payload || t("ReduxMessage.Score.submitQuiz");
        }
      )
      // Handle deleteScore
      .addCase(deleteScore.pending, () => {})
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
          state.errorUser =
            action.payload || t("ReduxMessage.Score.deleteScore");
        }
      );
  },
});

export const { clearUserScores, clearExaminerScores } = scoresSlice.actions;
export default scoresSlice.reducer;
