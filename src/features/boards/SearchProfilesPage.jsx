import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { Chip, EmptyState, PageHeader, Skeleton, Toggle } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { errorMessage } from '../../lib/format';
import {
  useCreateSearchProfileMutation,
  useDeleteSearchProfileMutation,
  useGetSearchProfilesQuery,
  useRunSearchProfileMutation,
  useUpdateSearchProfileMutation,
} from './searchProfilesApi';

const WORK_SETTINGS_OPTIONS = ['Remote', 'Hybrid', 'On-Site'];
const POSTED_OPTIONS = [
  { value: 'ONE', label: 'Today (24 hours)' },
  { value: 'THREE', label: 'Last 3 days' },
  { value: 'SEVEN', label: 'Last 7 days' },
  { value: 'ANY', label: 'No preference' },
];
const EMPLOYMENT_OPTIONS = [
  { value: 'FULLTIME', label: 'Full time' },
  { value: 'CONTRACTS', label: 'Contract' },
  { value: 'THIRD_PARTY', label: 'Third Party' },
  { value: 'PARTTIME', label: 'Part time' },
];

const POSTED_SHORT = { ONE: 'Past 24 hours', THREE: 'Past 3 days', SEVEN: 'Past 7 days', ANY: 'Any time' };
const EMPLOYMENT_LABEL = Object.fromEntries(EMPLOYMENT_OPTIONS.map((o) => [o.value, o.label]));

const keywordList = (p) =>
  Array.isArray(p.keywords)
    ? p.keywords
    : typeof p.keywords === 'string'
    ? p.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

function Stat({ label, value }) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</p>
    </div>
  );
}

