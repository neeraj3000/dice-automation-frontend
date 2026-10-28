import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { api } from '../app/api';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../app/uiSlice';
import billingReducer from '../features/billing/billingSlice';
import HomePage from '../features/home/HomePage';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import { DiceProvider } from '../context/DiceContext';
import { LogoLink, Logo } from '../components/ui/Misc';

// Mock IntersectionObserver for Framer Motion / elements in JSDOM
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

function createTestStore(initialAuthState = {}) {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      ui: uiReducer,
      billing: billingReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: false,
      }).concat(api.middleware),
    preloadedState: {
      auth: {
        status: 'unauthenticated',
        token: null,
        user: null,
        ...initialAuthState,
      },
    },
  });
}

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

describe('Homepage & Logo Navigation Suite', () => {
  it('renders public homepage at / with hero, features, how it works, and CTA sections', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <HomePage />
        </MemoryRouter>
      </Provider>
    );

    // Verify main headline and key sections
    expect(screen.getByText(/Applications dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/by agents/i)).toBeInTheDocument();
    expect(screen.getByText(/approved by you/i)).toBeInTheDocument();
    expect(screen.getByText(/How Apply2Hire works/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Frequently asked questions/i })).toBeInTheDocument();
  }, 15000);

  it('renders "Sign In" and "Start Applying" CTA buttons for unauthenticated users on homepage', () => {
    const store = createTestStore({ status: 'unauthenticated', user: null });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <HomePage />
        </MemoryRouter>
      </Provider>
    );

    const signInLinks = screen.getAllByRole('link', { name: /^Sign In$/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(signInLinks[0]).toHaveAttribute('href', '/login');

    const startApplyingLinks = screen.getAllByRole('link', { name: /Start Applying/i });
    expect(startApplyingLinks.length).toBeGreaterThanOrEqual(1);
    expect(startApplyingLinks[0]).toHaveAttribute('href', '/login');
  });

  it('renders "Go to Dashboard" button on homepage for authenticated users', () => {
    const store = createTestStore({
      status: 'authenticated',
      token: 'mock-token',
      user: { id: 'user-1', name: 'Alex' },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <HomePage />
        </MemoryRouter>
      </Provider>
    );

    const dashLinks = screen.getAllByRole('link', { name: /Go to Dashboard/i });
    expect(dashLinks.length).toBeGreaterThan(0);
    expect(dashLinks[0]).toHaveAttribute('href', '/dashboard');
  });

  it('verifies Logo component links to / when to prop is provided', () => {
    render(
      <MemoryRouter>
        <Logo to="/" />
      </MemoryRouter>
    );

    const logoLink = screen.getByRole('link', { name: /Apply2Hire Home/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('verifies LogoLink component links to /', () => {
    render(
      <MemoryRouter>
        <LogoLink to="/" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Apply2Hire Home/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('verifies clicking logo from /dashboard navigates back to /', () => {
    const store = createTestStore({
      status: 'authenticated',
      token: 'jwt-xyz',
      user: { id: 'u123', email: 'pro@test.io' },
    });

    render(
      <Provider store={store}>
        <DiceProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <LocationDisplay />
            <Routes>
              <Route path="/" element={<div>Public Home Screen</div>} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<div>Dashboard Workspace Screen</div>} />
                </Route>
              </Route>
            </Routes>
          </MemoryRouter>
        </DiceProvider>
      </Provider>
    );

    // Initial check
    expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard');

    // Find and click the Apply2Hire logo in AppShell
    const homeLinks = screen.getAllByRole('link', { name: /Apply2Hire Home/i });
    expect(homeLinks.length).toBeGreaterThan(0);
    fireEvent.click(homeLinks[0]);

    // Verify user is navigated to /
    expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    expect(screen.getByText('Public Home Screen')).toBeInTheDocument();
  });

  it('verifies unauthenticated user navigating to /dashboard is redirected to /login', () => {
    const store = createTestStore({
      status: 'unauthenticated',
      token: null,
      user: null,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <LocationDisplay />
          <Routes>
            <Route path="/login" element={<div>Login Page Screen</div>} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<div>Dashboard Workspace Screen</div>} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('location-display')).toHaveTextContent('/login');
    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
  });

  it('verifies Logo respects custom height and does not inject conflicting default height', () => {
    const { container } = render(
      <MemoryRouter>
        <Logo className="h-6" />
      </MemoryRouter>
    );

    const logoSpan = container.querySelector('span');
    expect(logoSpan.className).toContain('h-6');
    expect(logoSpan.className).not.toContain('h-7');
  });

  it('verifies AppShell desktop sidebar header renders logo with shrink-0', () => {
    const store = createTestStore({
      status: 'authenticated',
      token: 'jwt-xyz',
      user: { id: 'u123', email: 'pro@test.io' },
    });

    render(
      <Provider store={store}>
        <DiceProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<div>Dashboard Workspace Screen</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </DiceProvider>
      </Provider>
    );

    const logoLinks = screen.getAllByRole('link', { name: /Apply2Hire Home/i });
    const fullLogoLink = logoLinks.find(link => link.className.includes('shrink-0'));
    expect(fullLogoLink).toBeDefined();
    expect(fullLogoLink.className).toContain('shrink-0');
  });
});
