import { useState } from 'react';
import { Eye } from 'lucide-react';
import { FileTile } from '../resumes/ResumePreviewModal';
import { describeProfileResumes, resumeLabel } from './profileResumes';

// Two rows of the grid; anything beyond that waits behind "Show all"
const VISIBLE_RESUMES = 4;

export function ResumeTile({ resume, onPreview }) {
  const label = resumeLabel(resume);
  return (
    <li className="flex items-center gap-3 rounded-control border border-line bg-paper-raised py-2 pl-2.5 pr-1.5 transition-colors hover:border-line-strong">
      <FileTile name={resume.file_name} compact />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium tracking-[-0.005em] text-ink" title={label}>{label}</p>
        {resume.target_role && <p className="truncate text-xs text-ink-soft">{resume.target_role}</p>}
      </div>
      <button
        type="button"
        onClick={() => onPreview(resume)}
        aria-label={`Preview ${label}`}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-2.5 text-xs font-medium text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
      >
        <Eye className="size-3.5" /> Preview
      </button>
    </li>
  );
}

export default function ProfileResumeList({ profile, resumes, onPreview, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const { items, text, missingCount, allMissing } = describeProfileResumes(profile, resumes);
  const shown = expanded ? items : items.slice(0, VISIBLE_RESUMES);
  const hidden = items.length - VISIBLE_RESUMES;

  return (
    <section aria-label={`Resumes for ${profile.name}`} className="mt-5 border-t border-line pt-4 sm:pl-14">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
          Resumes
          {items.length > 0 && <span className="ml-1.5 font-medium tabular-nums text-ink-soft/70">{items.length}</span>}
        </p>
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-xs font-medium text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            {expanded ? 'Show less' : `Show all ${items.length}`}
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {shown.map((r) => <ResumeTile key={r.id} resume={r} onPreview={onPreview} />)}
        </ul>
      ) : allMissing ? (
        <p className="mt-1.5 text-[13px] text-rust">
          The selected resumes were deleted, so this profile can't run in an automation.{' '}
          <button type="button" onClick={onEdit} className="font-medium underline underline-offset-2">
            Pick new ones
          </button>
        </p>
      ) : (
        <p className="mt-1.5 text-[13px] text-ink-soft">
          {text === 'All resumes' ? 'All resumes, using the best match for each job.' : text}
        </p>
      )}

      {missingCount > 0 && !allMissing && (
        <p className="mt-2 text-xs text-ink-soft">
          {missingCount === 1 ? '1 selected resume was' : `${missingCount} selected resumes were`} deleted.
        </p>
      )}
    </section>
  );
}
