// src/reducer/store/store.ts
//
// The Redux store. This file owns the reducer map and middleware chain.
// HTTP concerns (baseURL, credentials, language header) used to live here
// as a global axios interceptor — that was moved to `src/api/http.ts` so
// "configuring the store" and "configuring HTTP" are no longer tangled.

import { configureStore } from "@reduxjs/toolkit";
import usersSlice from "../action/usersSlice";
import quizzesSlice from "../action/quizzesSlice";
import questionsSlice from "../action/questionsSlice";
import scoresSlice from "../action/scoresSlice";
import quizProgressReducer from "../action/quizProgressSlice";
import librarySlice from "../action/librariesSlice";
import publicUsersReducer from "../action/publicUsersSlice";
import { quizProgressPersistence } from "../middleware/quizProgressPersistence";

export const store = configureStore({
  reducer: {
    users: usersSlice,
    quizzes: quizzesSlice,
    library: librarySlice,
    questions: questionsSlice,
    scores: scoresSlice,
    quizProgress: quizProgressReducer,
    publicUsers: publicUsersReducer,
  },
  // Prepend so the listener observes actions AFTER the reducer runs but
  // before any other middleware can intercept — standard pattern for
  // persistence listeners.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(quizProgressPersistence.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;