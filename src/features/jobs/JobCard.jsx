import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink, MapPin, Sparkles, Trash2, Users, Wallet, CalendarDays, Clock, Download } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/cn';
import { timeAgo, formatExactDate } from '../../lib/format';

function MatchBar({ score }) {
  const tone = score >= 70 ? 'bg-signal' : score >= 40 ? 'bg-amber' : 'bg-rust';
  return (
    <div className="flex items-center gap-2" title={`${score}% of detected skills match`}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper-sunken">
        <motion.div className={`h-full ${tone}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}% match</span>
    </div>
  );
}

/**
 * Dual timestamp display: Job Posted date (from Dice) + Fetched date (when we scraped it).
 * Hovering shows the exact date/time as a native tooltip.
 */
function JobTimestampPill({ icon: Icon, label, value, tooltipTitle, tooltipDetail, tone = 'neutral' }) {
  const isSignal = tone === 'signal';
  return (
    <div className="group/tip relative inline-flex">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all duration-150 cursor-default select-none border',
          isSignal
            ? 'border-signal/25 bg-signal-soft/40 text-signal-deep hover:border-signal/50 hover:bg-signal-soft/70'
            : 'border-line-strong/60 bg-paper-sunken/80 text-ink-soft hover:border-line-strong hover:bg-paper-sunken hover:text-ink'
        )}
      >
        <Icon className={cn('size-3 shrink-0', isSignal ? 'text-signal' : 'text-ink-disabled')} />
        <span>
          {label}: <strong className="font-semibold text-ink">{value}</strong>
        </span>
      </span>

      {/* Sleek Custom Floating Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover/tip:flex flex-col items-center">
        <div className="flex flex-col gap-0.5 rounded-lg border border-slate-700/80 bg-slate-900 px-2.5 py-1.5 text-center text-xs text-white shadow-xl whitespace-nowrap">
          <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white">
            <Icon className={cn('size-3 shrink-0', isSignal ? 'text-emerald-400' : 'text-sky-400')} />
            {tooltipTitle}
          </p>
          {tooltipDetail && (
            <p className="text-[10px] text-slate-300 font-normal">
              {tooltipDetail}
            </p>
          )}
        </div>
        <div className="-mt-1 size-2 rotate-45 border-b border-r border-slate-700/80 bg-slate-900" />
      </div>
    </div>
  );
}

function JobTimestamps({ postedDate, fetchedAt }) {
  const fetchedAgo = fetchedAt ? timeAgo(fetchedAt) : null;
  const fetchedExact = fetchedAt ? formatExactDate(fetchedAt) : null;

  if (!postedDate && !fetchedAgo) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {postedDate && (
        <JobTimestampPill
          icon={CalendarDays}
          label="Posted"
          value={postedDate}
          tooltipTitle="Original Dice Posting"
          tooltipDetail={`Dice listed this job as "${postedDate}"`}
          tone="neutral"
        />
      )}
      {fetchedAgo && (
        <JobTimestampPill
          icon={Clock}
          label="Fetched"
          value={fetchedAgo}
          tooltipTitle="Scraped by Automation"
          tooltipDetail={fetchedExact ? `Saved to workspace on ${fetchedExact}` : `Scraped ${fetchedAgo}`}
          tone="signal"
        />
      )}
    </div>
  );
}

function JobCard({ job, onApply, onMatch, onDelete, matching }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const applied = job.status === 'APPLIED';
  const m = job.match;

  const hasDetails = m && (m.matched?.length > 0 || m.missing?.length > 0 || m.alternatives?.length > 0);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div>
            <a
              href={job.url || job.job_url}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex items-center gap-1.5 font-serif text-lg font-medium leading-snug hover:text-signal"
            >
              <span className="break-words">{job.title}</span>
              <ExternalLink className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
            </a>
            <p className="text-sm text-ink-soft">{job.company || 'Company not listed'}</p>
          </div>

          {/* Location / Salary row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
            {job.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span>
            )}
            {job.salary && (
              <span className="inline-flex items-center gap-1"><Wallet className="size-3.5" />{job.salary}</span>
            )}
          </div>

          {/* Timestamps row — Posted (Dice) + Fetched (our system) */}
          <JobTimestamps postedDate={job.posted_date} fetchedAt={job.created_at} />

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {job.is_easy_apply && <Badge tone="signal">Easy Apply</Badge>}
            {job.work_setting && <Badge>{job.work_setting}</Badge>}
            {job.employment_type && <Badge>{job.employment_type}</Badge>}
            {applied && <Badge tone="signal" dot>Applied</Badge>}
            {!applied && (job.status === "LOW_MATCH" || (m?.score !== undefined && m?.score !== null && m.score < 70)) && (
              <Badge tone="rust" dot>Low match (&lt;70%)</Badge>
            )}
          </div>

          {m && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <MatchBar score={m.score} />
                {hasDetails && (
                  <button
                    type="button"
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-ink-soft hover:text-ink"
                  >
                    <span>{detailsOpen ? 'Hide skills' : 'View match breakdown'}</span>
                    <ChevronDown className={`size-3 transition ${detailsOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {!detailsOpen && m.missing?.length > 0 && (
                <p className="text-xs text-ink-soft">
                  Missing from candidate: {m.missing.slice(0, 5).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <Button size="sm" disabled={applied} onClick={() => onApply(job)}>
            {applied ? 'Applied' : 'Apply'}
          </Button>
          <Button size="sm" variant="secondary" icon={Sparkles} loading={matching} onClick={() => onMatch(job.id)}>
            {m ? 'Re-match' : 'Match resume'}
          </Button>
          <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove job" onClick={() => onDelete(job.id)} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen && m && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-2.5 overflow-hidden border-t border-line pt-3"
          >
            {m.matched?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-signal">Matched Skills ({m.matched.length}):</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.matched.map((s) => (
                    <Badge key={s} tone="signal">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {m.missing?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-soft">Missing / Required Skills ({m.missing.length}):</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.missing.map((s) => (
                    <Badge key={s} tone="neutral">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {m.alternatives?.length > 0 && (
              <div className="pt-1">
                <p className="flex items-center gap-1 text-xs font-medium text-ink-soft">
                  <Users className="size-3.5" /> Alternative Candidates Fit:
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {m.alternatives.map((alt) => (
                    <span
                      key={alt.resume_id}
                      className="inline-flex items-center gap-1.5 rounded-control border border-line bg-paper-sunken px-2.5 py-1 text-xs"
                    >
                      <span className="font-medium text-ink">{alt.display_name}</span>
                      <span className="font-semibold text-signal">{alt.match_percentage}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
export default memo(JobCard);
