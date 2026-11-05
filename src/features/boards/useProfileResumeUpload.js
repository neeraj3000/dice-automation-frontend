import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../../lib/format';
import { useUploadResumeMutation } from '../resumes/resumesApi';
import { resumeFileError, storedFileName } from '../resumes/resumeFiles';

const nameKey = (name) => storedFileName(name || '').toLowerCase();

// Uploads resumes from the profile form, selecting the existing resume instead of a duplicate:
// a matching file name is caught here without uploading, and the server catches matching content
// under a different name. onAdd receives the resume ids to select.
export function useProfileResumeUpload({ resumes, refetch, onAdd }) {
  const [upload] = useUploadResumeMutation();
  const [uploading, setUploading] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  const clearDuplicates = useCallback(() => setDuplicates([]), []);

  const uploadFiles = async (files) => {
    const library = new Map(resumes.map((r) => [nameKey(r.file_name), r]));
    const existing = new Map();
    const fresh = new Map();

    files.forEach((file) => {
      const error = resumeFileError(file);
      if (error) {
        toast.error(error);
        return;
      }
      const key = nameKey(file.name);
      const match = library.get(key);
      if (match) existing.set(match.id, match);
      else fresh.set(key, file);
    });

    setDuplicates([...existing.values()]);
    if (existing.size) onAdd([...existing.keys()]);
    if (!fresh.size) return;

    setUploading(true);
    try {
      const added = [];
      // One at a time: in parallel, two copies of a resume could both pass the server's check
      for (const file of fresh.values()) {
        try {
          const resume = await upload({ file, rejectDuplicates: true }).unwrap();
          added.push(resume.id);
        } catch (err) {
          const match = err?.status === 409 ? err.data?.detail?.resume : null;
          if (match) existing.set(match.id, match);
          else toast.error(`Failed to upload ${file.name}: ${errorMessage(err)}`);
        }
      }
      setDuplicates([...existing.values()]);
      if (added.length || existing.size) {
        // Select only once the list has them, or saving would drop them as unknown resumes
        await refetch();
        onAdd([...existing.keys(), ...added]);
      }
      if (added.length) {
        toast.success(added.length === 1 ? 'Resume uploaded and selected.' : `${added.length} resumes uploaded and selected.`);
      }
    } finally {
      setUploading(false);
    }
  };

  return { uploading, duplicates, uploadFiles, clearDuplicates };
}
