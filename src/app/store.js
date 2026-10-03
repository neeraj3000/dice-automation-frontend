import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import auth from '../features/auth/authSlice';
import ui from './uiSlice';

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth, ui },
  middleware: (gdm) => gdm().concat(api.middleware),
  devTools: import.meta.env.DEV,
});
setupListeners(store.dispatch);
