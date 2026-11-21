import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Clock, MapPin, Send, Copy, Check, CircleCheck, LoaderCircle } from 'lucide-react';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';
import { SUPPORT_EMAIL, useContactSupportMutation } from './supportApi';

const CATEGORIES = ['General', 'Technical issue', 'Billing', 'Account', 'Feature request', 'Other'];
const MAX_MESSAGE = 5000;

const inputCls =
  'w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition focus:border-[#104e43] dark:focus:border-emerald-500 focus:outline-none focus:ring-[3px] focus:ring-[#104e43]/15';

function FormField({ label, htmlFor, error, children, aside }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-stone-800 dark:text-stone-200">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.subject.trim().length < 3) e.subject = 'Subject should be at least 3 characters.';
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters.';
  return e;
}

function errorText(err) {
  const d = err?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return 'Please check the form fields and try again.';
  return `Something went wrong. You can also email us at ${SUPPORT_EMAIL}.`;
}

export default function SupportPage() {
  const user = useSelector((s) => s.auth.user);
  const reduce = useReducedMotion();
  const [contactSupport, { isLoading }] = useContactSupportMutation();
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    category: 'General',
    subject: '',
    message: '',
    website: '', // honeypot
  });

  useEffect(() => {
    const prev = document.title;
    document.title = 'Support – Apply2Hire';
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, []);

  // Prefill from the signed-in account
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({
      ...v,
      name: v.name || user.name || '',
      email: v.email || user.email || '',
    }));
  }, [user]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await contactSupport({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      }).unwrap();
      setSent(true);
      toast.success("Message sent. We'll be in touch soon.");
    } catch (err) {
      toast.error(errorText(err));
    }
  };

  const reset = () => {
    setValues((v) => ({ ...v, subject: '', message: '', category: 'General' }));
    setSent(false);
  };

  const fade = (delay = 0) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0c100e] text-[#161a18] dark:text-[#edf2f0] font-sans antialiased relative">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60 dark:opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(16, 78, 67, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 78, 67, 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-28">
          {/* Header */}
          <motion.div {...fade()} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#eef4f0] dark:bg-emerald-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#104e43] dark:text-emerald-300">
              Support
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-stone-950 dark:text-white">
              How can we help?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Questions, feedback, or something not working? Send us a message and our team will get back to you by email.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-10 items-start">
            {/* Contact info */}
            <motion.aside {...fade(0.05)} className="space-y-4">
              <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-900/70 backdrop-blur p-5">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4f0] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300">
                    <Mail className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Email us</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="mt-0.5 block truncate text-sm text-[#104e43] dark:text-emerald-300 hover:underline underline-offset-2"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="Copy email address"
                    title={copied ? 'Copied' : 'Copy'}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition"
                  >
                    {copied ? <Check className="size-4 text-[#104e43] dark:text-emerald-300" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-900/70 backdrop-blur p-5">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    <Clock className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Response time</p>
                    <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">Usually within 1 business day</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white/80 dark:bg-stone-900/70 backdrop-blur p-5">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    <MapPin className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Location</p>
                    <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">Frisco, Texas, United States</p>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Form */}
            <motion.section
              {...fade(0.1)}
              className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-6 sm:p-8"
            >
              {sent ? (
                <div className="py-10 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef4f0] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300">
                    <CircleCheck className="size-7" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-stone-950 dark:text-white">Message sent</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600 dark:text-stone-400">
                    Thanks for reaching out. We'll reply to <span className="font-medium text-stone-900 dark:text-stone-200">{values.email}</span> as soon as we can.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-stone-300 dark:border-stone-700 px-5 py-2 text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-950 dark:text-white">Send us a message</h2>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">All fields are required.</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Name" htmlFor="s-name" error={errors.name}>
                      <input id="s-name" autoComplete="name" value={values.name} onChange={set('name')} maxLength={100} placeholder="Jane Doe" className={`${inputCls} h-11`} aria-invalid={!!errors.name} />
                    </FormField>
                    <FormField label="Email" htmlFor="s-email" error={errors.email}>
                      <input id="s-email" type="email" autoComplete="email" value={values.email} onChange={set('email')} maxLength={254} placeholder="you@example.com" className={`${inputCls} h-11`} aria-invalid={!!errors.email} />
                    </FormField>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
                    <FormField label="Topic" htmlFor="s-category">
                      <select id="s-category" value={values.category} onChange={set('category')} className={`${inputCls} h-11 pr-8`}>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Subject" htmlFor="s-subject" error={errors.subject}>
                      <input id="s-subject" value={values.subject} onChange={set('subject')} maxLength={150} placeholder="Briefly describe your request" className={`${inputCls} h-11`} aria-invalid={!!errors.subject} />
                    </FormField>
                  </div>

                  <FormField
                    label="Message"
                    htmlFor="s-message"
                    error={errors.message}
                    aside={<span className="text-[11px] tabular-nums text-stone-400">{values.message.length}/{MAX_MESSAGE}</span>}
                  >
                    <textarea id="s-message" rows={6} value={values.message} onChange={set('message')} maxLength={MAX_MESSAGE} placeholder="Tell us what's going on. Include any steps, links, or error messages that might help." className={`${inputCls} py-3 resize-y min-h-[140px] leading-relaxed`} aria-invalid={!!errors.message} />
                  </FormField>

                  {/* Honeypot: hidden from people, catches bots */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="s-website">Website</label>
                    <input id="s-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Prefer email? Write to{' '}
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#104e43] dark:text-emerald-300 hover:underline underline-offset-2">
                        {SUPPORT_EMAIL}
                      </a>
                    </p>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#104e43] hover:bg-[#0c3d34] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow transition disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#104e43]"
                    >
                      {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                      <span>{isLoading ? 'Sending…' : 'Send message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
