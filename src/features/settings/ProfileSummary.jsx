import { motion } from 'framer-motion';
import { Briefcase, Globe, Hash, Mail, MapPin, PencilLine, Phone, Plane } from 'lucide-react';
import { FlagImage, guessCountryByPartialPhoneNumber } from 'react-international-phone';

import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/cn';
import { GithubIcon, LinkedinIcon } from './ProfileEditModal';

const COMPLETENESS_FIELDS = [
  'first_name', 'last_name', 'email', 'phone', 'city', 'state', 'zip_code',
  'linkedin_url', 'github_url', 'portfolio_url', 'years_of_experience', 'work_authorization',
];

const container = { show: { transition: { staggerChildren: 0.035 } } };
const tile = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } },
};

function stripProtocol(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function InfoTile({ icon: Icon, label, children, empty, className }) {
  return (
    <motion.div
      variants={tile}
      className={cn('flex items-start gap-3 rounded-control border border-line p-3.5 transition-colors hover:bg-paper-sunken/60', className)}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-signal-soft text-signal-deep">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
        <div className={cn('mt-0.5 truncate text-sm', empty ? 'italic text-ink-soft/70' : 'font-medium text-ink')}>
          {empty ? 'Not set' : children}
        </div>
      </div>
    </motion.div>
  );
}

function PhoneValue({ phone }) {
  const { country } = guessCountryByPartialPhoneNumber({ phone });
  return (
    <span className="inline-flex items-center gap-1.5">
      {country && <FlagImage iso2={country.iso2} size="18px" />}
      <span className="truncate">{phone}</span>
    </span>
  );
}

function LinkValue({ url }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="hover:text-signal hover:underline">
      {stripProtocol(url)}
    </a>
  );
}

export default function ProfileSummary({ profile, onEdit }) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '?';
  const location = [profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ');
  const filled = COMPLETENESS_FIELDS.filter((k) => String(profile[k] ?? '').trim()).length;
  const completeness = Math.round((filled / COMPLETENESS_FIELDS.length) * 100);

  return (
    <Card className="overflow-hidden">
      {/* Identity header */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="grid size-16 shrink-0 place-items-center rounded-full bg-signal text-xl font-semibold text-white shadow-card"
        >
          {initials}
        </motion.div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-xl font-medium tracking-tight">
            {fullName || 'Your name'}
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Pre-filled into application forms during automated submissions.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-sunken">
              <motion.div
                className="h-full rounded-full bg-signal"
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="text-xs font-medium text-ink-soft">{completeness}% complete</span>
          </div>
        </div>

        <Button icon={PencilLine} onClick={onEdit} className="self-start sm:self-center">
          Edit Profile
        </Button>
      </div>

      {/* Details */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 border-t border-line p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3"
      >
        <InfoTile icon={Mail} label="Email" empty={!profile.email}>{profile.email}</InfoTile>
        <InfoTile icon={Phone} label="Phone" empty={!profile.phone}>
          <PhoneValue phone={profile.phone} />
        </InfoTile>
        <InfoTile icon={MapPin} label="Location" empty={!location}>{location}</InfoTile>
        <InfoTile icon={LinkedinIcon} label="LinkedIn" empty={!profile.linkedin_url}>
          <LinkValue url={profile.linkedin_url} />
        </InfoTile>
        <InfoTile icon={GithubIcon} label="GitHub" empty={!profile.github_url}>
          <LinkValue url={profile.github_url} />
        </InfoTile>
        <InfoTile icon={Globe} label="Portfolio" empty={!profile.portfolio_url}>
          <LinkValue url={profile.portfolio_url} />
        </InfoTile>
        <InfoTile icon={Hash} label="Experience" empty={!profile.years_of_experience}>
          {profile.years_of_experience} {Number(profile.years_of_experience) === 1 ? 'year' : 'years'}
        </InfoTile>
        <InfoTile icon={Briefcase} label="Work Authorization" empty={!profile.work_authorization}>
          {profile.work_authorization}
        </InfoTile>
        <InfoTile icon={Plane} label="Relocation">
          {profile.willing_to_relocate ? 'Open to relocate' : 'Not relocating'}
        </InfoTile>
      </motion.div>
    </Card>
  );
}
