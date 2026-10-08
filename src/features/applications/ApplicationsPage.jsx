import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Compass,
  ExternalLink,
  FileText,
  HelpCircle,
  ListChecks,
  Loader2,
  RefreshCw,
  Send,
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
  useSubmitApplicationMutation,
} from './applicationsApi';
import { STATUS_META } from './statusMeta';
import ReviewModal from './ReviewModal';

const BASE_FILTERS = [
  ['ALL', 'All'],
  ['PREPARING', 'In progress'],
  ['REVIEW', 'Needs input'],
  ['READY', 'Ready to submit'],
  ['APPLIED', 'Applied'],
  ['FAILED', 'Failed'],
];

function ApplicationRow({ app, onReview, onSubmitConfirm }) {
  const [open, setOpen] = useState(false);
  const [retry, { isLoading: retrying }] = useRetryApplicationMutation();
  const meta = STATUS_META[app.status] ?? STATUS_META.FAILED;

  const handleRetry = async () => {
    try {
      await retry(app.id).unwrap();
      toast.success('Retrying application…');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-medium">{app.job_title}</h3>
            <Badge tone={meta.tone} dot>
              {meta.label}
            </Badge>
            {app.mode && (
              <Badge tone="neutral" className="text-[10px]">
                {app.mode}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {[
              app.company,
              app.resume_name && `Resume: ${app.resume_name}`,
              app.board && app.board[0].toUpperCase() + app.board.slice(1),
              timeAgo(app.created_at || app.applied_at),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm" aria-live="polite">
            {app.status === 'PREPARING' && <Loader2 className="size-3.5 animate-spin text-amber" />}
            {app.status === 'REVIEW' && <HelpCircle className="size-3.5 text-amber" />}
            {app.steps?.length && app.status === 'PREPARING'
              ? app.steps[app.steps.length - 1].message
              : app.message}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
          {app.status === 'FAILED' && (
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
        </div>
      </div>

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
    </Card>
  );
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading, isFetching, refetch } = useGetApplicationsQuery();
  const [submitApp, { isLoading: submitting }] = useSubmitApplicationMutation();

  const [filter, setFilter] = useState('ALL');
  const [reviewing, setReviewing] = useState(null);
  const [confirmSubmitApp, setConfirmSubmitApp] = useState(null);

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'APPLIED').length;
    const ready = applications.filter((a) => a.status === 'READY').length;
    const review = applications.filter((a) => a.status === 'REVIEW').length;
    return { total, applied, ready, review };
  }, [applications]);

  const items = applications.filter((a) => filter === 'ALL' || a.status === filter);

  const handleSubmitVerified = async () => {
    if (!confirmSubmitApp) return;
    try {
      await submitApp(confirmSubmitApp.id).unwrap();
      toast.success(`Application submitted to ${confirmSubmitApp.company}!`);
      setConfirmSubmitApp(null);
      refetch();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Tracker"
        description="Verify prepared forms, review automation logs, and execute verified submissions on Dice."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button variant="secondary" icon={Compass} onClick={() => navigate('/jobs')}>
              Jobs Explorer
            </Button>
          </div>
        }
      />

      {/* Top 4 Stat Cards matching Screenshot 3 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Total Applications
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{stats.total}</p>
        </Card>
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Submitted (Applied)
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
            {stats.applied}
          </p>
        </Card>
        <Card className="p-5 border-blue-500/20 bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Ready to Submit
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-blue-800 dark:text-blue-300">
            {stats.ready}
          </p>
        </Card>
        <Card className="p-5 border-amber/20 bg-amber-soft/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber">
            Needs Review
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-amber">
            {stats.review}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {BASE_FILTERS.map(([v, l]) => {
          const count = v === 'ALL' ? applications.length : applications.filter((a) => a.status === v).length;
          return (
            <Chip key={v} active={filter === v} onClick={() => setFilter(v)}>
              {l} {count > 0 ? `(${count})` : ''}
            </Chip>
          );
        })}
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
            />
          ))
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No applications tracked yet"
            description="Go to the Jobs Explorer and click 'Prepare Apply' or 'Apply' on any matched job."
            action={
              <Button icon={Compass} onClick={() => navigate('/jobs')}>
                Go to Jobs Explorer
              </Button>
            }
          />
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        key={reviewing?.id}
        application={reviewing}
        onClose={() => {
          setReviewing(null);
          refetch();
        }}
      />

      {/* Submission Protection Confirmation Modal */}
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
