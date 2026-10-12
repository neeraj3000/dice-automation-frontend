import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Copy,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Replace,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import ActionMenu from '../../components/ui/ActionMenu';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TagInput from '../../components/ui/TagInput';
import { Input, Textarea } from '../../components/ui/Field';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useDeleteResumeMutation,
  useGetResumesQuery,
  useReparseResumeMutation,
  useReplaceResumeMutation,
  useSetDefaultResumeMutation,
  useUpdateResumeMutation,
  useUploadResumeMutation,
} from './resumesApi';

const MAX_MB = 20;
const VISIBLE_SKILLS = 10;
const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const customEntries = (r) =>
  r?.custom_fields && typeof r.custom_fields === 'object' && !Array.isArray(r.custom_fields)
    ? Object.entries(r.custom_fields)
    : [];

function Dropzone({ onFiles, uploading, inputRef, compact }) {
  const [over, setOver] = useState(false);

  const validateAndPick = (fileList) => {
    if (!fileList || !fileList.length) return;
    const valid = [];
    for (const f of fileList) {
      if (!/\.(pdf|docx)$/i.test(f.name)) {
        toast.error(`"${f.name}" is not a PDF or DOCX file.`);
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds ${MAX_MB} MB limit.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length) onFiles(valid);
  };

  const browse = () => inputRef.current?.click();

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); validateAndPick(Array.from(e.dataTransfer.files || [])); }}
      className={cn(
        'rounded-card border border-dashed transition-colors',
        over ? 'border-signal bg-signal-soft/60' : 'border-line-strong bg-paper-raised/60 hover:border-ink-soft/40',
        compact ? 'flex items-center gap-4 px-5 py-4' : 'flex flex-col items-center px-6 py-14 text-center'
      )}
    >
      <div className={cn('grid shrink-0 place-items-center rounded-xl border border-line bg-paper-raised text-signal shadow-[0_1px_2px_rgb(0_0_0/0.04)]', compact ? 'size-10' : 'mb-4 size-12')}>
        {uploading ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
      </div>
      <div className={cn('min-w-0', compact && 'flex-1')}>
        <p className="text-sm font-medium text-ink">
          {uploading ? 'Processing your files…' : (
            <>Drop resumes here, or{' '}
              <button type="button" onClick={browse} className="text-signal underline-offset-4 hover:underline">browse</button>
            </>
          )}
        </p>
        <p className="mt-0.5 text-[13px] text-ink-soft">PDF or DOCX, up to {MAX_MB} MB each. Skills are extracted automatically.</p>
      </div>
      {!compact && (
        <Button className="mt-5" variant="secondary" loading={uploading} onClick={browse}>Choose files</Button>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPT}
        onChange={(e) => { validateAndPick(Array.from(e.target.files || [])); e.target.value = ''; }}
      />
    </div>
  );
}

function FileTile({ name }) {
  const ext = (name?.match(/\.(\w+)$/)?.[1] || 'doc').toUpperCase();
  return (
    <div className="relative grid h-12 w-10 shrink-0 place-items-end overflow-hidden rounded-lg border border-line bg-paper-sunken pb-1.5">
      <span className="absolute right-0 top-0 size-3 rounded-bl-md border-b border-l border-line bg-paper-raised" />
      <span className={cn('w-full text-center text-[9px] font-bold tracking-wider', ext === 'PDF' ? 'text-rust' : 'text-signal')}>{ext}</span>
    </div>
  );
}