function ProfileCard({ p, running, onRun, onOpenDice, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const keywords = keywordList(p);
  const work = p.work_settings || ['Remote'];
  const employment = (p.employment_types || []).map((t) => EMPLOYMENT_LABEL[t] || t);
  const easyApply = p.easy_apply_only !== false;
  const meta = [
    { icon: MapPin, text: `${p.location || 'United States'} · ${p.radius || 30} mi` },
    { icon: Clock, text: POSTED_SHORT[p.posted_within] || 'Any time' },
    employment.length ? { icon: Briefcase, text: employment.join(', ') } : null,
  ].filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn('relative', menuOpen && 'z-20')}
    >
      <Card className="p-5 transition-colors hover:border-line-strong sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="hidden size-10 shrink-0 place-items-center rounded-xl bg-signal-soft text-signal sm:grid">
            <Search className="size-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{p.name}</h3>
              {easyApply && (
                <span className="inline-flex items-center gap-1 rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-semibold text-signal-deep">
                  <Zap className="size-3 fill-current" /> Easy Apply
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              {meta.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-ink-soft/70" />
                  {text}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {keywords.map((kw) => (
                <span key={kw} className="rounded-md border border-line bg-paper px-2 py-0.5 text-xs font-medium text-ink-soft">{kw}</span>
              ))}
              <span className="mx-1 h-4 w-px bg-line" aria-hidden />
              {work.map((w) => (
                <span key={w} className="rounded-md bg-paper-sunken px-2 py-0.5 text-xs font-medium text-ink">{w}</span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button size="sm" icon={Play} loading={running} onClick={onRun} className="whitespace-nowrap max-sm:flex-1">
              {running ? 'Running…' : 'Run search'}
            </Button>
            <button
              type="button"
              onClick={onOpenDice}
              title="Open this search on Dice"
              aria-label="Open this search on Dice"
              className="grid size-8 place-items-center rounded-control border border-transparent text-ink-soft transition hover:border-line hover:bg-paper-sunken hover:text-ink"
            >
              <ExternalLink className="size-4" />
            </button>
            <ActionMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              items={[
                { label: 'Edit profile', icon: Pencil, onClick: onEdit },
                'divider',
                { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
              ]}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function SearchProfilesPage() {
  const { data: profiles = [], isLoading, refetch, isFetching } = useGetSearchProfilesQuery();
  const [createProfile, { isLoading: creating }] = useCreateSearchProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateSearchProfileMutation();
  const [deleteProfile] = useDeleteSearchProfileMutation();
  const [runProfile] = useRunSearchProfileMutation();

  const formId = useId();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form State — single object to minimise re-renders and focus disruption
  const DEFAULTS = {
    name: '',
    keywords: '',
    location: 'United States',
    radius: 30,
    workSettings: ['Remote'],
    employmentTypes: ['FULLTIME', 'CONTRACTS'],
    postedWithin: 'ONE',
    easyApplyOnly: true,
  };
  const [form, setForm] = useState(DEFAULTS);
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleArray = (key, item) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((x) => x !== item)
        : [...prev[key], item],
    }));

  const stats = useMemo(() => {
    const total = profiles.length;
    const easyApply = profiles.filter((p) => p.easy_apply_only !== false).length;
    const remote = profiles.filter((p) => (p.work_settings || []).includes('Remote') || p.is_remote).length;
    const fullTime = profiles.filter((p) => (p.employment_types || []).includes('FULLTIME')).length;
    return { total, easyApply, remote, fullTime };
  }, [profiles]);

  const handleOpenDialog = (p = null) => {
    if (p) {
      setEditingProfile(p);
      setForm({
        name: p.name || '',
        keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : p.keywords || '',
        location: p.location || 'United States',
        radius: p.radius || 30,
        workSettings: p.work_settings || ['Remote'],
        employmentTypes: p.employment_types || ['FULLTIME', 'CONTRACTS'],
        postedWithin: p.posted_within || 'ONE',
        easyApplyOnly: p.easy_apply_only !== false,
      });
    } else {
      setEditingProfile(null);
      setForm(DEFAULTS);
    }
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Profile name is required.');
      return;
    }
    const kwList = form.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (!kwList.length) {
      toast.error('At least one keyword is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      keywords: kwList,
      location: form.location.trim() || 'United States',
      radius: Number(form.radius) || 30,
      work_settings: form.workSettings,
      employment_types: form.employmentTypes,
      posted_within: form.postedWithin,
      easy_apply_only: form.easyApplyOnly,
      is_remote: form.workSettings.includes('Remote'),
    };

    try {
      if (editingProfile) {
        await updateProfile({ id: editingProfile.id, ...payload }).unwrap();
        toast.success(`Search profile "${payload.name}" updated!`);
      } else {
        await createProfile(payload).unwrap();
        toast.success(`Search profile "${payload.name}" created!`);
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleRun = async (p) => {
    setRunningId(p.id);
    const toastId = toast.loading(`Searching Dice for "${p.name}"…`);
    try {
      const res = await runProfile(p.id).unwrap();
      toast.dismiss(toastId);
      const found = res?.total_found ?? res?.found ?? 0;
      const added = res?.new_jobs_added ?? res?.saved ?? found;
      toast.success(
        `Found ${found} jobs (${added} new). See them in Jobs Explorer.`
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(errorMessage(err) || 'Failed to complete automated search run.');
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProfile(confirmDelete.id).unwrap();
      toast.success(`Profile "${confirmDelete.name}" deleted.`);
      setConfirmDelete(null);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const openOnDice = (p) => {
    const kw = Array.isArray(p.keywords) ? p.keywords.join(' ') : p.keywords;
    const q = encodeURIComponent(kw);
    const loc = encodeURIComponent(p.location || 'United States');
    window.open(`https://www.dice.com/jobs?q=${q}&location=${loc}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Profiles"
        description="Saved Dice searches. Run one to find new jobs and match them against your resumes."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Refresh"
              title="Refresh"
              className="grid size-10 place-items-center rounded-control border border-line-strong bg-paper-raised text-ink-soft shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition hover:bg-paper-sunken hover:text-ink"
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
            </button>
            <Button icon={Plus} onClick={() => handleOpenDialog(null)}>
              New profile
            </Button>
          </div>
        }
      />

      {profiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Total Profiles
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{stats.total}</p>
          </Card>
          <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Easy Apply Only
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
              {stats.easyApply}
            </p>
          </Card>
          <Card className="p-5 border-blue-500/20 bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Remote Searches
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-blue-800 dark:text-blue-300">
              {stats.remote}
            </p>
          </Card>
          <Card className="p-5 border-amber/20 bg-amber-soft/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber">
              Full-Time Roles
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-amber">
              {stats.fullTime}
            </p>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-32 rounded-card" />)
        ) : profiles.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No search profiles yet"
            description="Save the roles, location and filters you care about, then run the search whenever you want fresh jobs."
            action={<Button icon={Plus} onClick={() => handleOpenDialog(null)}>Create your first profile</Button>}
          />
        ) : (
          <AnimatePresence initial={false}>
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                p={p}
                running={runningId === p.id}
                onRun={() => handleRun(p)}
                onOpenDice={() => openOnDice(p)}
                onEdit={() => handleOpenDialog(p)}
                onDelete={() => setConfirmDelete(p)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        wide
        title={editingProfile ? 'Edit search profile' : 'New search profile'}
        description="Choose what to search for, where, and which Dice filters to apply."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={creating || updating}>
              {editingProfile ? 'Save changes' : 'Create profile'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSave} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Profile name"
              placeholder="e.g. AI & Data Engineer Roles"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              autoComplete="off"
            />

            <Input
              label="Keywords"
              placeholder="Databricks, AI Engineer, PySpark, Python"
              value={form.keywords}
              onChange={(e) => setField('keywords', e.target.value)}
              hint="Separate keywords with commas."
              required
              autoComplete="off"
            />
          </div>

          {/* Location */}
          <div className="border-t border-line pt-5">
            <p className="mb-3 text-sm font-semibold text-ink">Location</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  label="Location"
                  placeholder="e.g. United States or Austin, TX"
                  value={form.location}
                  onChange={(e) => setField('location', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Select
                label="Radius"
                value={form.radius}
                onChange={(e) => setField('radius', Number(e.target.value))}
              >
                <option value={10}>10 miles</option>
                <option value={30}>30 miles</option>
                <option value={50}>50 miles</option>
                <option value={75}>75 miles</option>
              </Select>
            </div>
          </div>

          {/* Dice Filters */}
          <div className="space-y-4 border-t border-line pt-5">
            <p className="text-sm font-semibold text-ink">Filters</p>

            <div>
              <p className="mb-2 text-[13px] font-medium">Work setting</p>
              <div className="flex flex-wrap gap-2">
                {WORK_SETTINGS_OPTIONS.map((setting) => (
                  <Chip
                    key={setting}
                    active={form.workSettings.includes(setting)}
                    onClick={() => toggleArray('workSettings', setting)}
                  >
                    {setting}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Posted within"
                value={form.postedWithin}
                onChange={(e) => setField('postedWithin', e.target.value)}
              >
                {POSTED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>

              <div>
                <p className="mb-2 text-[13px] font-medium">Employment type</p>
                <div className="flex flex-wrap gap-1.5">
                  {EMPLOYMENT_OPTIONS.map((emp) => (
                    <Chip
                      key={emp.value}
                      active={form.employmentTypes.includes(emp.value)}
                      onClick={() => toggleArray('employmentTypes', emp.value)}
                    >
                      {emp.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Easy Apply */}
          <div className="rounded-control border border-line bg-paper-sunken/60 p-4">
            <Toggle
              checked={form.easyApplyOnly}
              onChange={(v) => setField('easyApplyOnly', v)}
              label="Easy Apply only"
              description={
                form.easyApplyOnly
                  ? "Recommended. Only finds jobs that use Dice's built-in application, so they can be applied to automatically."
                  : "Also finds jobs that apply on the company's own site. These need to be submitted manually."
              }
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete this search profile?"
        description={confirmDelete?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete profile
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Jobs this profile already found stay in Jobs Explorer. Only the saved search is removed.
        </p>
      </Modal>
    </div>
  );
}
