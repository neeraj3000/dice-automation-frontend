import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

const plan = (overrides) => ({
  description: '',
  currency: 'usd',
  interval: 'month',
  total_application_limit: null,
  features: [],
  highlight: false,
  is_trial: false,
  working_days_per_month: 22,
  ...overrides,
});

// Shape of GET /billing/plans after the Starter / Pro / Premium setup in Stripe
const API_PLANS = [
  plan({
    key: 'trial', name: 'Basic', description: '7-day free trial', unit_amount: 0, interval: null,
    daily_application_limit: null, total_application_limit: 25, monthly_application_limit: null,
    search_profile_limit: 1, is_trial: true,
  }),
  plan({ key: 'starter', name: 'Starter', unit_amount: 499, daily_application_limit: 10, monthly_application_limit: 220, search_profile_limit: 1 }),
  plan({ key: 'pro', name: 'Pro', unit_amount: 1299, daily_application_limit: 30, monthly_application_limit: 660, search_profile_limit: 3, highlight: true }),
  plan({ key: 'premium', name: 'Premium', unit_amount: 1999, daily_application_limit: 70, monthly_application_limit: 1540, search_profile_limit: 5 }),
];

const open = () => fireEvent.click(screen.getByRole('button', { name: /How application limits work/i }));
const rowFor = (name) => screen.getByText(name).closest('tr');

describe('Billing HowItWorks component', () => {
  it('renders no hardcoded plans when the API has not returned any', () => {
    renderWithStore(<HowItWorks />);
    open();

    expect(screen.getByText(/Daily limits, working days & monthly totals explained/i)).toBeInTheDocument();
    for (const name of ['Starter', 'Pro', 'Premium', 'Ultimate']) {
      expect(screen.queryByText(name)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders Starter / Pro / Premium prices and limits from the API', () => {
    renderWithStore(<HowItWorks plans={API_PLANS} />);
    open();

    const expected = {
      Starter: ['$4.99', '10 applications', '220 applications', '1'],
      Pro: ['$12.99', '30 applications', '660 applications', '3'],
      Premium: ['$19.99', '70 applications', '1,540 applications', '5'],
    };
    for (const [name, cells] of Object.entries(expected)) {
      const text = rowFor(name).textContent;
      for (const cell of cells) expect(text).toContain(cell);
    }
    expect(rowFor('Basic').textContent).toContain('25 applications total');
    expect(screen.getByText('7-day trial')).toBeInTheDocument();
    expect(screen.queryByText('Ultimate')).not.toBeInTheDocument();
    expect(within(rowFor('Pro')).getByText(/Popular/i)).toBeInTheDocument();
  });

  it('uses the working-days figure from the API, not a constant', () => {
    const plans = API_PLANS.map((p) => ({
      ...p,
      working_days_per_month: 20,
      monthly_application_limit: p.daily_application_limit != null ? p.daily_application_limit * 20 : null,
    }));
    renderWithStore(<HowItWorks plans={plans} />);
    open();

    expect(screen.getByText('20 days (Mon–Fri)')).toBeInTheDocument();
    expect(screen.getByText('Daily limit × 20 days')).toBeInTheDocument();
    expect(screen.getByText(/Per month \(20 days\)/)).toBeInTheDocument();
    expect(rowFor('Premium').textContent).toContain('1,400 applications');
    expect(screen.queryByText(/22/)).not.toBeInTheDocument();
  });

  it('renders any plan Stripe defines, e.g. a new tier, without code changes', () => {
    renderWithStore(<HowItWorks plans={[plan({
      key: 'growth', name: 'Growth Plan', unit_amount: 2999, daily_application_limit: 50,
      monthly_application_limit: 1100, search_profile_limit: 4,
    })]} />);
    open();

    const text = rowFor('Growth Plan').textContent;
    expect(text).toContain('$29.99');
    expect(text).toContain('1,100 applications');
    expect(text).toContain('4');
  });
});
