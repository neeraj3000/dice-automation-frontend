import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiceProvider, useDice } from '../context/DiceContext';
import authReducer from '../features/auth/authSlice';

// Test consumer component
function TestConsumer() {
  const { diceStatus, disconnectDice } = useDice();
  return (
    <div>
      <div data-testid="status">{diceStatus.status}</div>
      <div data-testid="connected">{String(diceStatus.is_connected)}</div>
      <div data-testid="username">{diceStatus.username}</div>
      <button onClick={() => disconnectDice()}>Disconnect</button>
    </div>
  );
}

describe('DiceContext & Real-Time SSE Lifecycle', () => {
  let mockEventSourceInstances = [];

  class MockEventSource {
    constructor(url) {
      this.url = url;
      this.close = vi.fn();
      this.onmessage = null;
      this.onerror = null;
      mockEventSourceInstances.push(this);
    }
  }

  beforeEach(() => {
    mockEventSourceInstances = [];
    vi.stubGlobal('EventSource', MockEventSource);

    // Mock global fetch
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.includes('/health')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ database: 'connected', status: 'healthy' }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ is_connected: false, connected: false, status: 'LOGIN_REQUIRED' }),
        });
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (token = 'test-token', user = { id: 'u123' }) => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        api: () => ({}),
      },
      preloadedState: {
        auth: { status: 'authenticated', token, user },
      },
    });

    let rendered;
    act(() => {
      rendered = render(
        <Provider store={store}>
          <DiceProvider>
            <TestConsumer />
          </DiceProvider>
        </Provider>
      );
    });
    return rendered;
  };

  it('initializes EventSource and cleans up on unmount', () => {
    const { unmount } = renderWithProviders();
    expect(mockEventSourceInstances.length).toBe(1);
    const es = mockEventSourceInstances[0];
    expect(es.url).toContain('/settings/dice-session/stream');

    unmount();
    expect(es.close).toHaveBeenCalledTimes(1);
  });

  it('updates state dynamically when SSE DICE_CONNECTED message arrives', async () => {
    renderWithProviders();
    const es = mockEventSourceInstances[0];
    expect(es).toBeDefined();

    // Flush initial on-mount fetch
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    await act(async () => {
      es.onmessage({
        data: JSON.stringify({
          type: 'DICE_CONNECTED',
          username: 'Jane Doe',
          cookies_count: 5,
        }),
      });
    });

    expect(screen.getByTestId('status')).toHaveTextContent('CONNECTED');
    expect(screen.getByTestId('connected')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('Jane Doe');
  });

  it('safely handles 401/403 or network failure when refreshing session status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error or 401 Unauthorized'))
    );

    renderWithProviders();

    // Should fall back cleanly without crashing
    expect(screen.getByTestId('status')).toBeInTheDocument();
    expect(screen.getByTestId('connected')).toHaveTextContent('false');
  });
});
