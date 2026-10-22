import { ArrowUpRight, Download, Receipt } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Misc';
import { useGetInvoicesQuery } from '../billingApi';
import { INVOICE_STATUS, formatDate, formatPeriod, formatPrice } from '../billingUtils';

const HEAD = 'px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft';

function IconLink({ href, label, icon: Icon }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="grid size-8 place-items-center rounded-control text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
    >
      <Icon className="size-4" />
    </a>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-paper-sunken text-ink-soft">
        <Receipt className="size-5" />
      </div>
      <p className="mt-4 text-sm font-medium">No payments yet</p>
      <p className="mt-1 max-w-xs text-[13px] text-ink-soft">Invoices and receipts will appear here after your first payment.</p>
    </div>
  );
}

export default function BillingHistory() {
  const { data: invoices = [], isLoading, isError } = useGetInvoicesQuery();

  return (
    <Card className="overflow-hidden">
      {isLoading ? (
        <div className="space-y-3 p-6">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : isError ? (
        <p className="px-6 py-10 text-center text-sm text-ink-soft">Billing history is unavailable right now.</p>
      ) : invoices.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-paper/60">
              <tr>
                <th className={HEAD}>Date</th>
                <th className={HEAD}>Plan</th>
                <th className={`${HEAD} hidden md:table-cell`}>Billing period</th>
                <th className={`${HEAD} text-right`}>Amount</th>
                <th className={HEAD}>Status</th>
                <th className="w-px px-4"><span className="sr-only">Receipt</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((inv) => {
                const meta = INVOICE_STATUS[inv.status] || { label: inv.status, tone: 'neutral' };
                return (
                  <tr key={inv.id} className="transition-colors hover:bg-paper/60">
                    <td className="whitespace-nowrap px-6 py-4 text-ink">{formatDate(inv.created)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{inv.plan_name || 'Subscription'}</p>
                      {inv.number && <p className="mt-0.5 font-mono text-[11px] text-ink-soft">{inv.number}</p>}
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-ink-soft md:table-cell">
                      {formatPeriod(inv.period_start, inv.period_end)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium tabular-nums text-ink">
                      {formatPrice(inv.amount, inv.currency)}
                    </td>
                    <td className="px-6 py-4"><Badge tone={meta.tone}>{meta.label}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-0.5">
                        <IconLink href={inv.invoice_pdf} label="Download PDF" icon={Download} />
                        <IconLink href={inv.hosted_invoice_url} label="View invoice" icon={ArrowUpRight} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
