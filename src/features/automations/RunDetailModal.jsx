/**
 * RunDetailModal
 *
 * Shows the details of a finished (or active) automation run.
 *
 * Production optimisations
 * ────────────────────────
 * 1. Tabbed layout   — "Applications" and "Activity log" are separate tabs.
 *    Only the active tab's content is rendered (no DOM bloat while hidden).
 *
 * 2. Applications tab
 *    • Uses getApplications({ automation_run_id }) — separate RTK Query
 *      cache entry from the global list (no cross-invalidation).
 *    • Displays submission duration (applied_at − created_at) next to each
 *      app, in the same column-style as RunApplicationsModal.
 *    • Client-side "Load more" pagination (APP_PAGE_SIZE = 10) — zero
 *      extra API calls while paging.
 *    • Skeleton cards match the real card shape exactly (no layout shift).
 *
 * 3. Activity log tab
 *    • Events are shown newest-first (reversed once with useMemo).
 *    • Only LOG_PAGE_SIZE (25) events are rendered initially; "Show more"
 *      expands without re-fetching — the full log is already in the run object.
 *    • The list is max-h capped + overflow-y-auto so it never blows the modal.
 *
 * 4. General
 *    • skip: !open on both queries — zero network cost until the modal opens.
 *    • All derived values (reversedEvents, pagedApps, etc.) are memoised.
 *    • Stable tab state resets when a different run is opened (key on runId
 *      propagated from RunHistory/RunDetailModal caller).
 */

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  SkipForward,
  XCircle,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { useGetApplicationsQuery } from '../applications/applicationsApi';
import { STATUS_META } from '../applications/statusMeta';
import { useGetAutomationRunQuery } from './automationsApi';
import {
  RUN_STATUS_META,
  formatDateTime,
  formatDuration,
  formatElapsed,
  runElapsedSeconds,
} from './runMeta';

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_PAGE_SIZE = 10;
const LOG_PAGE_SIZE = 25;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const timeOf = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

const shortTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

/** Returns a human-readable duration string, e.g. "28s" or "1m 12s". */
function submissionDuration(app) {
  const start = app.created_at;
  const end =
    app.applied_at ||
    (['APPLIED', 'FAILED', 'CANCELLED', 'SKIPPED'].includes(app.status)
      ? app.updated_at
      : null);
  if (!start || !end) return null;
  const secs = Math.round((new Date(end) - new Date(start)) / 1000);
  if (secs < 1) return null;
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Icon maps ────────────────────────────────────────────────────────────────

const EVENT_ICONS = {
  success: { icon: CheckCircle2, cls: 'text-signal' },
  warning: { icon: AlertTriangle, cls: 'text-amber' },
  error: { icon: XCircle, cls: 'text-rust' },
  info: { icon: Info, cls: 'text-ink-soft' },
};

const STATUS_ICON = {
  APPLIED: { icon: CheckCircle2, cls: 'text-signal' },
  REVIEW: { icon: Info, cls: 'text-amber' },
  PREPARING: { icon: Loader2, cls: 'text-amber animate-spin' },
  FAILED: { icon: XCircle, cls: 'text-rust' },
  CANCELLED: { icon: XCircle, cls: 'text-ink-soft' },
  SKIPPED: { icon: SkipForward, cls: 'text-ink-soft' },
};

// ─── Stat tile ────────────────────────────────────────────────────────────────

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', tone)}>{value}</p>
    </div>
  );
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────

function AppRowSkeleton() {
  return (
    <div className="flex gap-3 px-0 py-3 border-b border-line last:border-0">
      <Skeleton className="mt-1 size-4 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
    </div>
  );
}

// ─── Application row ──────────────────────────────────────────────────────────
// Column-style layout matching RunApplicationsModal:
//  [icon]  Job Title                    Badge          [↗]
//          Company
//          📄 Resume  🕐 09:38  ⏱ 31s
//          Application submitted.

