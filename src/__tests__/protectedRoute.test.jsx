import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import authReducer from '../features/auth/authSlice';

function renderWithAuth(initialAuthState, initialPath = '/protected') {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: initialAuthState,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page Screen</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secure Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('Protected Route Component', () => {
  it('renders splash loader when auth status is checking', () => {
    const { container } = renderWithAuth({ status: 'checking', token: null, user: null });
    expect(screen.queryByText('Secure Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page Screen')).not.toBeInTheDocument();
    expect(container.querySelector('.bg-paper')).toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated', () => {
    renderWithAuth({ status: 'unauthenticated', token: null, user: null });
    expect(screen.queryByText('Secure Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
  });

  it('renders child outlet when authenticated', () => {
    renderWithAuth({
      status: 'authenticated',
      token: 'valid-jwt-token',
      user: { id: 'u1', email: 'test@example.com' },
    });
    expect(screen.getByText('Secure Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page Screen')).not.toBeInTheDocument();
  });
});
