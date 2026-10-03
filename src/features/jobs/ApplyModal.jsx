import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { cn } from '../../lib/cn';
import { errorMessage } from '../../lib/format';
import { useGetResumesQuery } from '../resumes/resumesApi';
import { useGetSettingsQuery } from '../settings/settingsApi';
import { useStartApplicationMutation } from '../applications/applicationsApi';

const MODES = [
  { value: 'APPLY', title: 'Apply now', body: 'Fill in everything and submit automatically.' },
  { value: 'PREPARE', title: 'Prepare for review', body: 'Fill in everything, then stop before submitting so you can check it.' },
];

export default function ApplyModal({ job, onClose }) {
  const { data: resumes = [] } = useGetResumesQuery();
  const { data: settings } = useGetSettingsQuery();
  const [start, { isLoading }] = useStartApplicationMutation();
  const [resumeId, setResumeId] = useState('');
  const [mode, setMode] = useState('APPLY');

  useEffect(() => {
    if (!job) return;
    const rec = job.match?.resume_id && resumes.find((r) => r.id === job.match.resume_id);
    setResumeId((rec || resumes.find((r) => r.is_default) || resumes[0])?.id ?? '');
    setMode('APPLY');
  }, [job, resumes]);

  const submit = async () => {
    try {
      await start({ job_id: job.id, resume_id: resumeId, mode }).unwrap();
      toast.success(settings?.headless === false ? 'Starting. Watch the browser window.' : 'Applying in the background. We\'ll let you know.');
      onClose();
    } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <Modal open={!!job} onClose={onClose} title="Apply to this job" description={job ? `${job.title} · ${job.company ?? ''}` : ''}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={isLoading} disabled={!resumeId}>{mode === 'APPLY' ? 'Apply' : 'Prepare application'}</Button></>}>
      {resumes.length === 0 ? (
        <p className="text-sm text-ink-soft">You need a resume first. <Link to="/resumes" className="font-medium text-signal underline" onClick={onClose}>Upload one</Link> and come back.</p>
      ) : (
        <div className="space-y-5">
          <Select label="Resume" value={resumeId} onChange={(e) => setResumeId(e.target.value)}
            hint={job?.match?.resume_id === resumeId ? 'Best match for this job.' : 'Tip: use "Match resume" on the job to find the best fit.'}>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.file_name}{r.target_role ? ` · ${r.target_role}` : ''}</option>)}
          </Select>
          <div className="space-y-2">
            {MODES.map((m) => (
              <label key={m.value} className={cn('flex cursor-pointer gap-3 rounded-control border p-3.5 transition', mode === m.value ? 'border-signal bg-signal-soft/60' : 'border-line-strong hover:bg-paper-sunken')}>
                <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} className="mt-1 accent-[var(--color-signal)]" />
                <span><span className="block text-sm font-medium">{m.title}</span><span className="block text-sm text-ink-soft">{m.body}</span></span>
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{settings?.headless === false ? 'The browser window will be visible while we apply.' : 'This runs in the background. You can change that in Settings.'}</p>
        </div>
      )}
    </Modal>
  );
}
