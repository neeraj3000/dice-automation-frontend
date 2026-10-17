import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { EmptyState, Skeleton } from '../../components/ui/Misc';
import { useGetAutomationRunHistoryQuery } from './automationsApi';
import RunDetailModal from './RunDetailModal';
import { RUN_STATUS_META, formatDateTime, formatDuration, formatElapsed, runElapsedSeconds } from './runMeta';

const PAGE_SIZE = 20;

function RunRow({ run, automationExists, onOpen }) {
  const meta = RUN_STATUS_META[run.status] || RUN_STATUS_META.FAILED;
  const { submitted = 0, review = 0, failed = 0, scraped = 0 } = run.counters || {};
  return (
    <Card className="p-4 transition-colors hover:border-line-strong sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone} dot>{meta.label}</Badge>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{run.automation_name}</h3>
            {!automationExists && <span className="text-xs text-ink-soft">(automation deleted)</span>}
          </div>
          <p className="mt-1 text-[13px] text-ink-soft">
            {formatDateTime(run.started_at)} · ran {formatElapsed(runElapsedSeconds(run))} of {formatDuration(run.duration_minutes)}
            {run.paused_seconds >= 60 ? ` (paused ${formatElapsed(run.paused_seconds)})` : ''}
            {run.profile_names?.length ? ` · ${run.profile_names.join(', ')}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <span><span className="font-semibold text-signal-deep tabular-nums">{submitted}</span> / {run.apply_limit} applied</span>
            <span><span className="font-semibold tabular-nums">{review}</span> to review</span>
            <span><span className="font-semibold tabular-nums">{failed}</span> failed</span>
            <span><span className="font-semibold tabular-nums">{scraped}</span> new jobs found</span>
          </div>
          {run.end_reason && <p className="mt-2 text-xs text-ink-soft">{run.end_reason}</p>}
        </div>
        <Button size="sm" variant="secondary" onClick={onOpen} className="shrink-0 max-sm:w-full">Details</Button>
      </div>
    </Card>
  );
}

function HistoryPage({ automationId, skip, automationIds, onOpen, onTotal }) {
  const { data, isLoading } = useGetAutomationRunHistoryQuery({ automationId, limit: PAGE_SIZE, skip });
  useEffect(() => {
    if (data && skip === 0) onTotal(data.total);
  }, [data, skip, onTotal]);
  if (isLoading) return [0, 1].map((i) => <Skeleton key={i} className="h-28 rounded-card" />);
  return (data?.items || []).map((run) => (
    <RunRow key={run.id} run={run} automationExists={automationIds.has(run.automation_id)} onOpen={() => onOpen(run.id)} />
  ));
}

export default function RunHistory({ automations, filterId, onFilterChange }) {
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(null);
  const [openRunId, setOpenRunId] = useState(null);
  const automationIds = new Set(automations.map((a) => a.id));

  const changeFilter = (id) => {
    setPages(1);
    setTotal(null);
    onFilterChange(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-ink-soft">
          {total === null ? 'Loading…' : `${total} run${total === 1 ? '' : 's'}`}
        </p>
        <div className="sm:w-72">
          <Select aria-label="Filter by automation" value={filterId || ''} onChange={(e) => changeFilter(e.target.value || null)}>
            <option value="">All automations</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {total === 0 ? (
        <EmptyState icon={History} title="No runs yet" description="Every time an automation runs, its results are saved here." />
      ) : null}

      {Array.from({ length: pages }, (_, i) => (
        <HistoryPage
          key={`${filterId || 'all'}-${i}`}
          automationId={filterId}
          skip={i * PAGE_SIZE}
          automationIds={automationIds}
          onOpen={setOpenRunId}
          onTotal={setTotal}
        />
      ))}

      {total !== null && pages * PAGE_SIZE < total && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={() => setPages((p) => p + 1)}>Load more</Button>
        </div>
      )}

      <RunDetailModal runId={openRunId} onClose={() => setOpenRunId(null)} />
    </div>
  );
}
