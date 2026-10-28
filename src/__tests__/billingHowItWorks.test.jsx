import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../app/api';
import authReducer from '../features/auth/authSlice';
import HowItWorks from '../features/billing/components/HowItWorks';

function renderWithStore(ui) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: false,
      }).concat(api.middleware),
    preloadedState: {
      auth: {
        token: 'test-token',
        user: { id: 'test-user' },
        status: 'authenticated',
      },
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Billing HowItWorks component', () => {
  it('renders default/fallback plans when no plans are passed', () => {
    renderWithStore(<HowItWorks />);

    expect(screen.getByText(/How application limits work/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily limits, working days & monthly totals explained/i)).toBeInTheDocument();

    // Toggle open
    const toggleBtn = screen.getByRole('button', { name: /How application limits work/i });
    fireEvent.click(toggleBtn);

    // Fallback plans present
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Ultimate')).toBeInTheDocument();
  });

  it('renders custom dynamic plans fetched from Stripe backend', () => {
    const mockStripePlans = [
      {
        key: 'trial',
        name: 'Basic Free',
        description: '7-day trial',
        unit_amount: 0,
        currency: 'usd',
        daily_application_limit: null,
        total_application_limit: 30,
        search_profile_limit: 1,
        highlight: false,
        is_trial: true,
      },
      {
        key: 'growth',
        name: 'Growth Plan',
        description: 'Accelerate your career',
        unit_amount: 2999, // $29.99
        currency: 'usd',
        interval: 'month',
        daily_application_limit: 50,
        total_application_limit: null,
        search_profile_limit: 4,
        highlight: true,
        is_trial: false,
      },
    ];

    renderWithStore(<HowItWorks plans={mockStripePlans} />);

    // Toggle open
    const toggleBtn = screen.getByRole('button', { name: /How application limits work/i });
    fireEvent.click(toggleBtn);

    // Dynamic Plan Names
    expect(screen.getByText('Basic Free')).toBeInTheDocument();
    expect(screen.getByText('Growth Plan')).toBeInTheDocument();

    // Price calculation ($29.99)
    expect(screen.getByText('$29.99')).toBeInTheDocument();

    // Daily limit calculation
    expect(screen.getByText(/50 applications/i)).toBeInTheDocument();

    // Monthly limit calculation (50 * 22 = 1,100)
    expect(screen.getByText(/1,100 applications/i)).toBeInTheDocument();

    // Trial total application limit
    expect(screen.getByText(/30 applications total/i)).toBeInTheDocument();

    // Search profiles
    expect(screen.getByText('4')).toBeInTheDocument();

    // Highlight badge for Growth Plan
    expect(screen.getByText(/Popular/i)).toBeInTheDocument();
  });
});
