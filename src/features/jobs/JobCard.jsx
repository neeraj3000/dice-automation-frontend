import { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Sparkles, Trash2, Wallet } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

function MatchBar({ score }) {
  const tone = score >= 70 ? 'bg-signal' : score >= 40 ? 'bg-amber' : 'bg-rust';
  return (
    <div className="flex items-center gap-2" title={`${score}% of detected skills match`}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper-sunken"><motion.div className={`h-full ${tone}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} /></div>
      <span className="text-xs font-medium tabular-nums">{score}% match</span>
    </div>
  );
}

function JobCard({ job, onApply, onMatch, onDelete, matching }) {
  const applied = job.status === 'APPLIED';
  const m = job.match;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div>
            <a href={job.url} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-1.5 font-serif text-lg font-medium leading-snug hover:text-signal">
              <span className="break-words">{job.title}</span><ExternalLink className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
            </a>
            <p className="text-sm text-ink-soft">{job.company || 'Company not listed'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span>}
            {job.salary && <span className="inline-flex items-center gap-1"><Wallet className="size-3.5" />{job.salary}</span>}
            {job.posted_date && <span>{job.posted_date}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {job.is_easy_apply && <Badge tone="signal">Easy Apply</Badge>}
            {job.work_setting && <Badge>{job.work_setting}</Badge>}
            {job.employment_type && <Badge>{job.employment_type}</Badge>}
            {applied && <Badge tone="signal" dot>Applied</Badge>}
          </div>
          {m && (
            <div className="space-y-1.5 pt-1">
              <MatchBar score={m.score} />
              {m.missing?.length > 0 && <p className="text-xs text-ink-soft">Missing from your resume: {m.missing.slice(0, 6).join(', ')}</p>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <Button size="sm" disabled={applied} onClick={() => onApply(job)}>{applied ? 'Applied' : 'Apply'}</Button>
          <Button size="sm" variant="secondary" icon={Sparkles} loading={matching} onClick={() => onMatch(job.id)}>{m ? 'Re-match' : 'Match resume'}</Button>
          <Button size="sm" variant="ghost" icon={Trash2} aria-label="Remove job" onClick={() => onDelete(job.id)} />
        </div>
      </div>
    </Card>
  );
}
export default memo(JobCard);
