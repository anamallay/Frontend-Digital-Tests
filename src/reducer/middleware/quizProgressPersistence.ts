// src/reducer/middleware/quizProgressPersistence.ts
//
// Listener middleware that persists the quiz-progress slice after any
// action that mutates it. Reducers in quizProgressSlice stay pure; all
// `localStorage.*` calls live in `quizProgressStorage.ts`. This file
// is the glue: it subscribes to the five mutating actions and forwards
// the post-reducer state to the persist function.

import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import {
  startQuiz,
  setAnswer,
  setCurrentQuestion,
  endQuiz,
  resetQuizState,
} from "../action/quizProgressSlice";
import { persistQuizProgress } from "./quizProgressStorage";

export const quizProgressPersistence = createListenerMiddleware();

quizProgressPersistence.startListening({
  matcher: isAnyOf(
    startQuiz,
    setAnswer,
    setCurrentQuestion,
    endQuiz,
    resetQuizState
  ),
  effect: (_action, api) => {
    const state = api.getState() as RootState;
    persistQuizProgress(state.quizProgress);
  },
});