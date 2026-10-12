import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  StopCircle,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { PageHeader, Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { errorMessage } from '../../lib/format';
import { useDebounce } from '../../hooks/useDebounce';
import {
  useAnalyzeJobMutation,
  useApplyJobMutation,
  useClearAllJobsMutation,
  useDeleteJobMutation,
  useGetJobsQuery,
  useMatchJobMutation,
  usePrepareApplicationMutation,
} from './jobsApi';
import { useGetSearchProfilesQuery } from '../boards/searchProfilesApi';
import { useGetResumesQuery } from '../resumes/resumesApi';
import DirectMatchModal from './DirectMatchModal';

const PAGE_SIZE = 10;

// Shared column template so the header and every row line up.
const ROW_GRID = 'lg:grid-cols-[minmax(0,1fr)_200px_130px_200px] lg:items-center lg:gap-6';
const FIELD =
  'h-10 rounded-control border border-line-strong bg-paper-raised text-sm text-ink placeholder:text-ink-soft/70 transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15';

function SelectField({ value, onChange, className, children }) {
  return (
    <div className={cn('relative w-full', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, 'w-full cursor-pointer appearance-none pl-3.5 pr-9')}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}

const jobScore = (job) => job.match?.score ?? job.match_result?.match_percentage ?? null;

function JobStatus({ job, score }) {
  if (job.status === 'APPLIED') return <Badge tone="signal" dot>Applied</Badge>;
  if (job.status === 'REVIEW') return <Badge tone="amber" dot>In review</Badge>;
  if (job.status === 'FAILED') {
    return (
      <div className="min-w-0">
        <Badge tone="rust" dot>Failed</Badge>
        {job.failure_reason && (
          <p className="mt-1 truncate text-[11px] text-rust/90" title={job.failure_reason}>
            {job.failure_reason}
          </p>
        )}
      </div>
    );
  }
  return <Badge tone="neutral">{score !== null ? 'Matched' : 'New'}</Badge>;
}

function MatchCell({ score, resumeName }) {
  if (score === null && !resumeName) return <span className="text-xs text-ink-soft/70">Not evaluated</span>;
  const bar = score >= 70 ? 'bg-signal' : score >= 40 ? 'bg-amber' : 'bg-rust';
  return (
    <div className="min-w-0 space-y-1.5">
      {score !== null && (
        <div className="flex items-center gap-2.5">
          <span className="w-9 text-sm font-semibold tabular-nums text-ink">{score}%</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
            <div className={cn('h-full rounded-full', bar)} style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>
      )}
      {resumeName && (
        <p className="flex items-center gap-1.5 text-xs text-ink-soft" title={resumeName}>
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{resumeName}</span>
        </p>
      )}
    </div>
  );
}

function JobRow({ job, resumes, busy, onApply, onView }) {
  const score = jobScore(job);
  const resumeName =
    job.match_result?.recommended_resume_name ||
    job.match?.resume_name ||
    (job.match?.resume_id && resumes.find((r) => r.id === job.match.resume_id)?.file_name) ||
    null;
  const isApplied = job.status === 'APPLIED';
  const listingUrl = job.url || job.job_url;
  const company = job.company || 'Company not listed';
  const location = job.location || 'Remote';
  const extras = [job.employment_type, job.salary, job.posted_date].filter(Boolean);

  return (
    <li className={cn(ROW_GRID, 'grid gap-4 px-5 py-4 transition-colors hover:bg-paper-sunken/40')}>
      {/* Role */}
      <div className="flex min-w-0 gap-3.5">
        <span
          aria-hidden
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-paper-sunken font-serif text-base font-medium text-ink-soft"
        >
          {company.trim()[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onView(job)}
            title={job.title}
            className="line-clamp-2 text-left text-[15px] font-semibold leading-snug text-ink transition-colors hover:text-signal"
          >
            {job.title}
          </button>
          <p className="mt-0.5 truncate text-sm text-ink-soft">{company}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {location}
            </span>
            {extras.map((m) => (
              <span key={m}>· {m}</span>
            ))}
            {job.work_setting && job.work_setting !== location && (
              <span className="rounded-full border border-line px-2 py-px text-[11px]">{job.work_setting}</span>
            )}
            {job.is_easy_apply && (
              <span className="inline-flex items-center gap-1 rounded-full border border-signal/25 px-2 py-px text-[11px] text-signal">
                <Zap className="size-3" />
                Easy Apply
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Match */}
      <div className="min-w-0 pl-[54px] lg:pl-0">
        <MatchCell score={score} resumeName={resumeName} />
      </div>

      {/* Status */}
      <div className="min-w-0 pl-[54px] lg:pl-0">
        <JobStatus job={job} score={score} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pl-[54px] lg:justify-end lg:pl-0">
        {isApplied ? (
          <span className="inline-flex h-8 items-center gap-1.5 px-2 text-[13px] font-medium text-signal">
            <CheckCircle2 className="size-4" />
            Applied
          </span>
        ) : (
          <Button size="sm" loading={busy} onClick={() => onApply(job)}>
            {job.status === 'FAILED' ? 'Retry' : 'Apply'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onView(job)}>
          Details
        </Button>
        {listingUrl && (
          <a
            href={listingUrl}
            target="_blank"
            rel="noreferrer noopener"
            title="Open on Dice"
            aria-label="Open listing on Dice"
            className="grid size-8 place-items-center rounded-control text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </li>
  );
}

export default function JobsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skipApplied, setSkipApplied] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      search_profile_id: profileFilter || undefined,
      status: statusFilter || undefined,
      exclude_applied: skipApplied ? true : undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, profileFilter, statusFilter, skipApplied, page]
  );

  const { data, isLoading, isFetching, refetch } = useGetJobsQuery(queryParams);
  const { data: profiles = [] } = useGetSearchProfilesQuery();
  const { data: resumes = [] } = useGetResumesQuery();

  const [applyJob] = useApplyJobMutation();
  const [prepareApp] = usePrepareApplicationMutation();
  const [matchJob] = useMatchJobMutation();
  const [analyzeJob] = useAnalyzeJobMutation();
  const [deleteJob] = useDeleteJobMutation();
  const [clearAllJobs, { isLoading: clearing }] = useClearAllJobsMutation();

  const [actionInProgress, setActionInProgress] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [directMatchOpen, setDirectMatchOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Apply All State
  const [applyAllState, setApplyAllState] = useState({
    isActive: false,
    currentIndex: 0,
    totalJobs: 0,
    currentTitle: '',
    currentCompany: '',
    appliedCount: 0,
    reviewCount: 0,
    failedCount: 0,
  });
  const abortBatchRef = useRef(false);

  const jobsList = data?.items || [];
  const totalCount = data?.total || jobsList.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Single job 1-Click Apply
  const handleApply = async (job) => {
    setActionInProgress(job.id);
    const toastId = toast.loading(`Submitting 1-Click application to ${job.company || 'employer'}…`);
    try {
      const recId =
        job.match?.resume_id ||
        job.match_result?.recommended_resume_id ||
        resumes.find((r) => r.is_default)?.id ||
        resumes[0]?.id;

      const res = await applyJob({
        job_id: job.id,
        resume_id: recId,
      }).unwrap();

      toast.dismiss(toastId);
      if (res?.status === 'APPLIED') {
        toast.success(`Successfully applied to ${job.title}!`);
      } else if (res?.status === 'REVIEW') {
        toast.error('Application paused for review: Screener questions need manual input in Review Queue.');
      } else if (res?.status === 'FAILED') {
        toast.error(res?.failure_reason || 'Application submission failed.');
      } else {
        toast.success(`Application updated: ${res?.status || 'Submitted'}`);
      }
      refetch();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(errorMessage(err));
    } finally {
      setActionInProgress(null);
    }
  };

  // Single job Prepare for review
  const handlePrepare = async (job) => {
    setActionInProgress(job.id);
    try {
      const recId =
        job.match?.resume_id ||
        job.match_result?.recommended_resume_id ||
        resumes[0]?.id;
      await prepareApp({
        job_id: job.id,
        resume_id: recId,
        mode: 'PREPARE',
      }).unwrap();
      toast.success('Application form prepared. Review in Applications tab.');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionInProgress(null);
    }
  };

  // Match Job
  const handleMatch = async (jobId) => {
    setActionInProgress(jobId);
    try {
      const updated = await matchJob(jobId).unwrap();
      toast.success('Resume match analysis updated!');
      if (selectedJob?.id === jobId) setSelectedJob(updated);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setActionInProgress(null);
    }
  };

  // Batch Apply All (Current Page)
  const unappliedOnPage = jobsList.filter((j) => j.status !== 'APPLIED');
  const appliedJobsCount = jobsList.filter((j) => j.status === 'APPLIED').length;

  const handleApplyAll = async () => {
    if (applyAllState.isActive) return;
    if (!unappliedOnPage.length) {
      toast.success('All jobs on this page are already applied!');
      return;
    }

    abortBatchRef.current = false;
    setApplyAllState({
      isActive: true,
      currentIndex: 0,
      totalJobs: unappliedOnPage.length,
      currentTitle: unappliedOnPage[0].title || 'Untitled',
      currentCompany: unappliedOnPage[0].company || 'Company',
      appliedCount: 0,
      reviewCount: 0,
      failedCount: 0,
    });

    let applied = 0;
    let review = 0;
    let failed = 0;

    for (let i = 0; i < unappliedOnPage.length; i++) {
      if (abortBatchRef.current) {
        toast.success('Batch application halted.');
        break;
      }

      const target = unappliedOnPage[i];
      setApplyAllState((prev) => ({
        ...prev,
        currentIndex: i + 1,
        currentTitle: target.title || 'Untitled',
        currentCompany: target.company || 'Company',
      }));

      setActionInProgress(target.id);
      try {
        const recId =
          target.match?.resume_id ||
          target.match_result?.recommended_resume_id ||
          resumes[0]?.id;

        const res = await applyJob({
          job_id: target.id,
          resume_id: recId,
        }).unwrap();

        if (res?.status === 'APPLIED') applied++;
        else if (res?.status === 'REVIEW') review++;
        else failed++;
      } catch {
        failed++;
      } finally {
        setActionInProgress(null);
        setApplyAllState((prev) => ({
          ...prev,
          appliedCount: applied,
          reviewCount: review,
          failedCount: failed,
        }));
      }

      if (!abortBatchRef.current && i < unappliedOnPage.length - 1) {
        // Safe 10s cooldown between applications
        await new Promise((r) => setTimeout(r, 10000));
      }
    }

    setApplyAllState((prev) => ({ ...prev, isActive: false }));
    refetch();
    toast.success(`Batch complete! Applied: ${applied}, Review: ${review}, Failed: ${failed}`);
  };

  const handleStopBatch = () => {
    abortBatchRef.current = true;
    setApplyAllState((prev) => ({ ...prev, isActive: false }));
    toast.success('Stopping batch process…');
  };

  const handleClearAll = async () => {
    try {
      await clearAllJobs().unwrap();
      toast.success('All scraped jobs cleared.');
      setConfirmClearOpen(false);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Scraped Dice listings, matched against your resume library."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
              aria-label="Refresh jobs"
              title="Refresh"
              className="px-2.5"
            />
            {jobsList.length > 0 && (
              <Button variant="ghost" icon={Trash2} onClick={() => setConfirmClearOpen(true)}>
                Clear
              </Button>
            )}
            <Button variant="secondary" icon={Sparkles} onClick={() => setDirectMatchOpen(true)}>
              Match a JD
            </Button>
            <Button
              icon={Zap}
              disabled={applyAllState.isActive || unappliedOnPage.length === 0}
              onClick={handleApplyAll}
            >
              Apply to {unappliedOnPage.length}
            </Button>
          </div>
        }
      />

      {/* Top 4 Stat Cards matching Application Tracker design */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Total Jobs Found
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{totalCount}</p>
        </Card>
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Submitted (Applied)
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
            {appliedJobsCount}
          </p>
        </Card>
        <Card className="p-5 border-blue-500/20 bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Ready to Apply
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-blue-800 dark:text-blue-300">
            {unappliedOnPage.length}
          </p>
        </Card>
        <Card className="p-5 border-amber/20 bg-amber-soft/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber">
            Search Profiles
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-amber">
            {profiles.length}
          </p>
        </Card>
      </div>

      {/* Batch application progress */}
      {applyAllState.isActive && (
        <Card className="border-signal/30 bg-signal-soft/40 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <p className="flex items-center gap-2 text-sm text-ink">
                <Loader2 className="size-4 shrink-0 animate-spin text-signal" />
                <span className="truncate">
                  Applying {applyAllState.currentIndex} of {applyAllState.totalJobs} ·{' '}
                  <span className="font-medium">{applyAllState.currentTitle}</span>
                  <span className="text-ink-soft"> at {applyAllState.currentCompany}</span>
                </span>
              </p>
              <div className="h-1 w-full max-w-sm overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-signal transition-all duration-500"
                  style={{ width: `${(applyAllState.currentIndex / Math.max(1, applyAllState.totalJobs)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-ink-soft">
                {applyAllState.appliedCount} applied · {applyAllState.reviewCount} need review ·{' '}
                {applyAllState.failedCount} failed
              </p>
            </div>
            <Button variant="secondary" size="sm" icon={StopCircle} onClick={handleStopBatch}>
              Stop
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, company, or keyword"
            className={cn(FIELD, 'w-full pl-9 pr-9')}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-soft transition-colors hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <SelectField
          className="sm:w-52"
          value={profileFilter}
          onChange={(v) => {
            setProfileFilter(v);
            setPage(1);
          }}
        >
          <option value="">All search profiles</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          className="sm:w-40"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <option value="">Any status</option>
          <option value="NEW">New</option>
          <option value="MATCHED">Matched</option>
          <option value="APPLIED">Applied</option>
          <option value="REVIEW">In review</option>
          <option value="FAILED">Failed</option>
        </SelectField>

        <button
          type="button"
          aria-pressed={skipApplied}
          onClick={() => {
            setSkipApplied(!skipApplied);
            setPage(1);
          }}
          className={cn(
            'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-control border px-3.5 text-sm transition-colors',
            skipApplied
              ? 'border-signal/40 bg-signal-soft font-medium text-signal-deep'
              : 'border-line-strong bg-paper-raised text-ink-soft hover:text-ink'
          )}
        >
          {skipApplied ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <span className="size-4 rounded-full border border-line-strong" />
          )}
          Hide applied
        </button>
      </div>

      {/* Job list */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : jobsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-signal-soft text-signal">
              <Briefcase className="size-5" />
            </div>
            <h3 className="font-serif text-xl font-medium text-ink">No jobs yet</h3>
            <p className="mt-1.5 max-w-md text-sm text-ink-soft">
              Run a search profile to pull listings from Dice, loosen your filters, or paste a job description to match it directly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button icon={Sparkles} onClick={() => setDirectMatchOpen(true)}>
                Match a JD
              </Button>
              <Button variant="secondary" icon={SlidersHorizontal} onClick={() => navigate('/search-profiles')}>
                Search profiles
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                ROW_GRID,
                'hidden border-b border-line bg-paper-sunken/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-soft lg:grid'
              )}
            >
              <span>Role</span>
              <span>Resume match</span>
              <span>Status</span>
              <span className="sr-only">Actions</span>
            </div>
            <ul className="divide-y divide-line">
              {jobsList.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  resumes={resumes}
                  busy={actionInProgress === job.id}
                  onApply={handleApply}
                  onView={setSelectedJob}
                />
              ))}
            </ul>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <span className="text-xs text-ink-soft">
              Page {page} of {totalPages} · {totalCount} jobs
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          wide
          title={selectedJob.title}
          description={`${selectedJob.company || 'Company'} · ${selectedJob.location || 'Remote'} · ${
            selectedJob.salary || ''
          }`}
          footer={
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Sparkles}
                  loading={actionInProgress === selectedJob.id}
                  onClick={() => handleMatch(selectedJob.id)}
                >
                  Re-match Resume
                </Button>
                {selectedJob.status !== 'APPLIED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePrepare(selectedJob)}
                  >
                    Prepare Application
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button
                  disabled={selectedJob.status === 'APPLIED'}
                  loading={actionInProgress === selectedJob.id}
                  onClick={() => handleApply(selectedJob)}
                >
                  {selectedJob.status === 'APPLIED' ? 'Applied' : '1-Click Apply'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Match Breakdown Card */}
            {(selectedJob.match || selectedJob.match_result) && (
              <div className="rounded-control border border-line bg-paper-sunken p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-semibold text-sm text-ink">
                    Candidate Resume Fit:{' '}
                    <span className="text-signal">
                      {selectedJob.match_result?.recommended_resume_name ||
                        selectedJob.match?.resume_name ||
                        'Recommended Resume'}
                    </span>
                  </span>
                  <Badge
                    tone={
                      (selectedJob.match?.score || selectedJob.match_result?.match_percentage) >= 70
                        ? 'signal'
                        : 'amber'
                    }
                    className="font-bold text-xs"
                  >
                    {selectedJob.match?.score || selectedJob.match_result?.match_percentage}% Match
                  </Badge>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  {(selectedJob.match?.matched?.length > 0 ||
                    selectedJob.match_result?.matched_skills?.length > 0) && (
                    <div>
                      <p className="text-xs font-semibold text-signal">Matched Skills:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(
                          selectedJob.match?.matched ||
                          selectedJob.match_result?.matched_skills ||
                          []
                        ).map((s) => (
                          <Badge key={s} tone="signal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedJob.match?.missing?.length > 0 ||
                    selectedJob.match_result?.missing_skills?.length > 0) && (
                    <div>
                      <p className="text-xs font-semibold text-ink-soft">Missing / Required Skills:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(
                          selectedJob.match?.missing ||
                          selectedJob.match_result?.missing_skills ||
                          []
                        ).map((s) => (
                          <Badge key={s} tone="neutral">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Description Raw */}
            <div>
              <h4 className="font-serif text-base font-semibold mb-2">Job Description</h4>
              <div className="max-h-96 overflow-y-auto rounded-control border border-line bg-paper-sunken p-4 text-xs leading-relaxed text-ink-soft whitespace-pre-wrap">
                {selectedJob.description_raw ||
                  selectedJob.description ||
                  'No raw job description recorded.'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Paste & Match JD Modal */}
      <DirectMatchModal open={directMatchOpen} onClose={() => setDirectMatchOpen(false)} />

      {/* Clear All Confirmation Modal */}
      <Modal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear all scraped jobs?"
        description="This will permanently delete all stored job listings from your workspace. Existing submitted applications will not be affected."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={clearing} onClick={handleClearAll}>
              Clear All Jobs
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Are you sure? This action cannot be undone. You can run fresh searches anytime via Search Profiles.
        </p>
      </Modal>
    </div>
  );
}