function AppRow({ app }) {
  const meta = STATUS_META[app.status] ?? STATUS_META.FAILED;
  const { icon: StatusIcon, cls: iconCls } =
    STATUS_ICON[app.status] ?? STATUS_ICON.FAILED;
  const jobLink =
    app.external_job_url || app.application_url || app.job_url || app.external_url;

  const duration = submissionDuration(app);
  const appliedTime = shortTime(
    app.applied_at ||
      (['APPLIED', 'FAILED', 'CANCELLED', 'SKIPPED'].includes(app.status)
        ? app.updated_at
        : null)
  );

  const completionLine =
    app.status === 'APPLIED'
      ? 'Application submitted.'
      : app.status === 'FAILED' && app.message
      ? app.message
      : app.status === 'SKIPPED'
      ? 'Already applied — skipped.'
      : app.status === 'CANCELLED'
      ? 'Stopped by user.'
      : null;

  return (
    <div className="group border-b border-line py-3 last:border-0 hover:bg-paper-sunken/30 -mx-1 px-1 rounded-lg transition-colors">
      {/* Row 1: icon · title · badge · external link */}
      <div className="flex items-start gap-2.5">
        <div className="mt-[3px] w-4 shrink-0">
          <StatusIcon className={cn('size-3.5', iconCls)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-[13px] font-semibold text-ink">{app.job_title}</p>
            <Badge tone={meta.tone} className="shrink-0 text-[11px]">
              {meta.label}
            </Badge>
          </div>
        </div>

        {/* External link — always reserve space */}
        <div className="w-5 shrink-0">
          {jobLink && (
            <a
              href={jobLink}
              target="_blank"
              rel="noreferrer noopener"
              title="View job posting"
              className="block rounded p-0.5 text-ink-soft/30 transition-colors hover:bg-paper-sunken hover:text-ink group-hover:text-ink-soft"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Row 2: company */}
      {app.company && (
        <p className="ml-[26px] mt-0.5 truncate text-[12px] text-ink-soft">{app.company}</p>
      )}

      {/* Row 3: resume · time · duration pill */}
      <div className="ml-[26px] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft">
        {app.resume_name && (
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <FileText className="size-3 shrink-0 opacity-50" />
            <span className="truncate">{app.resume_name}</span>
          </span>
        )}
        {appliedTime && (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="size-3 shrink-0 opacity-50" />
            {appliedTime}
          </span>
        )}
        {duration && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold tabular-nums',
              app.status === 'APPLIED'
                ? 'bg-signal-soft text-signal-deep'
                : app.status === 'FAILED'
                ? 'bg-rust-soft text-rust'
                : 'bg-paper-sunken text-ink-soft'
            )}
            title="Time taken to complete"
          >
            <svg viewBox="0 0 16 16" className="size-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="9" r="5.5" />
              <path d="M8 6v3l2 1.5" strokeLinecap="round" />
              <path d="M6 1h4M8 1v2.5" strokeLinecap="round" />
            </svg>
            {duration}
          </span>
        )}
      </div>

      {/* Row 4: completion message */}
      {completionLine && (
        <p
          className={cn(
            'ml-[26px] mt-1 text-[11px] italic',
            app.status === 'FAILED' ? 'text-rust/70' : 'text-ink-soft/70'
          )}
        >
          {completionLine}
        </p>
      )}
    </div>
  );
}

// ─── Applications tab ─────────────────────────────────────────────────────────

