import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input } from '../../components/ui/Field';
import { Chip } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useCreateAutomationMutation, useUpdateAutomationMutation } from './automationsApi';
import {
  DEFAULT_APPLY,
  DEFAULT_MINUTES,
  MAX_APPLY,
  MAX_MINUTES,
  MIN_MINUTES,
  TIMER_PRESETS,
  formatDuration,
} from './runMeta';

const emptyForm = {
  name: '',
  profileIds: [],
  applyLimit: String(DEFAULT_APPLY),
  minutes: DEFAULT_MINUTES,
  custom: false,
  customMinutes: '',
};

const toForm = (a) =>
  a
    ? {
        name: a.name,
        profileIds: a.search_profile_ids,
        applyLimit: String(a.apply_limit),
        minutes: a.duration_minutes,
        custom: !TIMER_PRESETS.includes(a.duration_minutes),
        customMinutes: TIMER_PRESETS.includes(a.duration_minutes) ? '' : String(a.duration_minutes),
      }
    : emptyForm;

export default function AutomationFormModal({ open, onClose, automation, profiles }) {
  const formId = useId();
  const [form, setForm] = useState(emptyForm);
  const [createAutomation, { isLoading: creating }] = useCreateAutomationMutation();
  const [updateAutomation, { isLoading: updating }] = useUpdateAutomationMutation();

  useEffect(() => {
    if (open) setForm(toForm(automation));
  }, [open, automation]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleProfile = (id) =>
    setForm((f) => ({
      ...f,
      profileIds: f.profileIds.includes(id) ? f.profileIds.filter((p) => p !== id) : [...f.profileIds, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const applyLimit = Number(form.applyLimit);
    const minutes = form.custom ? Number(form.customMinutes) : form.minutes;
    // Profiles deleted since the automation was saved can't be submitted
    const profileIds = form.profileIds.filter((id) => profiles.some((p) => p.id === id));

    if (!name) return toast.error('Give this automation a name.');
    if (!profileIds.length) return toast.error('Pick at least one search profile.');
    if (!Number.isInteger(applyLimit) || applyLimit < 1 || applyLimit > MAX_APPLY) {
      return toast.error(`Jobs to apply must be between 1 and ${MAX_APPLY}.`);
    }
    if (!Number.isInteger(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
      return toast.error(`The timer must be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`);
    }

    const body = { name, search_profile_ids: profileIds, apply_limit: applyLimit, duration_minutes: minutes };
    try {
      if (automation) {
        await updateAutomation({ id: automation.id, ...body }).unwrap();
        toast.success(`Automation "${name}" updated.`);
      } else {
        await createAutomation(body).unwrap();
        toast.success(`Automation "${name}" created.`);
      }
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={automation ? 'Edit automation' : 'New automation'}
      description="Choose which searches to run, how many jobs to apply to, and how long it may run."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId} loading={creating || updating}>
            {automation ? 'Save changes' : 'Create automation'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Name"
          placeholder="e.g. Morning data engineering run"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          maxLength={100}
          autoComplete="off"
          required
        />

        <div className="border-t border-line pt-5">
          <p className="mb-1 text-[13px] font-medium">Search profiles</p>
          <p className="mb-3 text-xs text-ink-soft">Run in the order you select them.</p>
          {profiles.length ? (
            <div className="flex flex-wrap gap-2">
              {profiles.map((p) => (
                <Chip key={p.id} active={form.profileIds.includes(p.id)} onClick={() => toggleProfile(p.id)}>
                  {form.profileIds.includes(p.id) && (
                    <span className="mr-1 tabular-nums">{form.profileIds.indexOf(p.id) + 1}.</span>
                  )}
                  {p.name}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              You have no search profiles yet.{' '}
              <Link to="/search-profiles" className="font-medium text-signal-deep underline-offset-2 hover:underline">
                Create one first
              </Link>
              .
            </p>
          )}
        </div>

        <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          <Input
            label="Jobs to apply"
            type="number"
            min={1}
            max={MAX_APPLY}
            value={form.applyLimit}
            onChange={(e) => set('applyLimit', e.target.value)}
            hint="Only jobs actually submitted count. Jobs that need your input are skipped and don't count."
          />

          <div className="space-y-1.5">
            <p className="text-[13px] font-medium">Timer</p>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((m) => (
                <Chip key={m} active={!form.custom && form.minutes === m} onClick={() => setForm((f) => ({ ...f, custom: false, minutes: m }))}>
                  {formatDuration(m)}
                </Chip>
              ))}
              <Chip active={form.custom} onClick={() => set('custom', true)}>Custom</Chip>
            </div>
            {form.custom && (
              <Input
                type="number"
                min={MIN_MINUTES}
                max={MAX_MINUTES}
                placeholder="Minutes"
                value={form.customMinutes}
                onChange={(e) => set('customMinutes', e.target.value)}
                aria-label="Custom timer in minutes"
                hint={`Between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`}
              />
            )}
            <p className="text-xs text-ink-soft">The automation stops when the timer ends, even if it hasn't finished.</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
