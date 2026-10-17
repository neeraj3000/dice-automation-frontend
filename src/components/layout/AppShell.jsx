import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Bot,
} from 'lucide-react';
import { closeSidebar, toggleSidebar, toggleDesktopSidebar } from '../../app/uiSlice';
import { useTheme } from '../../hooks/useTheme';
import { useLogoutMutation } from '../../features/auth/authApi';
import { BOARD_REGISTRY } from '../../features/boards/boardRegistry';
import { useApplicationWatcher } from '../../features/applications/useApplicationWatcher';
import { useAutomationWatcher } from '../../features/automations/useAutomationWatcher';
import { formatClock, useCountdown } from '../../features/automations/runMeta';
import { useGetApplicationsQuery } from '../../features/applications/applicationsApi';
import { useGetReviewQueueQuery } from '../../features/review/reviewQueueApi';
import { useGetResumesQuery } from '../../features/resumes/resumesApi';
import { useGetProfileQuery } from '../../features/settings/settingsApi';
import { useDice } from '../../context/DiceContext';
import { Logo, Spinner } from '../ui/Misc';
import { cn } from '../../lib/cn';

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resumes', label: 'Resume Library', icon: FileText, badgeKey: 'resumes' },
  { to: '/search-profiles', label: 'Search Profiles', icon: SlidersHorizontal },
  { to: '/automations', label: 'Automations', icon: Bot, badgeKey: 'automation' },
  { to: '/jobs', label: 'Jobs Explorer', icon: Compass },
  { to: '/applications', label: 'Applications', icon: ListChecks, badgeKey: 'apps' },
  { to: '/review', label: 'Review Queue', icon: HelpCircle, badgeKey: 'review' },
];

const linkCls = ({ isActive }) =>
  cn(
    'group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150 ease-out select-none',
    isActive
      ? 'bg-signal-soft/90 text-signal-deep font-semibold shadow-xs border border-signal/20'
      : 'text-ink-soft hover:bg-paper-sunken/80 hover:text-ink border border-transparent'
  );

const collapsedLinkCls = ({ isActive }) =>
  cn(
    'group relative flex size-10 mx-auto items-center justify-center rounded-xl transition-all duration-150 ease-out',
    isActive
      ? 'bg-signal-soft/90 text-signal-deep font-semibold shadow-xs border border-signal/20'
      : 'text-ink-soft hover:bg-paper-sunken/80 hover:text-ink border border-transparent'
  );

