import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { api } from '../app/api';

const DiceContext = createContext(null);

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
const SSE_URL = `${API_BASE_URL}/settings/dice-session/stream`;

export function DiceProvider({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  const [diceStatus, setDiceStatus] = useState({
    is_connected: false,
    connected: false,
    status: 'LOGIN_REQUIRED',
    username: '',
    cookies_count: 0,
    last_verified: null,
  });

  const [dbStatus, setDbStatus] = useState('connected');
  const [isWaitingForLogin, setIsWaitingForLogin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastEventMessage, setLastEventMessage] = useState(null);

  const successCallbackRef = useRef(null);

  // Check MongoDB and service health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.database === 'connected' || data.status === 'healthy' ? 'connected' : 'disconnected');
      } else {
        setDbStatus('disconnected');
      }
    } catch {
      setDbStatus('disconnected');
    }
  }, []);

  // Refresh Dice session status
  const refreshDiceStatus = useCallback(async (checkLive = false) => {
    setIsChecking(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const userId = user?.id || user?._id || 'default';
      const [legacyRes, sessionRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/settings/dice-status?check_live=${checkLive}`, { headers }),
        fetch(`${API_BASE_URL}/api/dice/session/status?check_live=${checkLive}&user_id=${userId}`, { headers }),
      ]);

      let legacyData = null;
      let sessionData = null;

      if (legacyRes.status === 'fulfilled' && legacyRes.value.ok) {
        legacyData = await legacyRes.value.json().catch(() => null);
      }
      if (sessionRes.status === 'fulfilled' && sessionRes.value.ok) {
        sessionData = await sessionRes.value.json().catch(() => null);
      }

      const isConn = Boolean(
        sessionData?.connected ||
        sessionData?.status === 'CONNECTED' ||
        sessionData?.status === 'valid' ||
        legacyData?.is_connected
      );

      const statusVal = isConn
        ? 'CONNECTED'
        : (sessionData?.status || (legacyData?.is_connected ? 'CONNECTED' : 'LOGIN_REQUIRED'));

      const verifiedTimestamp = sessionData?.last_verified_at || legacyData?.last_verified || null;

      const updated = {
        is_connected: isConn,
        connected: isConn,
        status: statusVal,
        last_verified: verifiedTimestamp,
        username: legacyData?.username || sessionData?.username || '',
        cookies_count: legacyData?.cookies_count || 0,
        expires_at: sessionData?.expires_at || null,
      };

      setDiceStatus(updated);
      return updated;
    } catch {
      const fallback = {
        is_connected: false,
        connected: false,
        status: 'LOGIN_REQUIRED',
        username: '',
        cookies_count: 0,
        last_verified: null,
      };
      setDiceStatus(fallback);
      return fallback;
    } finally {
      setIsChecking(false);
    }
  }, [token, user]);

  const disconnectDice = useCallback(async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const userId = user?.id || user?._id || 'default';
      await fetch(`${API_BASE_URL}/api/dice/session/disconnect?user_id=${userId}`, {
        method: 'POST',
        headers,
      });

      setDiceStatus({
        is_connected: false,
        connected: false,
        status: 'DISCONNECTED',
        username: '',
        cookies_count: 0,
        last_verified: null,
      });
      setIsWaitingForLogin(false);
      dispatch(api.util.invalidateTags(['Board', 'Stats', 'DiceSession']));
      toast.success('Dice account disconnected');
      return true;
    } catch {
      toast.error('Failed to disconnect Dice session');
      return false;
    }
  }, [token, user, dispatch]);

  const onLoginSuccess = useCallback((cb) => {
    successCallbackRef.current = cb;
  }, []);

  // Health and session check interval
  useEffect(() => {
    checkHealth();
    refreshDiceStatus(false);

    const hInterval = setInterval(checkHealth, 30000);
    return () => clearInterval(hInterval);
  }, [checkHealth, refreshDiceStatus]);

  // Real-time SSE listener
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource(SSE_URL);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT_STATE') {
            if (payload.dice_session) {
              const isConn = Boolean(payload.dice_session.is_connected);
              setDiceStatus((prev) => ({
                ...prev,
                ...payload.dice_session,
                is_connected: isConn,
                connected: isConn,
                status: isConn ? 'CONNECTED' : (payload.dice_session.status || 'LOGIN_REQUIRED'),
              }));
            }
            if (payload.manager_status === 'WAITING_FOR_LOGIN') {
              setIsWaitingForLogin(true);
            }
          } else if (payload.type === 'LOGIN_STARTED') {
            setIsWaitingForLogin(true);
            setLastEventMessage(payload.message || 'Waiting for Dice sign-in...');
          } else if (payload.type === 'DICE_CONNECTED') {
            setIsWaitingForLogin(false);
            const nowIso = new Date().toISOString();
            const newStatus = {
              is_connected: true,
              connected: true,
              status: 'CONNECTED',
              username: payload.username || '',
              cookies_count: payload.cookies_count || 0,
              last_verified: nowIso,
            };
            setDiceStatus(newStatus);
            dispatch(api.util.invalidateTags(['Board', 'Stats', 'DiceSession']));
            toast.success(`Connected to Dice as ${payload.username || 'Candidate'}!`);
            if (successCallbackRef.current) {
              successCallbackRef.current(newStatus);
            }
          } else if (payload.type === 'DICE_DISCONNECTED') {
            setIsWaitingForLogin(false);
            setDiceStatus({
              is_connected: false,
              connected: false,
              status: 'DISCONNECTED',
              username: '',
              cookies_count: 0,
              last_verified: null,
            });
            dispatch(api.util.invalidateTags(['Board', 'Stats', 'DiceSession']));
          } else if (payload.type === 'LOGIN_CANCELLED' || payload.type === 'LOGIN_TIMEOUT') {
            setIsWaitingForLogin(false);
            if (payload.type === 'LOGIN_TIMEOUT') {
              toast.error('Dice login timed out. Please try again.');
            }
          }
        } catch {
          // ignore comments or pings
        }
      };
    } catch (e) {
      console.warn('SSE connection notice:', e);
    }

    const handleFocus = () => {
      refreshDiceStatus(true);
      checkHealth();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (eventSource) eventSource.close();
    };
  }, [refreshDiceStatus, checkHealth, dispatch]);

  // Polling fallback while waiting for sign-in
  useEffect(() => {
    if (!isWaitingForLogin) return;
    const interval = setInterval(async () => {
      const status = await refreshDiceStatus(true);
      if (status.is_connected) {
        setIsWaitingForLogin(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isWaitingForLogin, refreshDiceStatus]);

  const value = {
    diceStatus,
    dbStatus,
    refreshDiceStatus,
    disconnectDice,
    isWaitingForLogin,
    setIsWaitingForLogin,
    isChecking,
    lastEventMessage,
    onLoginSuccess,
  };

  return <DiceContext.Provider value={value}>{children}</DiceContext.Provider>;
}

export function useDice() {
  const ctx = useContext(DiceContext);
  if (!ctx) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return ctx;
}
