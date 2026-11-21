import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
  LayoutDashboard,
  ChevronDown,
  Settings,
  LogOut,
  Headset,
} from 'lucide-react';
import { Logo } from '../../components/ui/Misc';
import { useTheme } from '../../hooks/useTheme';
import { useGetProfileQuery } from '../settings/settingsApi';
import { useLogoutMutation } from '../auth/authApi';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const profileDropdownRef = useRef(null);

  const { dark, toggle } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const shouldReduceMotion = useReducedMotion();
  const [logout] = useLogoutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const onSupport = location.pathname === '/support';

  // Safely fetch profile only when user is authenticated
  const { data: profile } = useGetProfileQuery(undefined, { skip: !user });

  const displayName = [
    profile?.first_name,
    profile?.last_name,
  ].filter(Boolean).join(' ') || profile?.name || profile?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  const avatarUrl = profile?.avatar || profile?.avatar_url || user?.avatar || null;

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#product-preview' },
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Platform Trust', href: '#trust' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${href}`);
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 pointer-events-none">
      <div className="max-w-6xl xl:max-w-7xl mx-auto pointer-events-auto">
        {/* Floating Pill Container */}
        <div
          className={`flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
              : 'bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/70 dark:border-stone-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)]'
          }`}
        >
          {/* Brand Logo & Wordmark + AI Tag */}
          <div className="flex shrink-0 items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-signal transition-opacity hover:opacity-95"
              aria-label="Apply2Hire Home"
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
                }
              }}
            >
              <Logo className="h-7 sm:h-8" />
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-[#eef4f0] text-[#104e43] border border-[#d3e2d6] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex flex-1 items-center justify-center gap-6 2xl:gap-8" aria-label="Public Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="whitespace-nowrap text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex shrink-0 items-center gap-2.5">
            <Link
              to="/support"
              aria-label="Contact support"
              title="Contact support"
              aria-current={onSupport ? 'page' : undefined}
              className={`grid size-8 place-items-center rounded-full border transition ${
                onSupport
                  ? 'border-[#104e43]/30 bg-[#eef4f0] text-[#104e43] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-950'
              }`}
            >
              <Headset className="size-4" />
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
              className="grid size-8 place-items-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-950"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#104e43] hover:bg-[#0c3d34] px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow transition-all"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-5 w-px bg-stone-300 dark:bg-stone-700 mx-0.5" />

                {/* Profile Pill with Avatar & Name matching resume2hire.ai */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/80 pl-1 pr-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-all shadow-xs focus-visible:outline-2 focus-visible:outline-[#104e43]"
                  >
                    {avatarUrl && !imgError ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="size-7 rounded-full border border-stone-200 dark:border-stone-600 object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="grid size-7 place-items-center rounded-full bg-[#104e43] text-[11px] font-bold text-white">
                        {displayName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                    <span className="max-w-[110px] truncate">{displayName}</span>
                    <ChevronDown
                      className={`size-3.5 text-stone-500 transition-transform duration-150 ${
                        profileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.96 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xl py-1.5 z-50 text-left"
                      >
                        <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                        >
                          <LayoutDashboard className="size-3.5 text-stone-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                        >
                          <Settings className="size-3.5 text-stone-500" />
                          <span>Settings</span>
                        </Link>
                        <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <LogOut className="size-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full border border-stone-300/80 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white hover:border-stone-400 dark:hover:border-stone-600 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#104e43]"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#104e43] hover:bg-[#0c3d34] px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:shadow transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#104e43]"
                >
                  <span>Start Applying</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}

            {/* Section links live in the menu until there is room for them inline */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden grid size-8 place-items-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 transition hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>

          {/* Mobile Toggle Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/support"
              aria-label="Contact support"
              className="grid size-8 place-items-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Headset className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid size-8 place-items-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 transition hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-8 place-items-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 transition hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Pill Card */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2.5 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-xl px-5 py-4"
            >
              <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Headset className="size-4 text-stone-500" />
                  <span>Contact Support</span>
                </Link>
                <div className="md:hidden pt-3 mt-1 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2.5">
                  {user ? (
                    <>
                      {/* Mobile Profile Card */}
                      <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 mb-1">
                        {avatarUrl && !imgError ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            className="size-9 rounded-full border border-stone-200 dark:border-stone-700 object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <span className="grid size-9 place-items-center rounded-full bg-[#104e43] text-sm font-bold text-white">
                            {displayName?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                        </div>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#104e43] py-2.5 text-center text-sm font-medium text-white shadow-sm"
                      >
                        <LayoutDashboard className="size-4" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-stone-700 py-2.5 text-center text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      >
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 py-2 text-center text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="size-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center py-2.5 rounded-full border border-stone-300/80 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/60 text-center text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-2 focus-visible:outline-[#104e43]"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#104e43] py-2.5 text-center text-sm font-medium text-white shadow-sm focus-visible:outline-2 focus-visible:outline-[#104e43]"
                      >
                        <span>Start Applying</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
