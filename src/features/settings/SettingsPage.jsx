import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { PageHeader, Skeleton, Toggle } from '../../components/ui/Misc';
import { errorMessage } from '../../lib/format';
import { useGetSettingsQuery, useUpdateSettingsMutation } from './settingsApi';

const TEXT = [
  ['first_name', 'First name'], ['last_name', 'Last name'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'],
  ['city', 'City'], ['state', 'State'], ['zip_code', 'ZIP code'], ['linkedin', 'LinkedIn URL', 'url'],
  ['github', 'GitHub URL', 'url'], ['portfolio', 'Portfolio URL', 'url'],
];

export default function SettingsPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [update, { isLoading: saving }] = useUpdateSettingsMutation();
  const [profile, setProfile] = useState(null);
  const [headless, setHeadless] = useState(true);

  useEffect(() => { if (data) { setProfile(data.profile); setHeadless(data.headless); } }, [data]);
  if (isLoading || !profile) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>;

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    try {
      await update({ profile: { ...profile, years_experience: profile.years_experience === '' ? null : Number(profile.years_experience) }, headless }).unwrap();
      toast.success('Settings saved');
    } catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="Settings" description="What we use to fill in applications for you." action={<Button type="submit" loading={saving}>Save changes</Button>} />

      <Card>
        <CardHeader title="Browser automation" description="Choose how applications run on your computer." />
        <CardBody className="space-y-4">
          <Toggle checked={!headless} onChange={(v) => setHeadless(!v)} label="Show the browser while applying"
            description={headless ? 'Off: applications run quietly in the background.' : 'On: you can watch each step, and solve any human check if one appears.'} />
          <p className="flex items-center gap-2 text-sm text-ink-soft">{headless ? <EyeOff className="size-4" /> : <Eye className="size-4" />}Either way, we use the same browser profile you signed in with.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact details" description="Used to fill in forms. Leave anything blank to skip it." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          {TEXT.map(([k, label, type]) => <Input key={k} label={label} type={type ?? 'text'} value={profile[k] ?? ''} onChange={(e) => set(k, e.target.value)} />)}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Screening answers" description="We answer common employer questions with these." />
        <CardBody className="space-y-5">
          <Input label="Total years of experience" type="number" min="0" max="60" value={profile.years_experience ?? ''} onChange={(e) => set('years_experience', e.target.value)} className="sm:max-w-40" />
          <Toggle checked={profile.authorized_to_work} onChange={(v) => set('authorized_to_work', v)} label="Authorized to work in the country" />
          <Toggle checked={profile.requires_sponsorship} onChange={(v) => set('requires_sponsorship', v)} label="Will require visa sponsorship" />
          <Toggle checked={profile.willing_to_relocate} onChange={(v) => set('willing_to_relocate', v)} label="Willing to relocate" />
        </CardBody>
      </Card>
    </form>
  );
}
