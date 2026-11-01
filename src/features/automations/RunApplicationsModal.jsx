/**
 * RunApplicationsModal
 *
 * Shows applications from a specific automation run inline on the
 * Automations page — no navigation required.
 *
 * Data strategy
 * ─────────────
 * • RTK Query: getApplications({ automation_run_id }) → separate cache
 *   entry from the global list, zero collision, no repeated fetches.
 * • skip: !open  → deferred until the modal is actually opened.
 * • pollingInterval 30 s while a run is live → live updates without
 *   the user having to manually refresh.
 * • Client-side pagination (slice) → no extra API calls while paging.
 */

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  SkipForward,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Skeleton, EmptyState, Chip } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { timeAgo } from '../../lib/format';
import { useGetApplicationsQuery } from '../applications/applicationsApi';
import { STATUS_META } from '../applications/statusMeta';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

/**
 * Computes how long an application took to reach its terminal state.
 * Returns a human-readable string like "28s" or "1m 12s", or null.
 */
function submissionDuration(app) {
  const start = app.created_at;
  // Prefer applied_at for successful apps; fall back to updated_at for
  // failed/cancelled so we always show a duration for terminal states.
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

/** Formats a timestamp to a short time string. */
const shortTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

// Status → icon mapping used inside cards
const STATUS_ICON = {
  APPLIED: { icon: CheckCircle2, cls: 'text-signal' },
  REVIEW: { icon: HelpCircle, cls: 'text-amber' },
  PREPARING: { icon: Loader2, cls: 'text-amber animate-spin' },
  FAILED: { icon: XCircle, cls: 'text-rust' },
  CANCELLED: { icon: XCircle, cls: 'text-ink-soft' },
  SKIPPED: { icon: SkipForward, cls: 'text-ink-soft' },
};

const STATUS_FILTERS = [
  ['ALL', 'All'],
  ['PREPARING', 'In progress'],
  ['REVIEW', 'Needs input'],
  ['APPLIED', 'Applied'],
  ['FAILED', 'Failed'],
  ['CANCELLED', 'Stopped'],
  ['SKIPPED', 'Skipped'],
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

function AppCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-line bg-paper p-4">
      <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
    </div>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────
// Layout (matches screenshot):
//  [icon]  Job Title                    Badge          [↗]
//          Company
//          [📄] Resume name  [🕐] 09:38  [⏱ 31s]
//          Application submitted.   ← italic, only for terminal states

function AppCard({ app }) {
  const meta = STATUS_META[app.status] ?? STATUS_META.FAILED;
  const { icon: StatusIcon, cls: iconCls } =
    STATUS_ICON[app.status] ?? STATUS_ICON.FAILED;
  const jobLink =
    app.external_job_url ||
    app.application_url ||
    app.job_url ||
    app.external_url;

  const duration = submissionDuration(app);
  const appliedTime = shortTime(
    app.applied_at ||
      (['APPLIED', 'FAILED', 'CANCELLED', 'SKIPPED'].includes(app.status)
        ? app.updated_at
        : null)
  );

  // Friendly completion line shown below the meta row
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.16 }}
    >
      <div className="group rounded-xl border border-line bg-paper px-4 py-3.5 transition-colors hover:border-line-strong hover:bg-paper-raised">
        {/* ── Row 1: icon · title · badge · external link ── */}
        <div className="flex items-start gap-3">
          {/* Status icon — fixed width so titles stay aligned */}
          <div className="mt-[3px] w-4 shrink-0">
            <StatusIcon className={cn('size-4', iconCls)} />
          </div>

          {/* Title + badge */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="truncate text-[14px] font-semibold leading-tight text-ink">
                {app.job_title}
              </h4>
              <Badge tone={meta.tone} className="shrink-0 text-[11px]">
                {meta.label}
              </Badge>
            </div>
          </div>

          {/* External link — always reserve its space to keep alignment consistent */}
          <div className="w-5 shrink-0">
            {jobLink && (
              <a
                href={jobLink}
                target="_blank"
                rel="noreferrer noopener"
                title="View job posting"
                className="block rounded p-0.5 text-ink-soft/40 transition-colors hover:bg-paper-sunken hover:text-ink group-hover:text-ink-soft"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ── Row 2: company ── */}
        {app.company && (
          <p className="ml-7 mt-0.5 truncate text-[13px] text-ink-soft">
            {app.company}
          </p>
        )}

        {/* ── Row 3: resume · submitted-time · duration pill ── */}
        <div className="ml-7 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-soft">
          {app.resume_name && (
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <FileText className="size-3 shrink-0 opacity-50" />
              <span className="truncate">{app.resume_name}</span>
            </span>
          )}

          {appliedTime && (
            <span className="inline-flex shrink-0 items-center gap-1.5">
              <Clock className="size-3 shrink-0 opacity-50" />
              {appliedTime}
            </span>
          )}

          {duration && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                app.status === 'APPLIED'
                  ? 'bg-signal-soft text-signal-deep'
                  : app.status === 'FAILED'
                  ? 'bg-rust-soft text-rust'
                  : 'bg-paper-sunken text-ink-soft'
              )}
              title="Time taken to complete"
            >
              {/* Inline timer icon character to keep it tight */}
              <svg viewBox="0 0 16 16" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="9" r="5.5" />
                <path d="M8 6v3l2 1.5" strokeLinecap="round" />
                <path d="M6 1h4M8 1v2.5" strokeLinecap="round" />
              </svg>
              {duration}
            </span>
          )}
        </div>

        {/* ── Row 4: completion message ── */}
        {completionLine && (
          <p
            className={cn(
              'ml-7 mt-1.5 text-[12px] italic',
              app.status === 'FAILED' ? 'text-rust/70' : 'text-ink-soft/70'
            )}
          >
            {completionLine}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Summary stats bar ────────────────────────────────────────────────────────

function SummaryBar({ apps }) {
  const stats = useMemo(() => {
    const applied = apps.filter((a) => a.status === 'APPLIED');
    const review = apps.filter((a) => a.status === 'REVIEW').length;
    const failed = apps.filter((a) => a.status === 'FAILED').length;
    const skipped = apps.filter((a) => a.status === 'SKIPPED').length;
    const inProgress = apps.filter((a) => a.status === 'PREPARING').length;

    // Average submission duration for successfully applied jobs
    const durations = applied
      .map((a) => {
        if (!a.created_at || !a.applied_at) return null;
        return (new Date(a.applied_at) - new Date(a.created_at)) / 1000;
      })
      .filter((d) => d !== null && d > 0);
    const avgSecs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;
    const avgDuration =
      avgSecs !== null
        ? avgSecs < 60
          ? `${avgSecs}s`
          : `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s`
        : null;

    return { applied: applied.length, review, failed, skipped, inProgress, avgDuration };
  }, [apps]);

  const tiles = [
    {
      label: 'Applied',
      value: stats.applied,
      tone: 'text-signal-deep',
      border: 'border-signal/20 bg-signal-soft/30',
    },
    {
      label: 'Needs input',
      value: stats.review,
      tone: stats.review ? 'text-amber' : 'text-ink-soft',
      border: stats.review ? 'border-amber/20 bg-amber-soft/30' : '',
    },
    {
      label: 'Failed',
      value: stats.failed,
      tone: stats.failed ? 'text-rust' : 'text-ink-soft',
      border: stats.failed ? 'border-rust/20 bg-rust-soft/20' : '',
    },
    {
      label: 'Avg. time',
      value: stats.avgDuration ?? '—',
      tone: stats.avgDuration ? 'text-ink' : 'text-ink-soft',
      border: '',
      sub: 'per application',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map(({ label, value, tone, border, sub }) => (
        <div
          key={label}
          className={cn(
            'rounded-xl border border-line bg-paper px-3.5 py-3 transition-colors',
            border
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            {label}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', tone)}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-[11px] text-ink-soft">{sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton summary ─────────────────────────────────────────────────────────

function SummaryBarSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[72px] rounded-xl" />
      ))}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function RunApplicationsModal({ open, onClose, run }) {
  const runId = run?.id;

  const {
    data: allApps = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetApplicationsQuery(
    { automation_run_id: runId },
    {
      skip: !open || !runId,
      // Live-poll while the run is active so new apps surface automatically.
      pollingInterval: run?.phase ? 30_000 : 0,
    }
  );

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const handleFilterChange = (f) => {
    setStatusFilter(f);
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return allApps;
    return allApps.filter(
      (a) => a.status === statusFilter || a.raw_status === statusFilter
    );
  }, [allApps, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );
  const hasMore = paginated.length < filtered.length;

  // Only render chips that have matching apps (always keep ALL + PREPARING + APPLIED)
  const always = new Set(['ALL', 'PREPARING', 'APPLIED']);
  const visibleFilters = STATUS_FILTERS.filter(
    ([v]) => always.has(v) || allApps.some((a) => a.status === v || a.raw_status === v)
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={
        run?.automation_name
          ? `Applications · ${run.automation_name}`
          : 'Run Applications'
      }
      description={
        !isLoading && allApps.length > 0
          ? `${allApps.length} application${allApps.length === 1 ? '' : 's'} from this session`
          : undefined
      }
    >
      <div className="space-y-5">
        {/* Summary stats */}
        {isLoading ? (
          <SummaryBarSkeleton />
        ) : allApps.length > 0 ? (
          <SummaryBar apps={allApps} />
        ) : null}

        {/* Filter chips + refresh */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {visibleFilters.map(([v, label]) => {
              const count =
                v === 'ALL'
                  ? allApps.length
                  : allApps.filter(
                      (a) => a.status === v || a.raw_status === v
                    ).length;
              return (
                <Chip
                  key={v}
                  active={statusFilter === v}
                  onClick={() => handleFilterChange(v)}
                >
                  {label}
                  {count > 0 && (
                    <span className="ml-1 tabular-nums opacity-70">
                      {count}
                    </span>
                  )}
                </Chip>
              );
            })}
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={isFetching}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-soft transition hover:bg-paper-sunken hover:text-ink disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Divider */}
        {!isLoading && allApps.length > 0 && (
          <div className="-mx-1 border-t border-line" />
        )}

        {/* Application list */}
        <div className="space-y-2">
          {isLoading ? (
            [0, 1, 2, 3].map((i) => <AppCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={
                statusFilter === 'ALL'
                  ? 'No applications yet'
                  : `No "${
                      STATUS_META[statusFilter]?.label?.toLowerCase() ??
                      statusFilter
                    }" applications`
              }
              description={
                statusFilter === 'ALL'
                  ? 'Applications will appear here as the automation works through jobs.'
                  : 'Try "All" to see everything from this run.'
              }
            />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {paginated.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-1">
            <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
              Load more&ensp;
              <span className="tabular-nums opacity-60">
                ({filtered.length - paginated.length} more)
              </span>
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
