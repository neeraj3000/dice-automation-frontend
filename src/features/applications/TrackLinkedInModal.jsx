import { useState } from 'react';
import { Briefcase, CheckCircle2, Bookmark, AlertCircle, Link, MapPin, Building2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useTrackExternalApplicationMutation } from './applicationsApi';
import { errorMessage } from '../../lib/format';

export default function TrackLinkedInModal({ open, onClose, onSuccess }) {
  const [trackApp, { isLoading }] = useTrackExternalApplicationMutation();

  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('APPLIED');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setJobUrl('');
    setJobTitle('');
    setCompany('');
    setLocation('');
    setStatus('APPLIED');
    setNotes('');
    setFormError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedUrl = jobUrl.trim();
    const trimmedTitle = jobTitle.trim();
    const trimmedCompany = company.trim();

    if (!trimmedUrl) {
      setFormError('Job posting URL is required.');
      return;
    }
    if (!validateUrl(trimmedUrl)) {
      setFormError('Please enter a valid HTTP or HTTPS job URL.');
      return;
    }
    if (!trimmedTitle) {
      setFormError('Job title is required.');
      return;
    }
    if (!trimmedCompany) {
      setFormError('Company name is required.');
      return;
    }

    try {
      await trackApp({
        job_url: trimmedUrl,
        job_title: trimmedTitle,
        company: trimmedCompany,
        location: location.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        source: 'linkedin',
      }).unwrap();

      const actionText = status === 'APPLIED' ? 'Recorded applied job' : 'Saved tracked job';
      toast.success(`${actionText} for ${trimmedCompany}`);
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Track LinkedIn Application"
      description="Record an application you submitted directly on LinkedIn, or save an opening for follow-up."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="track-linkedin-form"
            loading={isLoading}
            icon={status === 'APPLIED' ? CheckCircle2 : Bookmark}
          >
            {status === 'APPLIED' ? 'Confirm & Record Application' : 'Save as Tracked Job'}
          </Button>
        </>
      }
    >
      <form id="track-linkedin-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-card border border-rust/30 bg-rust-soft/50 p-3 text-xs text-rust"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Tracking Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Application Status <span className="text-rust">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStatus('APPLIED')}
              className={`flex items-start gap-3 rounded-card border p-3 text-left transition ${
                status === 'APPLIED'
                  ? 'border-signal bg-signal-soft/40 ring-1 ring-signal'
                  : 'border-line bg-paper-sunken/40 hover:bg-paper-sunken'
              }`}
            >
              <CheckCircle2
                className={`size-4 shrink-0 mt-0.5 ${
                  status === 'APPLIED' ? 'text-signal-deep' : 'text-ink-soft'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-ink">I applied on LinkedIn</p>
                <p className="text-xs text-ink-soft mt-0.5 leading-snug">
                  Marks this job as applied with user-confirmed status.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatus('DISCOVERED')}
              className={`flex items-start gap-3 rounded-card border p-3 text-left transition ${
                status === 'DISCOVERED'
                  ? 'border-signal bg-signal-soft/40 ring-1 ring-signal'
                  : 'border-line bg-paper-sunken/40 hover:bg-paper-sunken'
              }`}
            >
              <Bookmark
                className={`size-4 shrink-0 mt-0.5 ${
                  status === 'DISCOVERED' ? 'text-signal-deep' : 'text-ink-soft'
                }`}
              />
              <div>
                <p className="text-sm font-medium text-ink">Save as Tracked</p>
                <p className="text-xs text-ink-soft mt-0.5 leading-snug">
                  Saves to your tracker for later review without marking as applied.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Job URL */}
        <div className="space-y-1.5">
          <label htmlFor="linkedin-job-url" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            LinkedIn Job URL <span className="text-rust">*</span>
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-3 size-4 text-ink-soft pointer-events-none" />
            <input
              id="linkedin-job-url"
              type="url"
              required
              placeholder="https://www.linkedin.com/jobs/view/1234567890"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-control border border-line bg-paper px-3 py-2 pl-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>
          <p className="text-[11px] text-ink-soft">
            Direct job post link. Tracking query parameters will be safely stripped.
          </p>
        </div>

        {/* Job Title & Company */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="linkedin-job-title" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Job Title <span className="text-rust">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 size-4 text-ink-soft pointer-events-none" />
              <input
                id="linkedin-job-title"
                type="text"
                required
                maxLength={255}
                placeholder="Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-control border border-line bg-paper px-3 py-2 pl-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="linkedin-company" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Company <span className="text-rust">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 size-4 text-ink-soft pointer-events-none" />
              <input
                id="linkedin-company"
                type="text"
                required
                maxLength={255}
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-control border border-line bg-paper px-3 py-2 pl-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label htmlFor="linkedin-location" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Location <span className="text-ink-soft/60 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 size-4 text-ink-soft pointer-events-none" />
            <input
              id="linkedin-location"
              type="text"
              maxLength={255}
              placeholder="San Francisco, CA or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-control border border-line bg-paper px-3 py-2 pl-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="linkedin-notes" className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Notes & Details <span className="text-ink-soft/60 font-normal">(Optional)</span>
          </label>
          <textarea
            id="linkedin-notes"
            rows={2}
            maxLength={2000}
            placeholder="Applied with custom resume v2; reached out to recruiter on LinkedIn."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-control border border-line bg-paper p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
        </div>

        <div className="rounded-card border border-line bg-paper-sunken/40 p-3 text-xs text-ink-soft flex items-center gap-2">
          <span className="size-2 rounded-full bg-signal shrink-0" />
          <span>
            Status provenance is saved as <strong>User Confirmed</strong>. No automated bots or scraping tools are executed.
          </span>
        </div>
      </form>
    </Modal>
  );
}
