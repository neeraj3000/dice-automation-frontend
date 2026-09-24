import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  RefreshRounded as RefreshIcon,
  CheckCircleRounded as CheckCircleIcon,
  SendRounded as SendIcon,
  CloseRounded as CloseIcon,
  RateReviewRounded as RateReviewIcon,
  DescriptionRounded as DescriptionIcon,
  WorkRounded as WorkIcon,
  ErrorOutlineRounded as ErrorOutlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Application } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Drawer State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Submission Protection Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [appToSubmit, setAppToSubmit] = useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getApplications();
      setApps(data);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenDrawer = (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const handleOpenSubmitModal = (app: Application) => {
    setAppToSubmit(app);
    setSubmitModalOpen(true);
  };

  const confirmSubmit = async () => {
    if (!appToSubmit) return;
    setSubmittingId(appToSubmit.id);
    try {
      const updated = await api.submitApplication(appToSubmit.id);
      setApps((prev) => prev.map((a) => (a.id === appToSubmit.id ? updated : a)));
      if (selectedApp?.id === appToSubmit.id) setSelectedApp(updated);
      setToastMessage(`Successfully submitted application to ${appToSubmit.company}!`);
      setSubmitModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Submission failed.');
    } finally {
      setSubmittingId(null);
    }
  };

  const appliedCount = apps.filter((a) => a.status === 'APPLIED').length;
  const readyCount = apps.filter((a) => a.status === 'READY').length;
  const reviewCount = apps.filter((a) => a.status === 'REVIEW').length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Application Tracker
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Verify prepared forms, review automation logs, and execute verified submissions on Dice.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchApplications}
            disabled={loading}
            sx={{ borderColor: '#cbd5e1', color: '#334155', borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>TOTAL APPLICATIONS</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{apps.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#a7f3d0', bgcolor: '#f0fdf4' }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#065f46' }}>SUBMITTED (APPLIED)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#065f46', mt: 0.5 }}>{appliedCount}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#bfdbfe', bgcolor: '#f0fdfa' }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e40af' }}>READY TO SUBMIT</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e40af', mt: 0.5 }}>{readyCount}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: reviewCount > 0 ? '#fde68a' : '#e2e8f0', bgcolor: reviewCount > 0 ? '#fffdf5' : '#ffffff' }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: reviewCount > 0 ? '#92400e' : '#64748b' }}>NEEDS REVIEW</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: reviewCount > 0 ? '#92400e' : '#0f172a', mt: 0.5 }}>{reviewCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Applications Table */}
      <TableContainer component={Paper} variant="outlined" className="table-responsive-container" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow>
              <TableCell>Job & Company</TableCell>
              <TableCell>Resume File</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} thickness={4} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b' }}>
                    Loading application records...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748b' }}>
                    No applications tracked yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Go to the Jobs Explorer and click &quot;Prepare Apply&quot; on any matched job.
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => navigate('/jobs')} sx={{ bgcolor: '#6366f1' }} startIcon={<WorkIcon />}>
                    Go to Jobs Explorer
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => {
                const canSubmit = app.status === 'READY' || app.status === 'APPLIED';
                const needsReview = app.status === 'REVIEW';
                return (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          '&:hover': { color: '#6366f1', textDecoration: 'underline' },
                        }}
                        onClick={() => handleOpenDrawer(app)}
                      >
                        {app.job_title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {app.company}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, maxWidth: 280 }}>
                        <DescriptionIcon sx={{ fontSize: 16, color: '#6366f1', shrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem', lineHeight: 1.3 }}>
                          {app.resume_name || 'Matched Resume'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.mode}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: app.mode === 'APPLY' ? '#f5f3ff' : '#f8fafc',
                          color: app.mode === 'APPLY' ? '#7c3aed' : '#475569',
                          border: '1px solid',
                          borderColor: app.mode === 'APPLY' ? '#ddd6fe' : '#e2e8f0',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <StatusBadge status={app.status} />
                        {app.failure_reason && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 180 }}>
                            <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 13, shrink: 0 }} />
                            <Typography variant="caption" sx={{ color: '#ef4444', fontSize: '0.68rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {app.failure_reason}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {app.applied_at ? new Date(app.applied_at).toLocaleString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {needsReview && (
                          <Button
                            variant="contained"
                            size="small"
                            color="warning"
                            startIcon={<RateReviewIcon />}
                            onClick={() => navigate('/review')}
                            sx={{ fontSize: '0.75rem', py: 0.4 }}
                          >
                            Answer Question
                          </Button>
                        )}
                        {canSubmit && (
                          <Button
                            variant="contained"
                            size="small"
                            color={app.status === 'APPLIED' ? 'primary' : 'success'}
                            startIcon={<SendIcon />}
                            onClick={() => handleOpenSubmitModal(app)}
                            sx={{ fontSize: '0.75rem', py: 0.4, bgcolor: app.status === 'APPLIED' ? '#4f46e5' : undefined }}
                          >
                            {app.status === 'APPLIED' ? 'Re-Submit' : 'Submit'}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDrawer(app)}
                          sx={{ fontSize: '0.75rem', py: 0.4, borderColor: '#cbd5e1', color: '#334155' }}
                        >
                          Timeline
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

      {/* Progress Timeline Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 540 }, p: 0, bgcolor: '#ffffff' },
          },
        }}
      >
        {selectedApp && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, bgcolor: '#090d16', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                  {selectedApp.job_title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  {selectedApp.company} • Status: {selectedApp.status}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.75 }}>
                  Matched Candidate Resume
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <DescriptionIcon sx={{ color: '#6366f1' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {selectedApp.resume_name || 'Resume'}
                  </Typography>
                </Box>
              </Box>

              {selectedApp.failure_reason && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  {selectedApp.failure_reason}
                </Alert>
              )}

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.25 }}>
                Playwright Automation Timeline
              </Typography>
              <List dense sx={{ bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', p: 1.5 }}>
                {selectedApp.progress_steps?.map((step, idx) => (
                  <ListItem key={idx} sx={{ py: 0.75, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={step}
                      slotProps={{
                        primary: {
                          sx: { fontSize: '0.84rem', fontWeight: 500, color: '#1e293b', lineHeight: 1.4 },
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
              <Button onClick={() => setDrawerOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                Close
              </Button>
              {selectedApp.status === 'READY' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SendIcon />}
                  onClick={() => {
                    setDrawerOpen(false);
                    handleOpenSubmitModal(selectedApp);
                  }}
                  sx={{ fontWeight: 700 }}
                >
                  Submit Application
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Submission Protection Confirmation Modal */}
      <Dialog open={submitModalOpen} onClose={() => setSubmitModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Application Submission
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2, color: '#1e293b', fontSize: '0.88rem' }}>
            Please confirm the candidate resume and company details before executing the submission on Dice:
          </DialogContentText>
          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              COMPANY:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
              {appToSubmit?.company}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              ROLE:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>
              {appToSubmit?.job_title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              ATTACHED RESUME:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#4338ca' }}>
              {appToSubmit?.resume_name}
            </Typography>
          </Box>
          <Alert severity="info" sx={{ fontSize: '0.8rem', borderRadius: 2 }}>
            Playwright will navigate to the application wizard, attach this resume file, verify all fields, and click Submit.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSubmitModalOpen(false)} color="inherit" disabled={Boolean(submittingId)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmSubmit}
            disabled={Boolean(submittingId)}
            startIcon={submittingId ? <CircularProgress size={14} color="inherit" /> : <SendIcon />}
            sx={{ fontWeight: 700 }}
          >
            {submittingId ? 'Submitting on Dice...' : 'Confirm & Submit'}
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
