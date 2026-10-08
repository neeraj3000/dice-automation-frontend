import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  Copy,
  Eye,
  FileCheck,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Replace,
  Search,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import TagInput from '../../components/ui/TagInput';
import { Input, Textarea } from '../../components/ui/Field';
import { Chip, EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
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

function Dropzone({ onFiles, uploading, inputRef }) {
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

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); validateAndPick(Array.from(e.dataTransfer.files || [])); }}
      className={cn(
        'flex flex-col items-center rounded-card border-2 border-dashed px-6 py-9 text-center transition',
        over ? 'border-signal bg-signal-soft/50' : 'border-line-strong bg-paper-raised'
      )}
    >
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-signal-soft text-signal">
        <UploadCloud className="size-5" />
      </div>
      <p className="font-serif text-lg font-medium">{uploading ? 'Processing resume files…' : 'Drop candidate resumes here'}</p>
      <p className="mt-1 text-sm text-ink-soft max-w-md">
        Select one or multiple PDF or Word files (up to {MAX_MB} MB each). Automatic text extraction and skill classification.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => { validateAndPick(Array.from(e.target.files || [])); e.target.value = ''; }}
      />
      <Button className="mt-4" variant="secondary" loading={uploading} onClick={() => inputRef.current?.click()}>
        Choose file(s)
      </Button>
    </div>
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
      title={resume.file_name || 'Resume Preview'}
      description={resume.target_role || 'Extracted document'}
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
        <div className="py-12 text-center text-sm text-ink-soft">No preview file URL available for this resume.</div>
      )}
    </Modal>
  );
}

