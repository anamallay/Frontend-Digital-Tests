import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { QuestionType } from "../../types/QuestionType";
import { t } from "i18next";
import { backendUrl } from "../baseURl";

export interface QuestionState {
  currentQuizId: any;
  questions: QuestionType[];
  isLoading: boolean;
  error: string | Error | null;
}

const initialState: QuestionState = {
  questions: [],
  isLoading: false,
  error: null,
  currentQuizId: undefined,
};

// Fetch all questions for a specific quiz by quizId
export const fetchQuestionsByQuizId = createAsyncThunk<
  QuestionType[],
  string,
  { rejectValue: string }
>("question/fetchQuestionsByQuizId", async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/questions/quiz/${quizId}`
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Question.fetchQuestionsByQuizId"));
  }
});
// Fetch a specific question by its ID
export const fetchQuestionById = createAsyncThunk<
  QuestionType,
  string,
  { rejectValue: string }
>("question/fetchQuestionById", async (questionId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/questions/question/${questionId}`
    );
    console.log("Question fetched: ", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching question: ", error);
    return rejectWithValue(t("ReduxMessage.Question.fetchQuestionById"));
  }
});
// Add a question to a quiz
export const addQuestion = createAsyncThunk<
  QuestionType,
  Partial<QuestionType>,
  { rejectValue: string }
>("question/addQuestion", async (questionData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/questions/add`,
      questionData
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Question.addQuestion"));
  }
});
// Delete a question by quizId and questionId
export const deleteQuestion = createAsyncThunk<
  string,
  { quizId: string; questionId: string },
  { rejectValue: string }
>(
  "question/deleteQuestion",
  async ({ quizId, questionId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/questions/${quizId}/${questionId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(t("ReduxMessage.Question.deleteQuestion"));
    }
  }
);

// Async thunk for updating a question
export const updateQuestionInQuiz = createAsyncThunk<
  QuestionType,
  { questionId: string; questionData: Partial<QuestionType> },
  { rejectValue: string }
>(
  "question/updateQuestionInQuiz",
  async ({ questionId, questionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/questions/${questionId}`,
        questionData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(t("ReduxMessage.Question.updateQuestionInQuiz"));
    }
  }
);
// fetch quiz from library
export const fetchQuizFromLibrary = createAsyncThunk<
  QuestionType[],
  string,
  { rejectValue: string }
>("quiz/fetchQuizFromLibrary", async (quizId, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/quizzes/library/${quizId}`
    );
    return response.data.quiz.questions;
  } catch (error) {
    return rejectWithValue(t("ReduxMessage.Question.fetchQuizFromLibrary"));
  }
});

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all questions for a specific quiz by quizId
      .addCase(fetchQuestionsByQuizId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchQuestionsByQuizId.fulfilled,
        (state, action: PayloadAction<QuestionType[]>) => {
          state.isLoading = false;
          state.questions = Array.isArray(action.payload) ? action.payload : [];
        }
      )
      .addCase(fetchQuestionsByQuizId.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || t("ReduxMessage.Question.fetchQuestionsByQuizId");
      })
      // Fetch a specific question by its ID
      .addCase(fetchQuestionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchQuestionById.fulfilled,
        (state, action: PayloadAction<QuestionType>) => {
          state.isLoading = false;
          const existingQuestionIndex = state.questions.findIndex(
            (q) => q._id === action.payload._id
          );
          if (existingQuestionIndex !== -1) {
            state.questions[existingQuestionIndex] = action.payload;
          } else {
            state.questions.push(action.payload);
          }
        }
      )
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || t("ReduxMessage.Question.fetchQuestionById");
      })
      // Add a question to a quiz
      .addCase(addQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addQuestion.fulfilled,
        (state, action: PayloadAction<QuestionType>) => {
          state.isLoading = false;
          if (Array.isArray(state.questions)) {
            state.questions.push(action.payload);
          } else {
            state.questions = [action.payload];
          }
        }
      )
      .addCase(addQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || t("ReduxMessage.Question.addQuestion");
      })
      // Delete a question by quizId and questionId
      .addCase(deleteQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteQuestion.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.questions = state.questions.filter(
            (question) => question._id !== action.payload
          );
        }
      )
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || t("ReduxMessage.Question.deleteQuestion");
      })
      // Async thunk for updating a question
      .addCase(updateQuestionInQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateQuestionInQuiz.fulfilled,
        (state, action: PayloadAction<QuestionType>) => {
          state.isLoading = false;
          const index = state.questions.findIndex(
            (q) => q._id === action.payload._id
          );
          if (index !== -1) {
            state.questions[index] = action.payload;
          }
        }
      )
      .addCase(updateQuestionInQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || t("ReduxMessage.Question.updateQuestionInQuiz");
      })
      // fetch quiz from library
      .addCase(fetchQuizFromLibrary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchQuizFromLibrary.fulfilled,
        (state, action: PayloadAction<QuestionType[]>) => {
          state.isLoading = false;
          state.questions = action.payload;
        }
      )
      .addCase(fetchQuizFromLibrary.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || t("ReduxMessage.Question.fetchQuizFromLibrary");
      });
  },
});

export default questionSlice.reducer;
