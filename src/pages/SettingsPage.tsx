import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  PersonRounded as PersonIcon,
  TuneRounded as TuneIcon,
  RefreshRounded as RefreshIcon,
  SecurityRounded as SecurityIcon,
  OpenInNewRounded as OpenInNewIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import { useDice } from '../context/DiceContext';
import type { UserProfile, AppSettings } from '../types';

function formatRelativeTime(dateInput?: string | null): string {
  if (!dateInput) return 'Never';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 minute ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 7200) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zip_code: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    years_of_experience: '5',
    work_authorization: 'US Citizen',
    willing_to_relocate: false,
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    max_jobs_per_search: 15,
    max_applications_per_run: 10,
    default_mode: 'PREPARE',
    headless_browser: false,
  });

  const {
    diceStatus,
    refreshDiceStatus,
    disconnectDice,
    isChecking,
    isDisconnecting,
    syncSuccess,
    clearSyncSuccess,
    syncError,
    clearSyncError,
    onLoginSuccess,
  } = useDice();

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
  const [verifyingLive, setVerifyingLive] = useState(false);

  useEffect(() => {
    if (onLoginSuccess) {
      onLoginSuccess((status) => {
        setToastMessage(`Dice account connected successfully! Account: ${status.username || 'Active Candidate'}`);
      });
    }
  }, [onLoginSuccess]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, settsData] = await Promise.all([
        api.getProfile(),
        api.getSettings(),
        refreshDiceStatus(),
      ]);
      setProfile(profData);
      setSettings(settsData);
    } catch {
      setError('Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile);
      setToastMessage('Personal profile saved successfully!');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setToastMessage('AI & Automation settings updated!');
    } catch {
      setError('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectClick = () => {
    setConfirmDisconnectOpen(true);
  };

  const handleConfirmDisconnect = async () => {
    setConfirmDisconnectOpen(false);
    const success = await disconnectDice();
    if (success) {
      setToastMessage('Dice account disconnected successfully.');
    } else {
      setError('Failed to disconnect Dice session.');
    }
  };

  const handleVerifyDiceLive = async () => {
    setVerifyingLive(true);
    try {
      const res = await refreshDiceStatus(true);
      if (res.is_connected || res.status === 'CONNECTED' || res.status === 'valid') {
        setToastMessage(`Dice session active and verified!`);
      } else if (res.status === 'SESSION_EXPIRED') {
        setError('Dice session has expired. Please reconnect using the Chrome extension.');
      } else if (res.status === 'BROWSER_ERROR') {
        setError('Browser verification encountered an error.');
      } else {
        setError('Dice session is not connected.');
      }
    } catch {
      setError('Failed to verify Dice session.');
    } finally {
      setVerifyingLive(false);
    }
  };

  const isConnected = Boolean(
    diceStatus?.is_connected ||
    diceStatus?.connected ||
    diceStatus?.status === 'CONNECTED' ||
    diceStatus?.status === 'valid'
  );

  const sessionStatus = diceStatus?.status || (isConnected ? 'CONNECTED' : 'DISCONNECTED');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={36} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
          Settings & Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure personal information, auto-apply thresholds, and your Dice account connection.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            px: 3,
            pt: 1,
            borderBottom: '1px solid #f1f5f9',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              minHeight: 48,
              color: '#64748b',
              '&.Mui-selected': { color: '#6366f1' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal Profile" />
          <Tab icon={<TuneIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="AI & Automation" />
        </Tabs>

        {/* Tab 0: Personal Profile */}
        {tab === 0 && (
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Candidate Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Used to automatically populate recruiter screening questions and application details.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
              <TextField
                label="First Name"
                size="small"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
              <TextField
                label="Last Name"
                size="small"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
              <TextField
                label="Email Address"
                size="small"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <TextField
                label="Phone Number"
                size="small"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
              <TextField
                label="City"
                size="small"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />
              <TextField
                label="State"
                size="small"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
              <TextField
                label="Zip Code"
                size="small"
                value={profile.zip_code}
                onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
              />
            </Box>

            <TextField
              fullWidth
              label="LinkedIn Profile URL"
              size="small"
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              sx={{ mb: 2.5 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
              <TextField
                label="GitHub URL"
                size="small"
                value={profile.github_url}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              />
              <TextField
                label="Portfolio URL"
                size="small"
                value={profile.portfolio_url}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
              <FormControl size="small">
                <InputLabel>Work Authorization</InputLabel>
                <Select
                  value={profile.work_authorization}
                  label="Work Authorization"
                  onChange={(e) => setProfile({ ...profile, work_authorization: e.target.value })}
                >
                  <MenuItem value="US Citizen">US Citizen</MenuItem>
                  <MenuItem value="Green Card">Permanent Resident (Green Card)</MenuItem>
                  <MenuItem value="H1B">H-1B Visa</MenuItem>
                  <MenuItem value="EAD">EAD / OPT</MenuItem>
                  <MenuItem value="Canadian Citizen">Canadian Citizen</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Years of Experience"
                size="small"
                value={profile.years_of_experience}
                onChange={(e) => setProfile({ ...profile, years_of_experience: e.target.value })}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={profile.willing_to_relocate}
                  onChange={(e) => setProfile({ ...profile, willing_to_relocate: e.target.checked })}
                  color="primary"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Willing to Relocate</Typography>}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #f1f5f9' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={saving}
                sx={{ bgcolor: '#6366f1', px: 3, py: 1, fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Tab 1: AI & Automation */}
        {tab === 1 && (
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Automation & Browser Session Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Control application rate limits, automation mode, and your synchronized Dice session.
              </Typography>
            </Box>

            {/* Dice Account Connection Section */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', mb: 0.75 }}>
                  Dice Account
                </Typography>

                {/* State Badge / Indicator */}
                {isChecking ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={12} sx={{ color: '#6366f1' }} />
                    <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
                      Checking status...
                    </Typography>
                  </Box>
                ) : isConnected ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: '#10b981',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
                        display: 'inline-block',
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, color: '#065f46', fontSize: '0.9rem' }}>
                      Connected
                    </Typography>
                  </Box>
                ) : sessionStatus === 'SESSION_EXPIRED' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: '#f59e0b',
                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
                        display: 'inline-block',
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, color: '#92400e', fontSize: '0.9rem' }}>
                      Session Expired
                    </Typography>
                  </Box>
                ) : sessionStatus === 'BROWSER_ERROR' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                        display: 'inline-block',
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9rem' }}>
                      Browser Error
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        border: '2px solid #64748b',
                        bgcolor: 'transparent',
                        display: 'inline-block',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, color: '#475569', fontSize: '0.9rem' }}>
                      Not Connected
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Connected State Body */}
              {isConnected ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.25 }}>
                      Last verified:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatRelativeTime(diceStatus?.last_verified_at || diceStatus?.last_verified)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={isDisconnecting || isChecking}
                      onClick={handleDisconnectClick}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        borderColor: '#fca5a5',
                        color: '#dc2626',
                        '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
                      }}
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect Dice'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={verifyingLive || isChecking}
                      onClick={handleVerifyDiceLive}
                      startIcon={verifyingLive ? <CircularProgress size={13} /> : <RefreshIcon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: '#475569',
                        borderColor: '#cbd5e1',
                      }}
                    >
                      {verifyingLive ? 'Verifying...' : 'Verify Session'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                /* Disconnected State Body */
                <Box sx={{ mt: 2 }}>
                  {sessionStatus === 'SESSION_EXPIRED' && (
                    <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, py: 0.5 }}>
                      Your Dice session has expired. Click <strong>Connect Dice</strong> to re-sync using the Dice Sync Chrome Extension.
                    </Alert>
                  )}
                  {sessionStatus === 'BROWSER_ERROR' && (
                    <Alert severity="error" sx={{ borderRadius: 2, mb: 2, py: 0.5 }}>
                      Browser verification encountered an error. Click <strong>Connect Dice</strong> to re-sync your session.
                    </Alert>
                  )}
                  {sessionStatus === 'LOGIN_REQUIRED' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Login is required on Dice.com before synchronizing your account session.
                    </Typography>
                  )}
                  {!['SESSION_EXPIRED', 'BROWSER_ERROR', 'LOGIN_REQUIRED'].includes(sessionStatus) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect your Dice candidate account to enable automated searches and application wizard.
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => {
                        clearSyncError();
                        clearSyncSuccess();
                        setConnectModalOpen(true);
                      }}
                      sx={{
                        bgcolor: '#0f172a',
                        '&:hover': { bgcolor: '#1e293b' },
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        px: 3,
                        py: 0.85,
                        borderRadius: 2,
                      }}
                    >
                      Connect Dice
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={verifyingLive || isChecking}
                      onClick={handleVerifyDiceLive}
                      startIcon={verifyingLive ? <CircularProgress size={13} /> : <RefreshIcon fontSize="small" />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: '#475569',
                        borderColor: '#cbd5e1',
                      }}
                    >
                      {verifyingLive ? 'Checking...' : 'Check Status'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Automation Settings Form */}
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Default Automation Mode</InputLabel>
                <Select
                  value={settings.default_mode}
                  label="Default Automation Mode"
                  onChange={(e) => setSettings({ ...settings, default_mode: e.target.value })}
                >
                  <MenuItem value="PREPARE">Prepare (Fills form & pauses at final review - Recommended)</MenuItem>
                  <MenuItem value="ANALYZE">Analyze (Only matches resume)</MenuItem>
                  <MenuItem value="APPLY">Apply (Auto-submits when verified)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
              <TextField
                label="Max Jobs Per Search Run"
                type="number"
                size="small"
                value={settings.max_jobs_per_search}
                onChange={(e) => setSettings({ ...settings, max_jobs_per_search: parseInt(e.target.value) || 15 })}
              />
              <TextField
                label="Max Applications Per Run"
                type="number"
                size="small"
                value={settings.max_applications_per_run}
                onChange={(e) => setSettings({ ...settings, max_applications_per_run: parseInt(e.target.value) || 10 })}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.headless_browser || false}
                  onChange={(e) => setSettings({ ...settings, headless_browser: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Run Browser in Headless Mode (Uncheck to watch the browser in action and log in manually)
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #f1f5f9' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={saving}
                sx={{ bgcolor: '#6366f1', px: 3, py: 1, fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Connect Dice Modal / Flow */}
      <Dialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: '#6366f1' }} />
          Connect Dice Account
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {/* Security Guarantee: Never ask for user password */}
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Zero-Password Security
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
              This application will <strong>never</strong> ask for your Dice password. Sign in normally in your official Chrome browser.
            </Typography>
          </Alert>

          {/* Sync Success State */}
          {syncSuccess || isConnected ? (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Dice Account Successfully Connected!
              </Typography>
              <Typography variant="body2">
                {diceStatus?.username ? `Active account: ${diceStatus.username}. ` : ''}Your session is verified and ready for automation.
              </Typography>
            </Alert>
          ) : null}

          {/* Sync Failure State */}
          {syncError && !isConnected ? (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={clearSyncError}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Connection Sync Failed
              </Typography>
              <Typography variant="body2">{syncError}</Typography>
            </Alert>
          ) : null}

          {/* 5-Step Instructions */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              Follow these steps to connect:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Step 1 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  1
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Open Dice in Chrome
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open('https://www.dice.com/dashboard/login', '_blank')}
                    sx={{ mt: 0.75, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderColor: '#cbd5e1' }}
                  >
                    Open Dice Login in New Tab
                  </Button>
                </Box>
              </Box>

              {/* Step 2 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  2
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Log in normally
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sign into your Dice account using your email/password or Google Sign-In with 2FA as usual.
                  </Typography>
                </Box>
              </Box>

              {/* Step 3 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  3
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Use the Dice Sync Chrome Extension
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click the Dice Automation Sync icon in your Chrome extensions bar.
                  </Typography>
                </Box>
              </Box>

              {/* Step 4 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  4
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Click Sync
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    In the extension popup, click <strong>&quot;Sync Dice Account&quot;</strong>.
                  </Typography>
                </Box>
              </Box>

              {/* Step 5 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}
                >
                  5
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Return here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This dialog will automatically detect your synced session in real-time.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Live listening indicator */}
          {!isConnected && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={16} sx={{ color: '#6366f1' }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                Waiting for extension sync... (Auto-detecting in real-time)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            size="small"
            startIcon={verifyingLive ? <CircularProgress size={14} /> : <RefreshIcon />}
            disabled={verifyingLive}
            onClick={handleVerifyDiceLive}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {verifyingLive ? 'Checking...' : 'Check Status Now'}
          </Button>
          <Button
            variant={isConnected ? 'contained' : 'outlined'}
            color={isConnected ? 'success' : 'inherit'}
            onClick={() => setConnectModalOpen(false)}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            {isConnected ? 'Done' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={confirmDisconnectOpen}
        onClose={() => setConfirmDisconnectOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Disconnect Dice Account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to disconnect your Dice account session? You will need to re-sync using the Chrome extension to resume automated searches and applications.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setConfirmDisconnectOpen(false)} color="inherit" size="small" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDisconnect}
            color="error"
            variant="contained"
            size="small"
            disabled={isDisconnecting}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};
