import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { FileText, Moon, Search, Send, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLoginMutation, useLoginMutation, useRegisterMutation } from './authApi';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Logo } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useTheme } from '../../hooks/useTheme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POINTS = [
  { icon: FileText, text: 'Upload your resumes once. We read the skills and pick the best one for each job.' },
  { icon: Search, text: 'Search job boards from one place and skip roles you already applied to.' },
  { icon: Send, text: 'Apply in the background using the browser you signed in with.' },
];

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

  if (status === 'authenticated') return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
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

  return (
    <div className="relative grid min-h-dvh bg-paper text-ink lg:grid-cols-[1.05fr_1fr]">
      {/* Left hero banner */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c3e34] via-[#104b3f] to-[#082922] p-12 text-white lg:flex border-r border-[#155446]/40">
        <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10">
          <Logo className="[&_span:last-child]:text-white" />
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-5xl font-medium leading-[1.12] tracking-tight text-white"
          >
            Spend your time on interviews, not applications.
          </motion.h1>
          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.12 }}
                className="flex items-start gap-3.5 text-[15px] leading-relaxed text-emerald-100/90"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                  <Icon className="size-4" />
                </span>
                <span className="pt-0.5">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-200/60">
          <p>Your resumes stay private to your account.</p>
          <span>Apply2Hire</span>
        </div>
      </section>

      {/* Right login form section */}
      <section className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        {/* Theme toggle button */}
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3 py-1.5 text-xs font-medium text-ink-soft shadow-xs transition hover:bg-paper-sunken hover:text-ink"
          >
            {dark ? <Sun className="size-3.5 text-amber-500" /> : <Moon className="size-3.5 text-ink-soft" />}
            <span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>

        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            {mode === 'login' ? 'Sign in to continue to Apply2Hire.' : 'It takes less than a minute.'}
          </p>

          <div className="mt-7 flex justify-center">
            <GoogleLogin
              onSuccess={onGoogle}
              onError={() => toast.error('Google sign-in failed')}
              theme={dark ? 'filled_black' : 'outline'}
              shape="rectangular"
              size="large"
              width="360"
              text="continue_with"
            />
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            or use email
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'register' && <Input label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />}
            <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} error={errors.password} />
            <Button type="submit" size="lg" className="w-full" loading={l1 || l2}>{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {mode === 'login' ? 'New to Apply2Hire? ' : 'Already have an account? '}
            <button className="font-medium text-signal hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
