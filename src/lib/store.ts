import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { jobsApi } from './api/jobsApi';
import { studentsApi } from './api/studentsApi';
import { analyticsApi } from './api/analyticsApi';
import { usersApi } from './api/usersApi';
import { resumesApi } from './api/resumesApi';
import { internshipRequestsApi } from './api/internshipRequestsApi';
import { internshipsApi } from './api/internshipsApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [resumesApi.reducerPath]: resumesApi.reducer,
    [internshipRequestsApi.reducerPath]: internshipRequestsApi.reducer,
    [internshipsApi.reducerPath]: internshipsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      jobsApi.middleware, 
      studentsApi.middleware,
      analyticsApi.middleware, 
      usersApi.middleware,
      resumesApi.middleware,
      internshipRequestsApi.middleware,
      internshipsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
