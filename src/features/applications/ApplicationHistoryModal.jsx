import { Clock, ShieldCheck, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useGetExternalApplicationHistoryQuery } from './applicationsApi';
import { STATUS_META } from './statusMeta';
import { Skeleton } from '../../components/ui/Misc';

export default function ApplicationHistoryModal({ application, onClose }) {
  const appId = application?.id;
  const { data: history = [], isLoading } = useGetExternalApplicationHistoryQuery(appId, {
    skip: !appId,
  });

  const appHistory = (history && history.length > 0) ? history : (application?.status_history || []);

  const meta = STATUS_META[application?.status] ?? STATUS_META.FAILED;
  const showSkeleton = isLoading && !application?.status_history?.length;

  return (
    <Modal
      open={Boolean(application)}
      onClose={onClose}
      title="Application Status History"
      description={`${application?.job_title} at ${application?.company}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Header Metadata Summary Card */}
        <div className="rounded-card border border-line bg-paper-sunken/40 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone={meta.tone} dot>
                {meta.label}
              </Badge>
              {application?.status_provenance === 'user_confirmed' && (
                <Badge tone="signal" className="gap-1">
                  <ShieldCheck className="size-3" />
                  User Confirmed
                </Badge>
              )}
            </div>
            {application?.board && (
              <span className="text-xs uppercase tracking-wider font-semibold text-ink-soft">
                Source: {application.board}
              </span>
            )}
          </div>

          <div className="text-xs text-ink-soft leading-relaxed">
            {application?.status_provenance === 'user_confirmed' ? (
              <p>
                This record was confirmed and recorded directly by the user. It is not an officially verified webhook or scraper result.
              </p>
            ) : (
              <p>Application tracked within Apply2Hire.</p>
            )}
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Transition History & Notes
          </h4>

          {showSkeleton ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : appHistory.length ? (
            <ol className="relative border-l border-line ml-3 space-y-4 py-1">
              {appHistory.map((entry, idx) => {
                const stepMeta = STATUS_META[entry.status] ?? STATUS_META.FAILED;
                const entryDate = entry.at ? new Date(entry.at) : null;
                const formattedDate = entryDate
                  ? `${entryDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Recorded';

                return (
                  <li key={idx} className="ml-5 relative">
                    <span className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-paper bg-signal ring-2 ring-signal-soft" />
                    <div className="flex flex-col gap-1 rounded-card border border-line bg-paper p-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge tone={stepMeta.tone} dot>
                            {stepMeta.label}
                          </Badge>
                          <span className="text-[11px] text-ink-soft flex items-center gap-1">
                            <User className="size-3" />
                            {entry.actor || 'User'}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-soft tabular-nums">
                          {formattedDate}
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="mt-1.5 text-xs text-ink-soft bg-paper-sunken/60 p-2 rounded border border-line-subtle italic">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="p-4 text-center text-xs text-ink-soft bg-paper-sunken/20 rounded-card border border-line">
              No status changes recorded yet.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
