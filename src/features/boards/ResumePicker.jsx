import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Eye, Search, UploadCloud, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { ACCEPT } from '../resumes/resumeFiles';
import { ResumeTile } from './ProfileResumeList';
import { resumeLabel, resumeRoleLabel } from './profileResumes';

// The search box only earns its space once the list needs scrolling
const SEARCH_THRESHOLD = 6;

function SelectedTray({ resumes, onRemove, onClear }) {
  return (
    <div className="mb-3 rounded-control bg-paper-sunken/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
          Selected
          <span className="ml-1.5 font-medium tabular-nums text-ink-soft/70">{resumes.length}</span>
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="flex max-h-[5.5rem] flex-wrap gap-1.5 overflow-y-auto" aria-label="Selected resumes">
        {resumes.map((r) => {
          const label = resumeRoleLabel(r);
          return (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-line bg-paper-raised py-0.5 pl-3 pr-1 shadow-[0_1px_2px_rgb(0_0_0/0.03)]"
            >
              <span className="max-w-[15rem] truncate text-[13px] font-medium tracking-[-0.005em] text-ink" title={resumeLabel(r)}>
                {label}
              </span>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={`Remove ${label}`}
                className="grid size-5 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
              >
                <X className="size-3" strokeWidth={2.5} />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function DuplicateNotice({ resumes, onPreview, onDismiss }) {
  const ref = useRef(null);

  // The form is taller than the screen, so this can open out of sight
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [resumes]);

  return (
    <div ref={ref} className="mb-3 rounded-control border border-line p-3" role="status">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink">
            {resumes.length === 1 ? 'This resume already exists' : 'These resumes already exist'}
          </p>
          <p className="text-xs text-ink-soft">
            Nothing was uploaded. {resumes.length === 1 ? 'The one in your library is' : 'The ones in your library are'} now selected.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-6 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <ul className="space-y-1.5">
        {resumes.map((r) => <ResumeTile key={r.id} resume={r} onPreview={onPreview} />)}
      </ul>
    </div>
  );
}

function ResumeOption({ resume, checked, onToggle, onPreview }) {
  return (
    <div
      className={cn(
        'flex items-center pr-2 transition-colors has-[:focus-visible]:bg-paper-sunken',
        checked ? 'bg-signal-soft/50' : 'hover:bg-paper-sunken/60'
      )}
    >
      <label className="relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3.5 py-2.5">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
        <span
          aria-hidden
          className={cn(
            'grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors',
            checked ? 'border-signal bg-signal text-on-signal' : 'border-line-strong bg-paper-raised'
          )}
        >
          {checked && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium tracking-[-0.005em] text-ink">{resumeLabel(resume)}</span>
            {resume.is_default && <span className="shrink-0 text-[11px] font-medium text-ink-soft">Default</span>}
          </span>
          {resume.target_role && <span className="block truncate text-xs text-ink-soft">{resume.target_role}</span>}
        </span>
      </label>
      {onPreview && (
        <button
          type="button"
          onClick={() => onPreview(resume)}
          aria-label={`Preview ${resumeLabel(resume)}`}
          title="Preview"
          className="grid size-8 shrink-0 place-items-center rounded-control text-ink-soft transition-colors hover:bg-paper-raised hover:text-ink"
        >
          <Eye className="size-4" />
        </button>
      )}
    </div>
  );
}

export default function ResumePicker({
  resumes,
  isLoading,
  isError,
  onRetry,
  selectedIds,
  onChange,
  onPreview,
  onUpload,
  uploading,
  duplicates = [],
  onDismissDuplicates,
}) {
  const [query, setQuery] = useState('');
  const fileInput = useRef(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((r) =>
      [r.display_name, r.file_name, r.target_role].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [resumes, query]);

  // In the order they were picked; ids of deleted resumes have nothing to show
  const selected = useMemo(() => {
    const byId = new Map(resumes.map((r) => [r.id, r]));
    return selectedIds.filter((id) => byId.has(id)).map((id) => byId.get(id));
  }, [resumes, selectedIds]);

  const selectedCount = selected.length;
  const missingCount = isLoading || isError ? 0 : selectedIds.length - selectedCount;

  const toggle = (id) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  let body;
  if (isLoading) {
    body = (
      <div className="space-y-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  } else if (isError) {
    body = (
      <p className="text-sm text-ink-soft">
        Couldn't load your resumes.{' '}
        <button type="button" onClick={onRetry} className="font-medium text-signal-deep underline-offset-2 hover:underline">
          Try again
        </button>
      </p>
    );
  } else if (!resumes.length) {
    body = (
      <p className="text-sm text-ink-soft">
        You have no resumes yet. Upload one to get started.
      </p>
    );
  } else {
    body = (
      <div className="space-y-2">
        {resumes.length > SEARCH_THRESHOLD && (
          <Input
            icon={Search}
            placeholder="Search by name or role"
            aria-label="Search resumes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            autoComplete="off"
          />
        )}
        <div
          className="max-h-64 divide-y divide-line overflow-y-auto rounded-control border border-line"
          role="group"
          aria-label="Available resumes"
        >
          {visible.map((r) => (
            <ResumeOption
              key={r.id}
              resume={r}
              checked={selectedIds.includes(r.id)}
              onToggle={() => toggle(r.id)}
              onPreview={onPreview}
            />
          ))}
          {!visible.length && <p className="py-6 text-center text-sm text-ink-soft">No resumes match "{query.trim()}".</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-line pt-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Resumes</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {selectedCount
              ? `Automations apply only with ${selectedCount === 1 ? 'this resume' : `these ${selectedCount} resumes, using the best match for each job`}.`
              : 'None selected: automations use the best match from all your resumes.'}
          </p>
        </div>
        {/* Needs the loaded library to recognise files that are already in it */}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={UploadCloud}
          loading={uploading}
          disabled={isLoading || isError}
          onClick={() => fileInput.current?.click()}
          className="shrink-0 whitespace-nowrap"
        >
          {uploading ? 'Uploading…' : 'Upload resume'}
        </Button>
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          accept={ACCEPT}
          aria-label="Upload resume files"
          onChange={(e) => {
            onUpload(Array.from(e.target.files || []));
            e.target.value = '';
          }}
        />
      </div>
      {missingCount > 0 && (
        <p className="mb-3 flex items-start gap-1.5 text-xs text-rust" role="alert">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {missingCount === 1 ? '1 selected resume was' : `${missingCount} selected resumes were`} deleted and will be removed
          when you save.
        </p>
      )}
      {duplicates.length > 0 && (
        <DuplicateNotice resumes={duplicates} onPreview={onPreview} onDismiss={onDismissDuplicates} />
      )}
      {selectedCount > 0 && <SelectedTray resumes={selected} onRemove={toggle} onClear={() => onChange([])} />}
      {body}
    </div>
  );
}
