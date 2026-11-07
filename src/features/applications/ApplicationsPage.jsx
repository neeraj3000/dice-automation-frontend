import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Compass,
  Edit3,
  ExternalLink,
  FileText,
  HelpCircle,
  History,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Chip, EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useGetApplicationsQuery,
  useRetryApplicationMutation,
  useStopApplicationMutation,
  useSubmitApplicationMutation,
  usePurgeStaleJobsMutation,
} from './applicationsApi';
import { STATUS_META } from './statusMeta';
import ReviewModal from './ReviewModal';
import TrackLinkedInModal from './TrackLinkedInModal';
import ApplicationHistoryModal from './ApplicationHistoryModal';
import UpdateStatusModal from './UpdateStatusModal';

const STATUS_FILTERS = [
  ['ALL', 'All Statuses'],
  ['PREPARING', 'In progress'],
  ['REVIEW', 'Needs input'],
  ['READY', 'Ready to submit'],
  ['APPLIED', 'Applied'],
  ['DISCOVERED', 'Tracked'],
  ['INTERVIEWING', 'Interviewing'],
  ['OFFER', 'Offer'],
  ['FAILED', 'Failed'],
  ['CANCELLED', 'Stopped'],
  ['SKIPPED', 'Skipped'],
];

const BOARD_FILTERS = [
  ['ALL', 'All Boards'],
  ['dice', 'Dice'],
  ['linkedin', 'LinkedIn'],
];

