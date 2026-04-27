// src/layout/GlobalTimer.tsx
//
// Sole owner of the "did time run out?" check. Mounted once in App.tsx,
// runs continuously at the app level so auto-submit fires even if the
// user navigates away from the quiz page mid-quiz.
//
// This component is the ONLY place in the codebase that auto-submits a
// quiz on timeout. The `QuizQuestions` page is display-only; the
// `CountdownCircleTimer` library's `onComplete` is a no-op. Centralizing
// the trigger eliminates the previous three-way race between competing
// timers.
//
// Duplicate-submit protection lives in `submitAndEndQuiz` itself via the
// `isSubmitting` flag in the slice — so this component doesn't need to
// manage that flag. We just dispatch and let the thunk sort it out. If a
// manual submit is already in flight, the thunk no-ops; if not, it
// proceeds. Either way, at most one submission happens per quiz session.

import React, { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState } from "../reducer/store/store";
import {
  selectRemainingTime,
  submitAndEndQuiz,
} from "../reducer/action/quizProgressSlice";

const GlobalTimer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const isQuizInProgress = useSelector(
    (s: RootState) => s.quizProgress.isQuizInProgress
  );

  useEffect(() => {
    if (!isQuizInProgress) return;

    const checkAndMaybeSubmit = () => {
      const state = store.getState();
      // The thunk has its own `isSubmitting` guard; this early-exit is
      // purely a cheap optimization to avoid dispatching a no-op action
      // every second while a submit is in flight.
      if (state.quizProgress.isSubmitting) return;
      if (selectRemainingTime(state) <= 0) {
        dispatch(submitAndEndQuiz());
      }
    };

    // Fire once immediately in case the app reloaded after time ran out
    // (e.g. laptop closed during a quiz).
    checkAndMaybeSubmit();

    const timer = setInterval(checkAndMaybeSubmit, 1000);
    return () => clearInterval(timer);
  }, [dispatch, store, isQuizInProgress]);

  return null;
};

export default GlobalTimer;