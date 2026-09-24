import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  Snackbar,
  TablePagination,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AutoAwesome as SparklesIcon,
  Work as WorkIcon,
  Close as CloseIcon,
  ContentPaste as ContentPasteIcon,
  Description as DescriptionIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  DeleteSweep as DeleteSweepIcon,
  StopCircle as StopCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ErrorOutlineRounded as ErrorOutlineIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Job, DirectMatchRequest, SearchProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface ApplyAllState {
  isActive: boolean;
  currentIndex: number;
  totalJobs: number;
  currentJobId: string | null;
  currentJobTitle: string;
  currentCompany: string;
  appliedCount: number;
  reviewCount: number;
  failedCount: number;
  isCompleted: boolean;
}

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [excludeApplied, setExcludeApplied] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Apply All State
  const [applyAllState, setApplyAllState] = useState<ApplyAllState>({
    isActive: false,
    currentIndex: 0,
    totalJobs: 0,
    currentJobId: null,
    currentJobTitle: '',
    currentCompany: '',
    appliedCount: 0,
    reviewCount: 0,
    failedCount: 0,
    isCompleted: false,
  });
  const abortBatchRef = React.useRef(false);

  // Detail Drawer State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Paste & Match Modal State (Phase 2 Direct JD Matcher)
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteTitle, setPasteTitle] = useState('Senior AI & Cloud Engineer');
  const [pasteCompany, setPasteCompany] = useState('Tech Solutions Inc.');
  const [pasteJD, setPasteJD] = useState(
    'Looking for a Lead AI Engineer with 5+ years experience in Python, FastAPI, LangChain, RAG, Docker, and Kubernetes. AWS experience preferred.'
  );
  const [matchingDirect, setMatchingDirect] = useState(false);
  const [directMatchResult, setDirectMatchResult] = useState<any | null>(null);

  useEffect(() => {
    api.getSearchProfiles().then(setProfiles).catch(() => {});
  }, []);

  const fetchJobs = async (resetPage = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        search_profile_id: profileFilter || undefined,
        exclude_applied: excludeApplied || undefined,
      });
      setJobs(data);
      if (resetPage) {
        setPage(0);
      }
    } catch {
      setError('Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllJobs = async () => {
    setClearing(true);
    try {
      const res = await api.clearAllJobs();
      setToastMessage(res.message || 'All jobs cleared successfully!');
      setClearDialogOpen(false);
      await fetchJobs(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to clear jobs.');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, profileFilter, excludeApplied]);

  const handleOpenDrawer = async (job: Job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
    try {
      const fresh = await api.getJob(job.id);
      setSelectedJob(fresh);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? fresh : j)));
    } catch {}
  };

  const handleAnalyze = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const updated = await api.analyzeJob(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      if (selectedJob?.id === jobId) setSelectedJob(updated);
      setToastMessage('Job description analyzed into structured requirements!');
    } catch {
      setError('Failed to analyze job description.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMatch = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const updated = await api.matchJob(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      if (selectedJob?.id === jobId) setSelectedJob(updated);
      setToastMessage(`Matched! Recommended: ${updated.match_result?.recommended_resume_name}`);
    } catch {
      setError('Failed to match resumes.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePrepare = async (jobId: string, resumeId?: string) => {
    setActionInProgress(jobId);
    try {
      await api.prepareApplication({ job_id: jobId, resume_id: resumeId, mode: 'PREPARE' });
      setToastMessage('Application preparation initiated!');
      navigate('/applications');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to prepare application.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApply = async (jobId: string, resumeId?: string) => {
    setActionInProgress(jobId);
    try {
      setToastMessage('Executing 1-Click Apply: matching resume, filling fields, and submitting on Dice...');
      const res = await api.applyJob({ job_id: jobId, resume_id: resumeId });
      if (res.status === 'APPLIED') {
        setToastMessage(`Successfully applied to ${res.job_title || 'job'} with ${res.resume_name || 'matched resume'}!`);
      } else if (res.status === 'REVIEW') {
        setError('Application paused for review: required screener questions need manual input. Check Review Queue.');
      } else if (res.status === 'FAILED') {
        setError(res.failure_reason || 'Application submission failed.');
      } else {
        setToastMessage(`Application updated to state: ${res.status}`);
      }

      try {
        const freshJob = await api.getJob(jobId);
        if (res.status === 'FAILED' && res.failure_reason && !freshJob.failure_reason) {
          freshJob.failure_reason = res.failure_reason;
        }
        setJobs((prev) => prev.map((j) => (j.id === jobId ? freshJob : j)));
        if (selectedJob?.id === jobId) {
          setSelectedJob(freshJob);
        }
      } catch {
        await fetchJobs(false);
      }
    } catch (err: any) {
      const reason = err.response?.data?.detail || err.message || 'Failed to execute 1-Click Apply.';
      setError(reason);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'FAILED', failure_reason: reason } : j)));
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev) => (prev ? { ...prev, status: 'FAILED', failure_reason: reason } : null));
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRunDirectMatch = async () => {
    if (!pasteJD.trim()) {
      setError('Please paste a Job Description.');
      return;
    }
    setMatchingDirect(true);
    setDirectMatchResult(null);
    try {
      const payload: DirectMatchRequest = {
        title: pasteTitle,
        company: pasteCompany,
        description_raw: pasteJD,
      };
      const res = await api.matchDirect(payload);
      setDirectMatchResult(res);
      fetchJobs();
    } catch {
      setError('Direct matching failed.');
    } finally {
      setMatchingDirect(false);
    }
  };

  const currentPageStartIndex = page * rowsPerPage;
  const currentPageJobs = jobs.slice(currentPageStartIndex, currentPageStartIndex + rowsPerPage);
  const unappliedJobsOnPage = currentPageJobs.filter((j) => j.status !== 'APPLIED');
  const totalPages = Math.ceil(jobs.length / rowsPerPage);
  const hasNextPage = page < totalPages - 1;

  const handleApplyAll = async () => {
    if (applyAllState.isActive) return;

    if (unappliedJobsOnPage.length === 0) {
      if (hasNextPage) {
        setToastMessage(`All jobs on Page ${page + 1} are already applied! Advance to Page ${page + 2} to apply to more.`);
      } else {
        setToastMessage(`All jobs on this page are already applied!`);
      }
      return;
    }

    abortBatchRef.current = false;
    setApplyAllState({
      isActive: true,
      currentIndex: 0,
      totalJobs: unappliedJobsOnPage.length,
      currentJobId: unappliedJobsOnPage[0].id,
      currentJobTitle: unappliedJobsOnPage[0].title?.trim() || 'Untitled Position',
      currentCompany: unappliedJobsOnPage[0].company?.trim() || 'Company',
      appliedCount: 0,
      reviewCount: 0,
      failedCount: 0,
      isCompleted: false,
    });

    let applied = 0;
    let review = 0;
    let failed = 0;

    for (let i = 0; i < unappliedJobsOnPage.length; i++) {
      if (abortBatchRef.current) {
        setToastMessage('Batch application halted.');
        break;
      }

      const targetJob = unappliedJobsOnPage[i];
      const displayTitle = targetJob.title?.trim() || 'Untitled Position';
      const displayCompany = targetJob.company?.trim() || 'Company';

      setApplyAllState((prev) => ({
        ...prev,
        currentIndex: i,
        currentJobId: targetJob.id,
        currentJobTitle: displayTitle,
        currentCompany: displayCompany,
      }));
      setActionInProgress(targetJob.id);

      try {
        const res = await api.applyJob({
          job_id: targetJob.id,
          resume_id: targetJob.match_result?.recommended_resume_id,
        });

        if (res.status === 'APPLIED') {
          applied++;
        } else if (res.status === 'REVIEW') {
          review++;
        } else {
          failed++;
        }

        try {
          const freshJob = await api.getJob(targetJob.id);
          if (res.status === 'FAILED' && res.failure_reason && !freshJob.failure_reason) {
            freshJob.failure_reason = res.failure_reason;
          }
          setJobs((prev) => prev.map((j) => (j.id === targetJob.id ? freshJob : j)));
          if (selectedJob?.id === targetJob.id) {
            setSelectedJob(freshJob);
          }
        } catch {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === targetJob.id
                ? {
                    ...j,
                    status: res.status,
                    failure_reason: res.failure_reason || '',
                    applied_at: res.status === 'APPLIED' ? new Date().toISOString() : undefined,
                  }
                : j
            )
          );
        }
      } catch (err: any) {
        failed++;
        const reason = err.response?.data?.detail || err.message || 'Application submission failed.';
        setJobs((prev) =>
          prev.map((j) => (j.id === targetJob.id ? { ...j, status: 'FAILED', failure_reason: reason } : j))
        );
        if (selectedJob?.id === targetJob.id) {
          setSelectedJob((prev) => (prev ? { ...prev, status: 'FAILED', failure_reason: reason } : null));
        }
      } finally {
        setActionInProgress(null);
        setApplyAllState((prev) => ({
          ...prev,
          appliedCount: applied,
          reviewCount: review,
          failedCount: failed,
        }));
      }

      // Small pause between applications to let the browser session cleanly finish and avoid thrashing
      if (!abortBatchRef.current && i < unappliedJobsOnPage.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    const wasAborted = abortBatchRef.current;
    setApplyAllState((prev) => ({
      ...prev,
      isActive: false,
      currentJobId: null,
      isCompleted: !wasAborted,
    }));

    if (!wasAborted) {
      setToastMessage(
        `Finished Page ${page + 1}: ${applied} applied, ${review} review queue, ${failed} failed.`
      );
    }
  };

  const handleStopApplyAll = () => {
    abortBatchRef.current = true;
    setApplyAllState((prev) => ({
      ...prev,
      isActive: false,
      currentJobId: null,
    }));
    setActionInProgress(null);
    setToastMessage('Stopping batch application after current job finishes...');
  };

  const handleGoToNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
      setApplyAllState((prev) => ({ ...prev, isCompleted: false }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setToastMessage(`Navigated to Page ${page + 2}. Click "Apply All" to apply jobs on this page.`);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Jobs Explorer & Matcher
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Scrape Dice jobs, analyze requirements, and evaluate which of your ~40 resumes is the strongest fit.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchJobs(false)}
            disabled={loading || applyAllState.isActive}
            sx={{ borderColor: '#cbd5e1', color: '#475569' }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setClearDialogOpen(true)}
            disabled={loading || jobs.length === 0 || applyAllState.isActive}
            sx={{ borderColor: '#fca5a5', color: '#dc2626', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}
          >
            Clear All Jobs
          </Button>
          <Button
            variant="contained"
            startIcon={<ContentPasteIcon />}
            onClick={() => {
              setDirectMatchResult(null);
              setPasteModalOpen(true);
            }}
            disabled={applyAllState.isActive}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Paste & Match JD
          </Button>

          {applyAllState.isActive ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopCircleIcon />}
              onClick={handleStopApplyAll}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                px: 2,
              }}
            >
              Stop Applying ({applyAllState.currentIndex + 1}/{applyAllState.totalJobs})
            </Button>
          ) : unappliedJobsOnPage.length === 0 && currentPageJobs.length > 0 ? (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              endIcon={hasNextPage ? <ArrowForwardIcon /> : undefined}
              onClick={() => {
                if (hasNextPage) {
                  setPage((prev) => prev + 1);
                  setToastMessage(`Navigating to Page ${page + 2}`);
                } else {
                  setToastMessage(`All jobs on Page ${page + 1} are already applied!`);
                }
              }}
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
              }}
            >
              Page {page + 1} Applied {hasNextPage ? '• Next Page' : ''}
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<BoltIcon />}
              disabled={loading || currentPageJobs.length === 0}
              onClick={handleApplyAll}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' },
                fontWeight: 700,
                textTransform: 'none',
                px: 2.2,
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
              }}
            >
              Apply All (Page {page + 1} • {unappliedJobsOnPage.length} Jobs)
            </Button>
          )}
        </Box>
      </Box>

      {/* Search & Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by job title, company, or keyword..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Search Profile</InputLabel>
            <Select
              value={profileFilter}
              label="Search Profile"
              onChange={(e) => setProfileFilter(e.target.value)}
            >
              <MenuItem value="">All Profiles</MenuItem>
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="DISCOVERED">Discovered</MenuItem>
              <MenuItem value="ANALYZED">Analyzed</MenuItem>
              <MenuItem value="MATCHED">Matched</MenuItem>
              <MenuItem value="APPLIED">Applied</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={excludeApplied}
                onChange={(e) => setExcludeApplied(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569', fontSize: '0.85rem' }}>
                Skip Applied Jobs
              </Typography>
            }
            sx={{ ml: 0.5 }}
          />
          {(search || statusFilter || profileFilter || excludeApplied) && (
            <Button
              size="small"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setProfileFilter('');
                setExcludeApplied(false);
              }}
              sx={{ color: '#64748b' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Active Apply All Progress Banner */}
      {applyAllState.isActive && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2.5,
            bgcolor: '#f8fafc',
            borderColor: '#93c5fd',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={22} thickness={5} sx={{ color: '#2563eb' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  Applying Jobs on Page {page + 1} ({applyAllState.currentIndex + 1} of {applyAllState.totalJobs})
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mt: 0.25 }}>
                  Now applying: <strong>{applyAllState.currentJobTitle}</strong> at <em>{applyAllState.currentCompany}</em>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${applyAllState.appliedCount} Applied`}
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600 }}
              />
              {applyAllState.reviewCount > 0 && (
                <Chip
                  label={`${applyAllState.reviewCount} Review`}
                  size="small"
                  sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 600 }}
                />
              )}
              {applyAllState.failedCount > 0 && (
                <Chip
                  label={`${applyAllState.failedCount} Failed`}
                  size="small"
                  sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}
                />
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<StopCircleIcon />}
                onClick={handleStopApplyAll}
                sx={{ ml: 1, textTransform: 'none', fontWeight: 600 }}
              >
                Stop
              </Button>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.round(((applyAllState.currentIndex + 1) / applyAllState.totalJobs) * 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#2563eb',
                borderRadius: 4,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Auto-matching best resume, filling contact fields, and submitting via Dice
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563eb' }}>
              {Math.round(((applyAllState.currentIndex + 1) / applyAllState.totalJobs) * 100)}% Complete
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Completed Apply All Banner */}
      {applyAllState.isCompleted && !applyAllState.isActive && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2.5,
            bgcolor: '#f0fdf4',
            borderColor: '#86efac',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: '#16a34a' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#14532d', lineHeight: 1.2 }}>
                  Page {page + 1} Batch Application Finished!
                </Typography>
                <Typography variant="body2" sx={{ color: '#166534', mt: 0.25 }}>
                  Successfully submitted <strong>{applyAllState.appliedCount}</strong> jobs
                  {applyAllState.reviewCount > 0 && `, ${applyAllState.reviewCount} queued for review`}
                  {applyAllState.failedCount > 0 && `, ${applyAllState.failedCount} failed`}.
                  {hasNextPage ? ' You can now go to the next page and click Apply All again.' : ' All pages complete!'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {hasNextPage && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleGoToNextPage}
                  sx={{
                    bgcolor: '#16a34a',
                    '&:hover': { bgcolor: '#15803d' },
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.5,
                    boxShadow: '0 3px 8px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  Go to Page {page + 2}
                </Button>
              )}
              <Button
                size="small"
                onClick={() => setApplyAllState((prev) => ({ ...prev, isCompleted: false }))}
                sx={{ color: '#4b5563', textTransform: 'none' }}
              >
                Dismiss
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Jobs Table */}
      <TableContainer component={Paper} variant="outlined" className="table-responsive-container" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Job Title & Company</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Resume Match</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Recommended Resume</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Loading jobs...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <WorkIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#64748b' }}>
                    No jobs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {search || statusFilter || profileFilter
                      ? 'No jobs match your active filters. Try clearing your filters or running a search profile.'
                      : 'Scrape jobs from Search Profiles or paste a Job Description directly to match resumes.'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                    {(search || statusFilter || profileFilter) && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('');
                          setProfileFilter('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button variant="contained" size="small" onClick={() => navigate('/search-profiles')} sx={{ bgcolor: '#6366f1' }}>
                      Go to Search Profiles
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setPasteModalOpen(true)}>
                      Paste & Match JD Now
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              jobs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((job) => {
                  const match = job.match_result;
                  const inAction = actionInProgress === job.id;
                  const isCurrentlyApplying = applyAllState.currentJobId === job.id || inAction;
                  const profile = profiles.find((p) => p.id === job.search_profile_id);
                  const displayTitle = job.title?.trim() || 'Untitled Position';
                  const displayCompany = job.company?.trim() || 'Company Not Specified';

                  return (
                    <TableRow
                      key={job.id}
                      hover
                      sx={{
                        bgcolor: isCurrentlyApplying ? '#eff6ff !important' : undefined,
                        transition: 'background-color 0.25s ease',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1e293b',
                              cursor: 'pointer',
                              '&:hover': { color: '#6366f1', textDecoration: 'underline' },
                            }}
                            onClick={() => handleOpenDrawer(job)}
                          >
                            {displayTitle}
                          </Typography>
                          {job.is_easy_apply && (
                            <Chip label="Easy Apply" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.68rem', height: 20 }} />
                          )}
                          {profile && (
                            <Chip
                              label={profile.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.68rem', height: 20, borderColor: '#cbd5e1', color: '#64748b' }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {displayCompany} {job.posted_date && `• ${job.posted_date}`} {job.salary && `• ${job.salary}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {job.location || 'Remote'}
                        </Typography>
                        {job.work_setting && (
                          <Chip
                            label={job.work_setting}
                            size="small"
                            color={job.work_setting === 'Remote' ? 'primary' : job.work_setting === 'Hybrid' ? 'secondary' : 'default'}
                            sx={{ fontSize: '0.68rem', height: 18, mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {match ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${match.match_percentage}%`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: match.match_percentage >= 75 ? '#dcfce7' : '#fef3c7',
                                color: match.match_percentage >= 75 ? '#15803d' : '#b45309',
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not Matched
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {match ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, maxWidth: 280 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                              <DescriptionIcon sx={{ fontSize: 16, color: '#6366f1', mt: 0.25, shrink: 0 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
                                {match.recommended_resume_name}
                              </Typography>
                            </Box>
                            {match.recommended_resume_file_name && match.recommended_resume_file_name !== match.recommended_resume_name && (
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', pl: 2.75 }}>
                                {match.recommended_resume_file_name}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {job.status === 'APPLIED' ? (
                            <Button
                              variant="contained"
                              size="small"
                              disabled
                              startIcon={<CheckCircleIcon fontSize="small" />}
                              sx={{
                                fontSize: '0.75rem',
                                py: 0.3,
                                px: 1.2,
                                bgcolor: '#16a34a !important',
                                color: '#ffffff !important',
                                fontWeight: 600,
                                textTransform: 'none',
                              }}
                            >
                              Applied
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={inAction || applyAllState.isActive}
                              startIcon={
                                inAction ? (
                                  <CircularProgress size={12} color="inherit" />
                                ) : job.status === 'FAILED' ? (
                                  <ReplayIcon fontSize="small" />
                                ) : (
                                  <BoltIcon fontSize="small" />
                                )
                              }
                              onClick={() => handleApply(job.id, match?.recommended_resume_id)}
                              sx={{
                                fontSize: '0.75rem',
                                py: 0.3,
                                px: 1.5,
                                bgcolor: job.status === 'FAILED' ? '#dc2626' : '#2563eb',
                                '&:hover': { bgcolor: job.status === 'FAILED' ? '#b91c1c' : '#1d4ed8' },
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: job.status === 'FAILED' ? '0 2px 4px rgba(220,38,38,0.2)' : '0 2px 4px rgba(37,99,235,0.2)',
                              }}
                            >
                              {inAction ? 'Applying...' : job.status === 'FAILED' ? 'Re-try' : 'Apply'}
                            </Button>
                          )}
                          <Button size="small" onClick={() => handleOpenDrawer(job)} sx={{ fontSize: '0.75rem' }} disabled={applyAllState.isActive && inAction}>
                            View
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {jobs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', mt: 1, pt: 0.5, px: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
              Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
            </Typography>
            {unappliedJobsOnPage.length === 0 && currentPageJobs.length > 0 && (
              <Chip
                label={`Page ${page + 1} All Applied`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 22, fontWeight: 600 }}
              />
            )}
            {unappliedJobsOnPage.length === 0 && hasNextPage && (
              <Button
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                onClick={handleGoToNextPage}
                disabled={applyAllState.isActive}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: '#16a34a' }}
              >
                Go to Page {page + 2}
              </Button>
            )}
          </Box>
          <TablePagination
            component="div"
            count={jobs.length}
            page={page}
            onPageChange={(_, newPage) => {
              if (!applyAllState.isActive) {
                setPage(newPage);
                setApplyAllState((prev) => ({ ...prev, isCompleted: false }));
              }
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              if (!applyAllState.isActive) {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
                setApplyAllState((prev) => ({ ...prev, isCompleted: false }));
              }
            }}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ borderTop: 'none' }}
          />
        </Box>
      )}

      {/* Job Detail & Match Breakdown Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 700 }, p: 0, bgcolor: '#ffffff' },
          },
        }}
      >
        {selectedJob && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2.5, bgcolor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedJob.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {selectedJob.company} • {selectedJob.location || 'Remote'} ({selectedJob.work_setting || 'Remote'})
                  </Typography>
                  {selectedJob.is_easy_apply && (
                    <Chip label="Easy Apply" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.65rem', height: 18 }} />
                  )}
                  {selectedJob.salary && (
                    <Chip label={selectedJob.salary} size="small" sx={{ bgcolor: '#334155', color: '#f8fafc', fontSize: '0.65rem', height: 18 }} />
                  )}
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              {/* Failed Job Error Card */}
              {(selectedJob.status === 'FAILED' || Boolean(selectedJob.failure_reason)) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2.5,
                    bgcolor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <ErrorOutlineIcon sx={{ color: '#dc2626', mt: 0.25, fontSize: 26 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#991b1b', lineHeight: 1.2 }}>
                          Application Failed
                        </Typography>
                        <Chip
                          label="FAILED"
                          size="small"
                          sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: '0.72rem', height: 22, border: '1px solid #fca5a5' }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 600, mb: 0.75, mt: 0.5 }}>
                        Reason for failure:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.75,
                          bgcolor: '#ffffff',
                          borderColor: '#fecaca',
                          borderRadius: 1.5,
                          color: '#b91c1c',
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {selectedJob.failure_reason || 'An unexpected error occurred during browser automation submission.'}
                      </Paper>
                      <Typography variant="caption" sx={{ color: '#7f1d1d', mt: 1, display: 'block' }}>
                        You can review the job requirements below, check your profile or screener answers, and click <strong>Re-try 1-Click Apply</strong> to attempt submission again.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Match Card if matched */}
              {selectedJob.match_result && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <SparklesIcon sx={{ color: '#6366f1', mt: 0.25 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                          Recommended: {selectedJob.match_result.recommended_resume_name}
                        </Typography>
                        {selectedJob.match_result.recommended_resume_file_name && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <DescriptionIcon sx={{ fontSize: 14, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {selectedJob.match_result.recommended_resume_file_name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={`${selectedJob.match_result.match_percentage}% Match`}
                      color={selectedJob.match_result.match_percentage >= 75 ? 'success' : 'warning'}
                      sx={{ fontWeight: 700, shrink: 0 }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#334155', mb: 2, lineHeight: 1.5 }}>
                    {selectedJob.match_result.reason}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#15803d', display: 'block', mb: 0.5 }}>
                    MATCHED SKILLS:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    {selectedJob.match_result.matched_skills.map((s) => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontSize: '0.75rem' }} />
                    ))}
                  </Box>

                  {selectedJob.match_result.missing_skills.length > 0 && (
                    <>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#b91c1c', display: 'block', mb: 0.5 }}>
                        MISSING REQUIREMENTS:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                        {selectedJob.match_result.missing_skills.map((s) => (
                          <Chip key={s} label={s} size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem' }} />
                        ))}
                      </Box>
                    </>
                  )}

                  {selectedJob.match_result.alternatives?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        TOP ALTERNATIVE CANDIDATES:
                      </Typography>
                      {selectedJob.match_result.alternatives.map((alt) => (
                        <Typography key={alt.resume_id} variant="caption" sx={{ display: 'block', color: '#475569' }}>
                          • {alt.display_name} ({alt.match_percentage}% match)
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

              {/* Action trigger if not matched */}
              {!selectedJob.match_result && (
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SparklesIcon />}
                    onClick={() => handleMatch(selectedJob.id)}
                    sx={{ bgcolor: '#6366f1', py: 1 }}
                  >
                    Compare Against All Resumes & Recommend Best Fit
                  </Button>
                  {!selectedJob.description_structured && (
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      disabled={actionInProgress === selectedJob.id}
                      onClick={() => handleAnalyze(selectedJob.id)}
                    >
                      Extract JD Requirements Only
                    </Button>
                  )}
                </Box>
              )}

              {/* Structured requirements if analyzed */}
              {selectedJob.description_structured && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                    Structured JD Requirements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
                    {selectedJob.description_structured.required_skills?.map((s) => (
                      <Chip key={s} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Required Experience: {selectedJob.description_structured.experience || 'Not specified'}
                  </Typography>
                </Box>
              )}

              {/* Full JD */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                Full Job Description
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 350,
                  overflowY: 'auto',
                }}
              >
                {selectedJob.description_raw}
              </Paper>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button onClick={() => setDrawerOpen(false)} color="inherit">
                Close
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePrepare(selectedJob.id, selectedJob.match_result?.recommended_resume_id)}
                  sx={{ textTransform: 'none' }}
                >
                  Prepare Only
                </Button>
                {selectedJob.status === 'APPLIED' ? (
                  <Button
                    variant="contained"
                    disabled
                    startIcon={<CheckCircleIcon />}
                    sx={{ bgcolor: '#16a34a !important', color: '#fff !important', textTransform: 'none', fontWeight: 600 }}
                  >
                    Applied
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={actionInProgress === selectedJob.id}
                    startIcon={
                      actionInProgress === selectedJob.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : selectedJob.status === 'FAILED' ? (
                        <ReplayIcon />
                      ) : (
                        <BoltIcon />
                      )
                    }
                    onClick={() => {
                      handleApply(selectedJob.id, selectedJob.match_result?.recommended_resume_id);
                      setDrawerOpen(false);
                    }}
                    sx={{
                      bgcolor: selectedJob.status === 'FAILED' ? '#dc2626' : '#2563eb',
                      '&:hover': { bgcolor: selectedJob.status === 'FAILED' ? '#b91c1c' : '#1d4ed8' },
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {actionInProgress === selectedJob.id
                      ? 'Applying...'
                      : selectedJob.status === 'FAILED'
                      ? 'Re-try 1-Click Apply'
                      : 'Apply (1-Click)'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Paste & Match Dialog (Phase 2 Direct Evaluation) */}
      <Dialog open={pasteModalOpen} onClose={() => setPasteModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Direct Job Description Matcher (Phase 2)
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste any Job Description from Dice or anywhere else. The engine will extract key requirements and compare them against your ~40 candidate resumes in MongoDB.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Target Role / Title"
              size="small"
              value={pasteTitle}
              onChange={(e) => setPasteTitle(e.target.value)}
            />
            <TextField
              label="Company Name"
              size="small"
              value={pasteCompany}
              onChange={(e) => setPasteCompany(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Job Description (Paste raw text here)"
            value={pasteJD}
            onChange={(e) => setPasteJD(e.target.value)}
            sx={{ mb: 2 }}
          />

          {matchingDirect && (
            <Box sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Analyzing requirements and matching across all candidate resumes...
              </Typography>
              <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
            </Box>
          )}

          {directMatchResult && (
            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    Recommended: {directMatchResult.match_result.recommended_resume_name}
                  </Typography>
                  {directMatchResult.match_result.recommended_resume_file_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <DescriptionIcon sx={{ fontSize: 14, color: '#64748b' }} />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {directMatchResult.match_result.recommended_resume_file_name}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Chip
                  label={`${directMatchResult.match_result.match_percentage}% Match`}
                  color="success"
                  sx={{ fontWeight: 700, shrink: 0 }}
                />
              </Box>
              <Typography variant="body2" sx={{ mb: 1.5, color: '#334155' }}>
                {directMatchResult.match_result.reason}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#15803d' }}>
                Matched Skills: {directMatchResult.match_result.matched_skills.join(', ')}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPasteModalOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleRunDirectMatch}
            disabled={matchingDirect}
            startIcon={<SparklesIcon />}
            sx={{ bgcolor: '#6366f1' }}
          >
            {matchingDirect ? 'Matching...' : 'Evaluate Against All Resumes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Jobs Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#dc2626' }}>
          Clear All Jobs?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete all jobs from Jobs Explorer? This will remove all scraped job entries from your database.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClearDialogOpen(false)} color="inherit" disabled={clearing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearAllJobs}
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepIcon />}
            sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' }, textTransform: 'none' }}
          >
            {clearing ? 'Clearing...' : 'Confirm Clear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};
