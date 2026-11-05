export const resumeLabel = (r) => r.display_name || r.file_name || 'Untitled resume';

// Resumes are usually named after the candidate, so the role is what tells them apart
export const resumeRoleLabel = (r) => r.target_role || resumeLabel(r);

// Summarises which resumes a search profile applies with. `resumes` is undefined until the
// library has loaded, so a selection is only reported as deleted once that is actually known.
export function describeProfileResumes(profile, resumes) {
  const ids = profile.resume_ids || [];
  if (!ids.length) return { text: 'All resumes', items: [], names: [], missingCount: 0, allMissing: false };
  if (!resumes) {
    return { text: `${ids.length} resume${ids.length === 1 ? '' : 's'}`, items: [], names: [], missingCount: 0, allMissing: false };
  }

  const byId = new Map(resumes.map((r) => [r.id, r]));
  const items = ids.filter((id) => byId.has(id)).map((id) => byId.get(id));
  const names = items.map(resumeRoleLabel);
  const allMissing = names.length === 0;
  let text = `${names.length} resumes`;
  if (allMissing) text = 'Selected resumes deleted';
  else if (names.length === 1) [text] = names;
  return { text, items, names, missingCount: ids.length - names.length, allMissing };
}
