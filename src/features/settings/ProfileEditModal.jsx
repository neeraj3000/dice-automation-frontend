import { forwardRef, useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Building2,
  Globe,
  Hash,
  Mail,
  MapPin,
  Navigation,
  Plane,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import Button from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Misc';
import { cn } from '../../lib/cn';
import ProfileAvatarPicker from './ProfileAvatarPicker';
import { useUploadAvatarMutation, useDeleteAvatarMutation } from './settingsApi';
import { setCredentials } from '../auth/authSlice';

export const DEFAULT_PHONE_COUNTRY = 'us';
const PREFERRED_COUNTRIES = ['us', 'in', 'ca', 'gb'];

export const WORK_AUTH_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1B',
  'EAD',
  'OPT/CPT',
  'TN Visa',
  'Other / Sponsorship Needed',
];

const SECTIONS = [
  { id: 'contact', label: 'Contact', icon: UserRound },
  { id: 'links', label: 'Links', icon: Globe },
  { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
];

// lucide-react v1 dropped brand marks, so these two are inlined.
export function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function GithubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
    </svg>
  );
}

const inputBase =
  'h-10 w-full rounded-control border border-line-strong bg-paper-raised pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20';

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">
      {children}
    </label>
  );
}

const IconInput = forwardRef(function IconInput({ label, icon: Icon, className, ...rest }, ref) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70 transition-colors group-focus-within:text-signal" />
        <input ref={ref} id={id} className={inputBase} {...rest} />
      </div>
    </div>
  );
});

function IconSelect({ label, icon: Icon, children, ...rest }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70 transition-colors group-focus-within:text-signal" />
        <select id={id} className={cn(inputBase, 'appearance-none')} {...rest}>
          {children}
        </select>
      </div>
    </div>
  );
}

function PhoneField({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>Phone Number</FieldLabel>
      <PhoneInput
        defaultCountry={DEFAULT_PHONE_COUNTRY}
        preferredCountries={PREFERRED_COUNTRIES}
        value={value}
        onChange={(phone) => onChange(phone)}
        className="a2h-phone"
        inputProps={{ 'aria-label': 'Phone number' }}
      />
    </div>
  );
}

const sectionVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -24 }),
};

const stagger = {
  center: { transition: { staggerChildren: 0.04 } },
};

const item = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 32 } },
};

