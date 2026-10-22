export const PLAN_LIMIT_STATUS = 402;

export function formatPrice(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format((amount || 0) / 100);
}

export function applicationAllowance(plan) {
  if (!plan) return '';
  return plan.is_trial
    ? `${plan.total_application_limit} applications total`
    : `${plan.daily_application_limit} applications per day`;
}

export const profileAllowance = (plan) =>
  plan ? `${plan.search_profile_limit} search profile${plan.search_profile_limit === 1 ? '' : 's'}` : '';

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export function daysLeft(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

// Labels for Stripe subscription statuses we surface to the user
export const SUBSCRIPTION_STATUS = {
  active: { label: 'Active', tone: 'signal' },
  trialing: { label: 'Trialing', tone: 'signal' },
  past_due: { label: 'Payment due', tone: 'amber' },
  unpaid: { label: 'Unpaid', tone: 'rust' },
  canceled: { label: 'Canceled', tone: 'neutral' },
  incomplete: { label: 'Incomplete', tone: 'amber' },
  incomplete_expired: { label: 'Expired', tone: 'neutral' },
  paused: { label: 'Paused', tone: 'neutral' },
};

export const INVOICE_STATUS = {
  paid: { label: 'Paid', tone: 'signal' },
  open: { label: 'Due', tone: 'amber' },
  uncollectible: { label: 'Failed', tone: 'rust' },
};

export function formatPeriod(start, end) {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString(undefined, opts)} – ${new Date(end).toLocaleDateString(undefined, opts)}`;
}
