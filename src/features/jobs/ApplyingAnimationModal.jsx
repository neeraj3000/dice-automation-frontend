import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle, Send, X, ExternalLink } from 'lucide-react';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/cn';

/**
 * Centered animated overlay displayed while a job application is being submitted.
 * Displays:
 *  - stage = 'applying': Sleek spinning radar ring with floating send icon, progress bar, and status steps.
 *  - stage = 'success': Celebratory spring checkmark with "Application Submitted" and "Marked as Applied".
 *  - stage = 'failed': Warning state with reason and close button.
 *  - stage = 'review': Review required state.
 */
export default function ApplyingAnimationModal({
  open,
  job,
  stage = 'applying', // 'applying' | 'success' | 'failed' | 'review'
  message = '',
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && (stage === 'failed' || stage === 'review')) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, stage, onClose]);

  if (!open || !job) return null;

  const company = job.company || 'Company';
  const title = job.title || 'Untitled Role';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Job Application Status"
      >
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          onClick={() => {
            if (stage === 'failed' || stage === 'review') onClose?.();
          }}
        />

        {/* Centered Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className={cn(
            'relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-paper-raised/95 p-6 shadow-2xl backdrop-blur-md text-center',
            stage === 'applying' && 'border-signal/30 shadow-signal/10',
            stage === 'success' && 'border-emerald-500/40 shadow-emerald-500/10',
            stage === 'failed' && 'border-rust/40 shadow-rust/10'
          )}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className={cn(
              'pointer-events-none absolute -top-12 left-1/2 size-36 -translate-x-1/2 rounded-full blur-2xl transition-colors duration-500',
              stage === 'applying' && 'bg-signal/20',
              stage === 'success' && 'bg-emerald-500/25',
              stage === 'failed' && 'bg-rust/20',
              stage === 'review' && 'bg-amber/20'
            )}
          />

          {/* Close button for non-applying stages */}
          {(stage === 'failed' || stage === 'review') && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}

          {/* STAGE: APPLYING */}
          {stage === 'applying' && (
            <div className="relative flex flex-col items-center">
              {/* Central Radar / Spinning Beacon Animation */}
              <div className="relative flex items-center justify-center size-20">
                {/* Breathing outer glow */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-signal/30 blur-md"
                />

                {/* Rotating gradient track */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-signal/20 border-t-signal border-r-signal"
                />

                {/* Counter-rotating subtle dash ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border border-dashed border-signal/30"
                />

                {/* Inner floating Icon */}
                <motion.div
                  animate={{ y: [-2, 2, -2], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="grid size-11 place-items-center rounded-full bg-signal-soft text-signal shadow-sm"
                >
                  <Send className="size-5 translate-x-0.5 -translate-y-0.5" />
                </motion.div>
              </div>

              {/* Title & Target Details */}
              <h3 className="mt-4 font-serif text-lg font-medium text-ink">Applying to Job</h3>

              <div className="mt-2.5 w-full rounded-xl border border-line bg-paper-sunken/60 px-3.5 py-2.5 text-left">
                <p className="line-clamp-1 text-sm font-semibold text-ink" title={title}>
                  {title}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-soft" title={company}>
                  {company}
                </p>
              </div>

              {/* Dynamic Status Micro-Copy */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-signal" />
                </span>
                <span className="text-xs font-medium text-ink-soft">
                  {message || 'Connecting & submitting application...'}
                </span>
              </div>

              {/* Shimmering Indeterminate Progress Bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-signal/40 via-signal to-signal/40"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  style={{ width: '60%' }}
                />
              </div>

              <p className="mt-3 text-[11px] text-ink-soft/75">
                Automating submission via companion session…
              </p>
            </div>
          )}

          {/* STAGE: SUCCESS */}
          {stage === 'success' && (
            <div className="relative flex flex-col items-center">
              {/* Spring Checkmark Animation */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 280 }}
                className="relative flex items-center justify-center size-20"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
                <div className="grid size-16 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="size-8" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full"
              >
                <h3 className="mt-4 font-serif text-lg font-medium text-ink">
                  Application Submitted!
                </h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Successfully submitted to <span className="font-medium text-ink">{company}</span>
                </p>

                <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  Marked as Applied
                </div>
              </motion.div>
            </div>
          )}

          {/* STAGE: FAILED */}
          {stage === 'failed' && (
            <div className="relative flex flex-col items-center">
              <div className="grid size-16 place-items-center rounded-full border border-rust/30 bg-rust-soft text-rust ring-8 ring-rust/10">
                <AlertCircle className="size-8" />
              </div>

              <h3 className="mt-4 font-serif text-lg font-medium text-ink">Application Incomplete</h3>
              <p className="mt-1.5 text-xs text-ink-soft max-w-xs">
                {message || 'Unable to submit application automatically.'}
              </p>

              <div className="mt-5 flex w-full gap-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Dismiss
                </Button>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-control border border-line bg-paper-raised px-3 py-2 text-xs font-medium text-ink transition hover:bg-paper-sunken"
                  >
                    <span>Open on Dice</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* STAGE: REVIEW */}
          {stage === 'review' && (
            <div className="relative flex flex-col items-center">
              <div className="grid size-16 place-items-center rounded-full border border-amber/30 bg-amber-soft text-amber ring-8 ring-amber/10">
                <HelpCircle className="size-8" />
              </div>

              <h3 className="mt-4 font-serif text-lg font-medium text-ink">Review Required</h3>
              <p className="mt-1.5 text-xs text-ink-soft max-w-xs">
                {message || 'This application requires answering employer questionnaire questions.'}
              </p>

              <div className="mt-5 flex w-full gap-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    onClose?.();
                    window.location.href = '/applications';
                  }}
                >
                  Go to Applications
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
