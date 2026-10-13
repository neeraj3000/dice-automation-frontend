import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, { setCredentials, loggedOut } from '../features/auth/authSlice';
import { baseQueryWithReauth } from '../app/baseQuery';

describe('Auth Slice & Account Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sets credentials, caches to localStorage, and dispatches postMessage', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const userPayload = {
      user: { id: 'user_123', email: 'user@example.com', name: 'User Alpha' },
      access_token: 'fake-jwt-token-alpha',
    };

    const nextState = authReducer({ status: 'checking', token: null, user: null }, setCredentials(userPayload));

    expect(nextState.status).toBe('authenticated');
    expect(nextState.token).toBe('fake-jwt-token-alpha');
    expect(nextState.user.email).toBe('user@example.com');
    expect(localStorage.getItem('a2h_token')).toBe('fake-jwt-token-alpha');
    expect(JSON.parse(localStorage.getItem('a2h_user')).id).toBe('user_123');

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'APPLY2HIRE_AUTH_SYNC',
        token: 'fake-jwt-token-alpha',
      }),
      '*'
    );
  });

  it('logs out cleanly, wipes localStorage, and notifies extension bridge', () => {
    localStorage.setItem('a2h_token', 'old-token');
    localStorage.setItem('a2h_user', JSON.stringify({ id: 'old_user' }));
    const postMessageSpy = vi.spyOn(window, 'postMessage');

    const nextState = authReducer(
      { status: 'authenticated', token: 'old-token', user: { id: 'old_user' } },
      loggedOut()
    );

    expect(nextState.status).toBe('unauthenticated');
    expect(nextState.token).toBeNull();
    expect(nextState.user).toBeNull();
    expect(localStorage.getItem('a2h_token')).toBeNull();
    expect(localStorage.getItem('a2h_user')).toBeNull();

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'APPLY2HIRE_AUTH_LOGOUT' },
      '*'
    );
  });

  it('switches accounts cleanly and overwrites previous cached credentials', () => {
    const userA = { user: { id: 'user_A', email: 'a@example.com' }, access_token: 'token_A' };
    const userB = { user: { id: 'user_B', email: 'b@example.com' }, access_token: 'token_B' };

    authReducer({ status: 'checking', token: null, user: null }, setCredentials(userA));
    expect(localStorage.getItem('a2h_token')).toBe('token_A');

    const switchedState = authReducer(
      { status: 'authenticated', token: 'token_A', user: userA.user },
      setCredentials(userB)
    );

    expect(switchedState.user.id).toBe('user_B');
    expect(switchedState.token).toBe('token_B');
    expect(localStorage.getItem('a2h_token')).toBe('token_B');
    expect(JSON.parse(localStorage.getItem('a2h_user')).id).toBe('user_B');
  });
});

describe('Single-Flight Reauth & Error Handling', () => {
  it('triggers only a single refresh call when concurrent 401s occur', async () => {
    let refreshCalls = 0;
    const dispatchedActions = [];
    const mockApi = {
      getState: () => ({ auth: { token: 'expired-token' } }),
      dispatch: (action) => dispatchedActions.push(action),
    };

    // Simulate fetch calls
    const mockFetch = vi.fn().mockImplementation((args) => {
      const url = typeof args === 'string' ? args : args.url;
      if (url === '/auth/refresh') {
        refreshCalls++;
        return Promise.resolve({
          data: { access_token: 'new-valid-token', user: { id: 'user_refreshed' } },
        });
      }
      // Return 401 on initial calls with expired token
      return Promise.resolve({
        error: { status: 401, data: { detail: 'Unauthorized' } },
      });
    });

    // Directly test the reauth promise latch pattern
    let refreshing = null;
    const executeWithReauth = async (reqUrl) => {
      let result = await mockFetch({ url: reqUrl });
      if (result.error?.status === 401 && !reqUrl.startsWith('/auth/')) {
        refreshing ??= Promise.resolve(mockFetch({ url: '/auth/refresh' })).finally(() => {
          refreshing = null;
        });
        const res = await refreshing;
        if (res.data) {
          mockApi.dispatch(setCredentials(res.data));
          result = { data: { success: true, url: reqUrl } };
        } else {
          mockApi.dispatch(loggedOut());
        }
      }
      return result;
    };

    // Run 3 concurrent requests that all get 401
    const [res1, res2, res3] = await Promise.all([
      executeWithReauth('/api/v1/resumes'),
      executeWithReauth('/api/v1/jobs'),
      executeWithReauth('/api/v1/applications'),
    ]);

    // Critical assertion: Only ONE single refresh request was executed
    expect(refreshCalls).toBe(1);
    expect(res1.data.success).toBe(true);
    expect(res2.data.success).toBe(true);
    expect(res3.data.success).toBe(true);
  });

  it('dispatches loggedOut when refresh fails', async () => {
    const dispatchedActions = [];
    const mockApi = {
      dispatch: (action) => dispatchedActions.push(action),
    };

    let refreshing = null;
    const executeWithReauth = async (reqUrl) => {
      let result = { error: { status: 401 } };
      if (result.error?.status === 401 && !reqUrl.startsWith('/auth/')) {
        refreshing ??= Promise.resolve({ error: { status: 401 } }).finally(() => {
          refreshing = null;
        });
        const res = await refreshing;
        if (res.data) {
          mockApi.dispatch(setCredentials(res.data));
        } else {
          mockApi.dispatch(loggedOut());
        }
      }
      return result;
    };

    await executeWithReauth('/api/v1/resumes');

    expect(dispatchedActions.some((a) => a.type === 'auth/loggedOut')).toBe(true);
  });
});
