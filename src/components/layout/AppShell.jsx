import { Suspense } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  SlidersHorizontal,
  Compass,
  ListChecks,
  HelpCircle,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { closeSidebar, toggleSidebar, toggleDesktopSidebar } from '../../app/uiSlice';
import { useTheme } from '../../hooks/useTheme';
import { useLogoutMutation } from '../../features/auth/authApi';
import { BOARD_REGISTRY } from '../../features/boards/boardRegistry';
import { useApplicationWatcher } from '../../features/applications/useApplicationWatcher';
import { useGetApplicationsQuery } from '../../features/applications/applicationsApi';
import { useGetReviewQueueQuery } from '../../features/review/reviewQueueApi';
import { useGetResumesQuery } from '../../features/resumes/resumesApi';
import { useDice } from '../../context/DiceContext';
import { Logo, Spinner } from '../ui/Misc';
import { cn } from '../../lib/cn';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resumes', label: 'Resume Library', icon: FileText, badgeKey: 'resumes' },
  { to: '/search-profiles', label: 'Search Profiles', icon: SlidersHorizontal },
  { to: '/jobs', label: 'Jobs Explorer', icon: Compass },
  { to: '/applications', label: 'Applications', icon: ListChecks, badgeKey: 'apps' },
  { to: '/review', label: 'Review Queue', icon: HelpCircle, badgeKey: 'review' },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const linkCls = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-signal-soft text-signal-deep font-semibold' : 'text-ink-soft hover:bg-paper-sunken hover:text-ink'
  );

function SidebarContent({ active, reviewCount, resumeCount }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const close = () => dispatch(closeSidebar());
  const { diceStatus } = useDice();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded-md bg-signal-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-signal-deep">
            PRO
          </span>
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleDesktopSidebar())}
          title="Collapse sidebar"
          className="hidden lg:grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Main">
        <div className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <NavLink key={to} to={to} end={end} onClick={close} className={linkCls}>
              <Icon className="size-[18px] shrink-0" />
              <span className="truncate">{label}</span>

              {badgeKey === 'resumes' && resumeCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-paper-sunken px-2 py-0.5 text-[11px] font-medium text-ink-soft tabular-nums border border-line">
                  ~{resumeCount} Files
                </span>
              )}

              {badgeKey === 'apps' && active && (
                <span className="ml-auto size-2 animate-pulse rounded-full bg-amber" aria-label="Application running" />
              )}

              {badgeKey === 'review' && reviewCount > 0 && (
                <span
                  className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold text-amber tabular-nums border border-amber/30 animate-pulse"
                  title={`${reviewCount} screener questions waiting for review`}
                >
                  {reviewCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft/70">Automation Boards</p>
          <div className="space-y-1">
            {BOARD_REGISTRY.map((b) =>
              b.enabled ? (
                <NavLink key={b.key} to={`/boards/${b.key}`} onClick={close} className={linkCls}>
                  <Briefcase className="size-[18px] shrink-0" />
                  <span className="truncate">{b.name}</span>
                  {b.key === 'dice' && diceStatus?.is_connected && (
                    <span className="ml-auto size-2 rounded-full bg-signal" title="Dice connected" />
                  )}
                </NavLink>
              ) : (
                <div key={b.key} className="flex items-center gap-3 rounded-control px-3 py-2 text-sm text-ink-soft/50" aria-disabled>
                  <Briefcase className="size-[18px] shrink-0" />
                  <span className="truncate">{b.name}</span>
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wider">Soon</span>
                </div>
              )
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

const PAGE_TITLES = {
  '/': { title: 'Dashboard', desc: 'Job search, automation metrics, and application activity.' },
  '/resumes': { title: 'Resume Library', desc: 'Manage candidate resumes and ATS skill extractions.' },
  '/search-profiles': { title: 'Search Profiles', desc: 'Automated matching & protected Playwright submission.' },
  '/jobs': { title: 'Jobs Explorer', desc: 'Scrape Dice jobs, analyze requirements, and evaluate resumes.' },
  '/applications': { title: 'Applications', desc: 'Track automated submissions and execution logs.' },
  '/review': { title: 'Review Queue', desc: 'Resolve unmapped screener questions to resume submissions.' },
  '/settings': { title: 'Settings', desc: 'Configure candidate profile, automation parameters, and Dice session.' },
};

export default function AppShell() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const open = useSelector((s) => s.ui.sidebarOpen);
  const desktopOpen = useSelector((s) => s.ui.desktopSidebarOpen);
  const { dark, toggle } = useTheme();
  const [logout, { isLoading }] = useLogoutMutation();
  const { active } = useApplicationWatcher();
  const { diceStatus } = useDice();

  const { data: apps = [] } = useGetApplicationsQuery();
  const { data: reviewItems = [] } = useGetReviewQueueQuery();
  const { data: resumes = [] } = useGetResumesQuery();

  const reviewCount = reviewItems.length || apps.filter((a) => a.status === 'REVIEW').length;
  const resumeCount = Array.isArray(resumes) ? resumes.length : 0;

  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: location.pathname.startsWith('/boards/') ? 'Job Board Automation' : 'Apply2Hire Automation',
    desc: 'Automated matching & protected Playwright submission',
  };

  return (
    <div className={cn('min-h-dvh transition-[padding] duration-200 ease-in-out', desktopOpen ? 'lg:pl-64' : 'lg:pl-0')}>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-paper lg:block transition-transform duration-200 ease-in-out w-64',
          desktopOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
      >
        <SidebarContent active={active} reviewCount={reviewCount} resumeCount={resumeCount} />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeSidebar())}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-paper lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            >
              <SidebarContent active={active} reviewCount={reviewCount} resumeCount={resumeCount} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken lg:hidden"
            aria-label="Open menu"
            onClick={() => dispatch(toggleSidebar())}
          >
            <Menu className="size-5" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            type="button"
            className="hidden rounded-lg p-2 text-ink-soft hover:bg-paper-sunken hover:text-ink lg:flex transition-colors"
            aria-label={desktopOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={desktopOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => dispatch(toggleDesktopSidebar())}
          >
            {desktopOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          </button>

          <div>
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">{currentMeta.title}</h1>
            <p className="hidden text-xs text-ink-soft md:block">{currentMeta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dice Connection Top Chip */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition border',
              diceStatus?.is_connected
                ? 'bg-signal-soft text-signal-deep border-signal/30 hover:bg-signal-soft/80'
                : 'bg-amber-soft text-amber border-amber/30 hover:bg-amber-soft/80'
            )}
            title={diceStatus?.is_connected ? `Connected: ${diceStatus.username || 'Dice'}` : 'Click to connect Dice'}
          >
            {diceStatus?.is_connected ? (
              <CheckCircle2 className="size-3.5 text-signal" />
            ) : (
              <AlertCircle className="size-3.5 text-amber" />
            )}
            <span>{diceStatus?.is_connected ? (diceStatus.username || 'Dice: Connected') : 'Dice: Sign In'}</span>
          </button>

          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken"
          >
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>

          <div className="mx-1 hidden text-right sm:block">
            <p className="text-[13px] font-medium leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs leading-tight text-ink-soft">{user?.email}</p>
          </div>

          {user?.avatar ? (
            <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full border border-line" />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-signal-soft text-sm font-semibold text-signal-deep">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}

          <button
            onClick={() => logout()}
            disabled={isLoading}
            aria-label="Sign out"
            className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <Suspense fallback={<div className="grid h-64 place-items-center"><Spinner /></div>}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
    </div>
  );
}
