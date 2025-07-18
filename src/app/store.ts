import { configureStore } from '@reduxjs/toolkit';
import { githubApi } from '../api/githubApi';

/**
 * Redux store приложения.
 */
export const store = configureStore({
  reducer: {
    [githubApi.reducerPath]: githubApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(githubApi.middleware),
});

/**
 * Тип состояния Redux.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Тип диспетчера Redux.
 */
export type AppDispatch = typeof store.dispatch;