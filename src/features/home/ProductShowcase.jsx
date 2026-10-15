import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  Compass,
  Zap,
  Check,
} from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('matches');
  const shouldReduceMotion = useReducedMotion();

  const SAMPLE_JOBS = [
    {
      id: 'job-1',
      title: 'Lead Full Stack & Cloud Architect',
      company: 'Datadog',
      location: 'Remote (US)',
      salary: '$190,000 – $225,000',
      matchScore: 96,
      skills: ['React', 'Node.js', 'Distributed Systems', 'AWS'],
      recommendedResume: 'FullStack_Architect_2026.pdf',
      status: 'Ready to Apply',
      board: 'Dice',
    },
    {
      id: 'job-2',
      title: 'Staff Python Backend Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA / Remote',
      salary: '$185,000 – $215,000',
      matchScore: 92,
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Kubernetes'],
      recommendedResume: 'Staff_Backend_Python.pdf',
      status: 'In Queue',
      board: 'Dice',
    },
    {
      id: 'job-3',
      title: 'Principal Systems Platform Engineer',
      company: 'Figma',
      location: 'Remote (US)',
      salary: '$200,000 – $240,000',
      matchScore: 89,
      skills: ['Go', 'Rust', 'Docker', 'Observability'],
      recommendedResume: 'Systems_Platform_Lead.pdf',
      status: 'Review Required',
      board: 'Dice',
    },
  ];

  return (
    <section id="product-preview" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-5">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>01 · WORKSPACE PREVIEW</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            Everything you need in{' '}
            <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
              One Workspace
              <WavyUnderline />
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            Analyze your fit, review missing skills, resolve tailored resumes, and preview live browser dispatch without leaving the application.
          </p>

          {/* Mode Switcher Pill Tabs */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-[#104e43] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Live Job Discovery <span className="ml-1 opacity-70 text-[11px] font-mono">1</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'inspector'
                  ? 'bg-[#104e43] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Automation Inspector <span className="ml-1 opacity-70 text-[11px] font-mono">2</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resumes')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'resumes'
                  ? 'bg-[#104e43] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Multi-Resume Resolver <span className="ml-1 opacity-70 text-[11px] font-mono">3</span>
            </button>
          </div>
        </div>

        {/* Visual Workspace Frame */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl overflow-hidden"
        >
          {/* Mock Browser/App Chrome Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-400/80" />
              <span className="size-3 rounded-full bg-amber-400/80" />
              <span className="size-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 font-mono text-xs text-stone-500 dark:text-stone-400 hidden sm:inline-block">
                app.apply2hire.com/dashboard
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efe9] dark:bg-emerald-950/40 px-3 py-1 text-xs font-medium text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
                Dice Session Connected
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono hidden md:inline-block">
                Candidate: Marcus Vance (Staff Architect)
              </span>
            </div>
          </div>

          {/* Performance Gauges Row (ATS Score, Keyword Match, Role Fit) */}
          <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/60 px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {/* Gauge 1 */}
              <div className="flex flex-col items-center">
                <div className="relative size-20 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200 dark:text-stone-700"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#104e43] dark:text-[#4fcfbc]"
                      strokeDasharray="96, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">96</span>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-500">Score</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-stone-900 dark:text-stone-100">ATS Match Score</p>
                <p className="text-[11px] text-stone-500">Keyword & experience density</p>
              </div>

              {/* Gauge 2 */}
              <div className="flex flex-col items-center">
                <div className="relative size-20 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200 dark:text-stone-700"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#104e43] dark:text-[#4fcfbc]"
                      strokeDasharray="92, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">92</span>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-500">Match</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-stone-900 dark:text-stone-100">JD Semantic Alignment</p>
                <p className="text-[11px] text-stone-500">14 required skills mapped</p>
              </div>

              {/* Gauge 3 */}
              <div className="flex flex-col items-center">
                <div className="relative size-20 grid place-items-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200 dark:text-stone-700"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#104e43] dark:text-[#4fcfbc]"
                      strokeDasharray="89, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">89</span>
                    <span className="block text-[9px] uppercase tracking-wider text-stone-500">Fit</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-stone-900 dark:text-stone-100">Seniority & Comp Band</p>
                <p className="text-[11px] text-stone-500">$190k–$225k targeted range</p>
              </div>
            </div>

            {/* Recruiter / Automation Take Banner */}
            <div className="mt-5 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex items-start gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5 font-mono">
                AI MATCH EVALUATION:
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                &quot;Candidate profile exhibits strong distributed systems and cloud architecture depth. Paired with candidate&apos;s authoritative <strong className="text-stone-900 dark:text-stone-100 not-italic">FullStack_Architect_2026.pdf</strong> resume. Ready for supervised browser submission.&quot;
              </p>
            </div>
          </div>

          {/* Dynamic Content Body based on tab */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'matches' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Job Match List */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <SlidersHorizontal className="size-4 text-[#104e43] dark:text-[#4fcfbc]" />
                      <span>Recommended Openings (3 of 24)</span>
                    </p>
                    <span className="text-xs text-stone-500">Ranked by Semantic Match</span>
                  </div>

                  {SAMPLE_JOBS.map((job) => (
                    <div
                      key={job.id}
                      className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 sm:p-5 transition-all duration-150 hover:border-[#104e43]/40 dark:hover:border-emerald-600/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#104e43] dark:group-hover:text-[#4fcfbc] transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                            {job.company} • {job.location} • <span className="font-mono text-xs">{job.salary}</span>
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8efe9] dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-[#104e43] dark:text-emerald-300 tabular-nums border border-[#d3e2d6] dark:border-emerald-800/60">
                          <Sparkles className="size-3" />
                          {job.matchScore}% Match
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-stone-100 dark:bg-stone-700/60 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <FileText className="size-3.5 text-[#104e43] dark:text-[#4fcfbc]" />
                          <span>Matched CV: <strong className="text-stone-800 dark:text-stone-200 font-medium">{job.recommendedResume}</strong></span>
                        </span>
                        <span
                          className={`font-semibold ${
                            job.status === 'Ready to Apply'
                              ? 'text-[#104e43] dark:text-[#4fcfbc]'
                              : job.status === 'Review Required'
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Live Automated Dispatch Preview */}
                <div className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/40 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono">
                      Dispatcher Execution Log
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#104e43] dark:text-emerald-300 bg-[#e8efe9] dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60">
                      <Zap className="size-3" /> In Progress
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">Job Description Analyzed</p>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">14 technical competencies mapped to candidate profile.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">Resume Resolved</p>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Paired with <span className="font-mono text-stone-800 dark:text-stone-200">FullStack_Architect_2026.pdf</span>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <CheckCircle2 className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">Dice Portal Opened</p>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Isolated browser context established with active user session.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-400">Review Queue Gate</p>
                        <p className="text-stone-500 dark:text-stone-400 mt-0.5">Custom employer question held for confirmation before dispatch.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-mono">Status: Awaiting review</span>
                    <span className="font-semibold text-[#104e43] dark:text-[#4fcfbc] hover:underline cursor-pointer">
                      Inspect Details →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inspector' && (
              <div className="max-w-3xl mx-auto py-4 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Deterministic Queue & Recovery Engine</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                      Multi-worker lease coordination prevents duplicate submissions and recovers interrupted tasks.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#104e43] dark:text-[#4fcfbc] font-semibold bg-[#e8efe9] dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60">
                    Lease TTL: 180s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                    <p className="text-xs font-semibold text-stone-500 uppercase font-mono">Pre-Submission</p>
                    <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">Retryable</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">Browser interruptions automatically recovered with exponential backoff.</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                    <p className="text-xs font-semibold text-stone-500 uppercase font-mono">Submitting Gate</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">Ambiguity Guard</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">Interrupted submissions marked for audit to prevent dual-submits.</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                    <p className="text-xs font-semibold text-stone-500 uppercase font-mono">Worker Leases</p>
                    <p className="text-xl font-bold text-[#104e43] dark:text-[#4fcfbc] mt-1">Heartbeat Safe</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">Active background tasks are never terminated prematurely.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resumes' && (
              <div className="max-w-3xl mx-auto py-4 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Authoritative Multi-Resume Resolution</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                      Store targeted resumes for different career tracks. Apply2Hire evaluates and selects the best fit per role.
                    </p>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">1 Default • 3 Specialized</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#104e43]/30 dark:border-emerald-700/40 bg-[#e8efe9]/50 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-[#104e43] dark:text-[#4fcfbc]" />
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">FullStack_Lead_2026.pdf</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Target Role: Full Stack / Web Architecture</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#104e43] px-3 py-1 text-xs font-medium text-white shadow-xs">
                      Authoritative Default
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-stone-400" />
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Cloud_Platform_DevOps.pdf</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Target Role: AWS / Kubernetes / Platform</p>
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">Specialized Track</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-stone-400" />
                      <div>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Data_Engineering_Spark.pdf</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Target Role: Databricks / PySpark / Data</p>
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">Specialized Track</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
