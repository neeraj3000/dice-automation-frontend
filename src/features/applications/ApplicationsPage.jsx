import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink, HelpCircle, ListChecks, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Chip, EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { errorMessage, timeAgo } from '../../lib/format';
import { useGetApplicationsQuery, useRetryApplicationMutation, useSubmitApplicationMutation } from './applicationsApi';
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

function Row({ app, onReview }) {
  const [open, setOpen] = useState(false);
  const [submit, { isLoading: submitting }] = useSubmitApplicationMutation();
  const [retry, { isLoading: retrying }] = useRetryApplicationMutation();
  const meta = STATUS_META[app.status] ?? STATUS_META.FAILED;
  const act = async (fn) => {
    try {
      await fn(app.id).unwrap();
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
            <Badge tone={meta.tone} dot>{meta.label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">
            {[app.company, app.board && app.board[0].toUpperCase() + app.board.slice(1), timeAgo(app.created_at)]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm" aria-live="polite">
            {app.status === 'PREPARING' && <Loader2 className="size-3.5 animate-spin text-amber" />}
            {app.status === 'REVIEW' && <HelpCircle className="size-3.5 text-amber" />}
            {app.steps?.length && app.status === 'PREPARING' ? app.steps[app.steps.length - 1].message : app.message}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {app.status === 'REVIEW' && !app.external_url && (
            <Button size="sm" onClick={() => onReview(app)}>Answer questions</Button>
          )}
          {app.external_url && (
            <a href={app.external_url} target="_blank" rel="noreferrer noopener">
              <Button size="sm" variant="secondary" icon={ExternalLink}>Apply on site</Button>
            </a>
          )}
          {app.status === 'READY' && (
            <Button size="sm" loading={submitting} onClick={() => act(submit)}>Submit application</Button>
          )}
          {app.status === 'FAILED' && (
            <Button size="sm" variant="secondary" loading={retrying} onClick={() => act(retry)}>Try again</Button>
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
                {s.message}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function ApplicationsPage() {
  const { data, isLoading } = useGetApplicationsQuery();
  const [filter, setFilter] = useState('ALL');
  const [reviewing, setReviewing] = useState(null);

  const applications = data ?? [];
  const items = applications.filter((a) => filter === 'ALL' || a.status === filter);

  const countByStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const reviewCount = countByStatus.REVIEW || 0;

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Track automated submissions and resolve screener questions in the human review queue."
      />

      {reviewCount > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-control border border-amber/30 bg-amber-soft/40 p-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="size-5 text-amber" />
            <div>
              <p className="text-sm font-medium text-ink">
                {reviewCount} application{reviewCount === 1 ? '' : 's'} paused waiting for your answers
              </p>
              <p className="text-xs text-ink-soft">
                The application wizard found unmapped employer screener questions. Answer them to continue.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setFilter('REVIEW')}>
            View Review Queue ({reviewCount})
          </Button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {BASE_FILTERS.map(([v, l]) => {
          const count = v === 'ALL' ? applications.length : countByStatus[v] || 0;
          return (
            <Chip
              key={v}
              active={filter === v}
              onClick={() => setFilter(v)}
            >
              {l} {count > 0 ? `(${count})` : ''}
            </Chip>
          );
        })}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)
        ) : items.length ? (
          items.map((a) => <Row key={a.id} app={a} onReview={setReviewing} />)
        ) : (
          <EmptyState
            icon={ListChecks}
            title={filter === 'ALL' ? 'No applications yet' : 'Nothing here'}
            description="Applications you start from a job board show up here with live progress."
          />
        )}
      </div>

      <ReviewModal key={reviewing?.id} application={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
}