function SidebarContent({ active, automationActive, reviewCount, resumeCount, isMobile = false, collapsed = false }) {
  const dispatch = useDispatch();
  const close = () => dispatch(closeSidebar());

  return (
    <div className="flex h-full flex-col">
      {/* Top Header: Full Brand or Icon Logo */}
      {collapsed ? (
        <div className="flex h-16 items-center justify-center border-b border-line px-2">
          <Link to="/" title="Apply2Hire Home" aria-label="Apply2Hire Home" className="flex items-center justify-center">
            <Logo variant="icon" className="h-7" />
          </Link>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-between px-4 border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link to="/" title="Apply2Hire Home" aria-label="Apply2Hire Home" className="flex items-center focus:outline-hidden">
              <Logo className="h-6" />
            </Link>
            <span className="rounded-md bg-signal-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-signal-deep shrink-0 border border-signal/15">
              PRO
            </span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(isMobile ? closeSidebar() : toggleDesktopSidebar())}
            title={isMobile ? 'Close menu' : 'Collapse sidebar'}
            aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
            className="size-8 flex items-center justify-center rounded-lg text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      )}

      {/* When collapsed on desktop, expand button right at top of rail */}
      {collapsed && (
        <div className="px-2 pt-2.5 pb-1">
          <button
            type="button"
            onClick={() => dispatch(toggleDesktopSidebar())}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="flex size-10 mx-auto items-center justify-center rounded-xl text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors border border-transparent hover:border-line"
          >
            <PanelLeftOpen className="size-[18px]" />
          </button>
          <div className="my-2 mx-auto w-8 h-px bg-line/60" />
        </div>
      )}

      {/* Navigation Links */}
      <nav
        className={cn(
          'flex-1 flex flex-col justify-between overflow-y-auto',
          collapsed ? 'px-2 py-3' : 'px-3.5 py-4'
        )}
        aria-label="Main"
      >
        <div className="space-y-1.5">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              title={collapsed ? label : undefined}
              className={collapsed ? collapsedLinkCls : linkCls}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-[18px] shrink-0 transition-colors',
                      isActive ? 'text-signal-deep' : 'text-ink-soft/80 group-hover:text-ink'
                    )}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}

                  {/* Badges - expanded mode */}
                  {!collapsed && badgeKey === 'resumes' && resumeCount > 0 && (
                    <span
                      className={cn(
                        'ml-auto inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums border transition-colors',
                        isActive
                          ? 'bg-signal/15 text-signal-deep border-signal/25'
                          : 'bg-paper-sunken/90 text-ink-soft border-line/70 group-hover:border-line'
                      )}
                    >
                      {resumeCount} {resumeCount === 1 ? 'file' : 'files'}
                    </span>
                  )}

                  {!collapsed && badgeKey === 'apps' && active && (
                    <span className="ml-auto relative flex size-2 items-center justify-center" title="Application running">
                      <span className="absolute size-2 rounded-full bg-signal animate-ping opacity-75" />
                      <span className="relative size-2 rounded-full bg-signal" />
                    </span>
                  )}

                  {!collapsed && badgeKey === 'automation' && automationActive && (
                    <span className="ml-auto relative flex size-2 items-center justify-center" title="Automation running">
                      <span className="absolute size-2 rounded-full bg-signal animate-ping opacity-75" />
                      <span className="relative size-2 rounded-full bg-signal" />
                    </span>
                  )}

                  {!collapsed && badgeKey === 'review' && reviewCount > 0 && (
                    <span
                      className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold text-amber tabular-nums border border-amber/30 animate-pulse shadow-xs"
                      title={`${reviewCount} screener questions waiting for review`}
                    >
                      {reviewCount}
                    </span>
                  )}

                  {/* Badges - collapsed mode */}
                  {collapsed && badgeKey === 'resumes' && resumeCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-signal ring-2 ring-paper" title={`${resumeCount} files`} />
                  )}
                  {collapsed && badgeKey === 'apps' && active && (
                    <span className="absolute top-1.5 right-1.5 size-2 animate-pulse rounded-full bg-signal ring-2 ring-paper" />
                  )}
                  {collapsed && badgeKey === 'automation' && automationActive && (
                    <span className="absolute top-1.5 right-1.5 size-2 animate-pulse rounded-full bg-signal ring-2 ring-paper" />
                  )}
                  {collapsed && badgeKey === 'review' && reviewCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber px-1 text-[9px] font-bold text-white shadow-xs"
                      title={`${reviewCount} screener questions`}
                    >
                      {reviewCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom Section: Settings */}
        <div className="pt-3 mt-auto border-t border-line/60">
          <NavLink
            to="/settings"
            onClick={close}
            title={collapsed ? 'Settings' : undefined}
            className={collapsed ? collapsedLinkCls : linkCls}
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={cn(
                    'size-[18px] shrink-0 transition-transform duration-300 group-hover:rotate-45',
                    isActive ? 'text-signal-deep' : 'text-ink-soft/80 group-hover:text-ink'
                  )}
                />
                {!collapsed && <span className="truncate">Settings</span>}
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', desc: 'Job search, automation metrics, and application activity.' },
  '/': { title: 'Dashboard', desc: 'Job search, automation metrics, and application activity.' },
  '/resumes': { title: 'Resume Library', desc: 'Manage candidate resumes and ATS skill extractions.' },
  '/search-profiles': { title: 'Search Profiles', desc: 'Saved searches you can run any time.' },
  '/automations': { title: 'Automations', desc: 'Timed runs that search and apply for you, even with this tab closed.' },
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
  const { run: automationRun, receivedAt: automationReceivedAt } = useAutomationWatcher();
  const automationLeft = useCountdown(automationRun?.remaining_seconds || 0, automationReceivedAt, Boolean(automationRun?.paused));
  const { diceStatus } = useDice();

  const { data: apps = [] } = useGetApplicationsQuery();
  const { data: reviewItems = [] } = useGetReviewQueueQuery();
  const { data: resumes = [] } = useGetResumesQuery();
  const { data: profile } = useGetProfileQuery();

  // Prefer profile first_name + last_name; fall back to auth user name
  const displayName = [
    profile?.first_name,
    profile?.last_name,
  ].filter(Boolean).join(' ') || user?.name || 'User';

  // Use custom uploaded avatar first, then Google avatar from auth
  const navAvatarUrl = profile?.avatar || profile?.avatar_url || user?.avatar || null;
  const [navImgError, setNavImgError] = useState(false);
  useEffect(() => {
    setNavImgError(false);
  }, [navAvatarUrl]);

  const reviewCount = reviewItems.length || apps.filter((a) => a.status === 'REVIEW').length;
  const resumeCount = Array.isArray(resumes) ? resumes.length : 0;

  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: location.pathname.startsWith('/boards/') ? 'Job Board Automation' : 'Apply2Hire Automation',
    desc: 'Automated matching & protected Playwright submission',
  };

  return (
    <div className={cn('min-h-dvh transition-[padding] duration-200 ease-in-out', desktopOpen ? 'lg:pl-64' : 'lg:pl-16')}>
      {/* Desktop Persistent / Collapsible Sidebar (rail when collapsed) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-paper lg:block transition-[width] duration-200 ease-in-out overflow-hidden',
          desktopOpen ? 'w-64' : 'w-16'
        )}
      >
        <SidebarContent
          active={active}
          automationActive={Boolean(automationRun)}
          reviewCount={reviewCount}
          resumeCount={resumeCount}
          collapsed={!desktopOpen}
          isMobile={false}
        />
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
              <SidebarContent
                active={active}
                automationActive={Boolean(automationRun)}
                reviewCount={reviewCount}
                resumeCount={resumeCount}
                collapsed={false}
                isMobile={true}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            className="flex size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-paper-sunken hover:text-ink lg:hidden transition-colors"
            aria-label="Open menu"
            onClick={() => dispatch(toggleSidebar())}
          >
            <Menu className="size-5" />
          </button>

          <div>
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">{currentMeta.title}</h1>
            <p className="hidden text-xs text-ink-soft md:block">{currentMeta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Running automation: countdown, visible from every page */}
          {automationRun && (
            <button
              type="button"
              onClick={() => navigate('/automations')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                automationRun.paused
                  ? 'border-amber/30 bg-amber-soft text-amber hover:bg-amber-soft/80'
                  : 'border-signal/30 bg-signal-soft text-signal-deep hover:bg-signal-soft/80'
              )}
              title={`${automationRun.automation_name} is ${automationRun.paused ? 'paused' : 'running'}`}
            >
              {automationRun.paused ? (
                <span className="size-2 rounded-full bg-amber" />
              ) : (
                <span className="relative flex size-2">
                  <span className="absolute size-2 animate-ping rounded-full bg-signal opacity-75" />
                  <span className="relative size-2 rounded-full bg-signal" />
                </span>
              )}
              <span className="hidden sm:inline">{automationRun.paused ? 'Paused' : 'Automation'}</span>
              <span className="font-mono tabular-nums">{formatClock(automationLeft)}</span>
            </button>
          )}

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
            className="size-8 flex items-center justify-center rounded-lg text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="mx-1 hidden text-right sm:block">
            <p className="text-[13px] font-medium leading-tight text-ink">{displayName}</p>
            <p className="text-xs leading-tight text-ink-soft">{user?.email}</p>
          </div>

          {navAvatarUrl && !navImgError ? (
            <img
              src={navAvatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="size-8 rounded-full border border-line object-cover shadow-xs"
              onError={() => setNavImgError(true)}
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-signal-soft text-xs font-bold text-signal-deep border border-signal/20 shadow-xs">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </span>
          )}

          <button
            onClick={() => logout()}
            disabled={isLoading}
            aria-label="Sign out"
            title="Sign out"
            className="size-8 flex items-center justify-center rounded-lg text-ink-soft hover:bg-paper-sunken hover:text-ink transition-colors"
          >
            <LogOut className="size-4" />
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
