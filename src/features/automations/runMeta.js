import { useEffect, useState } from 'react';

export const RUN_STATUS_META = {
  RUNNING: { label: 'Running', tone: 'signal' },
  COMPLETED: { label: 'Completed', tone: 'signal' },
  TIME_UP: { label: "Time's up", tone: 'neutral' },
  STOPPED: { label: 'Stopped', tone: 'neutral' },
  LOGIN_REQUIRED: { label: 'Dice login required', tone: 'rust' },
  FAILED: { label: 'Failed', tone: 'rust' },
  INTERRUPTED: { label: 'Interrupted', tone: 'amber' },
};

export const STEP_LABELS = {
  SEARCHING: 'Searching Dice',
  STARTING: 'Starting application',
  OPENING_JOB: 'Opening the job page',
  FILLING_APPLICATION: 'Filling in the application',
  UPLOADING_RESUME: 'Uploading resume',
  SUBMITTING: 'Submitting',
  SUBMITTED: 'Submitted',
  COOLDOWN: 'Short pause before the next job',
  PAUSED: 'Paused',
};

export const TIMER_PRESETS = [15, 30, 60, 120];
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 240;
export const MAX_APPLY = 100;
export const DEFAULT_APPLY = 10;
export const DEFAULT_MINUTES = 30;

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : formatDuration(m);
}

/** Time the run actually worked, excluding time spent paused. */
export const runElapsedSeconds = (run) => {
  if (!run.started_at) return 0;
  const end = run.finished_at ? new Date(run.finished_at) : new Date();
  return Math.max(0, (end - new Date(run.started_at)) / 1000 - (run.paused_seconds || 0));
};

export const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/**
 * Seconds left on a run, ticking locally every second. Anchored to the server's
 * remaining_seconds and the moment that response arrived, so the client clock
 * and timezone never matter.
 */
export function useCountdown(remainingSeconds, receivedAt, frozen = false) {
  const [now, setNow] = useState(() => Date.now());
  const active = remainingSeconds > 0 && Boolean(receivedAt) && !frozen;
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (frozen) return Math.max(0, remainingSeconds);
  if (!active) return 0;
  return Math.max(0, Math.round((receivedAt + remainingSeconds * 1000 - now) / 1000));
}
