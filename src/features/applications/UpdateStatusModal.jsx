import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useUpdateExternalApplicationMutation } from './applicationsApi';
import { errorMessage } from '../../lib/format';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied', desc: 'Application confirmed and submitted' },
  { value: 'INTERVIEWING', label: 'Interviewing', desc: 'Screening or interview scheduled' },
  { value: 'OFFER', label: 'Offer', desc: 'Received employment offer' },
  { value: 'REJECTED', label: 'Rejected', desc: 'Candidate not selected' },
  { value: 'DISCOVERED', label: 'Tracked', desc: 'Saved for future consideration' },
  { value: 'CANCELLED', label: 'Cancelled', desc: 'Withdrawn by candidate' },
];

export default function UpdateStatusModal({ application, onClose, onSuccess }) {
  const [updateApp, { isLoading }] = useUpdateExternalApplicationMutation();

  const [status, setStatus] = useState(application?.raw_status || application?.status || 'APPLIED');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!application?.id) return;
    setFormError('');

    try {
      await updateApp({
        id: application.id,
        status,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success(`Updated status to ${status} for ${application.company}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  };

  return (
    <Modal
      open={Boolean(application)}
      onClose={onClose}
      title="Update Application Status"
      description={`Update progress for ${application?.job_title} at ${application?.company}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="update-status-form"
            loading={isLoading}
            icon={CheckCircle2}
          >
            Save Status
          </Button>
        </>
      }
    >
      <form id="update-status-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-card border border-rust/30 bg-rust-soft/50 p-3 text-xs text-rust"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            New Status
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex flex-col items-start p-2.5 rounded-card border text-left transition ${
                  status === opt.value
                    ? 'border-signal bg-signal-soft/40 ring-1 ring-signal'
                    : 'border-line bg-paper hover:bg-paper-sunken'
                }`}
              >
                <span className="text-xs font-semibold text-ink">{opt.label}</span>
                <span className="text-[11px] text-ink-soft mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="update-notes" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Status Notes <span className="text-ink-soft/60 font-normal">(Optional)</span>
          </label>
          <textarea
            id="update-notes"
            rows={2}
            maxLength={2000}
            placeholder="e.g., Completed first round phone interview; waiting on team feedback."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-control border border-line bg-paper p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
        </div>

        <p className="text-[11px] text-ink-soft">
          Updates will be appended to the application's audit history with millisecond timestamps.
        </p>
      </form>
    </Modal>
  );
}
