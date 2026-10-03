import { cn } from '../../lib/cn';

export function Card({ className, children, ...rest }) {
  return <div className={cn('rounded-card border border-line bg-paper-raised shadow-card', className)} {...rest}>{children}</div>;
}
export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0', className)}>
      <div className="min-w-0">
        <h2 className="font-serif text-lg font-medium tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export const CardBody = ({ className, children }) => <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