function ApplicationRow({
  app,
  onReview,
  onSubmitConfirm,
  onViewHistory,
  onUpdateStatus,
}) {
  const [open, setOpen] = useState(false);
  const [retry, { isLoading: retrying }] = useRetryApplicationMutation();
  const [stop, { isLoading: stopping }] = useStopApplicationMutation();
  const meta = STATUS_META[app.status] ?? STATUS_META.FAILED;

  const isLinkedIn =
    (app.board && app.board.toLowerCase() === 'linkedin') ||
    (app.source && app.source.toLowerCase() === 'linkedin') ||
    app.status_provenance === 'user_confirmed';

  const handleRetry = async () => {
    try {
      await retry(app.id).unwrap();
      toast.success('Retrying application…');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const handleStop = async () => {
    try {
      await stop(app.id).unwrap();
      toast.success('Automation stopped');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const jobLink = app.external_job_url || app.application_url || app.job_url || app.external_url;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-medium">{app.job_title}</h3>
            <Badge tone={meta.tone} dot>
              {meta.label}
            </Badge>

            {isLinkedIn && (
              <Badge tone="signal" className="gap-1 text-[11px]">
                <ShieldCheck className="size-3" />
                User Confirmed
              </Badge>
            )}

            {app.board && (
              <Badge tone="neutral" className="text-[10px] uppercase font-mono">
                {app.board}
              </Badge>
            )}

            {app.mode && !isLinkedIn && (
              <Badge tone="neutral" className="text-[10px]">
                {app.mode}
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-ink-soft">
            {[
              app.company,
              app.location,
              app.resume_name && `Resume: ${app.resume_name}`,
              timeAgo(app.confirmed_at || app.applied_at || app.created_at),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {app.notes && (
            <p className="mt-1 text-xs text-ink-soft italic bg-paper-sunken/40 px-2 py-1 rounded inline-block">
              "{app.notes}"
            </p>
          )}

          {!isLinkedIn && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm" aria-live="polite">
              {app.status === 'PREPARING' && <Loader2 className="size-3.5 animate-spin text-amber" />}
              {app.status === 'REVIEW' && <HelpCircle className="size-3.5 text-amber" />}
              {app.steps?.length && app.status === 'PREPARING'
                ? app.steps[app.steps.length - 1].message
                : app.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* LinkedIn Specific Actions */}
          {isLinkedIn ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                icon={Edit3}
                onClick={() => onUpdateStatus(app)}
              >
                Update Status
              </Button>

              <Button
                size="sm"
                variant="secondary"
                icon={History}
                onClick={() => onViewHistory(app)}
              >
                History
              </Button>

              {jobLink && (
                <a href={jobLink} target="_blank" rel="noreferrer noopener">
                  <Button size="sm" variant="ghost" icon={ExternalLink}>
                    LinkedIn Job
                  </Button>
                </a>
              )}
            </>
          ) : (
            /* Dice Automation Actions */
            <>
              {app.status === 'REVIEW' && !app.external_url && (
                <Button size="sm" onClick={() => onReview(app)}>
                  Answer questions
                </Button>
              )}
              {app.external_url && (
                <a href={app.external_url} target="_blank" rel="noreferrer noopener">
                  <Button size="sm" variant="secondary" icon={ExternalLink}>
                    Apply on site
                  </Button>
                </a>
              )}
              {app.status === 'READY' && (
                <Button size="sm" onClick={() => onSubmitConfirm(app)}>
                  Submit application
                </Button>
              )}
              {app.status === 'PREPARING' && (
                <Button size="sm" variant="secondary" icon={Square} loading={stopping} onClick={handleStop}>
                  Stop
                </Button>
              )}
              {(app.status === 'FAILED' || app.status === 'CANCELLED') && (
                <Button size="sm" variant="secondary" loading={retrying} onClick={handleRetry}>
                  Try again
                </Button>
              )}
              {app.steps?.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-expanded={open}
                  aria-label="Show activity"
                  onClick={() => setOpen(!open)}
                >
                  <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {!isLinkedIn && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-1.5 overflow-hidden border-t border-line pt-3"
            >
              {app.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-ink-soft">
                  <span className="w-16 shrink-0 tabular-nums">
                    {new Date(s.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>{s.message}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </Card>
  );
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading, isFetching, refetch } = useGetApplicationsQuery(undefined, {
    refetchOnMountOrArgChange: 30, // Only re-fetch if data is older than 30 seconds
  });
  const [submitApp, { isLoading: submitting }] = useSubmitApplicationMutation();
  const [purgeStaleJobs, { isLoading: purging }] = usePurgeStaleJobsMutation();

  const [filter, setFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');

  // Modal states
  const [trackLinkedInOpen, setTrackLinkedInOpen] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [confirmSubmitApp, setConfirmSubmitApp] = useState(null);
  const [historyApp, setHistoryApp] = useState(null);
  const [updateStatusApp, setUpdateStatusApp] = useState(null);

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter(
      (a) => a.status === 'APPLIED' || a.raw_status === 'APPLIED' || a.raw_status === 'SUBMITTED'
    ).length;
    const ready = applications.filter((a) => a.status === 'READY').length;
    const review = applications.filter((a) => a.status === 'REVIEW').length;
    const linkedin = applications.filter(
      (a) => (a.board && a.board.toLowerCase() === 'linkedin') || (a.source && a.source.toLowerCase() === 'linkedin')
    ).length;
    return { total, applied, ready, review, linkedin };
  }, [applications]);

  const items = useMemo(() => {
    return applications.filter((a) => {
      const matchStatus = filter === 'ALL' || a.status === filter || a.raw_status === filter;
      const appBoard = (a.board || a.source || '').toLowerCase();
      const matchBoard = boardFilter === 'ALL' || appBoard === boardFilter.toLowerCase();
      return matchStatus && matchBoard;
    });
  }, [applications, filter, boardFilter]);

  const handleSubmitVerified = async () => {
    if (!confirmSubmitApp) return;
    try {
      await submitApp(confirmSubmitApp.id).unwrap();
      toast.success(`Submitting to ${confirmSubmitApp.company}. We'll let you know when it's done.`);
      setConfirmSubmitApp(null);
      refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const handlePurgeStaleJobs = async () => {
    try {
      const result = await purgeStaleJobs(72).unwrap();
      const deleted = result?.deleted ?? 0;
      if (deleted > 0) {
        toast.success(`Removed ${deleted} stale job listing(s) older than 72 hours.`);
        refetch();
      } else {
        toast.success('No stale jobs found — your queue is clean!');
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      <PageHeader
        title="Application Tracker"
        description="Monitor automated Dice submissions and track user-confirmed LinkedIn applications in one place."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setTrackLinkedInOpen(true)}
            >
              Track LinkedIn Application
            </Button>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              icon={Square}
              loading={purging}
              onClick={handlePurgeStaleJobs}
              title="Remove unapplied job listings older than 72 hours that Dice no longer accepts"
            >
              Clear Stale Jobs
            </Button>
            <Button variant="secondary" icon={Compass} onClick={() => navigate('/jobs')}>
              Jobs Explorer
            </Button>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Total Applications
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{stats.total}</p>
        </Card>
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Confirmed / Applied
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
            {stats.applied}
          </p>
        </Card>
        <Card className="p-5 border-blue-500/20 bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Ready to Submit (Dice)
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-blue-800 dark:text-blue-300">
            {stats.ready}
          </p>
        </Card>
        <Card className="p-5 border-amber/20 bg-amber-soft/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber">
            LinkedIn Tracked
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-amber">
            {stats.linkedin}
          </p>
        </Card>
      </div>

      {/* Board & Status Filter Controls */}
      <div className="flex flex-col gap-3">
        {/* Board Source Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft mr-1">
            Board:
          </span>
          {BOARD_FILTERS.map(([v, l]) => {
            const count =
              v === 'ALL'
                ? applications.length
                : applications.filter(
                    (a) => (a.board && a.board.toLowerCase() === v) || (a.source && a.source.toLowerCase() === v)
                  ).length;
            return (
              <Chip
                key={v}
                active={boardFilter === v}
                onClick={() => setBoardFilter(v)}
              >
                {l} {count > 0 ? `(${count})` : ''}
              </Chip>
            );
          })}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft mr-1">
            Status:
          </span>
          {STATUS_FILTERS.map(([v, l]) => {
            const count =
              v === 'ALL'
                ? applications.length
                : applications.filter((a) => a.status === v || a.raw_status === v).length;
            if (count === 0 && v !== 'ALL' && v !== 'PREPARING' && v !== 'APPLIED') return null;
            return (
              <Chip key={v} active={filter === v} onClick={() => setFilter(v)}>
                {l} {count > 0 ? `(${count})` : ''}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)
        ) : items.length ? (
          items.map((a) => (
            <ApplicationRow
              key={a.id}
              app={a}
              onReview={setReviewing}
              onSubmitConfirm={setConfirmSubmitApp}
              onViewHistory={setHistoryApp}
              onUpdateStatus={setUpdateStatusApp}
            />
          ))
        ) : (
          <EmptyState
            icon={ListChecks}
            title={
              boardFilter === 'linkedin'
                ? 'No LinkedIn applications tracked yet'
                : 'No applications found'
            }
            description={
              boardFilter === 'linkedin'
                ? 'Click "Track LinkedIn Application" to record jobs you applied to or discovered on LinkedIn.'
                : 'Track LinkedIn applications or prepare automated applications from Jobs Explorer.'
            }
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  icon={Plus}
                  onClick={() => setTrackLinkedInOpen(true)}
                >
                  Track LinkedIn Application
                </Button>
                <Button
                  variant="secondary"
                  icon={Compass}
                  onClick={() => navigate('/jobs')}
                >
                  Go to Jobs Explorer
                </Button>
              </div>
            }
          />
        )}
      </div>

      {/* Track LinkedIn Application Modal */}
      <TrackLinkedInModal
        open={trackLinkedInOpen}
        onClose={() => setTrackLinkedInOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Status History Modal */}
      <ApplicationHistoryModal
        application={historyApp}
        onClose={() => setHistoryApp(null)}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        application={updateStatusApp}
        onClose={() => setUpdateStatusApp(null)}
        onSuccess={() => refetch()}
      />

      {/* Review Modal (Dice) */}
      <ReviewModal
        key={reviewing?.id}
        application={reviewing}
        onClose={() => {
          setReviewing(null);
          refetch();
        }}
      />

      {/* Submission Protection Confirmation Modal (Dice) */}
      <Modal
        open={Boolean(confirmSubmitApp)}
        onClose={() => setConfirmSubmitApp(null)}
        title="Execute Final Submission?"
        description={`Submit application for ${confirmSubmitApp?.job_title} at ${confirmSubmitApp?.company}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmSubmitApp(null)}>
              Cancel
            </Button>
            <Button icon={Send} loading={submitting} onClick={handleSubmitVerified}>
              Confirm & Submit to Dice
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft leading-relaxed">
          The Playwright automation agent will open your authenticated session, attach the matched candidate resume, and execute the final submission step on Dice.com.
        </p>
      </Modal>
    </div>
  );
}
