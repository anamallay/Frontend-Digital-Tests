// src/reducer/store/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import usersSlice from "../action/usersSlice";
import quizzesSlice from "../action/quizzesSlice";
import questionsSlice from "../action/questionsSlice";
import scoresSlice from "../action/scoresSlice";
import quizProgressReducer from "../action/quizProgressSlice";
import librarySlice from "../action/librariesSlice";
import axios from "axios";

// Dynamically fetch the current language for each request
axios.interceptors.request.use((config) => {
  // Fetch the language each time a request is made to ensure it's up to date
  const currentLanguage = localStorage.getItem("language") || "ar";
  console.log(currentLanguage);

  config.headers["Accept-Language"] = currentLanguage;
  return config;
});

export const store = configureStore({
  reducer: {
    users: usersSlice,
    quizzes: quizzesSlice,
    library: librarySlice,
    questions: questionsSlice,
    scores: scoresSlice,
    quizProgress: quizProgressReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UserState, quizzes: QuizState, questions: QuestionState}
export type AppDispatch = typeof store.dispatch;
