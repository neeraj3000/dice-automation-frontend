import { createSlice } from '@reduxjs/toolkit';

const getInitialDark = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('a2h-theme') === 'dark';
  } catch (e) {
    return false;
  }
};

const slice = createSlice({
  name: 'ui',
  initialState: { dark: getInitialDark(), sidebarOpen: false },
  reducers: {
    setDark: (s, { payload }) => { s.dark = payload; },
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    closeSidebar: (s) => { s.sidebarOpen = false; },
  },
});
export const { setDark, toggleSidebar, closeSidebar } = slice.actions;
export default slice.reducer;
