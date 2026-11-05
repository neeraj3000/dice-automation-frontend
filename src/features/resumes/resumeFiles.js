export const MAX_MB = 20;
export const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Why this file can't be uploaded, or null if it can
export function resumeFileError(file) {
  if (!/\.(pdf|docx)$/i.test(file.name)) return `"${file.name}" is not a PDF or DOCX file.`;
  if (file.size > MAX_MB * 1024 * 1024) return `"${file.name}" exceeds ${MAX_MB} MB limit.`;
  return null;
}

// The name the server stores a file under (see save_uploaded_resume), for spotting re-uploads
export function storedFileName(name) {
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : '';
  return `${stem.replace(/[^a-zA-Z0-9_\-.]/gu, '_')}${ext}`;
}
