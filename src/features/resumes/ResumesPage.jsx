import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, FileText, Pencil, Star, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import TagInput from '../../components/ui/TagInput';
import { Input, Textarea } from '../../components/ui/Field';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import { errorMessage, timeAgo } from '../../lib/format';
import {
  useDeleteResumeMutation, useGetResumesQuery, useSetDefaultResumeMutation, useUpdateResumeMutation, useUploadResumeMutation,
} from './resumesApi';

const MAX_MB = 5;

function Dropzone({ onFile, uploading }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name)) return toast.error('Upload a PDF or Word (.docx) file.');
    if (f.size > MAX_MB * 1024 * 1024) return toast.error(`Files must be under ${MAX_MB} MB.`);
    onFile(f);
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
      className={cn('flex flex-col items-center rounded-card border-2 border-dashed px-6 py-10 text-center transition', over ? 'border-signal bg-signal-soft/50' : 'border-line-strong bg-paper-raised')}
    >
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-signal-soft text-signal"><UploadCloud className="size-5" /></div>
      <p className="font-serif text-lg font-medium">{uploading ? 'Reading your resume…' : 'Drop your resume here'}</p>
      <p className="mt-1 text-sm text-ink-soft">PDF or Word, up to {MAX_MB} MB. We pull out your role, skills and experience.</p>
      <input ref={ref} type="file" hidden accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      <Button className="mt-4" variant="secondary" loading={uploading} onClick={() => ref.current?.click()}>Choose file</Button>
    </div>
  );
}

function PreviewModal({ resume, onClose }) {
  if (!resume) return <Modal open={false} onClose={onClose} />;
  const isPdf = /\.pdf$/i.test(resume.file_name);
  const src = isPdf ? resume.cloudinary_url : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(resume.cloudinary_url)}`;
  return (
    <Modal open onClose={onClose} title={resume.file_name} wide footer={<a href={resume.cloudinary_url} target="_blank" rel="noreferrer noopener"><Button variant="secondary">Open original</Button></a>}>
      <iframe title={`Preview of ${resume.file_name}`} src={src} className="h-[65dvh] w-full rounded-control border border-line bg-white" />
    </Modal>
  );
}

function EditModal({ resume, onClose }) {
  const [update, { isLoading }] = useUpdateResumeMutation();
  const [form, setForm] = useState(() => ({
    target_role: resume?.target_role ?? '', skills: resume?.skills ?? [], experience_years: resume?.experience_years ?? '', summary: resume?.summary ?? '',
  }));
  const save = async () => {
    try { await update({ id: resume.id, ...form }).unwrap(); toast.success('Resume updated'); onClose(); } catch (e) { toast.error(errorMessage(e)); }
  };
  return (
    <Modal open onClose={onClose} title="Review extracted details" description="Skills drive job matching. Fix anything we got wrong."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} loading={isLoading}>Save changes</Button></>}>
      <div className="space-y-4">
        <Input label="Target role" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} />
        <Input label="Experience" placeholder="8+ years" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
        <TagInput label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
        <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
      </div>
    </Modal>
  );
}

export default function ResumesPage() {
  const { data: resumes, isLoading } = useGetResumesQuery();
  const [upload, { isLoading: uploading }] = useUploadResumeMutation();
  const [setDefault] = useSetDefaultResumeMutation();
  const [remove] = useDeleteResumeMutation();
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const onFile = useCallback(async (file) => {
    try {
      const r = await upload(file).unwrap();
      toast.success('Resume added. Check the details we found.');
      setEditing(r);
    } catch (e) { toast.error(errorMessage(e)); }
  }, [upload]);

  return (
    <div>
      <PageHeader title="Resumes" description="Keep several versions. We pick the best one for each job." />
      <Dropzone onFile={onFile} uploading={uploading} />

      <div className="mt-8 space-y-4">
        {isLoading ? [0, 1].map((i) => <Skeleton key={i} className="h-40" />)
          : !resumes?.length ? <EmptyState icon={FileText} title="No resumes yet" description="Upload your first resume to start matching and applying." />
          : (
            <AnimatePresence initial={false}>
              {resumes.map((r) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
                  <Card className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-all font-serif text-lg font-medium">{r.file_name}</h3>
                          {r.is_default && <Badge tone="signal" dot>Default</Badge>}
                        </div>
                        <p className="text-sm text-ink-soft">
                          {[r.target_role, r.experience_years, `added ${timeAgo(r.created_at)}`].filter(Boolean).join(' · ')}
                        </p>
                        {r.summary && <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{r.summary}</p>}
                        <div className="flex flex-wrap gap-1.5">
                          {r.skills?.slice(0, 14).map((s) => <Badge key={s}>{s}</Badge>)}
                          {r.skills?.length > 14 && <Badge>+{r.skills.length - 14}</Badge>}
                          {!r.skills?.length && <span className="text-sm text-amber">No skills detected. Add some so matching works.</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                        <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreview(r)}>Preview</Button>
                        <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setEditing(r)}>Edit details</Button>
                        {!r.is_default && <Button size="sm" variant="ghost" icon={Star} onClick={() => setDefault(r.id)}>Make default</Button>}
                        <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(r)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
      </div>

      <PreviewModal resume={preview} onClose={() => setPreview(null)} />
      {editing && <EditModal key={editing.id} resume={editing} onClose={() => setEditing(null)} />}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this resume?" description={confirmDelete?.file_name}
        footer={<><Button variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Button>
          <Button variant="danger" onClick={async () => { try { await remove(confirmDelete.id).unwrap(); toast.success('Resume deleted'); } catch (e) { toast.error(errorMessage(e)); } setConfirmDelete(null); }}>Delete resume</Button></>}>
        <p className="text-sm text-ink-soft">The file is permanently removed from storage. Past applications aren't affected.</p>
      </Modal>
    </div>
  );
}
