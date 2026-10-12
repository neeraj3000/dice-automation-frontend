import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Lock, Mail, Moon, Search, Send, ShieldCheck, Sun, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLoginMutation, useLoginMutation, useRegisterMutation } from './authApi';
import Button from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Field';
import { Logo } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useTheme } from '../../hooks/useTheme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POINTS = [
  { icon: FileText, title: 'One resume library', text: 'Upload once. We read the skills and pick the best resume for each job.' },
  { icon: Search, title: 'Every board, one search', text: 'Search job boards from one place and skip roles you already applied to.' },
  { icon: Send, title: 'Hands-free applying', text: 'Apply in the background using the browser you signed in with.' },
];
const COPY = {
  login: { title: 'Welcome back', sub: 'Sign in to continue to Apply2Hire.', cta: 'Sign in', switchText: 'New to Apply2Hire?', switchCta: 'Create an account' },
  register: { title: 'Create your account', sub: 'Start applying smarter. It takes less than a minute.', cta: 'Create account', switchText: 'Already have an account?', switchCta: 'Sign in' },
};
const GRID_STYLE = {
  backgroundImage: 'linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
  backgroundSize: '44px 44px',
  maskImage: 'radial-gradient(ellipse 80% 70% at 70% 20%, black, transparent)',
  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 70% 20%, black, transparent)',
};

// Google's button renders in an iframe with a fixed pixel width, so track the column width.
function useWidth() {
  const [node, setNode] = useState(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!node) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.min(400, Math.floor(entry.contentRect.width))));
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);
  return [setNode, width];
}

export default function LoginPage() {
  const { status } = useSelector((s) => s.auth);
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [login, { isLoading: l1 }] = useLoginMutation();
  const [register, { isLoading: l2 }] = useRegisterMutation();
  const [googleLogin] = useGoogleLoginMutation();
  const [googleRef, googleWidth] = useWidth();

  if (status === 'authenticated') return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const copy = COPY[mode];
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Enter your name';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Use at least 8 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await (mode === 'login' ? login({ email: form.email, password: form.password }) : register(form)).unwrap();
    } catch (err) { toast.error(errorMessage(err)); }
  };
  const onGoogle = async (res) => {
    try { await googleLogin(res.credential).unwrap(); } catch (err) { toast.error(errorMessage(err, 'Google sign-in failed')); }
  };
  const switchMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); };

  return (
    <div className="grid min-h-dvh bg-paper text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Form column */}
      <section className="flex min-h-dvh flex-col px-6 py-5 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo className="h-7" />
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
            className="grid size-9 place-items-center rounded-full border border-line text-ink-soft transition hover:bg-paper-sunken hover:text-ink"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[380px]"
          >
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">{copy.title}</h1>
            <p className="mt-1.5 text-sm text-ink-soft">{copy.sub}</p>

            <div ref={googleRef} className="mt-6 flex h-10 justify-center">
              {googleWidth > 0 && (
                <GoogleLogin
                  onSuccess={onGoogle}
                  onError={() => toast.error('Google sign-in failed')}
                  theme={dark ? 'filled_black' : 'outline'}
                  shape="rectangular"
                  size="large"
                  width={String(googleWidth)}
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                />
              )}
            </div>

            <div className="my-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft/70">
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={submit} className="space-y-3.5" noValidate>
              <AnimatePresence initial={false}>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Input label="Full name" icon={User} placeholder="Jane Doe" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                  </motion.div>
                )}
              </AnimatePresence>
              <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
              <PasswordInput
                label="Password"
                icon={Lock}
                placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={set('password')}
                error={errors.password}
               
              />
              <Button type="submit" size="lg" className="mt-1 w-full" loading={l1 || l2}>{copy.cta}</Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-soft">
              {copy.switchText}{' '}
              <button type="button" className="font-medium text-ink underline-offset-4 transition hover:text-signal hover:underline" onClick={switchMode}>
                {copy.switchCta}
              </button>
            </p>
          </motion.div>
        </main>

        <footer className="flex flex-col items-center justify-between gap-2 text-xs text-ink-soft/80 sm:flex-row">
          <span>© {new Date().getFullYear()} Apply2Hire</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" />Your resumes stay private to your account.</span>
        </footer>
      </section>

      {/* Brand panel */}
      <aside className="sticky top-0 hidden h-dvh p-3 lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] bg-[#0a3632] p-10 text-white xl:p-12">
          <div className="pointer-events-none absolute inset-0" style={GRID_STYLE} />
          <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[#10766c]/50 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 size-[360px] rounded-full bg-[#61ebd7]/10 blur-[110px]" />

          <div className="relative">
            <Logo onDark className="h-8" />
          </div>

          <div className="relative max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[38px] font-semibold leading-[1.1] tracking-[-0.03em] xl:text-[44px]"
            >
              Spend your time on <span className="text-[#61ebd7]">interviews</span>, not applications.
            </motion.h2>

            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {POINTS.map(({ icon: Icon, title, text }, i) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex gap-4 py-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white/[0.07] text-[#61ebd7] ring-1 ring-white/10">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/60">{text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/40">Built for job seekers who would rather be preparing than filling out forms.</p>
        </div>
      </aside>
    </div>
  );
}
