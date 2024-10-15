import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { QuizType } from "../../types/QuizType";
import { t } from "i18next";
import { backendUrl } from "../baseURl";

export interface QuizState {
  quizzes: QuizType[];
  currentQuiz: QuizType | null;
  isLoading: boolean;
  error: string | Error | null;
  totalQuizzes: number;
  totalPages: number;
  currentPage: number;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
  totalQuizzes: 0,
  totalPages: 0,
  currentPage: 1,
};

// Fetch public quizzes
export const fetchQuizzes = createAsyncThunk<
  {
    quizzes: QuizType[];
    totalQuizzes: number;
    totalPages: number;
    currentPage: number;
  },
  { page: number; limit: number },
  { rejectValue: string }
>("quiz/fetchQuizzes", async ({ page, limit }, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/quizzes/public`, {
      params: { page, limit },
    });

    console.log("Full API Response:", response.data);

    const { data } = response.data;

    if (Array.isArray(data.quizzes)) {
      return {
        quizzes: data.quizzes,
        totalQuizzes: data.totalQuizzes,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    } else {
      console.warn(
        "Expected `data.quizzes` to be an array but received:",
        data
      );
      return { quizzes: [], totalQuizzes: 0, totalPages: 0, currentPage: 1 };
    }
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return rejectWithValue(t("ReduxMessage.Quiz.fetchQuizzes"));
  }
});

// Fetch user quizzes
export const fetchUserQuizzes = createAsyncThunk<
  QuizType[],
  void,
  { rejectValue: string }
>("quiz/fetchUserQuizzes", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/quizzes/userQuiz`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Quiz.fetchUserQuizzes"));
  }
});

// Fetch quiz by ID
export const fetchQuizById = createAsyncThunk<
  QuizType,
  string,
  { rejectValue: string }
>("quiz/fetchQuizById", async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backendUrl}/api/quizzes/${quizId}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Quiz.fetchQuizById"));
  }
});

// Create a quiz
export const createQuiz = createAsyncThunk<
  QuizType,
  Partial<QuizType>,
  { rejectValue: string }
>("quiz/createQuiz", async (quizData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/quizzes/create`,
      quizData
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Quiz.createQuiz"));
  }
});

// Delete a quiz
export const deleteQuiz = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("quiz/deleteQuiz", async (quizId, { rejectWithValue }) => {
  try {
    await axios.delete(`${backendUrl}/api/quizzes/${quizId}`);
    return quizId;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Quiz.deleteQuiz"));
  }
});

// Update a quiz
export const updateQuiz = createAsyncThunk<
  QuizType,
  { quizId: string; updatedData: Partial<QuizType> },
  { rejectValue: string }
>("quiz/updateQuiz", async ({ quizId, updatedData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `${backendUrl}/api/quizzes/${quizId}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error in updateQuiz:", error);
    return rejectWithValue(t("ReduxMessage.Quiz.updateQuiz"));
  }
});

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch public quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchQuizzes.fulfilled,
        (
          state,
          action: PayloadAction<{
            quizzes: QuizType[];
            totalQuizzes: number;
            totalPages: number;
            currentPage: number;
          }>
        ) => {
          state.isLoading = false;
          state.quizzes = action.payload.quizzes;
          state.totalQuizzes = action.payload.totalQuizzes;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
        }
      )
      .addCase(
        fetchQuizzes.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.Quiz.fetchQuizzes");
        }
      )
      // Fetch user quizzes
      .addCase(fetchUserQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserQuizzes.fulfilled,
        (state, action: PayloadAction<QuizType[]>) => {
          state.isLoading = false;
          state.quizzes = action.payload;
        }
      )
      .addCase(
        fetchUserQuizzes.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error =
            action.payload || t("ReduxMessage.Quiz.fetchUserQuizzes");
        }
      )
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchQuizById.fulfilled,
        (state, action: PayloadAction<QuizType>) => {
          state.isLoading = false;
          state.currentQuiz = action.payload;
        }
      )
      .addCase(
        fetchQuizById.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.Quiz.fetchQuizById");
        }
      )
      // Create a quiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createQuiz.fulfilled,
        (state, action: PayloadAction<QuizType>) => {
          state.isLoading = false;
          state.quizzes.push(action.payload);
        }
      )
      .addCase(
        createQuiz.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.Quiz.createQuiz");
        }
      )
      // Delete a quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.quizzes = state.quizzes.filter(
          (quiz) => quiz._id !== action.payload
        );
      })
      .addCase(
        deleteQuiz.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.Quiz.deleteQuiz");
        }
      )
      // Update a quiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateQuiz.fulfilled,
        (state, action: PayloadAction<QuizType>) => {
          state.isLoading = false;
          if (action.payload) {
            state.currentQuiz = action.payload;
            state.quizzes = state.quizzes.map((quiz) =>
              quiz._id === action.payload._id ? action.payload : quiz
            );
          } else {
            console.error(
              "Update quiz fulfilled action received undefined payload"
            );
          }
        }
      )
      .addCase(
        updateQuiz.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || t("ReduxMessage.Quiz.updateQuiz");
        }
      );
  },
});

export default quizSlice.reducer;
