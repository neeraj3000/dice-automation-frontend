import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle2,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Send,
  ShieldCheck,
  Search,
  Sliders,
  Cpu,
  Clock,
} from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-[#faf8f5] dark:bg-[#0a0e0f] transition-colors">
      {/* Background Subtle Grid Pattern matching Resume2Hire */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(16, 78, 67, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 78, 67, 0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#104e43]/6 dark:bg-[#4fcfbc]/4 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 right-10 w-[500px] h-[350px] bg-[#d3e2d6]/30 dark:bg-emerald-950/20 blur-[110px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Bold Editorial Headline & Copy */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Pill Tag */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider text-[#104e43] dark:text-emerald-300 shadow-xs mb-6"
            >
              <Sparkles className="size-3.5 text-[#104e43] dark:text-emerald-300" />
              <span>Autonomous Job Applying Platform</span>
            </motion.div>

            {/* Signature Bold Serif Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-[1.12]"
            >
              Applications dispatched <br />
              by agents, <br />
              <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
                approved by you.
                <WavyUnderline className="text-[#104e43] dark:text-[#4fcfbc]" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl"
            >
              Upload your specialized resumes and set target search profiles. Autonomous agents discover verified openings, tailor your answers, and execute authentic browser applications—with a human review queue for complete oversight.
            </motion.p>

            {/* Primary CTA Button */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#104e43] hover:bg-[#0c3d34] px-8 py-3.5 text-base font-semibold text-white shadow-md hover:shadow-lg transition-all duration-150 ease-out hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start applying</span>
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 px-6 py-3.5 text-base font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-xs"
              >
                <span>See how it works</span>
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[#104e43] dark:text-[#4fcfbc]" />
                <span>Authenticated Dice Sessions</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-[#104e43] dark:text-[#4fcfbc]" />
                <span>Zero Blind Submissions</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual 2-Card Agent Automation Flow (Job Applying Engine) */}
          <div className="lg:col-span-7 relative flex items-center justify-center pt-6 lg:pt-0">
            {/* Visual Container */}
            <div className="relative w-full max-w-[680px] h-[520px] sm:h-[560px] flex items-center justify-center">
              
              {/* Card 1 (Left): Raw Job Opening / Unapplied Position (Tilted -5deg) */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: -5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute left-0 sm:left-2 top-6 w-[255px] sm:w-[295px] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-2xl shadow-stone-900/10 text-stone-800 dark:text-stone-100 z-10 transition-transform hover:scale-[1.02] duration-200"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Dice Job Opening
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">#49210-US</span>
                </div>

                {/* Job Title & Company */}
                <div className="mt-3">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 leading-snug">
                    Staff Backend Engineer
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" /> Stripe
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> Remote
                    </span>
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    <DollarSign className="size-3" /> $185,000 – $215,000 / yr
                  </div>
                </div>

                {/* Job Requirements & Screener Preview */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-stone-400">
                      Required Stack
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                        Python
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                        FastAPI
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                        Kubernetes
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                        Kafka
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                    <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 block">
                      Custom Screener Question:
                    </span>
                    <p className="text-[11px] text-amber-900/80 dark:text-amber-200/90 mt-0.5 leading-tight">
                      &quot;How many years experience scaling distributed task workers?&quot;
                    </p>
                  </div>
                </div>

                {/* Card 1 Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400 uppercase tracking-wider text-[10px]">
                    TARGET OPENING
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    45<span className="text-stone-400 font-normal"> / 100</span>
                  </span>
                </div>
              </motion.div>

              {/* Card 2 (Right): Confirmed & Dispatched Application (Tilted +5deg) */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 5 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute right-0 sm:right-2 top-14 w-[265px] sm:w-[305px] rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-2xl shadow-stone-900/15 text-stone-800 dark:text-stone-100 z-20 transition-transform hover:scale-[1.02] duration-200"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Dispatched & Verified
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-semibold">
                    SUBMITTED ✓
                  </span>
                </div>

                {/* Candidate & Portal Info */}
                <div className="mt-3">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 leading-snug">
                    Staff Backend Engineer
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span>Applicant: <strong>Marcus Vance</strong></span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-[#104e43] dark:text-[#4fcfbc]" />
                      <span className="font-medium text-[11px] truncate max-w-[160px]">
                        Staff_Backend_Python.pdf
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      98% Fit
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                      <span>Screener Answer [Approved]:</span>
                      <span className="font-mono text-[9px] uppercase bg-emerald-100 dark:bg-emerald-900/60 px-1 rounded">
                        Review Passed
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-1 leading-tight">
                      &quot;8+ years scaling Redis & Kafka message brokers to 20M+ daily events.&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-emerald-600" /> Dispatched in 1.4s
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      Browser Session Active
                    </span>
                  </div>
                </div>

                {/* Card 2 Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400 uppercase tracking-wider text-[10px]">
                    APPLICATION DISPATCH
                  </span>
                  <span className="font-bold text-[#104e43] dark:text-[#4fcfbc]">
                    98<span className="text-stone-400 font-normal"> / 100</span>
                  </span>
                </div>
              </motion.div>

              {/* Connecting Multi-Agent SVG Path and Pipeline Nodes (Centered Over Cards) */}
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 680 520" fill="none">
                  {/* Glowing connecting spline */}
                  <path
                    d="M 160 230 C 230 170, 300 270, 370 200 C 420 160, 480 220, 530 210"
                    stroke="#104e43"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-70 dark:opacity-90 animate-pulse"
                  />
                </svg>

                {/* Agent Pipeline Nodes positioned along the flow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  {/* Node 1: DISCOVER */}
                  <div className="absolute left-[24%] sm:left-[25%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="size-8 sm:size-9 rounded-full bg-white dark:bg-stone-900 border-2 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc] shadow-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[9px] font-mono font-bold tracking-wider uppercase text-stone-700 dark:text-stone-200 shadow-xs">
                      1 · DISCOVER
                    </span>
                  </div>

                  {/* Node 2: MATCH */}
                  <div className="absolute left-[38%] sm:left-[39%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="size-8 sm:size-9 rounded-full bg-white dark:bg-stone-900 border-2 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc] shadow-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[9px] font-mono font-bold tracking-wider uppercase text-stone-700 dark:text-stone-200 shadow-xs">
                      2 · MATCH
                    </span>
                  </div>

                  {/* Node 3: AUTOFILL */}
                  <div className="absolute left-[52%] sm:left-[53%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="size-8 sm:size-9 rounded-full bg-white dark:bg-stone-900 border-2 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc] shadow-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[9px] font-mono font-bold tracking-wider uppercase text-stone-700 dark:text-stone-200 shadow-xs">
                      3 · AUTOFILL
                    </span>
                  </div>

                  {/* Node 4: REVIEW */}
                  <div className="absolute left-[66%] sm:left-[67%] top-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="size-8 sm:size-9 rounded-full bg-white dark:bg-stone-900 border-2 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc] shadow-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[9px] font-mono font-bold tracking-wider uppercase text-stone-700 dark:text-stone-200 shadow-xs">
                      4 · REVIEW
                    </span>
                  </div>

                  {/* Node 5: DISPATCH (Solid Green Node with Floating Tooltip Banner) */}
                  <div className="absolute left-[80%] sm:left-[80%] top-[33%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-40">
                    <div className="relative">
                      {/* Floating Tooltip Banner pointing downwards matching Resume2Hire */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#104e43] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                        <Send className="size-2.5" />
                        <span>DISPATCH</span>
                        {/* Little triangle tail */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#104e43]" />
                      </div>

                      <div className="size-9 sm:size-10 rounded-full bg-[#104e43] text-[#61ebd7] shadow-lg flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-stone-900">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                    </div>
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-[#104e43] text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-xs">
                      5 · APPLIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Factual Highlights Bar (Subtle Bottom Grid) */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-stone-200/80 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Multi-Resume Library</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Targeted role pairing</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Sliders className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Human-in-the-Loop</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Review queue for screeners</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Cpu className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Real Browser Runs</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Authentic Dice sessions</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-[#104e43] dark:text-[#4fcfbc] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Tenant-Isolated</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Zero data contamination</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
