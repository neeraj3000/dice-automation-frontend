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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  PlayArrowRounded as PlayArrowIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  RefreshRounded as RefreshIcon,
  WorkRounded as WorkIcon,
  LocationOnRounded as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { SearchProfile, SearchProfileCreate } from '../types';

export const SearchProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SearchProfile | null>(null);
  const [name, setName] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [location, setLocation] = useState('United States');
  const [workSettings, setWorkSettings] = useState<string[]>(['Remote']);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['FULLTIME', 'CONTRACTS']);
  const [easyApplyOnly, setEasyApplyOnly] = useState(true);
  const [postedWithin, setPostedWithin] = useState('ONE');
  const [radius, setRadius] = useState(30);
  const [saving, setSaving] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSearchProfiles();
      setProfiles(data);
    } catch {
      setError('Failed to load search profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleOpenDialog = (profile?: SearchProfile) => {
    if (profile) {
      setEditingProfile(profile);
      setName(profile.name);
      setKeywordsInput(profile.keywords.join(', '));
      setLocation(profile.location);
      setWorkSettings(profile.work_settings || (profile.is_remote ? ['Remote'] : ['Remote', 'Hybrid', 'On-Site']));
      setEmploymentTypes(profile.employment_types || ['FULLTIME', 'CONTRACTS']);
      setEasyApplyOnly(profile.easy_apply_only !== undefined ? profile.easy_apply_only : true);
      setPostedWithin(profile.posted_within || 'ONE');
      setRadius(profile.radius || 30);
    } else {
      setEditingProfile(null);
      setName('');
      setKeywordsInput('');
      setLocation('United States');
      setWorkSettings(['Remote']);
      setEmploymentTypes(['FULLTIME', 'CONTRACTS']);
      setEasyApplyOnly(true);
      setPostedWithin('ONE');
      setRadius(30);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const kws = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (!name.trim() || kws.length === 0) {
      setError('Please provide a profile name and at least one keyword.');
      return;
    }

    setSaving(true);
    try {
      const payload: SearchProfileCreate = {
        name,
        keywords: kws,
        location,
        radius,
        work_settings: workSettings,
        employment_types: employmentTypes,
        easy_apply_only: easyApplyOnly,
        posted_within: postedWithin,
        is_remote: workSettings.includes('Remote'),
      };

      if (editingProfile) {
        await api.updateSearchProfile(editingProfile.id, payload);
        setToastMessage(`Updated profile "${name}"`);
      } else {
        await api.createSearchProfile(payload);
        setToastMessage(`Created profile "${name}"`);
      }
      setDialogOpen(false);
      fetchProfiles();
    } catch {
      setError('Failed to save search profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, profileName: string) => {
    if (window.confirm(`Delete search profile "${profileName}"?`)) {
      try {
        await api.deleteSearchProfile(id);
        setToastMessage(`Deleted profile "${profileName}"`);
        fetchProfiles();
      } catch {
        setError('Failed to delete profile.');
      }
    }
  };

  const handleRunSearch = async (profile: SearchProfile) => {
    setRunningId(profile.id);
    setRunResult(null);
    try {
      const result = await api.runSearchProfile(profile.id);
      setRunResult(
        `Dice Search Complete for "${profile.name}": Scraped ${result.total_found} jobs, ${result.new_jobs_added} new jobs added (${result.duplicates_skipped} duplicates skipped).`
      );
      setToastMessage(`Search completed: +${result.new_jobs_added} new jobs!`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Dice search execution failed or timed out.');
    } finally {
      setRunningId(null);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Dice Search Profiles
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Configure and trigger automated Playwright job search runs on Dice.com.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProfiles}
            disabled={loading}
            sx={{ borderColor: '#cbd5e1', color: '#334155', borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, fontWeight: 700 }}
          >
            Create Search Profile
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.25, mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>TOTAL PROFILES</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{profiles.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#bfdbfe', bgcolor: '#f0f9ff' }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7' }}>REMOTE PREFERENCE</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
              {profiles.filter((p) => (p.work_settings || []).includes('Remote') || p.is_remote).length}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#a7f3d0', bgcolor: '#f0fdf4' }}>
          <CardContent sx={{ py: 2, px: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#065f46' }}>EASY APPLY TARGETED</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#065f46', mt: 0.5 }}>
              {profiles.filter((p) => p.easy_apply_only !== false).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {runResult && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" endIcon={<WorkIcon />} onClick={() => navigate('/jobs')} sx={{ fontWeight: 700 }}>
              View Scraped Jobs
            </Button>
          }
        >
          {runResult}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Profiles Table */}
      <TableContainer component={Paper} variant="outlined" className="table-responsive-container" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Profile Name</TableCell>
              <TableCell>Search Keywords</TableCell>
              <TableCell>Location & Radius</TableCell>
              <TableCell>Work Settings</TableCell>
              <TableCell>Features & Posted</TableCell>
              <TableCell align="right">Run & Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} thickness={4} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Loading profiles...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748b' }}>
                    No search profiles created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Save keyword profiles (e.g. AI Engineer, Databricks Consultant) to automatically search Dice.
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => handleOpenDialog()} sx={{ bgcolor: '#6366f1' }}>
                    Create Profile
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((p) => {
                const isRunning = runningId === p.id;
                const settingsList = p.work_settings || (p.is_remote ? ['Remote'] : ['Remote', 'Hybrid', 'On-Site']);
                const postedLabel = p.posted_within === 'ONE' ? 'Today' : p.posted_within === 'THREE' ? 'Last 3 days' : p.posted_within === 'SEVEN' ? 'Last 7 days' : p.posted_within || 'Any';
                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 320 }}>
                        {p.keywords.map((k) => (
                          <Chip key={k} label={k} size="small" variant="outlined" sx={{ fontSize: '0.74rem', fontWeight: 600, borderColor: '#cbd5e1' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>{p.location}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">Within {p.radius || 30} miles</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {settingsList.map((ws) => (
                          <Chip
                            key={ws}
                            label={ws}
                            size="small"
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: ws === 'Remote' ? '#eff6ff' : ws === 'Hybrid' ? '#f5f3ff' : '#f8fafc',
                              color: ws === 'Remote' ? '#1e40af' : ws === 'Hybrid' ? '#6b21a8' : '#475569',
                              border: '1px solid',
                              borderColor: ws === 'Remote' ? '#bfdbfe' : ws === 'Hybrid' ? '#ddd6fe' : '#e2e8f0',
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                        {p.easy_apply_only !== false ? (
                          <Chip label="Easy Apply" size="small" sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #a7f3d0' }} />
                        ) : (
                          <Chip label="External Apply" size="small" sx={{ bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #bae6fd' }} />
                        )}
                        <Chip label={postedLabel} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
                          disabled={isRunning}
                          onClick={() => handleRunSearch(p)}
                          sx={{ fontSize: '0.78rem', py: 0.4, fontWeight: 700 }}
                        >
                          {isRunning ? 'Scraping...' : 'Run Search'}
                        </Button>
                        <Tooltip title="Edit Profile">
                          <IconButton size="small" onClick={() => handleOpenDialog(p)} sx={{ color: '#64748b' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Profile">
                          <IconButton size="small" color="error" onClick={() => handleDelete(p.id, p.name)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingProfile ? 'Edit Search Profile' : 'New Search Profile'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Profile Name"
            size="small"
            placeholder="e.g. AI Engineer - Remote"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="Keywords (comma-separated)"
            size="small"
            placeholder="AI Engineer, LLM Engineer, RAG, Python"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            helperText="Exact keywords used in Dice query"
            sx={{ mb: 2.5 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 2.5 }}>
            <TextField
              label="Location"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, Austin, TX, United States"
            />
            <FormControl size="small">
              <InputLabel>Distance</InputLabel>
              <Select value={radius} label="Distance" onChange={(e) => setRadius(Number(e.target.value))}>
                <MenuItem value={10}>10 miles</MenuItem>
                <MenuItem value={30}>30 miles</MenuItem>
                <MenuItem value={50}>50 miles</MenuItem>
                <MenuItem value={75}>75 miles</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Dice Work Settings */}
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.75, letterSpacing: '0.05em' }}>
            DICE WORK SETTINGS:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            {['Remote', 'Hybrid', 'On-Site'].map((setting) => (
              <FormControlLabel
                key={setting}
                control={
                  <Checkbox
                    checked={workSettings.includes(setting)}
                    onChange={(e) => {
                      if (e.target.checked) setWorkSettings([...workSettings, setting]);
                      else setWorkSettings(workSettings.filter((s) => s !== setting));
                    }}
                    size="small"
                    color="primary"
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{setting}</Typography>}
              />
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.5 }}>
            <FormControl size="small">
              <InputLabel>Posted Date (Dice)</InputLabel>
              <Select value={postedWithin} label="Posted Date (Dice)" onChange={(e) => setPostedWithin(e.target.value)}>
                <MenuItem value="ONE">Today (24 hours)</MenuItem>
                <MenuItem value="THREE">Last 3 days</MenuItem>
                <MenuItem value="SEVEN">Last 7 days</MenuItem>
                <MenuItem value="ANY">No preference</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>Employment Types</InputLabel>
              <Select
                multiple
                value={employmentTypes}
                label="Employment Types"
                renderValue={(selected) => selected.map((s) => s === 'FULLTIME' ? 'Full time' : s === 'CONTRACTS' ? 'Contract' : s === 'THIRD_PARTY' ? 'Third Party' : s).join(', ')}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmploymentTypes(typeof val === 'string' ? val.split(',') : val);
                }}
              >
                <MenuItem value="FULLTIME">Full time</MenuItem>
                <MenuItem value="CONTRACTS">Contract</MenuItem>
                <MenuItem value="THIRD_PARTY">Third Party</MenuItem>
                <MenuItem value="PARTTIME">Part time</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="easy-apply-filter-label">Application Type Filter</InputLabel>
              <Select
                labelId="easy-apply-filter-label"
                value={easyApplyOnly ? 'EASY_ONLY' : 'NON_EASY_ONLY'}
                label="Application Type Filter"
                onChange={(e) => setEasyApplyOnly(e.target.value === 'EASY_ONLY')}
              >
                <MenuItem value="EASY_ONLY">Easy Apply Only (Dice Application Wizard)</MenuItem>
                <MenuItem value="NON_EASY_ONLY">Standard / External Only (Company Direct)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mt: 1, px: 0.5 }}>
              {easyApplyOnly
                ? 'Recommended: Filters and scrapes only jobs with the Dice built-in application wizard.'
                : 'Standard: Filters and scrapes only company-direct/external jobs (strictly excludes Easy Apply).'}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, fontWeight: 700 }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
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