export default function ProfileEditModal({ open, onClose, initialProfile, onSave, saving }) {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: deleting }] = useDeleteAvatarMutation();

  const [draft, setDraft] = useState(initialProfile);
  const [section, setSection] = useState('contact');
  const [direction, setDirection] = useState(1);

  // Reset the draft each time the modal opens so cancelled edits are discarded.
  useEffect(() => {
    if (open) {
      setDraft(initialProfile);
      setSection('contact');
    }
  }, [open, initialProfile]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const goTo = (id) => {
    const from = SECTIONS.findIndex((s) => s.id === section);
    const to = SECTIONS.findIndex((s) => s.id === id);
    setDirection(to >= from ? 1 : -1);
    setSection(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(draft);
  };

  const initials =
    `${draft?.first_name?.[0] || ''}${draft?.last_name?.[0] || ''}`.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    '?';
  const googleAvatar = user?.avatar || null;
  const avatarUrl =
    draft?.avatar ||
    draft?.avatar_url ||
    initialProfile?.avatar ||
    initialProfile?.avatar_url ||
    googleAvatar ||
    null;

  const handleUploadAvatar = async (dataUrl) => {
    try {
      const pubId = draft?.avatar_public_id || initialProfile?.avatar_public_id;
      const result = await uploadAvatar({
        image_data: dataUrl,
        old_public_id: pubId || undefined,
      }).unwrap();
      setDraft((d) => ({
        ...d,
        avatar: result.avatar_url,
        avatar_url: result.avatar_url,
        avatar_public_id: result.public_id,
      }));
      if (user) {
        dispatch(
          setCredentials({
            access_token: token,
            user: { ...user, avatar: result.avatar_url },
          })
        );
      }
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err?.data?.detail || 'Upload failed. Please try again.');
    }
  };

  const handleDeleteAvatar = async () => {
    const pubId = draft?.avatar_public_id || initialProfile?.avatar_public_id;
    if (!pubId) {
      toast.error('No custom photo to delete.');
      return;
    }
    try {
      await deleteAvatar({ public_id: pubId }).unwrap();
      setDraft((d) => ({
        ...d,
        avatar: googleAvatar || null,
        avatar_url: googleAvatar || null,
        avatar_public_id: null,
      }));
      if (user) {
        dispatch(
          setCredentials({
            access_token: token,
            user: { ...user, avatar: googleAvatar || null },
          })
        );
      }
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error(err?.data?.detail || 'Delete failed. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {open && draft && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile"
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative flex max-h-[92dvh] w-full flex-col rounded-t-card bg-paper-raised shadow-popover sm:max-w-xl sm:rounded-card"
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 px-6 pt-6">
              <ProfileAvatarPicker
                avatarUrl={avatarUrl}
                initials={initials}
                size="md"
                loading={uploading || deleting}
                onUpload={handleUploadAvatar}
                onDelete={handleDeleteAvatar}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-medium leading-tight">Edit Profile</h3>
                <p className="mt-0.5 text-sm text-ink-soft">Used to pre-fill job applications.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-ink-soft transition hover:rotate-90 hover:bg-paper-sunken hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Section switcher */}
            <div className="px-6 pt-5">
              <div className="flex rounded-control bg-paper-sunken p-1">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goTo(id)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-1.5 text-[13px] font-medium transition-colors',
                      section === id ? 'text-ink' : 'text-ink-soft hover:text-ink'
                    )}
                  >
                    {section === id && (
                      <motion.span
                        layoutId="profile-section-pill"
                        className="absolute inset-0 rounded-[8px] bg-paper-raised shadow-card"
                        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      />
                    )}
                    <Icon className="relative size-3.5" />
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="relative min-h-[300px] overflow-y-auto overflow-x-hidden px-6 py-5">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={section}
                  custom={direction}
                  variants={sectionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <motion.div variants={stagger} initial="enter" animate="center" className="grid gap-4 sm:grid-cols-2">
                    {section === 'contact' && (
                      <>
                        <motion.div variants={item}>
                          <IconInput label="First Name" icon={UserRound} value={draft.first_name} onChange={set('first_name')} placeholder="Jane" autoFocus />
                        </motion.div>
                        <motion.div variants={item}>
                          <IconInput label="Last Name" icon={UserRound} value={draft.last_name} onChange={set('last_name')} placeholder="Doe" />
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2">
                          <IconInput label="Email" type="email" icon={Mail} value={draft.email} onChange={set('email')} placeholder="you@example.com" />
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2">
                          <PhoneField value={draft.phone} onChange={(phone) => setDraft((d) => ({ ...d, phone }))} />
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2">
                          <IconInput label="City" icon={Building2} value={draft.city} onChange={set('city')} placeholder="Austin" />
                        </motion.div>
                        <motion.div variants={item}>
                          <IconInput label="State" icon={MapPin} value={draft.state} onChange={set('state')} placeholder="Texas" />
                        </motion.div>
                        <motion.div variants={item}>
                          <IconInput label="ZIP Code" icon={Navigation} value={draft.zip_code} onChange={set('zip_code')} placeholder="73301" />
                        </motion.div>
                      </>
                    )}

                    {section === 'links' && (
                      <>
                        <motion.div variants={item} className="sm:col-span-2">
                          <IconInput label="LinkedIn" type="url" icon={LinkedinIcon} value={draft.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/…" />
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2">
                          <IconInput label="GitHub" type="url" icon={GithubIcon} value={draft.github_url} onChange={set('github_url')} placeholder="https://github.com/…" />
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2">
                          <IconInput label="Portfolio" type="url" icon={Globe} value={draft.portfolio_url} onChange={set('portfolio_url')} placeholder="https://…" />
                        </motion.div>
                      </>
                    )}

                    {section === 'eligibility' && (
                      <>
                        <motion.div variants={item}>
                          <IconInput label="Years of Experience" type="number" min="0" max="50" icon={Hash} value={draft.years_of_experience} onChange={set('years_of_experience')} />
                        </motion.div>
                        <motion.div variants={item}>
                          <IconSelect label="Work Authorization" icon={Briefcase} value={draft.work_authorization} onChange={set('work_authorization')}>
                            {WORK_AUTH_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </IconSelect>
                        </motion.div>
                        <motion.div variants={item} className="sm:col-span-2 rounded-control border border-line p-4">
                          <div className="flex gap-3">
                            <Plane className="mt-0.5 size-4 shrink-0 text-signal" />
                            <div className="flex-1">
                              <Toggle
                                checked={draft.willing_to_relocate}
                                onChange={(v) => setDraft((d) => ({ ...d, willing_to_relocate: v }))}
                                label="Willing to Relocate"
                                description="For hybrid or on-site roles."
                              />
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} loading={saving}>
                Save Changes
              </Button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
