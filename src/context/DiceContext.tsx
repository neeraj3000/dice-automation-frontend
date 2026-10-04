import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface DiceStatusData {
  is_connected: boolean;
  connected?: boolean;
  status?: string; // 'CONNECTED' | 'valid' | 'SESSION_EXPIRED' | 'LOGIN_REQUIRED' | 'BROWSER_ERROR' | 'UNKNOWN' | 'DISCONNECTED'
  username?: string;
  cookies_count?: number;
  last_verified?: string;
  last_verified_at?: string | null;
  expires_at?: string | null;
  error_message?: string | null;
}

interface DiceContextType {
  diceStatus: DiceStatusData | null;
  refreshDiceStatus: (checkLive?: boolean) => Promise<DiceStatusData>;
  disconnectDice: () => Promise<boolean>;
  isWaitingForLogin: boolean;
  setIsWaitingForLogin: (waiting: boolean) => void;
  isChecking: boolean;
  isDisconnecting: boolean;
  lastEventMessage: string | null;
  syncSuccess: boolean;
  clearSyncSuccess: () => void;
  syncError: string | null;
  clearSyncError: () => void;
  onLoginSuccess?: (cb: (status: DiceStatusData) => void) => void;
}

const DiceContext = createContext<DiceContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const SSE_URL = API_BASE_URL + '/settings/dice-session/stream';

export const DiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diceStatus, setDiceStatus] = useState<DiceStatusData | null>(null);
  const [isWaitingForLogin, setIsWaitingForLogin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null);
  const successCallbackRef = useRef<((status: DiceStatusData) => void) | null>(null);

  const clearSyncSuccess = useCallback(() => setSyncSuccess(false), []);
  const clearSyncError = useCallback(() => setSyncError(null), []);

  const refreshDiceStatus = useCallback(async (checkLive: boolean = false): Promise<DiceStatusData> => {
    setIsChecking(true);
    try {
      // Query GET /api/dice/session/status
      const [sessionRes, legacyRes] = await Promise.allSettled([
        api.getDiceSessionStatus(checkLive),
        api.getDiceStatus(checkLive),
      ]);

      const sess = sessionRes.status === 'fulfilled' ? sessionRes.value : null;
      const legacy = legacyRes.status === 'fulfilled' ? legacyRes.value : null;

      const isConn = Boolean(
        sess?.connected ||
        sess?.status === 'CONNECTED' ||
        sess?.status === 'valid' ||
        legacy?.is_connected
      );

      const statusVal = isConn
        ? 'CONNECTED'
        : (sess?.status || (legacy?.is_connected ? 'CONNECTED' : 'LOGIN_REQUIRED'));

      const verifiedTimestamp = sess?.last_verified_at || legacy?.last_verified || null;

      const updated: DiceStatusData = {
        is_connected: isConn,
        connected: isConn,
        status: statusVal,
        last_verified: verifiedTimestamp || undefined,
        last_verified_at: verifiedTimestamp,
        expires_at: sess?.expires_at || null,
        username: legacy?.username || '',
        cookies_count: legacy?.cookies_count || 0,
      };

      setDiceStatus(updated);
      return updated;
    } catch {
      const fallback: DiceStatusData = {
        is_connected: false,
        connected: false,
        status: 'LOGIN_REQUIRED',
        last_verified_at: null,
      };
      setDiceStatus(fallback);
      return fallback;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const disconnectDice = useCallback(async (): Promise<boolean> => {
    setIsDisconnecting(true);
    try {
      await api.disconnectDice();
      const disconnectedState: DiceStatusData = {
        is_connected: false,
        connected: false,
        status: 'DISCONNECTED',
        username: '',
        cookies_count: 0,
        last_verified: undefined,
        last_verified_at: null,
        expires_at: null,
      };
      setDiceStatus(disconnectedState);
      setSyncSuccess(false);
      setSyncError(null);
      setIsWaitingForLogin(false);
      setLastEventMessage('Dice account disconnected.');
      return true;
    } catch (e: any) {
      console.error('Failed to disconnect Dice session:', e);
      setSyncError('Failed to disconnect Dice session. Please try again.');
      return false;
    } finally {
      setIsDisconnecting(false);
    }
  }, []);

  const onLoginSuccess = useCallback((cb: (status: DiceStatusData) => void) => {
    successCallbackRef.current = cb;
  }, []);

  // Real-Time Server-Sent Events (SSE) listener
  useEffect(() => {
    let eventSource: EventSource | null = null;

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
            setSyncSuccess(true);
            setSyncError(null);
            const nowIso = new Date().toISOString();
            const newStatus: DiceStatusData = {
              is_connected: true,
              connected: true,
              status: 'CONNECTED',
              username: payload.username,
              cookies_count: payload.cookies_count,
              last_verified: nowIso,
              last_verified_at: nowIso,
            };
            setDiceStatus(newStatus);
            setLastEventMessage(payload.message || 'Connected to Dice!');
            if (successCallbackRef.current) {
              successCallbackRef.current(newStatus);
            }
          } else if (payload.type === 'DICE_DISCONNECTED') {
            setIsWaitingForLogin(false);
            setSyncSuccess(false);
            setDiceStatus({
              is_connected: false,
              connected: false,
              status: 'DISCONNECTED',
              last_verified_at: null,
            });
            setLastEventMessage(payload.message || 'Dice session disconnected.');
          } else if (payload.type === 'LOGIN_CANCELLED' || payload.type === 'LOGIN_TIMEOUT') {
            setIsWaitingForLogin(false);
            setLastEventMessage(payload.message || null);
            if (payload.type === 'LOGIN_TIMEOUT') {
              setSyncError('Dice login timed out. Please try again.');
            }
          }
        } catch {
          // ignore parse errors for ping/comments
        }
      };

      eventSource.onerror = () => {
        // SSE natively attempts auto-reconnection
      };
    } catch (e) {
      console.warn('Could not initialize SSE connection to backend:', e);
    }

    // Initial HTTP fetch fallback
    refreshDiceStatus(false);

    // Tab focus check: when user switches back from Dice tab, verify live
    const handleFocus = () => {
      refreshDiceStatus(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [refreshDiceStatus]);

  // Active auto-polling while waiting for login / session sync
  useEffect(() => {
    if (!isWaitingForLogin) return;
    const interval = setInterval(async () => {
      const status = await refreshDiceStatus(true);
      if (status.is_connected) {
        setIsWaitingForLogin(false);
        setSyncSuccess(true);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isWaitingForLogin, refreshDiceStatus]);

  return (
    <DiceContext.Provider
      value={{
        diceStatus,
        refreshDiceStatus,
        disconnectDice,
        isWaitingForLogin,
        setIsWaitingForLogin,
        isChecking,
        isDisconnecting,
        lastEventMessage,
        syncSuccess,
        clearSyncSuccess,
        syncError,
        clearSyncError,
        onLoginSuccess,
      }}
    >
      {children}
    </DiceContext.Provider>
  );
};

export const useDice = (): DiceContextType => {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return context;
};
