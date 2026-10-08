import { createSlice } from '@reduxjs/toolkit';

const getInitialDark = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('a2h-theme') === 'dark';
  } catch (e) {
    return false;
  }
};

const getInitialSidebar = () => {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem('a2h-sidebar-open');
    return val !== null ? val === 'true' : true;
  } catch (e) {
    return true;
  }
};

const slice = createSlice({
  name: 'ui',
  initialState: {
    dark: getInitialDark(),
    sidebarOpen: false, // mobile drawer
    desktopSidebarOpen: getInitialSidebar(), // desktop collapsible sidebar
  },
  reducers: {
    setDark: (s, { payload }) => { s.dark = payload; },
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    closeSidebar: (s) => { s.sidebarOpen = false; },
    toggleDesktopSidebar: (s) => {
      s.desktopSidebarOpen = !s.desktopSidebarOpen;
      try { localStorage.setItem('a2h-sidebar-open', String(s.desktopSidebarOpen)); } catch (e) {}
    },
    setDesktopSidebar: (s, { payload }) => {
      s.desktopSidebarOpen = !!payload;
      try { localStorage.setItem('a2h-sidebar-open', String(payload)); } catch (e) {}
    },
  },
});
export const { setDark, toggleSidebar, closeSidebar, toggleDesktopSidebar, setDesktopSidebar } = slice.actions;
export default slice.reducer;
