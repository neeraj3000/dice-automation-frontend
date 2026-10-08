import { useState } from 'react';
import { CheckCircle2, ChevronRight, FileText, Sparkles, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input, Textarea } from '../../components/ui/Field';
import { useMatchDirectMutation } from './jobsApi';
import { useGetResumesQuery } from '../resumes/resumesApi';
import { errorMessage } from '../../lib/format';

export default function DirectMatchModal({ open, onClose, onApplyJob }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  const { data: resumes = [] } = useGetResumesQuery();
  const [matchDirect] = useMatchDirectMutation();

  const handleEvaluate = async () => {
    if (rawText.trim().length < 20) {
      toast.error('Please paste a job description with at least 20 characters.');
      return;
    }

    setEvaluating(true);
    setResult(null);

    try {
      // Try backend endpoint first
      const res = await matchDirect({
        title: title.trim() || undefined,
        company: company.trim() || undefined,
        description_raw: rawText.trim(),
      }).unwrap();

      if (res?.match_result) {
        setResult(res.match_result);
      } else if (res?.match) {
        const bestResume = resumes.find((r) => r.id === res.match.resume_id);
        setResult({
          recommended_resume_name: bestResume?.file_name || 'Best Match',
          recommended_resume_id: res.match.resume_id,
          match_percentage: res.match.score,
          matched_skills: res.match.matched || [],
          missing_skills: res.match.missing || [],
          reason: `Matched ${res.match.matched?.length || 0} required skills from candidate resume.`,
          alternatives: res.match.alternatives || [],
        });
      } else {
        // If response is generic, fallback to client-side evaluation
        runClientFallback();
      }
      toast.success('Matching evaluation complete');
    } catch {
      // Graceful client fallback using candidate resumes in Redux cache
      runClientFallback();
    } finally {
      setEvaluating(false);
    }
  };

  const runClientFallback = () => {
    if (!resumes.length) {
      toast.error('No candidate resumes found. Upload resumes first to evaluate fit.');
      return;
    }

    const jdLower = rawText.toLowerCase();
    const scored = resumes.map((resume) => {
      const skills = resume.skills || [];
      const matched = skills.filter((s) => jdLower.includes(s.toLowerCase()));
      const missing = skills.filter((s) => !jdLower.includes(s.toLowerCase()));
      const pct = skills.length ? Math.round((matched.length / skills.length) * 100) : 0;
      return {
        resume_id: resume.id,
        display_name: resume.file_name,
        target_role: resume.target_role,
        score: pct,
        matched,
        missing: missing.slice(0, 8),
      };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0];
    setResult({
      recommended_resume_name: best.display_name,
      recommended_resume_id: best.resume_id,
      match_percentage: best.score,
      matched_skills: best.matched,
      missing_skills: best.missing,
      reason: `Best candidate fit based on ${best.matched.length} detected matching skills.`,
      alternatives: scored.slice(1, 4).map((s) => ({
        resume_id: s.resume_id,
        display_name: s.display_name,
        match_percentage: s.score,
      })),
    });
    toast.success('Evaluated against all candidate resumes');
  };

  const handleReset = () => {
    setTitle('');
    setCompany('');
    setRawText('');
    setResult(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Direct Job Description Matcher"
      description="Paste any JD from Dice, client emails, or external portals to evaluate requirements across candidate resumes."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            icon={Sparkles}
            loading={evaluating}
            disabled={rawText.trim().length < 20}
            onClick={handleEvaluate}
          >
            {evaluating ? 'Analyzing…' : 'Evaluate candidates'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Target role / title (optional)"
            placeholder="e.g. Senior Cloud Architect"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Company name (optional)"
            placeholder="e.g. Acme Tech"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <Textarea
          label="Job description"
          rows={6}
          placeholder="Paste full job description text here including requirements, qualifications, and responsibilities…"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        {result && (
          <div className="space-y-3 rounded-control border border-line bg-paper-sunken p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="size-5 text-signal" />
                <div>
                  <p className="font-serif text-base font-medium">Recommended: {result.recommended_resume_name}</p>
                  <p className="text-xs text-ink-soft">{result.reason}</p>
                </div>
              </div>
              <Badge tone={result.match_percentage >= 70 ? 'signal' : result.match_percentage >= 40 ? 'amber' : 'rust'}>
                {result.match_percentage}% Match
              </Badge>
            </div>

            {result.matched_skills?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-signal">Matched Skills ({result.matched_skills.length}):</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {result.matched_skills.map((s) => (
                    <Badge key={s} tone="signal">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missing_skills?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-soft">Missing / Required Skills:</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {result.missing_skills.map((s) => (
                    <Badge key={s} tone="neutral">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.alternatives?.length > 0 && (
              <div className="border-t border-line pt-2">
                <p className="text-xs font-medium text-ink-soft">Alternative Candidates:</p>
                <div className="mt-1.5 space-y-1">
                  {result.alternatives.map((alt) => (
                    <div key={alt.resume_id} className="flex items-center justify-between rounded-md bg-paper p-2 text-xs">
                      <span className="font-medium text-ink">{alt.display_name}</span>
                      <span className="tabular-nums font-semibold text-ink-soft">{alt.match_percentage}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
