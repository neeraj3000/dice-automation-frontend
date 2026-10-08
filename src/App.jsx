import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import LoginPage from './features/auth/LoginPage';
import { useRefreshMutation } from './features/auth/authApi';
import { useTheme } from './hooks/useTheme';
import { DiceProvider } from './context/DiceContext';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const ResumesPage = lazy(() => import('./features/resumes/ResumesPage'));
const SearchProfilesPage = lazy(() => import('./features/boards/SearchProfilesPage'));
const JobsPage = lazy(() => import('./features/jobs/JobsPage'));
const BoardPage = lazy(() => import('./features/boards/BoardPage'));
const ApplicationsPage = lazy(() => import('./features/applications/ApplicationsPage'));
const ReviewQueuePage = lazy(() => import('./features/review/ReviewQueuePage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

export default function App() {
  const [refresh] = useRefreshMutation();
  const { dark } = useTheme();

  useEffect(() => {
    refresh();
  }, [refresh]); // restore the session from the httpOnly refresh cookie

  return (
    <DiceProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="resumes" element={<ResumesPage />} />
            <Route path="search-profiles" element={<SearchProfilesPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="boards/:boardKey" element={<BoardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="review" element={<ReviewQueuePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: dark ? '#15161a' : '#fff',
            color: dark ? '#f4f3ef' : '#15161a',
            border: '1px solid var(--color-line)',
            fontSize: 14,
            borderRadius: 12,
          },
        }}
      />
    </DiceProvider>
  );
}