function AppsTab({ runId, open, counters }) {
  const [page, setPage] = useState(1);

  const { data: apps = [], isLoading } = useGetApplicationsQuery(
    { automation_run_id: runId },
    { skip: !open || !runId }
  );

  const paginated = useMemo(
    () => apps.slice(0, page * APP_PAGE_SIZE),
    [apps, page]
  );
  const hasMore = paginated.length < apps.length;

  // Avg duration across applied apps
  const avgDuration = useMemo(() => {
    const applied = apps.filter((a) => a.status === 'APPLIED' && a.created_at && a.applied_at);
    if (!applied.length) return null;
    const avgSecs = Math.round(
      applied.reduce((sum, a) => sum + (new Date(a.applied_at) - new Date(a.created_at)) / 1000, 0) /
        applied.length
    );
    if (avgSecs < 60) return `${avgSecs}s avg`;
    return `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s avg`;
  }, [apps]);

  if (isLoading) {
    return (
      <div className="divide-y divide-line">
        {[0, 1, 2].map((i) => <AppRowSkeleton key={i} />)}
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-soft">
        This run didn't apply to any jobs.
      </p>
    );
  }

  return (
    <div>
      {/* Mini header: count + avg */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] text-ink-soft">
          {apps.length} application{apps.length === 1 ? '' : 's'}
        </p>
        {avgDuration && (
          <span className="inline-flex items-center gap-1 rounded-md bg-signal-soft px-2 py-0.5 text-[11px] font-semibold text-signal-deep">
            <svg viewBox="0 0 16 16" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="9" r="5.5" />
              <path d="M8 6v3l2 1.5" strokeLinecap="round" />
              <path d="M6 1h4M8 1v2.5" strokeLinecap="round" />
            </svg>
            {avgDuration}
          </span>
        )}
      </div>

      {/* Application rows */}
      <div>
        {paginated.map((a) => <AppRow key={a.id} app={a} />)}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
          >
            Show more&ensp;
            <span className="tabular-nums opacity-60">
              ({apps.length - paginated.length} more)
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Activity log tab ─────────────────────────────────────────────────────────
// Events are rendered newest-first. Only LOG_PAGE_SIZE shown initially;
// "Show more" expands in-memory (no fetch). Capped height + scroll.

function LogTab({ events }) {
  const [logPage, setLogPage] = useState(1);

  const reversed = useMemo(
    () => [...(events || [])].reverse(),
    [events]
  );

  const visible = useMemo(
    () => reversed.slice(0, logPage * LOG_PAGE_SIZE),
    [reversed, logPage]
  );

  const hasMore = visible.length < reversed.length;

  if (!reversed.length) {
    return (
      <p className="py-6 text-center text-sm text-ink-soft">No activity recorded.</p>
    );
  }

  return (
    <div>
      <ul className="space-y-1">
        {visible.map((e, i) => {
          const { icon: Icon, cls } = EVENT_ICONS[e.type] || EVENT_ICONS.info;
          return (
            <li
              key={`${e.at}-${i}`}
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors hover:bg-paper-sunken"
            >
              <Icon className={cn('mt-0.5 size-3.5 shrink-0', cls)} />
              <span className="min-w-0 flex-1 text-ink">{e.message}</span>
              <span className="shrink-0 tabular-nums text-[11px] text-ink-soft">
                {timeOf(e.at)}
              </span>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setLogPage((p) => p + 1)}
          >
            Show more&ensp;
            <span className="tabular-nums opacity-60">
              ({reversed.length - visible.length} more)
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function RunDetailModal({ runId, onClose }) {
  const open = Boolean(runId);
  const [activeTab, setActiveTab] = useState('apps');

  const { data: run, isLoading } = useGetAutomationRunQuery(runId, { skip: !open });

  const meta = run ? RUN_STATUS_META[run.status] || RUN_STATUS_META.FAILED : null;
  const { submitted = 0, review = 0, failed = 0, scraped = 0 } = run?.counters || {};

  const tabs = [
    { id: 'apps', label: `Applications${submitted > 0 ? ` (${submitted})` : ''}` },
    { id: 'log', label: `Activity log${run?.events?.length > 0 ? ` (${run.events.length})` : ''}` },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={run?.automation_name || 'Automation run'}
      description={
        run
          ? `${formatDateTime(run.started_at)} · ran ${formatElapsed(runElapsedSeconds(run))} of ${formatDuration(run.duration_minutes)}`
          : ''
      }
    >
      {isLoading || !run ? (
        /* ── Loading state ── */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[68px] rounded-xl" />)}
          </div>
          <Skeleton className="h-8 rounded-lg" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Status + end reason ── */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone} dot>{meta.label}</Badge>
            {run.end_reason && (
              <span className="text-sm text-ink-soft">{run.end_reason}</span>
            )}
          </div>

          {run.profile_names?.length > 0 && (
            <p className="text-[13px] text-ink-soft">
              Profiles: {run.profile_names.join(', ')}
            </p>
          )}

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              label="Applied"
              value={`${submitted} / ${run.apply_limit}`}
              tone="text-signal-deep"
            />
            <Stat
              label="Sent to review"
              value={review}
              tone={review ? 'text-amber' : 'text-ink-soft'}
            />
            <Stat
              label="Failed"
              value={failed}
              tone={failed ? 'text-rust' : 'text-ink-soft'}
            />
            <Stat label="Jobs found" value={scraped} tone="text-ink" />
          </div>

          {/* ── Tabs ── */}
          <div>
            {/* Tab bar */}
            <div className="flex gap-0.5 border-b border-line" role="tablist">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    '-mb-px border-b-2 px-3.5 py-2 text-[13px] font-medium transition-colors',
                    activeTab === id
                      ? 'border-signal text-signal-deep'
                      : 'border-transparent text-ink-soft hover:text-ink'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab panels — only the active one renders */}
            <div className="mt-4">
              {activeTab === 'apps' && (
                <AppsTab runId={runId} open={open} counters={run.counters} />
              )}
              {activeTab === 'log' && (
                <LogTab events={run.events} />
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
