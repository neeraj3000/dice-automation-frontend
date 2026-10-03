import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../app/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Chip, Toggle } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useGetLatestSearchQuery, useRunSearchMutation } from './boardsApi';

const WORK = ['Remote', 'Hybrid', 'On-Site'];
const EMPLOYMENT = [['FULLTIME', 'Full-time'], ['CONTRACTS', 'Contract'], ['THIRD_PARTY', 'Third party'], ['PARTTIME', 'Part-time']];
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function SearchPanel({ boardKey, connected }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ keywords: '', location: '', work_settings: [], employment_types: [], easy_apply_only: true, posted_within: '3d', max_results: 20 });
  const [errors, setErrors] = useState({});
  const { data: latest, refetch } = useGetLatestSearchQuery();
  const [run, { isLoading }] = useRunSearchMutation();
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (form.keywords.trim().length < 2) return setErrors({ keywords: 'Enter a job title or keywords' });
    setErrors({});
    try { await run({ ...form, board: boardKey, keywords: form.keywords.trim(), location: form.location.trim() }).unwrap(); refetch(); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <Card>
      <CardHeader title="Find jobs" description="We open the board in your signed-in browser and collect matching roles." />
      <CardBody>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <fieldset disabled={!connected || running} className="space-y-5 disabled:opacity-60">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Job title or keywords" placeholder="Cloud architect" value={form.keywords} onChange={(e) => set('keywords', e.target.value)} error={errors.keywords} />
              <Input label="Location" placeholder="Remote, Austin TX…" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Work setting</p>
              <div className="flex flex-wrap gap-2">{WORK.map((w) => <Chip key={w} active={form.work_settings.includes(w)} onClick={() => set('work_settings', toggle(form.work_settings, w))}>{w}</Chip>)}</div>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Employment type</p>
              <div className="flex flex-wrap gap-2">{EMPLOYMENT.map(([v, l]) => <Chip key={v} active={form.employment_types.includes(v)} onClick={() => set('employment_types', toggle(form.employment_types, v))}>{l}</Chip>)}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Posted within" value={form.posted_within} onChange={(e) => set('posted_within', e.target.value)}>
                <option value="today">Last 24 hours</option><option value="3d">Last 3 days</option><option value="7d">Last 7 days</option><option value="any">Any time</option>
              </Select>
              <Select label="Number of jobs" value={form.max_results} onChange={(e) => set('max_results', Number(e.target.value))}>
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>
            <Toggle checked={form.easy_apply_only} onChange={(v) => set('easy_apply_only', v)} label="Easy Apply only" description="Applications that finish on the board itself work best with automation." />
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" icon={Search} loading={isLoading || running} disabled={!connected}>{running ? 'Searching…' : 'Search jobs'}</Button>
            {!connected && <p className="text-sm text-ink-soft">Connect your account above to search.</p>}
            {running && (
              <p className="text-sm text-ink-soft" aria-live="polite">
                Searching Dice… {latest?.found ? `Found ${latest.found} so far.` : 'Scanning listings…'}
              </p>
            )}
            {latest?.status === 'FAILED' && !running && <p className="text-sm text-rust" role="alert">{latest.error}</p>}
            {latest?.status === 'COMPLETED' && !running && latest?.found === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                0 jobs matched on Dice. Try unchecking "Easy Apply" or "Hybrid", or use broader location/keywords.
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
    </Card>
  );
}
