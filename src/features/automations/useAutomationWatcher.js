import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { api } from '../../app/api';
import { useGetActiveAutomationRunQuery, useLazyGetAutomationRunQuery } from './automationsApi';

// The server pushes AUTOMATION_UPDATED over SSE on every run change (see DiceContext), so this
// is only a safety net while a run is live in case an event is missed. Idle: no polling at all;
// a run started elsewhere arrives as an event, or on refetch when the tab regains focus.
const ACTIVE_POLL_MS = 30000;
const IDLE_POLL_MS = 0;

function notifyFinished(run) {
  const { submitted = 0, review = 0 } = run.counters || {};
  const summary = `${submitted} applied, ${review} sent to review`;
  if (run.status === 'COMPLETED') toast.success(`Automation finished: ${summary}`);
  else if (run.status === 'TIME_UP') toast.success(`Automation time's up: ${summary}`);
  else if (run.status === 'STOPPED') toast(`Automation stopped: ${summary}`);
  else toast.error(run.end_reason || 'Automation ended early.');
}

/**
 * Mounted once (in AppShell). Polls the active automation run, keeps Applications and the
 * Review Queue fresh while it makes progress, and announces when it finishes.
 */
export function useAutomationWatcher() {
  const dispatch = useDispatch();
  const [poll, setPoll] = useState(IDLE_POLL_MS);
  const { data: run, fulfilledTimeStamp } = useGetActiveAutomationRunQuery(undefined, {
    pollingInterval: poll,
    skipPollingIfUnfocused: true,
  });
  const [fetchRun] = useLazyGetAutomationRunQuery();
  const last = useRef(null);
  const active = Boolean(run);

  useEffect(() => { setPoll(active ? ACTIVE_POLL_MS : IDLE_POLL_MS); }, [active]);

  useEffect(() => {
    const prev = last.current;
    if (run) {
      const key = JSON.stringify(run.counters);
      if (prev && prev.id === run.id && prev.key !== key) {
        dispatch(api.util.invalidateTags(['Application', 'ReviewQueue', 'Job', 'Stats', 'Billing']));
      }
      last.current = { id: run.id, key };
    } else if (prev) {
      last.current = null;
      dispatch(api.util.invalidateTags(['Application', 'ReviewQueue', 'Job', 'Stats', 'Automation', 'AutomationHistory', 'Billing']));
      fetchRun(prev.id).unwrap().then(notifyFinished).catch(() => {});
    }
  }, [run, dispatch, fetchRun]);

  return { run: run || null, receivedAt: fulfilledTimeStamp };
}
