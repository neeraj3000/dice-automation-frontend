import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Blocks,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  Globe,
  PlugZap,
  RefreshCw,
  Save,
  ShieldCheck,
  Sliders,
  Unplug,
  User,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { Chip, PageHeader, Skeleton, Toggle } from '../../components/ui/Misc';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useGetProfileQuery,
  useGetSettingsQuery,
  useImportDiceSessionMutation,
  useOpenDiceLoginMutation,
  useUpdateProfileMutation,
  useUpdateSettingsMutation,
} from './settingsApi';
import { useDice } from '../../context/DiceContext';

const WORK_AUTH_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1B',
  'EAD',
  'OPT/CPT',
  'TN Visa',
  'Other / Sponsorship Needed',
];

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');

  // Queries
  const { data: profileData, isLoading: loadingProfile, refetch: refetchProfile } = useGetProfileQuery();
  const { data: settingsData, isLoading: loadingSettings, refetch: refetchSettings } = useGetSettingsQuery();

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updateSettings, { isLoading: savingSettings }] = useUpdateSettingsMutation();
  const [openDiceLogin] = useOpenDiceLoginMutation();
  const [importDiceSession, { isLoading: importingCookies }] = useImportDiceSessionMutation();

  const {
    diceStatus,
    refreshDiceStatus,
    disconnectDice,
    isChecking,
    isWaitingForLogin,
    setIsWaitingForLogin,
  } = useDice();

  // Profile Form State
  const [profile, setProfile] = useState({
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

  // Settings Form State
  const [settings, setSettings] = useState({
    max_jobs_per_search: 15,
    max_applications_per_run: 10,
    default_mode: 'PREPARE',
    headless_browser: false,
  });

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const cookieFileRef = useRef(null);

  useEffect(() => {
    if (profileData) {
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zip_code: profileData.zip_code || '',
        linkedin_url: profileData.linkedin_url || profileData.linkedin || '',
        github_url: profileData.github_url || profileData.github || '',
        portfolio_url: profileData.portfolio_url || profileData.portfolio || '',
        years_of_experience: String(profileData.years_of_experience ?? profileData.years_experience ?? '5'),
        work_authorization: profileData.work_authorization || 'US Citizen',
        willing_to_relocate: Boolean(profileData.willing_to_relocate),
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (settingsData) {
      setSettings({
        max_jobs_per_search: settingsData.max_jobs_per_search || 15,
        max_applications_per_run: settingsData.max_applications_per_run || 10,
        default_mode: settingsData.default_mode || 'PREPARE',
        headless_browser: Boolean(settingsData.headless_browser ?? settingsData.headless),
      });
    }
  }, [settingsData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile).unwrap();
      toast.success('Personal profile saved successfully!');
      refetchProfile();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings).unwrap();
      toast.success('Automation parameters saved!');
      refetchSettings();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleCookieFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      let cookies = [];
      try {
        const parsed = JSON.parse(text);
        cookies = Array.isArray(parsed) ? parsed : parsed.cookies || [];
      } catch {
        toast.error('File must be a valid JSON array of cookies.');
        return;
      }

      await importDiceSession({ cookies }).unwrap();
      toast.success('Dice session cookies imported successfully!');
      setConnectModalOpen(false);
      refreshDiceStatus(true);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleTriggerDiceLogin = async () => {
    setIsWaitingForLogin(true);
    try {
      const res = await openDiceLogin().unwrap();
      if (res?.login_url) {
        window.open(res.login_url, '_blank');
      } else {
        window.open('https://www.dice.com/dashboard/login', '_blank');
      }
      toast.success('Opened Dice login. Log in, then sync your account.');
    } catch {
      window.open('https://www.dice.com/dashboard/login', '_blank');
    }
  };

  const isLoading = loadingProfile || loadingSettings;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Integrations"
        description="Manage candidate profile details, automation limits, and Dice session credentials."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line pb-2">
        <Chip active={tab === 'profile'} onClick={() => setTab('profile')}>
          Personal Profile
        </Chip>
        <Chip active={tab === 'automation'} onClick={() => setTab('automation')}>
          AI & Automation
        </Chip>
        <Chip active={tab === 'dice'} onClick={() => setTab('dice')}>
          Dice Session & Board
        </Chip>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          {/* TAB 1: Profile */}
          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <Card>
                <CardHeader
                  title="Contact Details"
                  description="Pre-filled into candidate application fields during automated submissions."
                  action={
                    <Button type="submit" icon={Save} loading={savingProfile}>
                      Save Profile
                    </Button>
                  }
                />
                <CardBody className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                  <Input
                    label="City"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="State"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    />
                    <Input
                      label="ZIP Code"
                      value={profile.zip_code}
                      onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
                    />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Professional Links & Authorization"
                  description="Social links and legal eligibility attached to job application wizard forms."
                />
                <CardBody className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="LinkedIn URL"
                      type="url"
                      placeholder="https://linkedin.com/in/…"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    />
                    <Input
                      label="GitHub URL"
                      type="url"
                      placeholder="https://github.com/…"
                      value={profile.github_url}
                      onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    />
                    <Input
                      label="Portfolio URL"
                      type="url"
                      placeholder="https://…"
                      value={profile.portfolio_url}
                      onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-line">
                    <Input
                      label="Years of Experience"
                      type="number"
                      min="0"
                      max="50"
                      value={profile.years_of_experience}
                      onChange={(e) => setProfile({ ...profile, years_of_experience: e.target.value })}
                    />
                    <Select
                      label="Work Authorization"
                      value={profile.work_authorization}
                      onChange={(e) => setProfile({ ...profile, work_authorization: e.target.value })}
                    >
                      {WORK_AUTH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="pt-2">
                    <Toggle
                      checked={profile.willing_to_relocate}
                      onChange={(v) => setProfile({ ...profile, willing_to_relocate: v })}
                      label="Willing to Relocate"
                      description="Indicates willingness to relocate for hybrid or on-site opportunities."
                    />
                  </div>
                </CardBody>
              </Card>
            </form>
          )}

          {/* TAB 2: Automation */}
          {tab === 'automation' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <Card>
                <CardHeader
                  title="Application Limits & Execution Mode"
                  description="Controls scraper concurrency, batch sizing, and automation mode."
                  action={
                    <Button type="submit" icon={Save} loading={savingSettings}>
                      Save Settings
                    </Button>
                  }
                />
                <CardBody className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Max Jobs Per Search"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.max_jobs_per_search}
                      onChange={(e) =>
                        setSettings({ ...settings, max_jobs_per_search: Number(e.target.value) })
                      }
                      hint="Maximum job listings collected per Playwright search run"
                    />

                    <Input
                      label="Max Applications Per Run"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.max_applications_per_run}
                      onChange={(e) =>
                        setSettings({ ...settings, max_applications_per_run: Number(e.target.value) })
                      }
                      hint="Safety cap for batch submissions in a single session"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-medium block mb-1.5">
                      Default Application Mode
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-control border p-3.5 transition ${
                          settings.default_mode === 'PREPARE'
                            ? 'border-signal bg-signal-soft/60'
                            : 'border-line hover:bg-paper-sunken'
                        }`}
                      >
                        <input
                          type="radio"
                          name="default_mode"
                          value="PREPARE"
                          checked={settings.default_mode === 'PREPARE'}
                          onChange={() => setSettings({ ...settings, default_mode: 'PREPARE' })}
                          className="mt-1 accent-[var(--color-signal)]"
                        />
                        <div>
                          <span className="font-semibold text-sm block">Prepare Only (Safe)</span>
                          <span className="text-xs text-ink-soft block mt-0.5">
                            Fills the application form and pauses for human verification before final submission.
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-control border p-3.5 transition ${
                          settings.default_mode === 'APPLY'
                            ? 'border-signal bg-signal-soft/60'
                            : 'border-line hover:bg-paper-sunken'
                        }`}
                      >
                        <input
                          type="radio"
                          name="default_mode"
                          value="APPLY"
                          checked={settings.default_mode === 'APPLY'}
                          onChange={() => setSettings({ ...settings, default_mode: 'APPLY' })}
                          className="mt-1 accent-[var(--color-signal)]"
                        />
                        <div>
                          <span className="font-semibold text-sm block">1-Click Auto Apply</span>
                          <span className="text-xs text-ink-soft block mt-0.5">
                            Fills and executes final submission automatically if all screener fields match.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line">
                    <Toggle
                      checked={!settings.headless_browser}
                      onChange={(v) => setSettings({ ...settings, headless_browser: !v })}
                      label="Show Browser While Applying (Non-Headless)"
                      description={
                        settings.headless_browser
                          ? 'Headless: Applications run quietly in the background without opening a browser window.'
                          : 'Visible: Chromium window opens visibly so you can watch automated form submission in real time.'
                      }
                    />
                  </div>
                </CardBody>
              </Card>
            </form>
          )}

          {/* TAB 3: Dice Session */}
          {tab === 'dice' && (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Dice.com Session Connection"
                  description="Status of your authenticated candidate session used by the Playwright bot."
                  action={
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        loading={isChecking}
                        onClick={() => refreshDiceStatus(true)}
                      >
                        Check Status
                      </Button>
                      {diceStatus?.is_connected ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Unplug}
                          onClick={() => disconnectDice()}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          icon={PlugZap}
                          onClick={() => setConnectModalOpen(true)}
                        >
                          Connect Dice
                        </Button>
                      )}
                    </div>
                  }
                />
                <CardBody className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`flex items-center gap-3.5 rounded-control border p-4 ${
                      diceStatus?.is_connected
                        ? 'border-signal/30 bg-signal-soft/40'
                        : 'border-amber/30 bg-amber-soft/40'
                    }`}
                  >
                    {diceStatus?.is_connected ? (
                      <CheckCircle2 className="size-6 text-signal shrink-0" />
                    ) : (
                      <AlertCircle className="size-6 text-amber shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-ink">
                        {diceStatus?.is_connected
                          ? `Dice Session Connected: ${diceStatus.username || 'Candidate'}`
                          : 'Dice Session Not Connected'}
                      </p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {diceStatus?.is_connected
                          ? `Session active with ${diceStatus.cookies_count || 0} authenticated cookies synced. Verified ${timeAgo(
                              diceStatus.last_verified
                            )}.`
                          : 'Connect your Dice account via Chrome extension or cookie file to enable automated Playwright search & apply.'}
                      </p>
                    </div>
                  </div>

                  {/* Connected Details Bar */}
                  {diceStatus?.is_connected && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                      <div className="rounded-control border border-line bg-paper-sunken p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Candidate
                        </p>
                        <p className="font-semibold text-sm text-ink mt-0.5">
                          {diceStatus.username || 'Active Candidate'}
                        </p>
                      </div>
                      <div className="rounded-control border border-line bg-paper-sunken p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Synced Cookies
                        </p>
                        <p className="font-semibold text-sm text-signal mt-0.5">
                          {diceStatus.cookies_count || 21} cookies
                        </p>
                      </div>
                      <div className="rounded-control border border-line bg-paper-sunken p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Last Verified
                        </p>
                        <p className="font-semibold text-sm text-ink mt-0.5">
                          {diceStatus.last_verified ? timeAgo(diceStatus.last_verified) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={PlugZap}
                      onClick={() => setConnectModalOpen(true)}
                    >
                      {diceStatus?.is_connected ? 'Re-Sync Session' : 'Connect Dice Account'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Connect Dice Guided Modal */}
      <Modal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title="Connect Dice Account"
        description="Sync your authenticated Dice candidate session using the Chrome Extension or Cookie JSON import."
        footer={
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              loading={isChecking}
              onClick={() => refreshDiceStatus(true)}
            >
              Check Status
            </Button>
            <Button
              variant={diceStatus?.is_connected ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setConnectModalOpen(false)}
            >
              {diceStatus?.is_connected ? 'Done' : 'Close'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-control border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="size-4" /> Zero-Password Security Guarantee
            </div>
            <p className="mt-1 leading-relaxed">
              We never store your Dice password. You log in directly in Chrome, and the session token is safely synced for Playwright automation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-control border border-line bg-paper-sunken p-3">
              <div className="grid size-6 shrink-0 place-items-center rounded-full bg-signal text-xs font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Open Dice in Chrome</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={ExternalLink}
                    onClick={handleTriggerDiceLogin}
                  >
                    Open Dice
                  </Button>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Log in normally into your candidate account with Google or email/password.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-control border border-line bg-paper-sunken p-3">
              <div className="grid size-6 shrink-0 place-items-center rounded-full bg-signal text-xs font-bold text-white">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Sync Account via Extension</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Click the <strong>Dice Automation Sync</strong> extension icon in your Chrome extensions toolbar and click <strong>&quot;Sync Dice Account&quot;</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-control border border-line bg-paper-sunken px-3.5 py-3 text-xs text-ink-soft">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-signal"></span>
              </span>
              <span>Waiting for session sync… (auto-detects instantly)</span>
            </div>
          </div>

          <details className="border-t border-line pt-3 text-xs text-ink-soft">
            <summary className="cursor-pointer hover:text-ink font-medium">
              Alternative: Import Cookies (.json) directly
            </summary>
            <div className="mt-2.5 space-y-2">
              <p>Export cookies from your signed-in browser as a JSON file and upload below:</p>
              <input
                ref={cookieFileRef}
                type="file"
                accept="application/json,.json"
                onChange={handleCookieFileUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={FileJson}
                loading={importingCookies}
                onClick={() => cookieFileRef.current?.click()}
              >
                Upload cookies.json
              </Button>
            </div>
          </details>
        </div>
      </Modal>
    </div>
  );
}
