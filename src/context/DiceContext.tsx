import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface DiceStatusData {
  is_connected: boolean;
  username?: string;
  cookies_count?: number;
  last_verified?: string;
}

interface DiceContextType {
  diceStatus: DiceStatusData | null;
  refreshDiceStatus: (checkLive?: boolean) => Promise<DiceStatusData>;
  isWaitingForLogin: boolean;
  isChecking: boolean;
  lastEventMessage: string | null;
  onLoginSuccess?: (cb: (status: DiceStatusData) => void) => void;
}

const DiceContext = createContext<DiceContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const SSE_URL = API_BASE_URL + '/settings/dice-session/stream';

export const DiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diceStatus, setDiceStatus] = useState<DiceStatusData | null>(null);
  const [isWaitingForLogin, setIsWaitingForLogin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null);
  const successCallbackRef = useRef<((status: DiceStatusData) => void) | null>(null);

  const refreshDiceStatus = useCallback(async (checkLive: boolean = false): Promise<DiceStatusData> => {
    setIsChecking(true);
    try {
      const status = await api.getDiceStatus(checkLive);
      setDiceStatus(status);
      return status;
    } catch {
      const fallback: DiceStatusData = { is_connected: false };
      setDiceStatus(fallback);
      return fallback;
    } finally {
      setIsChecking(false);
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
              setDiceStatus(payload.dice_session);
            }
            if (payload.manager_status === 'WAITING_FOR_LOGIN') {
              setIsWaitingForLogin(true);
            }
          } else if (payload.type === 'LOGIN_STARTED') {
            setIsWaitingForLogin(true);
            setLastEventMessage(payload.message || 'Waiting for Dice sign-in...');
          } else if (payload.type === 'DICE_CONNECTED') {
            setIsWaitingForLogin(false);
            const newStatus: DiceStatusData = {
              is_connected: true,
              username: payload.username,
              cookies_count: payload.cookies_count,
              last_verified: new Date().toISOString(),
            };
            setDiceStatus(newStatus);
            setLastEventMessage(payload.message || 'Connected to Dice!');
            if (successCallbackRef.current) {
              successCallbackRef.current(newStatus);
            }
          } else if (payload.type === 'LOGIN_CANCELLED' || payload.type === 'LOGIN_TIMEOUT') {
            setIsWaitingForLogin(false);
            setLastEventMessage(payload.message || null);
          }
        } catch (e) {
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
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isWaitingForLogin, refreshDiceStatus]);

  return (
    <DiceContext.Provider
      value={{
        diceStatus,
        refreshDiceStatus,
        isWaitingForLogin,
        isChecking,
        lastEventMessage,
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
