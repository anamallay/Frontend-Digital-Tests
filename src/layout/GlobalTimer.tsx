// src/layout/GlobalTimer.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../reducer/store/store";
import { submitAndEndQuiz } from "../reducer/action/quizProgressSlice";

const GlobalTimer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isQuizInProgress, currentQuizId, startTime, initialTime } =
    useSelector((state: RootState) => state.quizProgress);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizInProgress && currentQuizId && startTime && initialTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = initialTime - elapsed;
        if (remainingTime <= 0) {
          clearInterval(timer);
          dispatch(
            submitAndEndQuiz(
              currentQuizId,
              JSON.parse(localStorage.getItem("answers") || "[]")
            )
          );
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dispatch, isQuizInProgress, currentQuizId, startTime, initialTime]);

  return null;
};

export default GlobalTimer;
