// src/reducer/action/quizProgressSlice.ts
//
// All state related to an in-progress quiz: the quiz's id, when it started,
// how long it has, the user's answers, which question they're on, and a
// guard flag (`isSubmitting`) that prevents duplicate submissions from
// any caller — whether the user clicks the Submit button twice, or the
// global timer fires while a manual submit is already in flight.
//
// Reducers are pure. All localStorage persistence lives in
// `src/reducer/middleware/quizProgressPersistence.ts`, which listens for
// the actions defined here and writes after each reducer has run.
//
// Design notes:
//   - `remainingTime` is DERIVED, not stored. Use the `selectRemainingTime`
//     selector to read it.
//   - `answers` and `currentQuestion` live here (not in QuizQuestions.tsx
//     component state) so the global auto-submit timer always has access
//     to the user's latest answers.
//   - `isSubmitting` is deliberately NOT persisted to localStorage. A flag
//     saying "we were mid-submit when the page closed" would be a lie on
//     reopen — we'd have no way to know if the POST succeeded. Keeping it
//     session-local means a page reload resets the guard and the user can
//     retry if needed.

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserScores, submitQuiz } from "./scoresSlice";
import type { AppDispatch, RootState } from "../store/store";
import { hydrateQuizProgressFromStorage } from "../middleware/quizProgressStorage";

interface QuizProgressState {
  isQuizInProgress: boolean;
  currentQuizId: string | null;
  startTime: number | null;
  initialTime: number;
  answers: number[];
  currentQuestion: number;
  /**
   * True while a submission is in flight. Set before the network call in
   * `submitAndEndQuiz` and cleared on success (via `endQuiz`) or on
   * failure (via `clearSubmitting`). Guards against:
   *   - User double-clicking the Submit button
   *   - GlobalTimer auto-submitting while a manual submit is already in flight
   *   - Multiple code paths racing to submit simultaneously
   */
  isSubmitting: boolean;
}

const initialState: QuizProgressState = hydrateQuizProgressFromStorage();

const quizProgressSlice = createSlice({
  name: "quizProgress",
  initialState,
  reducers: {
    startQuiz(
      state,
      action: PayloadAction<{
        quizId: string;
        totalTime: number;
        questionCount: number;
      }>
    ) {
      const { quizId, totalTime, questionCount } = action.payload;
      if (totalTime <= 0) return;

      state.isQuizInProgress = true;
      state.currentQuizId = quizId;
      state.initialTime = totalTime;
      state.startTime = Date.now();
      state.answers = new Array(questionCount).fill(-1);
      state.currentQuestion = 0;
      state.isSubmitting = false;
    },

    setAnswer(
      state,
      action: PayloadAction<{ questionIndex: number; optionIndex: number }>
    ) {
      const { questionIndex, optionIndex } = action.payload;
      if (questionIndex < 0 || questionIndex >= state.answers.length) return;
      state.answers[questionIndex] = optionIndex;
    },

    setCurrentQuestion(state, action: PayloadAction<number>) {
      state.currentQuestion = action.payload;
    },

    markSubmitting(state) {
      state.isSubmitting = true;
    },

    clearSubmitting(state) {
      state.isSubmitting = false;
    },

    endQuiz(state) {
      state.isQuizInProgress = false;
      state.currentQuizId = null;
      state.startTime = null;
      state.initialTime = 0;
      state.answers = [];
      state.currentQuestion = 0;
      state.isSubmitting = false;
    },

    resetQuizState(state) {
      state.isQuizInProgress = false;
      state.currentQuizId = null;
      state.startTime = null;
      state.initialTime = 0;
      state.answers = [];
      state.currentQuestion = 0;
      state.isSubmitting = false;
    },
  },
});

export const {
  startQuiz,
  setAnswer,
  setCurrentQuestion,
  markSubmitting,
  clearSubmitting,
  endQuiz,
  resetQuizState,
} = quizProgressSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────

/**
 * Single source of truth for how much time is left. Computed from
 * `startTime + initialTime` so every reader sees the same value and no
 * interval can drift.
 */
export function selectRemainingTime(state: RootState): number {
  const { startTime, initialTime, isQuizInProgress } = state.quizProgress;
  if (!isQuizInProgress || startTime == null || initialTime <= 0) return 0;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, initialTime - elapsed);
}

// ─── Thunks ───────────────────────────────────────────────────────────────

/**
 * Submit the current quiz's answers and tear down the progress state.
 * Reads `currentQuizId` and `answers` from state so the caller doesn't
 * have to pass them — this lets both the quiz page and the global timer
 * call this thunk in the same way.
 *
 * Guards against duplicate submissions via the `isSubmitting` flag:
 *   1. Check-and-exit: if we're already submitting, return immediately.
 *      This is safe despite looking like a TOCTOU pattern because
 *      JavaScript is single-threaded and no `await` runs between the
 *      check and the subsequent `markSubmitting` dispatch.
 *   2. Set-before-call: we set the flag BEFORE the network call, so a
 *      rapid second dispatch sees the flag already set and exits.
 *   3. Clear-on-failure: if the network call fails, we clear the flag
 *      so the user can retry. On success, `endQuiz()` implicitly clears
 *      it as part of tearing down state.
 */
export const submitAndEndQuiz =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { currentQuizId, answers, isSubmitting } = getState().quizProgress;
    if (!currentQuizId) return;
    if (isSubmitting) return;
    dispatch(markSubmitting());
    try {
      await dispatch(submitQuiz({ quizId: currentQuizId, answers })).unwrap();
      dispatch(endQuiz());
      await dispatch(fetchUserScores());
    } catch {
      // Network/backend failure — clear the guard so the user can retry.
      // Error itself is already surfaced via scoresSlice.errorSubmit by
      // the submitQuiz thunk's rejected handler; the component that
      // initiated the submit is responsible for displaying it.
      dispatch(clearSubmitting());
    }
  };

export default quizProgressSlice.reducer;