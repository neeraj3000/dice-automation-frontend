import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary: 'bg-signal text-white hover:bg-signal-deep shadow-card',
  secondary: 'bg-paper-raised text-ink border border-line-strong hover:bg-paper-sunken',
  ghost: 'text-ink-soft hover:bg-paper-sunken hover:text-ink',
  danger: 'bg-rust text-white hover:opacity-90',
  soft: 'bg-signal-soft text-signal-deep hover:opacity-80',
};
const sizes = { sm: 'h-8 px-3 text-[13px] gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' };

const Button = forwardRef(function Button({ variant = 'primary', size = 'md', loading, icon: Icon, className, children, disabled, ...rest }, ref) {
  return (
    <motion.button
      ref={ref}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-control font-medium transition-colors select-none disabled:opacity-50',
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </motion.button>
  );
});
export default Button;
