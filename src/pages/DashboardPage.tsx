import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  DescriptionRounded as DescriptionIcon,
  ManageSearchRounded as ManageSearchIcon,
  WorkRounded as WorkIcon,
  ArrowForwardRounded as ArrowForwardIcon,
  AutoAwesomeRounded as SparklesIcon,
  RefreshRounded as RefreshIcon,
  SendRounded as SendIcon,
  RateReviewRounded as RateReviewIcon,
  BoltRounded as BoltIcon,
  TrendingUpRounded as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [diceStatus, setDiceStatus] = useState<{ is_connected: boolean; username?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsData, diceData] = await Promise.all([
        api.getDashboardStats(),
        api.getDiceStatus(),
      ]);
      setStats(statsData);
      setDiceStatus(diceData);
    } catch {
      // Fallback empty stats
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3.5,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          color: '#ffffff',
          boxShadow: '0 12px 32px -8px rgba(49, 46, 129, 0.45)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2.5,
        }}
      >
        {/* Background decorative orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, rgba(129, 140, 248, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ maxWidth: 720, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: '#ffffff' }} />}
              label="DICE APPLICATION ENGINE"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontWeight: 800,
                fontSize: '0.68rem',
                letterSpacing: '0.05em',
              }}
            />
            <Chip
              icon={diceStatus?.is_connected ? <BoltIcon sx={{ color: '#6ee7b7 !important', fontSize: 16 }} /> : undefined}
              label={diceStatus?.is_connected ? `Dice Connected: ${diceStatus.username || 'Active'}` : 'Dice: Sign-In Required'}
              size="small"
              onClick={() => navigate('/settings')}
              sx={{
                bgcolor: diceStatus?.is_connected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                color: '#ffffff',
                border: '1px solid',
                borderColor: diceStatus?.is_connected ? 'rgba(52, 211, 153, 0.5)' : 'rgba(251, 191, 36, 0.5)',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
              }}
            />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', sm: '2.1rem' } }}>
            Automated Job Application Suite
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 650 }}>
            Manage ~40 candidate resumes, search Dice using Playwright automation, evaluate JDs with AI semantic matching, and execute verified job submissions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/jobs')}
              sx={{
                bgcolor: '#ffffff',
                color: '#3730a3',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-1px)' },
              }}
              startIcon={<WorkIcon />}
            >
              Explore Jobs
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/resumes')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                fontWeight: 600,
                px: 2,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
              startIcon={<DescriptionIcon />}
            >
              Resume Library
            </Button>
          </Box>
        </Box>

        <Box sx={{ zIndex: 1 }}>
          <Tooltip title="Refresh platform metrics">
            <Button
              variant="outlined"
              onClick={fetchStats}
              disabled={loading}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2.25, mb: 3.5 }}>
        {/* Metric 1: Resumes */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateY(-3px)', borderColor: '#818cf8', boxShadow: '0 10px 20px -3px rgba(99, 102, 241, 0.1)' },
          }}
          onClick={() => navigate('/resumes')}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                RESUME LIBRARY
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#eef2ff', color: '#6366f1' }}>
                <DescriptionIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.resumes_count ?? 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#6366f1' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                Manage candidate files <ArrowForwardIcon sx={{ fontSize: 13, ml: 0.5 }} />
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Metric 2: Search Profiles */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateY(-3px)', borderColor: '#38bdf8', boxShadow: '0 10px 20px -3px rgba(14, 165, 233, 0.1)' },
          }}
          onClick={() => navigate('/search-profiles')}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                SEARCH PROFILES
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#f0f9ff', color: '#0284c7' }}>
                <ManageSearchIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.profiles_count ?? 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#0284c7' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                Dice Search Configs <ArrowForwardIcon sx={{ fontSize: 13, ml: 0.5 }} />
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Metric 3: Jobs Scraped */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateY(-3px)', borderColor: '#34d399', boxShadow: '0 10px 20px -3px rgba(16, 185, 129, 0.1)' },
          }}
          onClick={() => navigate('/jobs')}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                JOBS DISCOVERED
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#ecfdf5', color: '#059669' }}>
                <WorkIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.jobs_count ?? 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#059669' }}>
              <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {stats?.jobs_matched ?? 0} AI Evaluated
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Metric 4: Applications */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateY(-3px)', borderColor: '#a78bfa', boxShadow: '0 10px 20px -3px rgba(139, 92, 246, 0.1)' },
          }}
          onClick={() => navigate('/applications')}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                APPLICATIONS
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                <SendIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats?.apps_count ?? 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: '#7c3aed' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {stats?.apps_applied ?? 0} Submitted • {stats?.apps_ready ?? 0} Ready
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Metric 5: Review Queue */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            borderColor: (stats?.review_count ?? 0) > 0 ? '#f59e0b' : '#e2e8f0',
            bgcolor: (stats?.review_count ?? 0) > 0 ? '#fffdf5' : '#ffffff',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 20px -3px rgba(245, 158, 11, 0.12)' },
          }}
          onClick={() => navigate('/review')}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: (stats?.review_count ?? 0) > 0 ? '#b45309' : '#64748b', letterSpacing: '0.05em' }}>
                HUMAN REVIEW
              </Typography>
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: (stats?.review_count ?? 0) > 0 ? '#fef3c7' : '#f8fafc', color: '#d97706' }}>
                <RateReviewIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: (stats?.review_count ?? 0) > 0 ? '#b45309' : '#0f172a', mt: 0.5 }}>
              {stats?.review_count ?? 0}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: (stats?.review_count ?? 0) > 0 ? '#b45309' : '#64748b' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {(stats?.review_count ?? 0) > 0 ? 'Action required!' : 'Queue is clear'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Applications Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Recent Applications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time snapshot of submissions and prepared candidates
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/applications')}
            sx={{ fontWeight: 600, color: '#6366f1' }}
          >
            View All Applications
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Resume Attached</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} thickness={4} />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#64748b' }}>
                      Fetching application records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !stats?.recent_applications?.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b' }}>
                      No applications prepared yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Explore discovered jobs and click &quot;Prepare Apply&quot; to begin automation.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/jobs')}
                      sx={{ bgcolor: '#6366f1' }}
                      startIcon={<WorkIcon />}
                    >
                      Go to Jobs Explorer
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                stats.recent_applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {app.job_title}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                      {app.company}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <DescriptionIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.82rem' }}>
                          {app.resume_name || 'Resume'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell><StatusBadge status={app.status} /></TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate('/applications')}
                        sx={{ fontSize: '0.75rem', py: 0.3, borderColor: '#cbd5e1', color: '#334155' }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Quick Access Feature Banners */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#818cf8', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#eef2ff', color: '#6366f1' }}>
              <SparklesIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Instant JD Matcher (Phase 2)
              </Typography>
              <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>
                AI-Driven Candidate Evaluation
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Paste any external job description directly into the evaluation modal to extract structured requirements and score all ~40 candidate resumes in your library.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/jobs')}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            endIcon={<ArrowForwardIcon />}
          >
            Launch JD Matcher
          </Button>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#38bdf8', boxShadow: '0 8px 24px rgba(14, 165, 233, 0.08)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7' }}>
              <ManageSearchIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Dice Scraper Profiles (Phase 3)
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                Automated Playwright Job Harvester
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Save keyword profiles, locations, and Easy-Apply preferences to automate browser-based job scraping runs on Dice with persistent session authentication.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/search-profiles')}
            sx={{ borderColor: '#cbd5e1', color: '#334155', '&:hover': { borderColor: '#0284c7', color: '#0284c7' } }}
            endIcon={<ArrowForwardIcon />}
          >
            Configure Search Profiles
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
