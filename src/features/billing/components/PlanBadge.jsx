import { Link } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { useGetBillingStatusQuery } from '../billingApi';

// The user's current plan name, shown next to the logo in the sidebar.
export default function PlanBadge({ onClick }) {
  const { data: status } = useGetBillingStatusQuery();
  if (!status) return null;

  const expired = status.source === 'none';
  const label = expired ? 'Upgrade' : status.source === 'trial' ? 'Trial' : status.plan?.name;

  return (
    <Link
      to="/billing"
      onClick={onClick}
      title="Plan & billing"
      className={cn(
        'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
        expired
          ? 'border-amber/30 bg-amber-soft text-amber hover:bg-amber-soft/80'
          : 'border-signal/15 bg-signal-soft text-signal-deep hover:bg-signal-soft/80',
      )}
    >
      {label}
    </Link>
  );
}
