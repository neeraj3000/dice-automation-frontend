import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { useGetApplicationsQuery } from '../applications/applicationsApi';
import { STATUS_META } from '../applications/statusMeta';
import { useGetAutomationRunQuery } from './automationsApi';
import { RUN_STATUS_META, formatDateTime, formatDuration, formatElapsed, runElapsedSeconds } from './runMeta';

const EVENT_ICONS = {
  success: { icon: CheckCircle2, cls: 'text-signal' },
  warning: { icon: AlertTriangle, cls: 'text-amber' },
  error: { icon: XCircle, cls: 'text-rust' },
  info: { icon: Info, cls: 'text-ink-soft' },
};

const timeOf = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-control border border-line bg-paper px-3 py-2.5">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold tabular-nums', tone)}>{value}</p>
    </div>
  );
}

export default function RunDetailModal({ runId, onClose }) {
  const open = Boolean(runId);
  const { data: run, isLoading } = useGetAutomationRunQuery(runId, { skip: !open });
  const { data: apps = [], isLoading: appsLoading } = useGetApplicationsQuery(
    { automation_run_id: runId },
    { skip: !open }
  );
  const meta = run ? RUN_STATUS_META[run.status] || RUN_STATUS_META.FAILED : null;
  const { submitted = 0, review = 0, failed = 0, scraped = 0 } = run?.counters || {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={run?.automation_name || 'Automation run'}
      description={run ? `${formatDateTime(run.started_at)} · ran ${formatElapsed(runElapsedSeconds(run))} of ${formatDuration(run.duration_minutes)}` : ''}
    >
      {isLoading || !run ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone} dot>{meta.label}</Badge>
            {run.end_reason && <span className="text-sm text-ink-soft">{run.end_reason}</span>}
          </div>
          {run.profile_names?.length > 0 && (
            <p className="text-[13px] text-ink-soft">Search profiles: {run.profile_names.join(', ')}</p>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat label="Applied" value={`${submitted} / ${run.apply_limit}`} tone="text-signal-deep" />
            <Stat label="Sent to review" value={review} tone={review ? 'text-amber' : undefined} />
            <Stat label="Failed" value={failed} tone={failed ? 'text-rust' : undefined} />
            <Stat label="New jobs found" value={scraped} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-medium">Applications ({apps.length})</p>
              <Link to="/applications" className="text-[13px] font-medium text-signal-deep underline-offset-2 hover:underline">
                Open Applications
              </Link>
            </div>
            {appsLoading ? (
              <Skeleton className="h-20" />
            ) : apps.length === 0 ? (
              <p className="text-sm text-ink-soft">This run didn't apply to any jobs.</p>
            ) : (
              <ul className="divide-y divide-line rounded-control border border-line">
                {apps.map((a) => {
                  const st = STATUS_META[a.status] || STATUS_META.FAILED;
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.job_title}</p>
                        <p className="truncate text-xs text-ink-soft">{a.company}</p>
                      </div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium">Activity log</p>
            <ul className="max-h-80 space-y-1.5 overflow-y-auto rounded-control border border-line bg-paper-sunken/40 p-3">
              {(run.events || []).map((e, i) => {
                const { icon: Icon, cls } = EVENT_ICONS[e.type] || EVENT_ICONS.info;
                return (
                  <li key={`${e.at}-${i}`} className="flex items-start gap-2 text-[13px]">
                    <Icon className={cn('mt-0.5 size-3.5 shrink-0', cls)} />
                    <span className="min-w-0 flex-1">{e.message}</span>
                    <span className="shrink-0 tabular-nums text-xs text-ink-soft">{timeOf(e.at)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
