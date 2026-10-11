import { useId, useMemo, useState } from 'react';
import {
  Bookmark,
  Briefcase,
  Compass,
  ExternalLink,
  MapPin,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Field';
import { Chip, EmptyState, PageHeader, Skeleton, Toggle } from '../../components/ui/Misc';
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
    const remote = profiles.filter((p) => (p.work_settings || []).includes('Remote') || p.is_remote).length;
    const easyApply = profiles.filter((p) => p.easy_apply_only !== false).length;
    return { total, remote, easyApply };
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
      toast.error('Profile Name is required.');
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
    const toastId = toast.loading(`Triggering automated Playwright search for "${p.name}"…`);
    try {
      const res = await runProfile(p.id).unwrap();
      toast.dismiss(toastId);
      const found = res?.total_found ?? res?.found ?? 0;
      const added = res?.new_jobs_added ?? res?.saved ?? found;
      toast.success(
        `Search completed! Found ${found} jobs (${added} newly added). Visit Jobs Explorer to view them.`
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
        title="Dice Search Profiles"
        description="Configure and trigger automated Playwright job search runs on Dice.com."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => handleOpenDialog(null)}>
              Create Search Profile
            </Button>
          </div>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total Profiles</p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{stats.total}</p>
        </Card>
        <Card className="p-5 border-signal/20 bg-signal-soft/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-signal-deep">Remote Preference</p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-signal-deep">{stats.remote}</p>
        </Card>
        <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Easy Apply Targeted
          </p>
          <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
            {stats.easyApply}
          </p>
        </Card>
      </div>

      {/* Search Profiles Table */}
      <Card>
        <CardHeader
          title="Configured Search Profiles"
          description="Runs execute headlessly via Playwright Chromium, match against resumes, and queue applications."
        />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={SlidersHorizontal}
                title="No search profiles yet"
                description="Create your first Dice search profile to target roles, locations, and filters for automated runs."
                action={
                  <Button icon={Plus} onClick={() => handleOpenDialog(null)}>
                    Create Search Profile
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper-sunken/60 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="py-3 pl-6 pr-4">Profile Name</th>
                    <th className="py-3 px-4">Search Keywords</th>
                    <th className="py-3 px-4">Location & Radius</th>
                    <th className="py-3 px-4">Work Settings</th>
                    <th className="py-3 px-4">Features & Posted</th>
                    <th className="py-3 pl-4 pr-6 text-right">Run & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {profiles.map((p) => {
                    const isRunning = runningId === p.id;
                    const kwList = Array.isArray(p.keywords)
                      ? p.keywords
                      : typeof p.keywords === 'string'
                      ? p.keywords.split(',').map((k) => k.trim()).filter(Boolean)
                      : [];

                    return (
                      <tr key={p.id} className="hover:bg-paper-sunken/30 transition-colors">
                        <td className="py-4 pl-6 pr-4 align-top font-medium text-ink">
                          <p className="font-semibold text-[15px]">{p.name}</p>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {kwList.map((kw, i) => (
                              <Badge key={i} tone="neutral">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top text-ink-soft">
                          <div className="flex items-center gap-1.5 font-medium text-ink">
                            <MapPin className="size-3.5 text-ink-soft shrink-0" />
                            <span>{p.location || 'United States'}</span>
                          </div>
                          <span className="text-xs text-ink-soft">Within {p.radius || 30} miles</span>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(p.work_settings || ['Remote']).map((w) => (
                              <Badge key={w} tone="signal">
                                {w}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1 items-start">
                            {p.easy_apply_only !== false ? (
                              <Badge tone="signal" dot>
                                Easy Apply
                              </Badge>
                            ) : (
                              <Badge tone="neutral">External Apply</Badge>
                            )}
                            <span className="text-xs text-ink-soft">
                              {p.posted_within === 'ONE'
                                ? '24h'
                                : p.posted_within === 'THREE'
                                ? '3 days'
                                : p.posted_within === 'SEVEN'
                                ? '7 days'
                                : 'Any time'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 pl-4 pr-6 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              icon={Play}
                              loading={isRunning}
                              onClick={() => handleRun(p)}
                              className="font-semibold"
                            >
                              Run Search
                            </Button>
                            <button
                              type="button"
                              onClick={() => openOnDice(p)}
                              title="Open query on Dice in new tab"
                              className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-sunken hover:text-signal transition"
                            >
                              <ExternalLink className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDialog(p)}
                              title="Edit Profile"
                              className="rounded-lg p-1.5 text-ink-soft hover:bg-paper-sunken transition"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(p)}
                              title="Delete Profile"
                              className="rounded-lg p-1.5 text-ink-soft hover:bg-rust-soft hover:text-rust transition"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create / Edit Dialog */}
      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        wide
        title={editingProfile ? 'Edit Search Profile' : 'New Search Profile'}
        description="Configure target keywords, location radius, and Dice search parameters."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={creating || updating}>
              {editingProfile ? 'Update Profile' : 'Save Profile'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSave} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Profile Name"
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
              hint="Comma-separated terms passed to the Dice Playwright search scraper"
              required
              autoComplete="off"
            />
          </div>

          {/* Location */}
          <div className="pt-1 border-t border-line">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft mb-3">Location & Radius</p>
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
                label="Search Radius"
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
          <div className="pt-1 border-t border-line space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Dice Filters</p>

            <div>
              <p className="text-[13px] font-medium mb-2">Work Settings</p>
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
                label="Posted Date"
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
                <p className="text-[13px] font-medium mb-2">Employment Types</p>
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
          <div className="rounded-control border border-signal/20 bg-signal-soft/30 p-3.5">
            <Toggle
              checked={form.easyApplyOnly}
              onChange={(v) => setField('easyApplyOnly', v)}
              label="Easy Apply Only (Dice Application Wizard)"
              description={
                form.easyApplyOnly
                  ? 'Recommended: Scrapes only jobs with the Dice built-in application wizard for automated 1-click apply.'
                  : 'Filters and scrapes company-direct / external links (requires manual submission).'
              }
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Search Profile?"
        description={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Profile
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          Stored listings scraped by this profile will remain in your Jobs Explorer, but this automated search profile will be removed.
        </p>
      </Modal>
    </div>
  );
}
