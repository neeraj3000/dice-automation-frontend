import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Loader2, Pause, Play, Search, Send, Square, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { errorMessage } from '../../lib/format';
import {
  usePauseAutomationRunMutation,
  useResumeAutomationRunMutation,
  useStopAutomationRunMutation,
} from './automationsApi';
import { STEP_LABELS, formatClock, useCountdown } from './runMeta';

const EVENT_ICONS = {
  success: { icon: CheckCircle2, cls: 'text-signal' },
  warning: { icon: AlertTriangle, cls: 'text-amber' },
  error: { icon: XCircle, cls: 'text-rust' },
  info: { icon: Info, cls: 'text-ink-soft' },
};

const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-control border border-line bg-paper px-4 py-3">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className={cn('mt-0.5 text-xl font-semibold tabular-nums', tone)}>{value}</p>
    </div>
  );
}

function CurrentActivity({ run }) {
  const cur = run.current || {};
  if (run.paused) {
    return (
      <div className="flex items-start gap-3">
        <Pause className="mt-0.5 size-4 shrink-0 text-amber" />
        <div className="min-w-0">
          <p className="text-sm font-medium">Paused. The timer is frozen.</p>
          <p className="text-xs text-ink-soft">Press Resume to continue. A paused automation stops automatically after 60 minutes.</p>
        </div>
      </div>
    );
  }
  if (run.phase === 'RESUMING') {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 className="size-4 animate-spin" /> Resuming…
      </p>
    );
  }
  if (run.phase === 'SCRAPING') {
    return (
      <div className="flex items-start gap-3">
        <Search className="mt-0.5 size-4 shrink-0 text-signal" />
        <div className="min-w-0">
          <p className="text-sm font-medium">Searching Dice for “{cur.profile_name}”</p>
          <p className="text-xs text-ink-soft">Finding and matching new jobs against your resumes</p>
        </div>
      </div>
    );
  }
  if (run.phase === 'APPLYING' && cur.job_title) {
    return (
      <div className="flex items-start gap-3">
        <Send className="mt-0.5 size-4 shrink-0 text-signal" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {cur.job_title} <span className="font-normal text-ink-soft">at {cur.company}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Loader2 className="size-3 animate-spin" />
            {STEP_LABELS[cur.step] || 'Working'}
            {cur.profile_name && <span>· from {cur.profile_name}</span>}
          </p>
        </div>
      </div>
    );
  }
  return (
    <p className="flex items-center gap-2 text-sm text-ink-soft">
      <Loader2 className="size-4 animate-spin" /> Getting started…
    </p>
  );
}

export default function ActiveRunPanel({ run, receivedAt }) {
  const [stopRun, { isLoading: stopping }] = useStopAutomationRunMutation();
  const [pauseRun, { isLoading: pausing }] = usePauseAutomationRunMutation();
  const [resumeRun, { isLoading: resuming }] = useResumeAutomationRunMutation();
  const left = useCountdown(run.remaining_seconds, receivedAt, run.paused);
  const pausePending = run.pause_requested && !run.paused;
  const total = run.duration_minutes * 60;
  const elapsedPct = total ? Math.min(100, ((total - left) / total) * 100) : 0;
  const { scraped = 0, submitted = 0, review = 0, failed = 0 } = run.counters || {};
  const events = [...(run.events || [])].reverse().slice(0, 8);

  const handlePause = async () => {
    try {
      await pauseRun(run.id).unwrap();
      toast('Pausing after the current step finishes…');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleResume = async () => {
    try {
      await resumeRun(run.id).unwrap();
      toast.success('Automation resumed.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleStop = async () => {
    try {
      await stopRun(run.id).unwrap();
      toast('Stopping automation…');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('p-5 sm:p-6', run.paused ? 'border-amber/40' : 'border-signal/30')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {run.paused ? (
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber">
                <span className="size-2 rounded-full bg-amber" />
                Paused
              </p>
            ) : (
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-signal-deep">
                <span className="relative flex size-2">
                  <span className="absolute size-2 animate-ping rounded-full bg-signal opacity-75" />
                  <span className="relative size-2 rounded-full bg-signal" />
                </span>
                {pausePending ? 'Pausing after the current step…' : 'Running now'}
              </p>
            )}
            <h2 className="mt-1 truncate font-serif text-xl font-medium">{run.automation_name}</h2>
            <p className="mt-0.5 text-xs text-ink-soft">Runs on our servers. You can close this tab and come back later.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:text-right">
            <div className="mr-1">
              <p className={cn('font-mono text-3xl font-semibold tabular-nums tracking-tight', run.paused && 'text-amber')} aria-live="off">
                {formatClock(left)}
              </p>
              <p className="text-xs text-ink-soft">{run.paused ? 'left (frozen)' : 'left'}</p>
            </div>
            {run.paused ? (
              <Button icon={Play} loading={resuming} onClick={handleResume}>Resume</Button>
            ) : (
              <Button variant="secondary" icon={Pause} loading={pausing} disabled={pausePending} onClick={handlePause}>
                {pausePending ? 'Pausing…' : 'Pause'}
              </Button>
            )}
            <Button variant="secondary" icon={Square} loading={stopping} onClick={handleStop}>Stop</Button>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-sunken" role="progressbar" aria-label="Time used" aria-valuenow={Math.round(elapsedPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear', run.paused ? 'bg-amber' : 'bg-signal')} style={{ width: `${elapsedPct}%` }} />
        </div>

        <div className="mt-5 rounded-control border border-line bg-paper-sunken/50 p-4">
          <CurrentActivity run={run} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Applied" value={`${submitted} / ${run.apply_limit}`} tone="text-signal-deep" />
          <Stat label="Sent to review" value={review} tone={review ? 'text-amber' : undefined} />
          <Stat label="Skipped (failed)" value={failed} tone={failed ? 'text-rust' : undefined} />
          <Stat label="New jobs found" value={scraped} />
        </div>

        {events.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-medium">Activity</p>
            <ul className="space-y-1.5">
              {events.map((e, i) => {
                const { icon: Icon, cls } = EVENT_ICONS[e.type] || EVENT_ICONS.info;
                return (
                  <li key={`${e.at}-${i}`} className="flex items-start gap-2 text-[13px]">
                    <Icon className={cn('mt-0.5 size-3.5 shrink-0', cls)} />
                    <span className="min-w-0 flex-1 text-ink">{e.message}</span>
                    <span className="shrink-0 tabular-nums text-xs text-ink-soft">{timeOf(e.at)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-[13px] font-medium">
          <Link to="/applications" className="text-signal-deep underline-offset-2 hover:underline">View applications</Link>
          <Link to="/review" className="text-signal-deep underline-offset-2 hover:underline">Open review queue</Link>
        </div>
      </Card>
    </motion.div>
  );
}
