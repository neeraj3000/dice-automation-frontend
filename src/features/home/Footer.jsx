import { Link } from 'react-router-dom';
import { Logo } from '../../components/ui/Misc';
import { Settings, HelpCircle, Building2, Globe, Mail, MapPin, ArrowUp } from 'lucide-react';

function LinkedinIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-stone-200/80 dark:border-stone-800 bg-[#f7f5f0]/80 dark:bg-[#0a0e0f] text-stone-600 dark:text-stone-400 pt-16 pb-12 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 5-Column Grid matching Resume2Hire */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-stone-200/80 dark:border-stone-800">
          {/* Brand Column (spans 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" aria-label="Apply2Hire Home" className="inline-flex items-center">
              <Logo className="h-8" />
            </Link>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm">
              An autonomous, multi-agent platform orchestrated to run job discovery, optimize specialized resumes, and dispatch verified browser submissions.
            </p>
            <p className="text-xs italic text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm">
              Our mission is to level the hiring field by making authentic application automation accessible to every candidate.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              <Settings className="size-3.5" />
              <span>PRODUCT</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/resumes" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  AI Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Multi-Board Aggregator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Review Queue Gate
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Application Dispatcher
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Host-Local Session Sync
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              <HelpCircle className="size-3.5" />
              <span>RESOURCES</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              <Building2 className="size-3.5" />
              <span>CONTACT</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@apply2hire.ai"
                  className="flex items-center gap-2 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <Mail className="size-4 text-stone-500" />
                  <span>support@apply2hire.ai</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                <MapPin className="size-4 text-stone-500 flex-shrink-0" />
                <span>Frisco, Texas, United States</span>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              <Globe className="size-3.5" />
              <span>SOCIALS</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <LinkedinIcon className="size-4 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching Resume2Hire */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="w-full flex-1 flex flex-wrap items-center justify-center sm:justify-center gap-x-2.5 sm:gap-x-3.5 gap-y-2 text-center">
            <span>Copyright © 2026. All Rights Reserved.</span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <Link to="/login" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <Link to="/login" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span>Version 1.0.4</span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span>
              Made with <span className="text-red-500">❤️</span> by Team Apply2Hire
            </span>
          </div>

          {/* Floating Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex-shrink-0 size-9 sm:size-10 rounded-full bg-[#104e43] text-[#61ebd7] hover:bg-[#0c3c34] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <ArrowUp className="size-4 sm:size-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
