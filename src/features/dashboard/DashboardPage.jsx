import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2, FileText, Send, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { timeAgo } from '../../lib/format';
import { useGetStatsQuery } from '../settings/settingsApi';
import { useGetApplicationsQuery } from '../applications/applicationsApi';
import { STATUS_META } from '../applications/statusMeta';
import DirectMatchModal from '../jobs/DirectMatchModal';

function Stat({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="group">
      <Card className="p-5 transition group-hover:shadow-raised">
        <div className="flex items-center justify-between text-ink-soft">
          <Icon className="size-[18px]" />
          <ArrowRight className="size-4 opacity-0 transition group-hover:opacity-100" />
        </div>
        <p className="mt-4 font-serif text-4xl font-medium tabular-nums">{value ?? '–'}</p>
        <p className="mt-1 text-sm text-ink-soft">{label}</p>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: apps } = useGetApplicationsQuery();
  const [directMatchOpen, setDirectMatchOpen] = useState(false);

  const recent = (apps ?? []).slice(0, 5);
  const first = user?.name?.split(' ')[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${first}`}
        description="Here's where your job search and candidate pipeline stands."
        action={
          <Button
            variant="secondary"
            icon={Sparkles}
            onClick={() => setDirectMatchOpen(true)}
          >
            Match External JD
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={Briefcase} label="Jobs found" value={stats?.jobs} to="/boards/dice" />
          <Stat icon={FileText} label="Resumes" value={stats?.resumes} to="/resumes" />
          <Stat icon={Send} label="Ready or in review" value={(stats?.applications?.READY ?? 0) + (stats?.applications?.REVIEW ?? 0)} to="/applications" />
          <Stat icon={CheckCircle2} label="Applied" value={stats?.applications?.APPLIED ?? 0} to="/applications" />
        </div>
      )}

      {stats && (!stats.resumes || !stats.connected_boards) && (
        <Card className="border-signal/30 bg-signal-soft/40">
          <CardBody className="space-y-2">
            <h2 className="font-serif text-lg font-medium">Get set up</h2>
            <ol className="space-y-1.5 text-sm text-ink-soft">
              {!stats.resumes && <li><Link to="/resumes" className="font-medium text-signal underline">Upload a resume</Link> so we can match you to jobs.</li>}
              {!stats.connected_boards && <li><Link to="/boards/dice" className="font-medium text-signal underline">Connect Dice</Link> to search and apply.</li>}
            </ol>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Recent applications" action={<Link to="/applications" className="text-sm font-medium text-signal hover:underline">View all</Link>} />
        <CardBody>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{a.job_title}</p><p className="truncate text-xs text-ink-soft">{a.company} · {timeAgo(a.created_at)}</p></div>
                  <Badge tone={STATUS_META[a.status]?.tone} dot>{STATUS_META[a.status]?.label}</Badge>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Send} title="No applications yet" description="Search a job board and apply in one click." />}
        </CardBody>
      </Card>

      <DirectMatchModal open={directMatchOpen} onClose={() => setDirectMatchOpen(false)} />
    </div>
  );
}
