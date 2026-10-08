import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, FileText, ListChecks, Settings, Menu, Moon, Sun, LogOut, Briefcase } from 'lucide-react';
import { closeSidebar, toggleSidebar } from '../../app/uiSlice';
import { useTheme } from '../../hooks/useTheme';
import { useLogoutMutation } from '../../features/auth/authApi';
import { BOARD_REGISTRY } from '../../features/boards/boardRegistry';
import { useApplicationWatcher } from '../../features/applications/useApplicationWatcher';
import { useGetApplicationsQuery } from '../../features/applications/applicationsApi';
import { Logo, Spinner } from '../ui/Misc';
import { cn } from '../../lib/cn';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/applications', label: 'Applications', icon: ListChecks },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const linkCls = ({ isActive }) =>
  cn('flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-signal-soft text-signal-deep' : 'text-ink-soft hover:bg-paper-sunken hover:text-ink');

function SidebarContent({ active, reviewCount }) {
  const dispatch = useDispatch();
  const close = () => dispatch(closeSidebar());
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5"><Logo /></div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4" aria-label="Main">
        <div className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={close} className={linkCls}>
              <Icon className="size-[18px]" />{label}
              {to === '/applications' && reviewCount > 0 && (
                <span
                  className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-soft px-1.5 py-0.5 text-[11px] font-semibold text-amber tabular-nums"
                  title={`${reviewCount} applications waiting for review`}
                >
                  {reviewCount}
                </span>
              )}
              {to === '/applications' && active && !reviewCount && (
                <span className="ml-auto size-2 animate-pulse rounded-full bg-amber" aria-label="Application running" />
              )}
            </NavLink>
          ))}
        </div>
        <div>
          <p className="px-3 pb-2 text-xs font-medium text-ink-soft">Job boards</p>
          <div className="space-y-1">
            {BOARD_REGISTRY.map((b) => b.enabled ? (
              <NavLink key={b.key} to={`/boards/${b.key}`} onClick={close} className={linkCls}><Briefcase className="size-[18px]" />{b.name}</NavLink>
            ) : (
              <div key={b.key} className="flex items-center gap-3 rounded-control px-3 py-2 text-sm text-ink-soft/50" aria-disabled>
                <Briefcase className="size-[18px]" />{b.name}<span className="ml-auto text-[11px]">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function AppShell() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const open = useSelector((s) => s.ui.sidebarOpen);
  const { dark, toggle } = useTheme();
  const [logout, { isLoading }] = useLogoutMutation();
  const { active } = useApplicationWatcher();
  const { data: apps } = useGetApplicationsQuery();

  const reviewCount = (apps ?? []).filter((a) => a.status === 'REVIEW').length;

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-paper lg:block">
        <SidebarContent active={active} reviewCount={reviewCount} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch(closeSidebar())} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-paper lg:hidden" initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: 'spring', damping: 32, stiffness: 340 }}>
              <SidebarContent active={active} reviewCount={reviewCount} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-8">
        <button className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken lg:hidden" aria-label="Open menu" onClick={() => dispatch(toggleSidebar())}><Menu className="size-5" /></button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-1.5">
          <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken">
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
          <div className="mx-1 hidden text-right sm:block">
            <p className="text-[13px] font-medium leading-tight">{user?.name}</p>
            <p className="text-xs leading-tight text-ink-soft">{user?.email}</p>
          </div>
          {user?.avatar ? <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" /> :
            <span className="grid size-8 place-items-center rounded-full bg-signal-soft text-sm font-semibold text-signal-deep">{user?.name?.[0]?.toUpperCase()}</span>}
          <button onClick={() => logout()} disabled={isLoading} aria-label="Sign out" className="rounded-lg p-2 text-ink-soft hover:bg-paper-sunken"><LogOut className="size-[18px]" /></button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <Suspense fallback={<div className="grid h-64 place-items-center"><Spinner /></div>}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
    </div>
  );
}
