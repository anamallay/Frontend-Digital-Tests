// src/reducer/action/quizProgressSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserScores, submitQuiz } from "./scoresSlice";
import { AppDispatch } from "../store/store";

interface QuizProgressState {
  isQuizInProgress: boolean;
  currentQuizId: string | null;
  startTime: number | null;
  initialTime: number;
}

const initialState: QuizProgressState = {
  isQuizInProgress: localStorage.getItem("isQuizInProgress") === "true",
  currentQuizId: localStorage.getItem("currentQuizId") || null,
  startTime: localStorage.getItem("startTime")
    ? Number(localStorage.getItem("startTime"))
    : null,
  initialTime: localStorage.getItem("initialTime")
    ? Number(localStorage.getItem("initialTime"))
    : 0,
};

const quizProgressSlice = createSlice({
  name: "quizProgress",
  initialState,
  reducers: {
    startQuiz(
      state,
      action: PayloadAction<{ quizId: string; totalTime: number }>
    ) {
      if (action.payload.totalTime <= 0) {
        console.error("Cannot start a quiz with zero or negative total time.");
        return;
      }
      state.isQuizInProgress = true;
      state.currentQuizId = action.payload.quizId;
      state.initialTime = action.payload.totalTime;
      state.startTime = Date.now();
      localStorage.setItem("isQuizInProgress", "true");
      localStorage.setItem("currentQuizId", state.currentQuizId);
      localStorage.setItem("initialTime", String(state.initialTime));
      localStorage.setItem("startTime", String(state.startTime));
    },
    endQuiz(state) {
      console.log("endQuiz reducer called");
      state.isQuizInProgress = false;
      state.currentQuizId = null;
      state.startTime = null;
      state.initialTime = 0;
      localStorage.setItem("isQuizInProgress", "false");
      localStorage.removeItem("currentQuizId");
      localStorage.removeItem("startTime");
      localStorage.removeItem("initialTime");
    },
    resetQuizState(state) {
      state.isQuizInProgress = false;
      state.currentQuizId = null;
      state.startTime = null;
      state.initialTime = 0;
      localStorage.removeItem("currentQuizId");
      localStorage.removeItem("startTime");
      localStorage.removeItem("initialTime");
      localStorage.setItem("isQuizInProgress", "false");
    },
  },
});

export const { startQuiz, endQuiz, resetQuizState } = quizProgressSlice.actions;

export const submitAndEndQuiz =
  (quizId: string, answers: number[]) => async (dispatch: AppDispatch) => {
    try {
      await dispatch(submitQuiz({ quizId, answers })).unwrap();
      dispatch(endQuiz());
      localStorage.removeItem("answers");
      localStorage.removeItem("currentQuestion");
      await dispatch(fetchUserScores());
    } catch (error) {
      console.error("Failed to submit and end quiz:", error);
    }
  };

export default quizProgressSlice.reducer;
