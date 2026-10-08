import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  HelpCircle,
  Play,
  Send,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EmptyState, PageHeader, Skeleton } from '../../components/ui/Misc';
import { timeAgo } from '../../lib/format';
import { useGetStatsQuery } from '../settings/settingsApi';
import { useGetApplicationsQuery } from '../applications/applicationsApi';
import { useDice } from '../../context/DiceContext';
import { STATUS_META } from '../applications/statusMeta';
import DirectMatchModal from '../jobs/DirectMatchModal';

function StatCard({ icon: Icon, label, value, to, badge, iconColor = 'text-signal' }) {
  return (
    <Link to={to} className="group">
      <Card className="p-5 transition-all duration-200 group-hover:shadow-raised group-hover:border-signal/40 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between text-ink-soft">
          <div className="grid size-10 place-items-center rounded-xl bg-signal-soft/80 text-signal transition group-hover:bg-signal group-hover:text-white">
            <Icon className="size-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="rounded-full bg-paper-sunken border border-line px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                {badge}
              </span>
            )}
            <ArrowRight className="size-4 text-signal opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>
        </div>
        <div>
          <p className="mt-4 font-serif text-3xl sm:text-4xl font-bold tabular-nums text-ink">{value ?? '0'}</p>
          <p className="mt-1 text-xs sm:text-sm font-medium text-ink-soft">{label}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { data: stats, isLoading } = useGetStatsQuery();
  const { data: apps = [] } = useGetApplicationsQuery();
  const { diceStatus } = useDice();
  const [directMatchOpen, setDirectMatchOpen] = useState(false);

  const recent = apps.slice(0, 6);
  const first = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-signal-deep via-[#12382e] to-[#0a231a] p-6 text-white shadow-raised sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white border border-white/20">
              <Zap className="size-3.5 text-signal" />
              Dice Application Engine
            </span>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-semibold text-white/90 border border-white/20 transition cursor-pointer"
            >
              {diceStatus?.is_connected ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>Connected: {diceStatus.username || 'Active'}</span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Dice Sign-In Required</span>
                </>
              )}
            </button>
          </div>

          <h2 className="font-serif text-2xl font-medium sm:text-3xl tracking-tight text-white">
            Welcome back, {first}
          </h2>
          <p className="text-sm text-white/85 leading-relaxed max-w-xl">
            Playwright automation agent active. Automated resume matching, 1-click easy apply, and protected form submission on Dice.com.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-3">
            {/* Jobs Explorer Button - Distinct high-contrast bold styling */}
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="inline-flex h-9 items-center gap-2 rounded-control bg-white px-4 text-xs sm:text-sm font-bold text-signal-deep shadow-md hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
            >
              <Compass className="size-4 text-signal-deep shrink-0 stroke-[2.2]" />
              <span className="text-signal-deep font-semibold">Jobs Explorer</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/search-profiles')}
              className="inline-flex h-9 items-center gap-2 rounded-control bg-white/15 hover:bg-white/25 border border-white/25 px-3.5 text-xs sm:text-sm font-medium text-white transition-all cursor-pointer"
            >
              <SlidersHorizontal className="size-4 text-white shrink-0" />
              <span>Search Profiles</span>
            </button>
            <button
              type="button"
              onClick={() => setDirectMatchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-control bg-white/15 hover:bg-white/25 border border-white/25 px-3.5 text-xs sm:text-sm font-medium text-white transition-all cursor-pointer"
            >
              <Sparkles className="size-4 text-white shrink-0" />
              <span>Paste & Match JD</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Briefcase}
            label="Jobs Discovered"
            value={stats?.jobs_count ?? stats?.jobs ?? 0}
            to="/jobs"
            badge="Explorer"
          />
          <StatCard
            icon={FileText}
            label="Resume Library"
            value={stats?.resumes_count ?? stats?.resumes ?? 0}
            to="/resumes"
            badge="ATS Parsed"
          />
          <StatCard
            icon={HelpCircle}
            label="Ready & In Review"
            value={
              (stats?.apps_ready ?? 0) +
              (stats?.review_count ?? 0) +
              (stats?.applications?.READY ?? 0) +
              (stats?.applications?.REVIEW ?? 0)
            }
            to="/review"
            badge="Action Needed"
          />
          <StatCard
            icon={CheckCircle2}
            label="Applications Submitted"
            value={stats?.apps_applied ?? stats?.applications?.APPLIED ?? 0}
            to="/applications"
            badge="Applied"
          />
        </div>
      )}

      {/* Quick Setup Guide if disconnected or no resumes */}
      {(!diceStatus?.is_connected || (stats?.resumes_count === 0 && stats?.resumes === 0)) && (
        <Card className="border-signal/30 bg-signal-soft/30 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="font-serif text-base font-semibold text-ink">Quick Onboarding Steps</h3>
              <p className="text-xs text-ink-soft max-w-xl">
                Get your automated pipeline running: connect your session to sync live Dice cookies and upload candidate resumes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!diceStatus?.is_connected && (
                <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
                  Connect Dice Account
                </Button>
              )}
              {stats?.resumes === 0 && (
                <Button size="sm" icon={UploadCloud} onClick={() => navigate('/resumes')}>
                  Upload Resumes
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Applications Activity */}
      <Card>
        <CardHeader
          title="Recent Applications Activity"
          description="Real-time submission pipeline and status logs."
          action={
            <Link to="/applications" className="text-sm font-medium text-signal hover:underline">
              View all tracker
            </Link>
          }
        />
        <CardBody className="p-0">
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-paper-sunken/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.job_title}</p>
                    <p className="truncate text-xs text-ink-soft mt-0.5">
                      {a.company} · {a.resume_name ? `Resume: ${a.resume_name} · ` : ''}
                      {timeAgo(a.created_at || a.applied_at)}
                    </p>
                  </div>
                  <Badge tone={STATUS_META[a.status]?.tone} dot>
                    {STATUS_META[a.status]?.label || a.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Send}
                title="No applications tracked yet"
                description="Explore scraped listings and apply in 1 click."
                action={
                  <Button icon={Compass} onClick={() => navigate('/jobs')}>
                    Go to Jobs Explorer
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      <DirectMatchModal open={directMatchOpen} onClose={() => setDirectMatchOpen(false)} />
    </div>
  );
}
