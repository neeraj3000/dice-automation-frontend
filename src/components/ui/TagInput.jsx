import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ label, value, onChange, placeholder = 'Add a skill and press Enter' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim().replace(/,$/, '');
    if (v && !value.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium">{label}</label>
      <div className="flex flex-wrap gap-1.5 rounded-control border border-line-strong bg-paper-raised p-2 focus-within:border-signal focus-within:ring-2 focus-within:ring-signal/20">
        {value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-signal-soft py-1 pl-2.5 pr-1.5 text-xs font-medium text-signal-deep">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((x) => x !== s))} className="rounded-full p-0.5 hover:bg-signal/20"><X className="size-3" /></button>
          </span>
        ))}
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={add} placeholder={value.length ? '' : placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1)); }}
          className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink-soft/60"
        />
      </div>
    </div>
  );
}
