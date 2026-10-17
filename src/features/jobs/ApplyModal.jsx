import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { cn } from '../../lib/cn';
import { errorMessage } from '../../lib/format';
import { useGetResumesQuery } from '../resumes/resumesApi';
import { useGetSettingsQuery } from '../settings/settingsApi';
import { useLazyGetApplicationQuery, useStartApplicationMutation } from '../applications/applicationsApi';
import { api } from '../../app/api';
import ApplyingAnimationModal from './ApplyingAnimationModal';

const MODES = [
  { value: 'APPLY', title: 'Apply now', body: 'Fill in everything and submit automatically.' },
  { value: 'PREPARE', title: 'Prepare for review', body: 'Fill in everything, then stop before submitting so you can check it.' },
];

export default function ApplyModal({ job, onClose }) {
  const dispatch = useDispatch();
  const { data: resumes = [] } = useGetResumesQuery();
  const { data: settings } = useGetSettingsQuery();
  const [start, { isLoading }] = useStartApplicationMutation();
  const [fetchApplication] = useLazyGetApplicationQuery();
  const [resumeId, setResumeId] = useState('');
  const [mode, setMode] = useState('APPLY');
  const [applyingModal, setApplyingModal] = useState({
    open: false,
    stage: 'applying',
    message: '',
  });

  useEffect(() => {
    if (!job) return;
    const rec = job.match?.resume_id && resumes.find((r) => r.id === job.match.resume_id);
    setResumeId((rec || resumes.find((r) => r.is_default) || resumes[0])?.id ?? '');
    setMode('APPLY');
  }, [job, resumes]);

  const submit = async () => {
    if (mode === 'PREPARE') {
      try {
        await start({ job_id: job.id, resume_id: resumeId, mode }).unwrap();
        toast.success('Preparing application for review.');
        onClose();
      } catch (e) {
        toast.error(errorMessage(e));
      }
      return;
    }

    // mode === 'APPLY': show centered animation and wait/mark as applied
    setApplyingModal({
      open: true,
      stage: 'applying',
      message: `Submitting application to ${job?.company || 'employer'}...`,
    });

    try {
      let res = await start({ job_id: job.id, resume_id: resumeId, mode: 'APPLY' }).unwrap();

      // Poll while PREPARING (up to 60s timeout)
      const startTime = Date.now();
      const MAX_WAIT_MS = 60000;

      while (res?.status === 'PREPARING' && Date.now() - startTime < MAX_WAIT_MS) {
        await new Promise((r) => setTimeout(r, 1800));
        try {
          res = await fetchApplication(res.id).unwrap();
          if (res?.message) {
            setApplyingModal((prev) => (prev.open ? { ...prev, message: res.message } : prev));
          }
        } catch {
          // continue polling
        }
      }

      if (res?.status === 'FAILED') {
        const failureReason = res?.failure_reason || 'Application submission failed.';
        setApplyingModal((prev) =>
          prev.open
            ? {
                ...prev,
                stage: 'failed',
                message: failureReason,
              }
            : prev
        );
        toast.error(failureReason);
        return;
      }

      if (res?.status === 'REVIEW') {
        setApplyingModal((prev) =>
          prev.open
            ? {
                ...prev,
                stage: 'review',
                message: 'This application requires manual review for additional employer questions.',
              }
            : prev
        );
        toast('Application placed in review queue.');
        dispatch(api.util.invalidateTags([{ type: 'Job', id: job.id }, { type: 'Job', id: 'LIST' }, 'Application', 'Stats']));
        return;
      }

      // Mark as applied in RTK Query cache
      dispatch(
        api.util.updateQueryData('getJobs', undefined, (draft) => {
          const item = draft?.items?.find((j) => j.id === job.id);
          if (item) item.status = 'APPLIED';
        })
      );
      dispatch(api.util.invalidateTags([{ type: 'Job', id: job.id }, { type: 'Job', id: 'LIST' }, 'Application', 'Stats']));

      setApplyingModal((prev) =>
        prev.open
          ? {
              ...prev,
              stage: 'success',
              message: `Successfully applied to ${job?.title}!`,
            }
          : prev
      );

      toast.success(`Applied to ${job?.title}! Marked as applied.`);

      setTimeout(() => {
        setApplyingModal((prev) => ({ ...prev, open: false }));
        onClose();
      }, 1500);
    } catch (e) {
      const errTxt = errorMessage(e);
      setApplyingModal((prev) =>
        prev.open
          ? {
              ...prev,
              stage: 'failed',
              message: errTxt,
            }
          : prev
      );
      toast.error(errTxt);
    }
  };

  return (
    <>
      <Modal
        open={Boolean(job) && !applyingModal.open}
        onClose={onClose}
        title="Apply to this job"
        description={job ? `${job.title} · ${job.company ?? ''}` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} loading={isLoading} disabled={!resumeId}>
              {mode === 'APPLY' ? 'Apply' : 'Prepare application'}
            </Button>
          </>
        }
      >
        {resumes.length === 0 ? (
          <p className="text-sm text-ink-soft">
            You need a resume first.{' '}
            <Link to="/resumes" className="font-medium text-signal underline" onClick={onClose}>
              Upload one
            </Link>{' '}
            and come back.
          </p>
        ) : (
          <div className="space-y-5">
            <Select
              label="Resume"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              hint={
                job?.match?.resume_id === resumeId
                  ? 'Best match for this job.'
                  : 'Tip: use "Match resume" on the job to find the best fit.'
              }
            >
              {resumes.map((r) => {
                const isRec = job?.match?.resume_id === r.id;
                return (
                  <option key={r.id} value={r.id}>
                    {isRec ? '★ ' : ''}
                    {r.file_name}
                    {r.target_role ? ` · ${r.target_role}` : ''}
                    {isRec && job?.match?.score ? ` (${job.match.score}% match)` : ''}
                  </option>
                );
              })}
            </Select>
            <div className="space-y-2">
              {MODES.map((m) => (
                <label
                  key={m.value}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-control border p-3.5 transition',
                    mode === m.value ? 'border-signal bg-signal-soft/60' : 'border-line-strong hover:bg-paper-sunken'
                  )}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.value}
                    checked={mode === m.value}
                    onChange={() => setMode(m.value)}
                    className="mt-1 accent-[var(--color-signal)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{m.title}</span>
                    <span className="block text-sm text-ink-soft">{m.body}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-soft">
              {settings?.headless === false
                ? 'The browser window will be visible while we apply.'
                : 'This runs in the background. You can change that in Settings.'}
            </p>
          </div>
        )}
      </Modal>

      <ApplyingAnimationModal
        open={applyingModal.open}
        job={job}
        stage={applyingModal.stage}
        message={applyingModal.message}
        onClose={() => {
          setApplyingModal((prev) => ({ ...prev, open: false }));
          onClose();
        }}
      />
    </>
  );
}
