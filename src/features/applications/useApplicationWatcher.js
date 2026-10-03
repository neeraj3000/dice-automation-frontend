import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { api } from '../../app/api';
import { useGetApplicationsQuery } from './applicationsApi';

const MESSAGES = {
  APPLIED: (a) => ({ ok: true, text: `Applied to ${a.job_title}` }),
  READY: (a) => ({ ok: true, text: `${a.job_title} is ready to submit` }),
  REVIEW: (a) => ({ ok: false, text: `${a.job_title} needs your input` }),
  FAILED: (a) => ({ ok: false, text: `${a.job_title} didn't go through` }),
};

/** Polls applications only while one is running, then refreshes dependent caches and notifies. */
export function useApplicationWatcher() {
  const dispatch = useDispatch();
  const [poll, setPoll] = useState(0);
  const { data } = useGetApplicationsQuery(undefined, { pollingInterval: poll });
  const seen = useRef(null);
  const active = !!data?.some((a) => a.status === 'PREPARING');

  useEffect(() => { setPoll(active ? 3000 : 0); }, [active]);

  useEffect(() => {
    if (!data) return;
    const next = Object.fromEntries(data.map((a) => [a.id, a.status]));
    if (seen.current) {
      let changed = false;
      for (const a of data) {
        if (seen.current[a.id] === 'PREPARING' && a.status !== 'PREPARING') {
          changed = true;
          const m = MESSAGES[a.status]?.(a);
          if (m) (m.ok ? toast.success : toast.error)(m.text);
        }
      }
      if (changed) dispatch(api.util.invalidateTags(['Job', 'Stats', 'Board']));
    }
    seen.current = next;
  }, [data, dispatch]);

  return { active };
}
