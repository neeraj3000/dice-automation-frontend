export const STATUS_META = {
  PREPARING: { label: 'In progress', tone: 'amber' },
  REVIEW: { label: 'Needs your input', tone: 'amber' },
  READY: { label: 'Ready to submit', tone: 'signal' },
  APPLIED: { label: 'Applied', tone: 'signal' },
  DISCOVERED: { label: 'Tracked', tone: 'neutral' },
  INTERVIEWING: { label: 'Interviewing', tone: 'signal' },
  OFFER: { label: 'Offer', tone: 'signal' },
  REJECTED: { label: 'Rejected', tone: 'rust' },
  FAILED: { label: 'Failed', tone: 'rust' },
  CANCELLED: { label: 'Stopped', tone: 'neutral' },
};

// The backend reports fine-grained runner states (QUEUED, SUBMITTING, SUBMITTED, ...);
// collapse them into the UI buckets above. Anything unknown is treated as failed.
const UI_STATUS = {
  APPLIED: 'APPLIED',
  SUBMITTED: 'APPLIED',
  READY: 'READY',
  REVIEW: 'REVIEW',
  PREPARING: 'PREPARING',
  PREPARE: 'PREPARING',
  APPLYING: 'PREPARING',
  QUEUED: 'PREPARING',
  STARTING: 'PREPARING',
  OPENING_JOB: 'PREPARING',
  FILLING_APPLICATION: 'PREPARING',
  UPLOADING_RESUME: 'PREPARING',
  SUBMITTING: 'PREPARING',
  CANCELLED: 'CANCELLED',
  DISCOVERED: 'DISCOVERED',
  INTERVIEWING: 'INTERVIEWING',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
};

export const uiStatus = (status) => UI_STATUS[status] ?? 'FAILED';
