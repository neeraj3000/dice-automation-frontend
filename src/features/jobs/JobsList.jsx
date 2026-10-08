import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Search as SearchIcon, SearchX, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Chip, EmptyState, Skeleton } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useDebounce } from '../../hooks/useDebounce';
import { useClearAllJobsMutation, useDeleteJobMutation, useGetJobsQuery, useMatchJobMutation } from './jobsApi';
import JobCard from './JobCard';
import ApplyModal from './ApplyModal';
import DirectMatchModal from './DirectMatchModal';

const PAGE_SIZE = 10;

export default function JobsList({ boardKey }) {
  const [q, setQ] = useState('');
  const [easy, setEasy] = useState(false);
  const [hideApplied, setHideApplied] = useState(true);
  const [page, setPage] = useState(1);
  const [applyJob, setApplyJob] = useState(null);
  const [matchingId, setMatchingId] = useState(null);
  const [directMatchOpen, setDirectMatchOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const dq = useDebounce(q);
  const params = {
    board: boardKey,
    page,
    page_size: PAGE_SIZE,
    ...(dq && { q: dq }),
    ...(easy && { easy_apply: true }),
    ...(hideApplied && { status: 'NEW' }),
  };

  const { data, isLoading, isFetching } = useGetJobsQuery(params);
  const [matchJob] = useMatchJobMutation();
  const [deleteJob] = useDeleteJobMutation();
  const [clearAllJobs, { isLoading: clearing }] = useClearAllJobsMutation();

  const onMatch = useCallback(async (id) => {
    setMatchingId(id);
    try {
      await matchJob(id).unwrap();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setMatchingId(null);
    }
  }, [matchJob]);

  const onDelete = useCallback((id) => {
    deleteJob(id).unwrap().catch((e) => toast.error(errorMessage(e)));
  }, [deleteJob]);

  const onApply = useCallback((job) => setApplyJob(job), []);

  const handleClearAll = async () => {
    try {
      await clearAllJobs().unwrap();
      toast.success('All scraped jobs cleared from workspace');
      setConfirmClearOpen(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const reset = (fn) => (v) => { fn(v); setPage(1); };

  return (
    <Card>
      <CardHeader
        title="Jobs"
        description={total ? `${total} job${total === 1 ? '' : 's'} saved` : 'Your search results appear here.'}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={() => setDirectMatchOpen(true)}
            >
              Match External JD
            </Button>
            {total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => setConfirmClearOpen(true)}
              >
                Clear all
              </Button>
            )}
          </div>
        }
      />
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => reset(setQ)(e.target.value)}
              placeholder="Filter by title, company or location"
              aria-label="Filter jobs"
              className="h-10 w-full rounded-control border border-line-strong bg-paper-raised pl-9 pr-3 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
            />
          </div>
          <div className="flex gap-2">
            <Chip active={easy} onClick={() => reset(setEasy)(!easy)}>Easy Apply</Chip>
            <Chip active={hideApplied} onClick={() => reset(setHideApplied)(!hideApplied)}>Hide applied</Chip>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
        ) : data?.items?.length ? (
          <div className={`space-y-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onApply={onApply}
                onMatch={onMatch}
                onDelete={onDelete}
                matching={matchingId === j.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No jobs yet"
            description="Run a search above or use 'Match External JD' to test candidate resumes against any job brief."
          />
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-ink-soft">Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next<ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </CardBody>

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
      <DirectMatchModal open={directMatchOpen} onClose={() => setDirectMatchOpen(false)} onApplyJob={onApply} />

      <Modal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear all scraped jobs?"
        description="This will remove all stored job listings from your workspace. Existing applications are not affected."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={clearing} onClick={handleClearAll}>
              Clear all jobs
            </Button>
          </>
        }
      />
    </Card>
  );
}
