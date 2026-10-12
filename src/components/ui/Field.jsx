import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

const base = 'w-full rounded-control border border-line-strong bg-paper-raised px-3 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)] placeholder:text-ink-soft/50 transition hover:border-ink-soft/40 focus:border-signal focus:outline-none focus:ring-[3px] focus:ring-signal/15 disabled:opacity-60';

export function Field({ label, hint, error, children, htmlFor, labelAction }) {
  return (
    <div className="space-y-1.5">
      {(label || labelAction) && (
        <div className="flex items-center justify-between">
          {label && <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">{label}</label>}
          {labelAction}
        </div>
      )}
      {children}
      {error ? <p className="text-xs text-rust" role="alert">{error}</p> : hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

// icon: optional lucide icon shown inside the left edge.
// trailing: optional node pinned inside the right edge (e.g. a reveal button).
export const Input = forwardRef(function Input({ label, hint, error, className, id, icon: Icon, trailing, labelAction, ...rest }, ref) {
  const auto = useId();
  const fid = id || auto;
  const input = (
    <input
      ref={ref}
      id={fid}
      aria-invalid={!!error}
      className={cn(base, 'h-10', Icon && 'pl-9', trailing && 'pr-10', error && 'border-rust focus:border-rust focus:ring-rust/15', className)}
      {...rest}
    />
  );
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid} labelAction={labelAction}>
      {Icon || trailing ? (
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70" aria-hidden />}
          {input}
          {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
        </div>
      ) : input}
    </Field>
  );
});

export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <Input
      ref={ref}
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="grid size-8 place-items-center rounded-lg text-ink-soft/80 transition hover:bg-paper-sunken hover:text-ink"
        >
          <Icon className="size-4" />
        </button>
      }
    />
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid}>
      <textarea ref={ref} id={fid} className={cn(base, 'min-h-24 py-2.5', className)} {...rest} />
    </Field>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, className, id, children, ...rest }, ref) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid}>
      <select ref={ref} id={fid} className={cn(base, 'h-10 appearance-none bg-no-repeat pr-8', className)} {...rest}>{children}</select>
    </Field>
  );
});
