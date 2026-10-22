import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import auth from '../features/auth/authSlice';
import ui from './uiSlice';
import billing from '../features/billing/billingSlice';

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth, ui, billing },
  middleware: (gdm) => gdm().concat(api.middleware),
  devTools: import.meta.env.DEV,
});
setupListeners(store.dispatch);