function EditModal({ resume, onClose }) {
  const [tab, setTab] = useState('details');
  const [update, { isLoading }] = useUpdateResumeMutation();

  const initialCustom = useMemo(() => {
    if (resume?.custom_fields && typeof resume.custom_fields === 'object' && !Array.isArray(resume.custom_fields)) {
      return Object.entries(resume.custom_fields).map(([key, value]) => ({ key, value: String(value ?? '') }));
    }
    return [];
  }, [resume]);

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
      title="Edit resume details"
      description="Refine extracted candidate attributes or add custom screening metadata."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={isLoading}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-2 border-b border-line pb-3">
          <Chip active={tab === 'details'} onClick={() => setTab('details')}>Details & Skills</Chip>
          <Chip active={tab === 'custom'} onClick={() => setTab('custom')}>Custom Metadata ({form.custom_fields.length})</Chip>
          <Chip active={tab === 'raw'} onClick={() => setTab('raw')}>Raw Text</Chip>
        </div>

        {tab === 'details' && (
          <div className="space-y-4">
            <Input label="Target role" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} />
            <Input label="Experience" placeholder="8+ years" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
            <TagInput label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
        )}

        {tab === 'custom' && (
          <div className="space-y-4">
            <p className="text-xs text-ink-soft">
              Attach custom attributes for recruiter filtering and screening (e.g., Security Clearance, Hourly Rate, Preferred Work Mode).
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
                  className="rounded-lg p-2 text-ink-soft hover:bg-rust-soft hover:text-rust"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Field name (e.g. clearance)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-1/3"
              />
              <Input
                placeholder="Value (e.g. Secret)"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="flex-1"
              />
              <Button variant="secondary" icon={Plus} size="sm" onClick={addCustomField}>
                Add
              </Button>
            </div>
          </div>
        )}

        {tab === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-soft">Extracted plain text content from parsed file</span>
              <Button size="sm" variant="secondary" icon={Copy} onClick={copyRawText}>Copy</Button>
            </div>
            <pre className="max-h-80 overflow-y-auto rounded-control border border-line bg-paper-sunken p-3 text-xs leading-relaxed text-ink-soft whitespace-pre-wrap">
              {resume?.raw_text || 'No raw text parsed for this document.'}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ResumesPage() {
  const { data: resumes, isLoading, refetch } = useGetResumesQuery();
  const [upload, { isLoading: uploading }] = useUploadResumeMutation();
  const [replaceResume, { isLoading: replacing }] = useReplaceResumeMutation();
  const [reparseResume] = useReparseResumeMutation();
  const [setDefault] = useSetDefaultResumeMutation();
  const [remove] = useDeleteResumeMutation();

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
      toast.success('Resume re-parsed with ATS engine');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setActiveReparseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Library"
        description="Manage candidate resumes, ATS skill extractions, and metadata for automated job matching."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              icon={UploadCloud}
              onClick={() => dropzoneInputRef.current?.click()}
            >
              Upload Resumes
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total Resumes</span>
            <FileText className="size-4 text-signal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{resumeList.length}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Stored documents for matching</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Target Roles</span>
            <Briefcase className="size-4 text-signal" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{uniqueRoles.length}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Unique candidate specializations</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Extracted Skills</span>
            <Sparkles className="size-4 text-amber" />
          </div>
          <p className="mt-2 text-2xl font-bold font-serif text-ink tabular-nums">{totalSkillsCount}</p>
          <p className="mt-0.5 text-xs text-ink-soft">ATS keywords classified</p>
        </Card>
      </div>

      <Dropzone onFiles={onFiles} uploading={uploading} inputRef={dropzoneInputRef} />

      <input
        ref={replaceFileRef}
        type="file"
        hidden
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onReplaceFileSelected}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, target role, or skills…"
            className="h-10 w-full rounded-control border border-line-strong bg-paper-raised pl-9 pr-3 text-sm focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
          />
        </div>
        {uniqueRoles.length > 0 && (
          <div className="w-full sm:w-56">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 w-full rounded-control border border-line-strong bg-paper-raised px-3 text-sm focus:border-signal focus:outline-none"
            >
              <option value="">All Target Roles ({uniqueRoles.length})</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [0, 1].map((i) => <Skeleton key={i} className="h-40" />)
        ) : !filteredResumes.length ? (
          <EmptyState
            icon={FileText}
            title={search || roleFilter ? 'No matching resumes' : 'No resumes yet'}
            description={
              search || roleFilter
                ? 'Try adjusting your search query or role filter.'
                : 'Upload candidate resumes to start matching and applying automatically.'
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {filteredResumes.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-all font-serif text-lg font-medium">
                          {r.display_name || r.file_name}
                        </h3>
                        {r.is_default && <Badge tone="signal" dot>Default</Badge>}
                        {r.custom_fields && typeof r.custom_fields === 'object' && !Array.isArray(r.custom_fields) && Object.keys(r.custom_fields).length > 0 && (
                          <Badge tone="neutral">
                            {Object.entries(r.custom_fields).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-ink-soft">
                        {[
                          r.target_role,
                          r.experience_years,
                          r.file_name && r.display_name && r.file_name !== r.display_name ? r.file_name : null,
                          r.created_at ? `added ${timeAgo(r.created_at)}` : null,
                        ].filter(Boolean).join(' · ')}
                      </p>
                      {r.summary && <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{r.summary}</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {r.skills?.slice(0, 14).map((s) => <Badge key={s}>{s}</Badge>)}
                        {r.skills?.length > 14 && <Badge>+{r.skills.length - 14}</Badge>}
                        {(!r.skills || !r.skills.length) && (
                          <span className="text-sm text-amber">No skills detected. Click Edit to add skills.</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:w-36">
                      <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreview(r)}>
                        Preview
                      </Button>
                      <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditing(r)}>
                        Edit details
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={RefreshCw}
                        loading={activeReparseId === r.id}
                        onClick={() => handleReparse(r.id)}
                      >
                        Re-parse
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Replace}
                        loading={replacing && targetReplaceResumeRef.current?.id === r.id}
                        onClick={() => handleTriggerReplace(r)}
                      >
                        Replace file
                      </Button>
                      {!r.is_default && (
                        <Button size="sm" variant="ghost" icon={Star} onClick={() => setDefault(r.id)}>
                          Make default
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(r)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
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
        description={confirmDelete?.file_name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Button>
            <Button
              variant="danger"
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
