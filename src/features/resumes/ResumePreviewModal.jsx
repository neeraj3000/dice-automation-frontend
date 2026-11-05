import { createPortal } from 'react-dom';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { cn } from '../../lib/cn';

export function FileTile({ name, compact }) {
  const ext = (name?.match(/\.(\w+)$/)?.[1] || 'doc').toUpperCase();
  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-end overflow-hidden border border-line bg-paper-sunken',
        compact ? 'h-10 w-8 rounded-md pb-1' : 'h-12 w-10 rounded-lg pb-1.5'
      )}
    >
      <span className={cn('absolute right-0 top-0 rounded-bl-md border-b border-l border-line bg-paper-raised', compact ? 'size-2.5' : 'size-3')} />
      <span className={cn('w-full text-center font-bold tracking-wider', compact ? 'text-[8px]' : 'text-[9px]', ext === 'PDF' ? 'text-rust' : 'text-signal')}>{ext}</span>
    </div>
  );
}

export default function ResumePreviewModal({ resume, onClose }) {
  if (!resume) return null;
  const isPdf = /\.pdf$/i.test(resume.file_name || '');
  const url = resume.cloudinary_url || '';
  const src = isPdf ? url : (url ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}` : '');

  // Portalled so it can stack over another modal without being laid out by the page around it
  return createPortal(
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
    </Modal>,
    document.body
  );
}
