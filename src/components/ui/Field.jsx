import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn';

const base = 'w-full rounded-control border border-line-strong bg-paper-raised px-3 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:opacity-60';

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">{label}</label>}
      {children}
      {error ? <p className="text-xs text-rust" role="alert">{error}</p> : hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid}>
      <input ref={ref} id={fid} aria-invalid={!!error} className={cn(base, 'h-10', error && 'border-rust', className)} {...rest} />
    </Field>
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
