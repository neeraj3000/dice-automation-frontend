import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Bookmark, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../app/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { Chip, Toggle } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useGetLatestSearchQuery, useRunSearchMutation } from './boardsApi';
import {
  useCreateSearchProfileMutation,
  useDeleteSearchProfileMutation,
  useGetSearchProfilesQuery,
} from './searchProfilesApi';

const WORK = ['Remote', 'Hybrid', 'On-Site'];
const EMPLOYMENT = [
  ['FULLTIME', 'Full-time'],
  ['CONTRACTS', 'Contract'],
  ['THIRD_PARTY', 'Third party'],
  ['PARTTIME', 'Part-time'],
];
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function SearchPanel({ boardKey, connected }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    keywords: '',
    location: '',
    work_settings: [],
    employment_types: [],
    easy_apply_only: true,
    posted_within: '3d',
    max_results: 20,
  });
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [errors, setErrors] = useState({});

  const { data: latest, refetch } = useGetLatestSearchQuery();
  const [run, { isLoading }] = useRunSearchMutation();
  const { data: profiles = [] } = useGetSearchProfilesQuery();
  const [createProfile, { isLoading: savingProfile }] = useCreateSearchProfileMutation();
  const [deleteProfile] = useDeleteSearchProfileMutation();

  const running = latest?.status === 'RUNNING';
  const prev = useRef(null);

  // Poll only while a search is actively running
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      refetch();
    }, 2500);
    return () => clearInterval(timer);
  }, [running, refetch]);

  useEffect(() => {
    if (prev.current === 'RUNNING' && latest && latest.status !== 'RUNNING') {
      dispatch(api.util.invalidateTags(['Job', 'Stats']));
      if (latest.status === 'COMPLETED') {
        toast.success(latest.found ? `Found ${latest.found} jobs!` : '0 jobs matched. Try unchecking Easy Apply or Hybrid.');
      }
    }
    prev.current = latest?.status ?? null;
  }, [latest, dispatch]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSelectedProfileId('');
  };

  const loadProfile = (profileId) => {
    setSelectedProfileId(profileId);
    const p = profiles.find((item) => item.id === profileId);
    if (!p) return;

    setForm({
      keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : p.keywords || '',
      location: p.location || '',
      work_settings: p.work_settings || [],
      employment_types: p.employment_types || [],
      easy_apply_only: p.easy_apply_only ?? true,
      posted_within: p.posted_within === 'ONE' ? 'today' : p.posted_within === 'SEVEN' ? '7d' : '3d',
      max_results: p.max_results || 20,
    });
    toast.success(`Loaded profile "${p.name}"`);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error('Enter a name for this search profile');
      return;
    }
    try {
      await createProfile({
        name: profileName.trim(),
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        location: form.location.trim(),
        work_settings: form.work_settings,
        employment_types: form.employment_types,
        easy_apply_only: form.easy_apply_only,
        posted_within: form.posted_within,
        board: boardKey,
      }).unwrap();
      toast.success('Search profile saved');
      setSaveModalOpen(false);
      setProfileName('');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const handleDeleteSelectedProfile = async () => {
    if (!selectedProfileId) return;
    try {
      await deleteProfile(selectedProfileId).unwrap();
      setSelectedProfileId('');
      toast.success('Profile deleted');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.keywords.trim().length < 2) return setErrors({ keywords: 'Enter a job title or keywords' });
    setErrors({});
    try {
      await run({
        ...form,
        board: boardKey,
        keywords: form.keywords.trim(),
        location: form.location.trim(),
      }).unwrap();
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const openOnDiceDirectly = () => {
    const q = encodeURIComponent(form.keywords.trim());
    const loc = encodeURIComponent(form.location.trim() || 'United States');
    const url = `https://www.dice.com/jobs?q=${q}&location=${loc}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader
        title="Find jobs"
        description="We open the board in your signed-in browser and collect matching roles."
        action={
          <div className="flex items-center gap-2">
            {form.keywords.trim().length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Bookmark}
                onClick={() => {
                  setProfileName(form.keywords.trim());
                  setSaveModalOpen(true);
                }}
              >
                Save as profile
              </Button>
            )}
            {form.keywords.trim().length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                icon={ExternalLink}
                onClick={openOnDiceDirectly}
              >
                Open on {boardKey[0].toUpperCase() + boardKey.slice(1)}
              </Button>
            )}
          </div>
        }
      />
      <CardBody>
        {profiles.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-control border border-line bg-paper-sunken p-2.5">
            <span className="text-xs font-medium text-ink-soft">Saved profiles:</span>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {profiles.map((p) => (
                <Chip
                  key={p.id}
                  active={selectedProfileId === p.id}
                  onClick={() => loadProfile(p.id)}
                >
                  {p.name}
                </Chip>
              ))}
            </div>
            {selectedProfileId && (
              <button
                type="button"
                onClick={handleDeleteSelectedProfile}
                title="Delete this saved profile"
                className="rounded-lg p-1.5 text-ink-soft hover:bg-rust-soft hover:text-rust"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5" noValidate>
          <fieldset disabled={!connected || running} className="space-y-5 disabled:opacity-60">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Job title or keywords"
                placeholder="Cloud architect, Python, AWS"
                value={form.keywords}
                onChange={(e) => set('keywords', e.target.value)}
                error={errors.keywords}
              />
              <Input
                label="Location"
                placeholder="Remote, Austin TX…"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Work setting</p>
              <div className="flex flex-wrap gap-2">
                {WORK.map((w) => (
                  <Chip
                    key={w}
                    active={form.work_settings.includes(w)}
                    onClick={() => set('work_settings', toggle(form.work_settings, w))}
                  >
                    {w}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Employment type</p>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT.map(([v, l]) => (
                  <Chip
                    key={v}
                    active={form.employment_types.includes(v)}
                    onClick={() => set('employment_types', toggle(form.employment_types, v))}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Posted within"
                value={form.posted_within}
                onChange={(e) => set('posted_within', e.target.value)}
              >
                <option value="today">Last 24 hours</option>
                <option value="3d">Last 3 days</option>
                <option value="7d">Last 7 days</option>
                <option value="any">Any time</option>
              </Select>
              <Select
                label="Number of jobs"
                value={form.max_results}
                onChange={(e) => set('max_results', Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </div>
            <Toggle
              checked={form.easy_apply_only}
              onChange={(v) => set('easy_apply_only', v)}
              label="Easy Apply only"
              description="Applications that finish on the board itself work best with automation."
            />
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              icon={Search}
              loading={isLoading || running}
              disabled={!connected}
            >
              {running ? 'Searching…' : 'Search jobs'}
            </Button>
            {!connected && <p className="text-sm text-ink-soft">Connect your account above to search.</p>}
            {running && (
              <p className="text-sm text-ink-soft" aria-live="polite">
                Searching {boardKey[0].toUpperCase() + boardKey.slice(1)}… {latest?.found ? `Found ${latest.found} so far.` : 'Scanning listings…'}
              </p>
            )}
            {latest?.status === 'FAILED' && !running && <p className="text-sm text-rust" role="alert">{latest.error}</p>}
            {latest?.status === 'COMPLETED' && !running && latest?.found === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                0 jobs matched. Try unchecking "Easy Apply" or "Hybrid", or use broader location/keywords.
              </p>
            )}
            {latest?.status === 'COMPLETED' && !running && latest?.found > 0 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Found {latest.found} jobs saved below.
              </p>
            )}
          </div>
        </form>
      </CardBody>

      <Modal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Search Profile"
        description="Give this query template a name so you can re-run it anytime."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button loading={savingProfile} onClick={handleSaveProfile}>Save profile</Button>
          </>
        }
      >
        <Input
          label="Profile name"
          placeholder="e.g. Senior Cloud Architect - Remote"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
