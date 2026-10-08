import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  MapPin,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  StopCircle,
  Trash2,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { Chip, EmptyState, PageHeader, Skeleton, Toggle } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { errorMessage, timeAgo } from '../../lib/format';
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
        title="Jobs Explorer & Matcher"
        description="Scrape Dice jobs, analyze requirements, and evaluate candidate resume match fit."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            {jobsList.length > 0 && (
              <Button
                variant="ghost"
                icon={Trash2}
                onClick={() => setConfirmClearOpen(true)}
              >
                Clear
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={() => setDirectMatchOpen(true)}
            >
              Paste & Match JD
            </Button>
            <Button
              icon={Zap}
              disabled={applyAllState.isActive || unappliedOnPage.length === 0}
              onClick={handleApplyAll}
            >
              Apply All ({unappliedOnPage.length})
            </Button>
          </div>
        }
      />

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total Scraped</span>
            <Briefcase className="size-4 text-signal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{totalCount}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Dice jobs currently cached</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Ready To Apply</span>
            <Zap className="size-4 text-amber" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{unappliedOnPage.length}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Unapplied on this page</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Search Profiles</span>
            <SlidersHorizontal className="size-4 text-signal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{profiles.length}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Active Dice query profiles</p>
        </Card>
      </div>

      {/* Batch Application Progress Banner */}
      {applyAllState.isActive && (
        <Card className="border-signal/40 bg-signal-soft/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Zap className="size-4 text-signal animate-pulse" />
                <span>
                  Applying ({applyAllState.currentIndex}/{applyAllState.totalJobs}):{' '}
                  <strong>{applyAllState.currentTitle}</strong> at <strong>{applyAllState.currentCompany}</strong>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-soft">
                <span>Applied: <strong className="text-signal">{applyAllState.appliedCount}</strong></span>
                <span>Review: <strong className="text-amber">{applyAllState.reviewCount}</strong></span>
                <span>Failed: <strong className="text-rust">{applyAllState.failedCount}</strong></span>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={StopCircle}
              onClick={handleStopBatch}
            >
              Stop Batch
            </Button>
          </div>
        </Card>
      )}

      {/* Sleek Integrated Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by job title, company, or keyword…"
            className="h-10 w-full rounded-control border border-line-strong bg-paper-raised pl-9 pr-9 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-soft hover:text-ink transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative w-full sm:w-56">
          <select
            value={profileFilter}
            onChange={(e) => {
              setProfileFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full appearance-none rounded-control border border-line-strong bg-paper-raised pl-3.5 pr-9 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 transition-all cursor-pointer"
          >
            <option value="">All Search Profiles ({profiles.length})</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full appearance-none rounded-control border border-line-strong bg-paper-raised pl-3.5 pr-9 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="MATCHED">AI Matched</option>
            <option value="APPLIED">Applied</option>
            <option value="REVIEW">Review</option>
            <option value="FAILED">Failed</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        </div>

        {/* Skip Applied Toggle Chip */}
        <button
          type="button"
          onClick={() => {
            setSkipApplied(!skipApplied);
            setPage(1);
          }}
          className={cn(
            'inline-flex h-10 items-center justify-center gap-2 rounded-control border px-3.5 text-sm font-medium transition-all shrink-0',
            skipApplied
              ? 'border-signal bg-signal-soft text-signal-deep font-semibold shadow-xs'
              : 'border-line-strong bg-paper-raised text-ink-soft hover:bg-paper-sunken hover:text-ink'
          )}
        >
          <span className={cn('size-2 rounded-full transition-colors', skipApplied ? 'bg-signal' : 'bg-line-strong')} />
          <span>Skip Applied</span>
        </button>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : jobsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 grid size-12 place-items-center rounded-full bg-signal-soft text-signal">
                <Briefcase className="size-5" />
              </div>
              <h3 className="font-serif text-xl font-medium text-ink">No jobs found in queue</h3>
              <p className="mt-1.5 max-w-md text-sm text-ink-soft">
                Run a Dice search profile to fetch live matching jobs, clear applied filters, or paste an external job description to evaluate candidates.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  icon={Sparkles}
                  onClick={() => setDirectMatchOpen(true)}
                >
                  Paste & Match JD
                </Button>
                <Button
                  variant="secondary"
                  icon={SlidersHorizontal}
                  onClick={() => navigate('/search-profiles')}
                >
                  Manage Search Profiles
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper-sunken/60 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="py-3 pl-6 pr-4">Job Title & Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Resume Match</th>
                    <th className="py-3 px-4">Recommended Resume</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {jobsList.map((job) => {
                    const isBusy = actionInProgress === job.id;
                    const score = job.match?.score || job.match_result?.match_percentage || null;
                    const recResume =
                      job.match_result?.recommended_resume_name ||
                      job.match?.resume_name ||
                      (job.match?.resume_id &&
                        resumes.find((r) => r.id === job.match.resume_id)?.file_name) ||
                      null;

                    const isApplied = job.status === 'APPLIED';
                    const isFailed = job.status === 'FAILED';
                    const isReview = job.status === 'REVIEW';

                    const tone =
                      score >= 70 ? 'signal' : score >= 40 ? 'amber' : score !== null ? 'rust' : 'neutral';

                    return (
                      <tr key={job.id} className="hover:bg-paper-sunken/30 transition-colors">
                        {/* Title & Company */}
                        <td className="py-4 pl-6 pr-4 align-top max-w-sm">
                          <p className="font-semibold text-[15px] text-ink leading-snug">
                            {job.title}
                          </p>
                          <p className="text-xs text-ink-soft mt-0.5">
                            {job.company || 'Company not specified'}
                            {job.salary ? ` · ${job.salary}` : ''}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {job.work_setting && (
                              <Badge tone="neutral" className="text-[10px]">
                                {job.work_setting}
                              </Badge>
                            )}
                            {job.is_easy_apply && (
                              <Badge tone="signal" className="text-[10px]">
                                Easy Apply
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 align-top text-ink-soft whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-ink">
                            <MapPin className="size-3.5 text-ink-soft shrink-0" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                          {job.work_setting === 'Remote' && (
                            <span className="text-xs text-signal font-semibold">Remote</span>
                          )}
                        </td>

                        {/* Resume Match */}
                        <td className="py-4 px-4 align-top text-center">
                          {score !== null ? (
                            <Badge tone={tone} className="font-bold text-xs">
                              {score}%
                            </Badge>
                          ) : (
                            <span className="text-xs text-ink-soft/60">–</span>
                          )}
                        </td>

                        {/* Recommended Resume */}
                        <td className="py-4 px-4 align-top max-w-xs">
                          {recResume ? (
                            <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                              <FileText className="size-3.5 text-signal shrink-0" />
                              <span className="truncate" title={recResume}>
                                {recResume}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-soft/60">Not evaluated yet</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 align-top">
                          {isApplied ? (
                            <Badge tone="signal" dot>
                              Applied
                            </Badge>
                          ) : isFailed ? (
                            <Badge
                              tone="rust"
                              dot
                              title={job.failure_reason || 'Application submission failed'}
                            >
                              Failed
                            </Badge>
                          ) : isReview ? (
                            <Badge tone="amber" dot>
                              In Review
                            </Badge>
                          ) : score !== null ? (
                            <Badge tone="signal">AI Matched</Badge>
                          ) : (
                            <Badge tone="neutral">New</Badge>
                          )}
                          {isFailed && job.failure_reason && (
                            <p className="mt-1 text-[11px] text-rust line-clamp-1" title={job.failure_reason}>
                              {job.failure_reason}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              disabled={isApplied}
                              loading={isBusy}
                              onClick={() => handleApply(job)}
                              className="font-semibold text-xs"
                            >
                              {isFailed ? 'Re-try' : isApplied ? 'Applied' : 'Apply'}
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedJob(job)}
                              className="text-xs"
                            >
                              View
                            </Button>

                            {(job.url || job.job_url) && (
                              <button
                                type="button"
                                onClick={() => window.open(job.url || job.job_url, '_blank')}
                                title="Open listing on Dice"
                                className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-sunken hover:text-signal transition"
                              >
                                <ExternalLink className="size-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-6 py-3.5">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-ink-soft">
                Page {page} of {totalPages} ({totalCount} total jobs)
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          )}
        </CardBody>
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
