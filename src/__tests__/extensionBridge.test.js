import { describe, it, expect, vi } from 'vitest';

describe('Chrome Extension Bridge Protocol & Validation', () => {
  const TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://apply2hire.com',
    'https://app.apply2hire.com',
  ];

  // Logic replicated from dice-chrome-extension/content_bridge.js
  function validateBridgeEvent(event, mockWindow = window) {
    if (!event || event.source !== mockWindow) {
      return { valid: false, reason: 'Invalid event source' };
    }
    if (!event.origin || !TRUSTED_ORIGINS.includes(event.origin)) {
      return { valid: false, reason: 'Untrusted origin' };
    }
    const message = event.data;
    if (!message || typeof message !== 'object') {
      return { valid: false, reason: 'Malformed payload' };
    }
    if (message.type === 'APPLY2HIRE_AUTH_SYNC') {
      if (!message.user || typeof message.user !== 'object' || !message.token) {
        return { valid: false, reason: 'Invalid auth sync payload' };
      }
      return { valid: true, type: 'APPLY2HIRE_AUTH_SYNC', payload: message };
    }
    if (message.type === 'APPLY2HIRE_AUTH_LOGOUT') {
      return { valid: true, type: 'APPLY2HIRE_AUTH_LOGOUT' };
    }
    return { valid: false, reason: 'Unknown message type' };
  }

  it('accepts valid auth sync from trusted origin', () => {
    const event = {
      source: window,
      origin: 'http://localhost:5173',
      data: {
        type: 'APPLY2HIRE_AUTH_SYNC',
        user: { id: 'u_123', email: 'valid@example.com' },
        token: 'valid.bearer.token',
      },
    };
    const res = validateBridgeEvent(event);
    expect(res.valid).toBe(true);
    expect(res.type).toBe('APPLY2HIRE_AUTH_SYNC');
  });

  it('rejects message from untrusted attacker origin', () => {
    const event = {
      source: window,
      origin: 'https://evil-phishing-site.com',
      data: {
        type: 'APPLY2HIRE_AUTH_SYNC',
        user: { id: 'spoofed_user' },
        token: 'stolen_token',
      },
    };
    const res = validateBridgeEvent(event);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Untrusted origin');
  });

  it('rejects message with foreign window source', () => {
    const foreignWindow = {};
    const event = {
      source: foreignWindow,
      origin: 'http://localhost:5173',
      data: {
        type: 'APPLY2HIRE_AUTH_SYNC',
        user: { id: 'u_123' },
        token: 'token',
      },
    };
    const res = validateBridgeEvent(event);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Invalid event source');
  });

  it('rejects malformed auth sync without token or user payload', () => {
    const event = {
      source: window,
      origin: 'http://localhost:5173',
      data: {
        type: 'APPLY2HIRE_AUTH_SYNC',
        user: null,
      },
    };
    const res = validateBridgeEvent(event);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Invalid auth sync payload');
  });

  it('accepts valid logout notification', () => {
    const event = {
      source: window,
      origin: 'http://localhost:5173',
      data: {
        type: 'APPLY2HIRE_AUTH_LOGOUT',
      },
    };
    const res = validateBridgeEvent(event);
    expect(res.valid).toBe(true);
    expect(res.type).toBe('APPLY2HIRE_AUTH_LOGOUT');
  });
});
