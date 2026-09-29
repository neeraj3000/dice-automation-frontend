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
  Divider,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  PersonRounded as PersonIcon,
  TuneRounded as TuneIcon,
  LaunchRounded as LaunchIcon,
  RefreshRounded as RefreshIcon,
  CheckCircleRounded as CheckCircleIcon,
  SecurityRounded as SecurityIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import { useDice } from '../context/DiceContext';
import type { UserProfile, AppSettings } from '../types';

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

  const { diceStatus, refreshDiceStatus, isWaitingForLogin, onLoginSuccess } = useDice();

  useEffect(() => {
    if (onLoginSuccess) {
      onLoginSuccess((status) => {
        setToastMessage(`Dice account connected successfully! Account: ${status.username || 'Active User'}`);
      });
    }
  }, [onLoginSuccess]);
  const [verifyingLive, setVerifyingLive] = useState(false);
  const [openingBrowser, setOpeningBrowser] = useState(false);

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

  const handleOpenDiceLogin = async () => {
    setOpeningBrowser(true);
    try {
      const res = await api.openDiceLogin();
      setToastMessage(res.message || 'Browser opened! Please sign in to Dice in the opened window.');
    } catch {
      setError('Failed to open browser. Please check backend logs.');
    } finally {
      setOpeningBrowser(false);
    }
  };

  const handleVerifyDiceLive = async () => {
    setVerifyingLive(true);
    try {
      const res = await refreshDiceStatus(true);
      if (res.is_connected) {
        setToastMessage(`Dice session active! Account: ${res.username || 'Active User'}`);
      } else {
        setError('Dice session is not connected or requires login.');
      }
    } catch {
      setError('Failed to verify Dice session.');
    } finally {
      setVerifyingLive(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={32} thickness={4} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Loading settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Settings & Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Manage your personal details for automated form population and configure AI matching preferences.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: { xs: 1.5, sm: 2.5 },
            bgcolor: '#f8fafc',
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.88rem', py: 2 },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="Personal Profile (Form Autofill)" />
          <Tab icon={<TuneIcon sx={{ fontSize: 19 }} />} iconPosition="start" label="AI & Automation Engine" />
        </Tabs>

        {/* Tab 0: Profile */}
        {tab === 0 && (
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Contact & Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These values are deterministically filled into Dice application fields by Playwright.
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
                type="email"
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
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
                label="ZIP Code"
                size="small"
                value={profile.zip_code}
                onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Professional Links & Work Authorization
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="LinkedIn URL"
              size="small"
              placeholder="https://linkedin.com/in/..."
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
                Control application rate limits, automation mode, and persistent Dice browser profile.
              </Typography>
            </Box>

            {/* Dice Account Connection Card */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <SecurityIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      Dice.com Account Session
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Persistent Chrome profile authentication
                    </Typography>
                  </Box>
                  <Chip
                    icon={diceStatus?.is_connected ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                    label={diceStatus?.is_connected ? 'CONNECTED' : 'NOT CONNECTED'}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: diceStatus?.is_connected ? '#ecfdf5' : '#fffbeb',
                      color: diceStatus?.is_connected ? '#065f46' : '#92400e',
                      border: '1px solid',
                      borderColor: diceStatus?.is_connected ? '#a7f3d0' : '#fde68a',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={verifyingLive ? <CircularProgress size={14} /> : <RefreshIcon />}
                    disabled={verifyingLive}
                    onClick={handleVerifyDiceLive}
                    sx={{ borderColor: '#cbd5e1', color: '#334155', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    {verifyingLive ? 'Verifying...' : 'Verify Session'}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={openingBrowser ? <CircularProgress size={14} color="inherit" /> : <LaunchIcon />}
                    disabled={openingBrowser}
                    onClick={handleOpenDiceLogin}
                    sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' }, fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    {openingBrowser ? 'Opening...' : 'Open Dice in Browser'}
                  </Button>
                </Box>
              </Box>

              {isWaitingForLogin && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} sx={{ color: '#2563eb' }} />
                  <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
                    Waiting for Dice sign-in in browser window... (Real-time detection active)
                  </Typography>
                </Box>
              )}

              {diceStatus?.is_connected ? (
                <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5 }}>
                    Active User Profile: {diceStatus.username || 'Active User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.5 }}>
                    {diceStatus.cookies_count || 24} authenticated session cookies active in <code>data/browser_profile/</code>. 
                    Search runs and Application Wizard preparation will automatically run with your authenticated Dice profile.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active Dice session detected. Click &quot;Open Dice in Browser&quot; to sign in once.
                </Typography>
              )}
            </Paper>

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

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};