function ResumeCard({ r, busy, onPreview, onEdit, onReparse, onReplace, onDefault, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const custom = customEntries(r);
  const skills = Array.isArray(r.skills) ? r.skills : [];
  const meta = [
    r.target_role,
    r.experience_years,
    r.created_at ? `Added ${timeAgo(r.created_at)}` : null,
  ].filter(Boolean);
  const showFileName = r.file_name && r.display_name && r.file_name !== r.display_name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn('relative', menuOpen && 'z-20')}
    >
      <Card className="group p-5 transition-colors hover:border-line-strong sm:p-6">
        <div className="flex gap-4">
          <FileTile name={r.file_name} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{r.display_name || r.file_name}</h3>
                  {r.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-semibold text-signal-deep">
                      <Star className="size-3 fill-current" /> Default
                    </span>
                  )}
                  {busy && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft">
                      <Loader2 className="size-3 animate-spin" /> {busy}
                    </span>
                  )}
                </div>
                {meta.length > 0 && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-soft">
                    {meta.map((m, i) => (
                      <span key={m} className="flex items-center gap-2">
                        {i > 0 && <span className="size-0.5 rounded-full bg-ink-soft/60" />}
                        {m}
                      </span>
                    ))}
                  </p>
                )}
                {showFileName && <p className="mt-0.5 truncate text-xs text-ink-soft/70">{r.file_name}</p>}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="secondary" icon={Eye} onClick={onPreview} className="hidden sm:inline-flex">Preview</Button>
                <Button size="sm" variant="secondary" icon={Pencil} onClick={onEdit} className="hidden sm:inline-flex">Edit</Button>
                <ActionMenu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  items={[
                    { label: 'Preview', icon: Eye, onClick: onPreview, mobileOnly: true },
                    { label: 'Edit details', icon: Pencil, onClick: onEdit, mobileOnly: true },
                    { label: 'Re-parse', icon: RefreshCw, onClick: onReparse },
                    { label: 'Replace file', icon: Replace, onClick: onReplace },
                    !r.is_default && { label: 'Make default', icon: Star, onClick: onDefault },
                    'divider',
                    { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
                  ]}
                />
              </div>
            </div>

            {r.summary && <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{r.summary}</p>}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.slice(0, VISIBLE_SKILLS).map((s) => (
                <span key={s} className="rounded-md border border-line bg-paper px-2 py-0.5 text-xs font-medium text-ink-soft">{s}</span>
              ))}
              {skills.length > VISIBLE_SKILLS && (
                <button type="button" onClick={onEdit} className="rounded-md px-2 py-0.5 text-xs font-medium text-ink-soft hover:text-signal">
                  +{skills.length - VISIBLE_SKILLS} more
                </button>
              )}
              {!skills.length && (
                <button type="button" onClick={onEdit} className="text-[13px] text-amber hover:underline">
                  No skills detected. Add them manually
                </button>
              )}
            </div>

            {custom.length > 0 && (
              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-xs">
                {custom.map(([k, v]) => (
                  <div key={k} className="flex gap-1.5">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="font-medium text-ink">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PreviewModal({ resume, onClose }) {
  if (!resume) return null;
  const isPdf = /\.pdf$/i.test(resume.file_name || '');
  const url = resume.cloudinary_url || '';
  const src = isPdf ? url : (url ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}` : '');

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={resume.display_name || resume.file_name || 'Resume preview'}
      description={resume.target_role || undefined}
      footer={
        url ? (
          <a href={url} target="_blank" rel="noreferrer noopener">
            <Button variant="secondary">Open original</Button>
          </a>
        ) : null
      }
    >
      {url ? (
        <iframe
          title={`Preview of ${resume.file_name || 'resume'}`}
          src={src}
          className="h-[65dvh] w-full rounded-control border border-line bg-white"
        />
      ) : (
        <div className="py-12 text-center text-sm text-ink-soft">No preview is available for this resume.</div>
      )}
    </Modal>
  );
}

const EDIT_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'custom', label: 'Custom fields' },
  { id: 'raw', label: 'Raw text' },
];

function EditModal({ resume, onClose }) {
  const [tab, setTab] = useState('details');
  const [update, { isLoading }] = useUpdateResumeMutation();

  const initialCustom = useMemo(
    () => customEntries(resume).map(([key, value]) => ({ key, value: String(value ?? '') })),
    [resume]
  );

  const [form, setForm] = useState(() => ({
    target_role: resume?.target_role ?? '',
    skills: Array.isArray(resume?.skills) ? resume.skills : [],
    experience_years: resume?.experience_years ?? '',
    summary: resume?.summary ?? '',
    custom_fields: initialCustom,
  }));
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const addCustomField = () => {
    if (!newKey.trim()) return;
    setForm((f) => ({ ...f, custom_fields: [...f.custom_fields, { key: newKey.trim(), value: newVal.trim() }] }));
    setNewKey('');
    setNewVal('');
  };

  const removeCustomField = (index) => {
    setForm((f) => ({ ...f, custom_fields: f.custom_fields.filter((_, i) => i !== index) }));
  };

  const save = async () => {
    try {
      const custom_fields_obj = form.custom_fields.reduce((acc, { key, value }) => {
        if (key.trim()) acc[key.trim()] = value.trim();
        return acc;
      }, {});
      await update({
        id: resume.id,
        target_role: form.target_role,
        skills: form.skills,
        experience_years: form.experience_years,
        summary: form.summary,
        custom_fields: custom_fields_obj,
      }).unwrap();
      toast.success('Resume updated');
      onClose();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const copyRawText = () => {
    if (resume?.raw_text) {
      navigator.clipboard.writeText(resume.raw_text);
      toast.success('Copied text to clipboard');
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Edit resume"
      description={resume?.display_name || resume?.file_name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={isLoading}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-5 border-b border-line" role="tablist">
          {EDIT_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative -mb-px flex items-center gap-1.5 pb-2.5 text-[13px] font-medium transition-colors',
                tab === t.id ? 'text-ink' : 'text-ink-soft hover:text-ink'
              )}
            >
              {t.label}
              {t.id === 'custom' && form.custom_fields.length > 0 && (
                <span className="rounded-full bg-paper-sunken px-1.5 text-[11px] tabular-nums text-ink-soft">{form.custom_fields.length}</span>
              )}
              {tab === t.id && <motion.span layoutId="resume-edit-tab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-signal" />}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Target role" placeholder="Senior Frontend Engineer" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} />
              <Input label="Experience" placeholder="8+ years" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
            </div>
            <TagInput label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
        )}

        {tab === 'custom' && (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-soft">
              Add your own attributes for filtering and screening, such as security clearance, hourly rate or preferred work mode.
            </p>
            {form.custom_fields.map((cf, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input value={cf.key} disabled className="w-1/3" />
                <Input
                  value={cf.value}
                  onChange={(e) => {
                    const next = [...form.custom_fields];
                    next[idx].value = e.target.value;
                    setForm({ ...form, custom_fields: next });
                  }}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  aria-label={`Remove ${cf.key}`}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-rust-soft hover:text-rust"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-control border border-dashed border-line-strong p-2">
              <Input placeholder="Field name" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="w-1/3" />
              <Input
                placeholder="Value"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomField(); } }}
                className="flex-1"
              />
              <Button variant="secondary" icon={Plus} onClick={addCustomField} disabled={!newKey.trim()}>Add</Button>
            </div>
          </div>
        )}

        {tab === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-soft">Plain text extracted from the file</span>
              <Button size="sm" variant="secondary" icon={Copy} onClick={copyRawText}>Copy</Button>
            </div>
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-control border border-line bg-paper-sunken p-4 font-mono text-xs leading-relaxed text-ink-soft">
              {resume?.raw_text || 'No text was extracted from this document.'}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Stat({ label, value }) {
  return (
    <div className="px-4 py-4 sm:px-6">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink tabular-nums">{value}</p>
    </div>
  );
}

export default function ResumesPage() {
  const { data: resumes, isLoading, isFetching, refetch } = useGetResumesQuery();
  const [upload, { isLoading: uploading }] = useUploadResumeMutation();
  const [replaceResume, { isLoading: replacing }] = useReplaceResumeMutation();
  const [reparseResume] = useReparseResumeMutation();
  const [setDefault] = useSetDefaultResumeMutation();
  const [remove, { isLoading: deleting }] = useDeleteResumeMutation();

  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeReparseId, setActiveReparseId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const dropzoneInputRef = useRef(null);
  const replaceFileRef = useRef(null);
  const targetReplaceResumeRef = useRef(null);

  // Defensively ensure resumeList is always an array
  const resumeList = useMemo(() => {
    if (Array.isArray(resumes)) return resumes;
    if (Array.isArray(resumes?.items)) return resumes.items;
    if (Array.isArray(resumes?.data)) return resumes.data;
    return [];
  }, [resumes]);

  const uniqueRoles = useMemo(() => {
    const set = new Set();
    resumeList.forEach((r) => {
      if (r?.target_role) set.add(r.target_role);
    });
    return Array.from(set);
  }, [resumeList]);

  const totalSkillsCount = useMemo(() => {
    const set = new Set();
    resumeList.forEach((r) => {
      if (Array.isArray(r?.skills)) {
        r.skills.forEach((s) => typeof s === 'string' && set.add(s.toLowerCase()));
      }
    });
    return set.size;
  }, [resumeList]);

  const parsedResumesCount = useMemo(() => {
    return resumeList.filter((r) => Array.isArray(r?.skills) && r.skills.length > 0).length;
  }, [resumeList]);

  const filteredResumes = useMemo(() => {
    return resumeList.filter((r) => {
      if (!r) return false;
      const matchRole = !roleFilter || r.target_role === roleFilter;
      if (!matchRole) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const inName = (r.file_name || '').toLowerCase().includes(q) || (r.display_name || '').toLowerCase().includes(q);
      const inRole = (r.target_role || '').toLowerCase().includes(q);
      const inSkills = Array.isArray(r.skills) ? r.skills.some((s) => typeof s === 'string' && s.toLowerCase().includes(q)) : false;
      const inSummary = (r.summary || '').toLowerCase().includes(q);
      return inName || inRole || inSkills || inSummary;
    });
  }, [resumeList, search, roleFilter]);

  const onFiles = useCallback(async (files) => {
    if (files.length === 1) {
      try {
        const r = await upload(files[0]).unwrap();
        toast.success('Resume added. Check the details we found.');
        setEditing(r);
      } catch (e) {
        toast.error(errorMessage(e));
      }
    } else {
      let count = 0;
      for (const file of files) {
        try {
          await upload(file).unwrap();
          count++;
        } catch (e) {
          toast.error(`Failed to upload ${file.name}: ${errorMessage(e)}`);
        }
      }
      if (count > 0) {
        toast.success(`Successfully uploaded ${count} resumes.`);
      }
    }
  }, [upload]);

  const handleTriggerReplace = (resume) => {
    targetReplaceResumeRef.current = resume;
    replaceFileRef.current?.click();
  };

  const onReplaceFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const targetResume = targetReplaceResumeRef.current;
    if (!file || !targetResume) return;

    try {
      await replaceResume({ id: targetResume.id, file }).unwrap();
      toast.success(`Replaced "${targetResume.file_name}" with "${file.name}"`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleReparse = async (id) => {
    setActiveReparseId(id);
    try {
      await reparseResume(id).unwrap();
      toast.success('Resume re-parsed');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setActiveReparseId(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefault(id).unwrap();
      toast.success('Default resume updated');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const hasResumes = resumeList.length > 0;
  const filtering = !!(search || roleFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Library"
        description="Your resumes, their extracted skills, and the details used to match you with jobs."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              aria-label="Refresh"
              title="Refresh"
              className="grid size-10 place-items-center rounded-control border border-line-strong bg-paper-raised text-ink-soft shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition hover:bg-paper-sunken hover:text-ink"
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
            </button>
            <Button icon={UploadCloud} loading={uploading} onClick={() => dropzoneInputRef.current?.click()}>
              Upload
            </Button>
          </div>
        }
      />

      {hasResumes && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Total Resumes
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums">{resumeList.length}</p>
          </Card>
          <Card className="p-5 border-emerald-500/20 bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              ATS Parsed
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-emerald-800 dark:text-emerald-300">
              {parsedResumesCount}
            </p>
          </Card>
          <Card className="p-5 border-blue-500/20 bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Target Roles
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-blue-800 dark:text-blue-300">
              {uniqueRoles.length}
            </p>
          </Card>
          <Card className="p-5 border-amber/20 bg-amber-soft/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber">
              Extracted Skills
            </p>
            <p className="mt-2 font-serif text-3xl font-medium tabular-nums text-amber">
              {totalSkillsCount}
            </p>
          </Card>
        </div>
      )}

      <Dropzone onFiles={onFiles} uploading={uploading} inputRef={dropzoneInputRef} compact={hasResumes} />

      <input ref={replaceFileRef} type="file" hidden accept={ACCEPT} onChange={onReplaceFileSelected} />

      {hasResumes && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role or skill"
              className="h-10 w-full rounded-control border border-line-strong bg-paper-raised pl-9 pr-9 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] placeholder:text-ink-soft/50 transition hover:border-ink-soft/40 focus:border-signal focus:outline-none focus:ring-[3px] focus:ring-signal/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-soft hover:bg-paper-sunken hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {uniqueRoles.length > 0 && (
            <div className="relative w-full sm:w-56">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by target role"
                className="h-10 w-full appearance-none rounded-control border border-line-strong bg-paper-raised pl-3 pr-9 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition hover:border-ink-soft/40 focus:border-signal focus:outline-none focus:ring-[3px] focus:ring-signal/15"
              >
                <option value="">All roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            </div>
          )}
          {filtering && (
            <p className="shrink-0 text-[13px] text-ink-soft tabular-nums">
              {filteredResumes.length} of {resumeList.length}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-card" />)
        ) : !filteredResumes.length ? (
          hasResumes ? (
            <EmptyState
              icon={Search}
              title="No matching resumes"
              description="Try a different search or clear the role filter."
              action={<Button variant="secondary" onClick={() => { setSearch(''); setRoleFilter(''); }}>Clear filters</Button>}
            />
          ) : (
            <p className="text-center text-sm text-ink-soft">Upload your first resume to start matching and applying automatically.</p>
          )
        ) : (
          <AnimatePresence initial={false}>
            {filteredResumes.map((r) => (
              <ResumeCard
                key={r.id}
                r={r}
                busy={
                  activeReparseId === r.id ? 'Re-parsing…'
                    : replacing && targetReplaceResumeRef.current?.id === r.id ? 'Replacing…'
                    : null
                }
                onPreview={() => setPreview(r)}
                onEdit={() => setEditing(r)}
                onReparse={() => handleReparse(r.id)}
                onReplace={() => handleTriggerReplace(r)}
                onDefault={() => handleSetDefault(r.id)}
                onDelete={() => setConfirmDelete(r)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {preview && <PreviewModal resume={preview} onClose={() => setPreview(null)} />}
      {editing && <EditModal key={editing.id} resume={editing} onClose={() => setEditing(null)} />}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this resume?"
        description={confirmDelete?.display_name || confirmDelete?.file_name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={async () => {
                try {
                  await remove(confirmDelete.id).unwrap();
                  toast.success('Resume deleted');
                } catch (e) {
                  toast.error(errorMessage(e));
                }
                setConfirmDelete(null);
              }}
            >
              Delete resume
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">The file is permanently removed from storage. Past applications aren&apos;t affected.</p>
      </Modal>
    </div>
  );
}
