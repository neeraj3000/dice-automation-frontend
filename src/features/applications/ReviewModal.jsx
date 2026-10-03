import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { errorMessage } from '../../lib/format';
import { useAnswerApplicationMutation } from './applicationsApi';
import { useGetSettingsQuery } from '../settings/settingsApi';

function matchProfileAnswer(question = '', profile = {}, options = []) {
  if (!profile) return '';
  const q = question.toLowerCase();

  // Location / city of residence
  if (/city of residence|current city|current location|where .* (located|live|reside)|candidatelocation/i.test(q)) {
    const loc = [profile.city, profile.state].filter(Boolean).join(', ') || profile.city || '';
    if (loc) return loc;
  }

  // First / Last / Full Name
  if (/first\s*name/i.test(q)) return profile.first_name || '';
  if (/last\s*name|surname/i.test(q)) return profile.last_name || '';
  if (/full\s*name/i.test(q)) return [profile.first_name, profile.last_name].filter(Boolean).join(' ');

  // Email / Phone
  if (/e-?mail/i.test(q)) return profile.email || '';
  if (/phone|mobile/i.test(q)) return profile.phone || '';

  // City / State / Zip
  if (/\bcity\b/i.test(q)) return profile.city || '';
  if (/\bstate\b|province/i.test(q)) return profile.state || '';
  if (/zip|postal/i.test(q)) return profile.zip_code || '';

  // Links
  if (/linkedin/i.test(q)) return profile.linkedin || '';
  if (/github/i.test(q)) return profile.github || '';
  if (/portfolio|website/i.test(q)) return profile.portfolio || '';

  // Work authorization / sponsorship / relocation
  if (/authori[sz]ed to work|legally (authori[sz]ed|eligible)|work authori[sz]ation|eligible to work|right to work/i.test(q)) {
    const val = (profile.authorized_to_work ?? true) ? 'Yes' : 'No';
    if (options?.length) {
      const match = options.find((o) => o.toLowerCase() === val.toLowerCase());
      if (match) return match;
    }
    return val;
  }

  if (/sponsor|visa/i.test(q)) {
    const val = profile.requires_sponsorship ? 'Yes' : 'No';
    if (options?.length) {
      const match = options.find((o) => o.toLowerCase() === val.toLowerCase());
      if (match) return match;
    }
    return val;
  }

  if (/relocat/i.test(q)) {
    const val = (profile.willing_to_relocate ?? true) ? 'Yes' : 'No';
    if (options?.length) {
      const match = options.find((o) => o.toLowerCase() === val.toLowerCase());
      if (match) return match;
    }
    return val;
  }

  if (/commut|18 years|background|drug/i.test(q)) {
    if (options?.length) {
      const match = options.find((o) => /^yes$/i.test(o.trim()));
      if (match) return match;
    }
    return 'Yes';
  }

  if (/years of (relevant |work |professional )?experience|years experience|how many years/i.test(q)) {
    if (profile.years_experience !== undefined && profile.years_experience !== null) {
      const y = String(profile.years_experience);
      if (options?.length) {
        const match = options.find((o) => o.includes(y));
        if (match) return match;
      }
      return y;
    }
  }

  return '';
}

export default function ReviewModal({ application, onClose }) {
  const [answer, { isLoading }] = useAnswerApplicationMutation();
  const { data: settings } = useGetSettingsQuery();
  const [values, setValues] = useState({});
  const questions = application?.unanswered_questions ?? [];
  const profile = settings?.profile;

  useEffect(() => {
    if (!questions.length) return;
    setValues((prev) => {
      const next = { ...prev };
      questions.forEach((q) => {
        if (!next[q.question]) {
          const auto = matchProfileAnswer(q.question, profile, q.options);
          if (auto) next[q.question] = auto;
        }
      });
      return next;
    });
  }, [questions, profile]);

  const ready = questions.length > 0 && questions.every((q) => values[q.question]?.trim());

  const submit = async () => {
    try {
      await answer({ id: application.id, answers: questions.map((q) => ({ question: q.question, answer: values[q.question].trim() })) }).unwrap();
      toast.success('Thanks. Continuing your application.');
      onClose();
    } catch (e) { toast.error(errorMessage(e)); }
  };

  const hasPrefilled = Object.keys(values).length > 0;

  return (
    <Modal open={!!application} onClose={onClose} title="A few questions" description="We pre-filled answers from your profile settings where available. Review and edit before continuing."
      footer={<><Button variant="ghost" onClick={onClose}>Not now</Button><Button onClick={submit} loading={isLoading} disabled={!ready}>Save and continue</Button></>}>
      <div className="space-y-4">
        {questions.map((q) => q.options?.length ? (
          <Select key={q.question} label={q.question} value={values[q.question] ?? ''} onChange={(e) => setValues({ ...values, [q.question]: e.target.value })}>
            <option value="">Choose an answer</option>
            {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        ) : (
          <Input key={q.question} label={q.question} value={values[q.question] ?? ''} onChange={(e) => setValues({ ...values, [q.question]: e.target.value })} />
        ))}
      </div>
    </Modal>
  );
}

