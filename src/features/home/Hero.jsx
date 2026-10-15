import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Send,
  Sliders,
  Clock,
  BarChart3,
} from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  // Sequential agent loop from Discover -> Gap Matrix -> Autofill -> Review -> Applied
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

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
    <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 overflow-hidden bg-[#f2f7f4] dark:bg-[#0c1210] transition-colors">
      {/* Background Lightish Green Radial Gradient & Matrix Grid Pattern matching Resume2Hire */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: '#f2f7f4',
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(16, 78, 67, 0.10) 0%, rgba(242, 247, 244, 0.96) 80%), linear-gradient(to right, rgba(27, 94, 79, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(27, 94, 79, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Ambient Lighting with Signature Lightish Green & Mint Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[480px] bg-[#2e855d]/12 dark:bg-[#4fcfbc]/6 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 right-10 w-[600px] h-[420px] bg-[#a8d5be]/40 dark:bg-emerald-950/25 blur-[130px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start"
        >
          {/* Left Column: Bold Editorial Headline & Copy (Sideways aligned to start of cards) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left pt-2 lg:pt-5">
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

            {/* Subtitle (Concise & Impactful) */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg"
            >
              Automate verified job applications with your tailored resumes. Agents discover roles, autofill forms, and await your review before dispatching.
            </motion.p>

            {/* Primary CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#104e43] hover:bg-[#0c3d34] px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:shadow-lg transition-all duration-150 ease-out hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start applying</span>
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800/90 px-6 py-3 text-sm sm:text-base font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-xs"
              >
                <span>See how it works</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Visual 2-Card Agent Automation Flow (Job Applying Engine with Match Matrices) */}
          <div className="lg:col-span-7 relative flex items-center justify-center pt-8 lg:pt-0">
            {/* Expanded Visual Container for Larger Cards & Clear Matrix Pipeline */}
            <div className="relative w-full max-w-[780px] h-[580px] sm:h-[640px] flex items-center justify-center">
              
              {/* Card 1 (Left): Larger Raw Job Opening / Unapplied Position (Tilted -5deg) */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: -5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute left-0 sm:left-2 top-4 sm:top-6 w-[285px] sm:w-[340px] lg:w-[360px] rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xl shadow-stone-900/12 text-stone-800 dark:text-stone-100 z-10 transition-transform hover:scale-[1.02] duration-200"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Dice Job Opening
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">#49210-US</span>
                </div>

                {/* Job Title & Company */}
                <div className="mt-4">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50 leading-snug">
                    Staff Backend Engineer
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="size-3.5 text-stone-400" /> Stripe
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-stone-400" /> San Francisco / Remote
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                    <DollarSign className="size-3.5" /> $185,000 – $215,000 / yr
                  </div>
                </div>

                {/* Job Requirements & Fit Matrix Breakdown */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
                      Required Stack
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300">
                        Python
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300">
                        FastAPI
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300">
                        Kubernetes
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300">
                        Kafka
                      </span>
                    </div>
                  </div>

                  {/* Fit Matrix Chip */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/60 px-2.5 py-1.5 rounded-lg border border-stone-200/60 dark:border-stone-700/50">
                    <span>Fit Matrix: <strong>45%</strong></span>
                    <span>Gap: <span className="text-amber-600 dark:text-amber-400 font-semibold">55% Unmapped</span></span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40">
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block">
                      Custom Screener Question:
                    </span>
                    <p className="text-xs text-amber-900/80 dark:text-amber-200/90 mt-1 leading-relaxed">
                      &quot;How many years experience scaling distributed task workers and microservices?&quot;
                    </p>
                  </div>
                </div>

                {/* Card 1 Footer */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400 uppercase tracking-wider text-[11px]">
                    TARGET FIT MATRIX
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    45<span className="text-stone-400 font-normal"> / 100</span>
                  </span>
                </div>
              </motion.div>

              {/* Card 2 (Right): Larger Confirmed & Dispatched Application (Tilted +5deg) */}
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 5 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute right-0 sm:right-2 top-10 sm:top-14 w-[295px] sm:w-[350px] lg:w-[370px] rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-2xl shadow-stone-900/18 text-stone-800 dark:text-stone-100 z-20 transition-transform hover:scale-[1.02] duration-200"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Dispatched & Verified
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    SUBMITTED ✓
                  </span>
                </div>

                {/* Candidate & Portal Info */}
                <div className="mt-4">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50 leading-snug">
                    Staff Backend Engineer
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    <span>Applicant: <strong className="text-stone-800 dark:text-stone-200">Marcus Vance</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Dice Verified</span>
                  </div>
                </div>

                {/* Application Details & Resolved Match Matrix */}
                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-[#104e43] dark:text-[#4fcfbc]" />
                      <span className="font-medium text-xs truncate max-w-[190px]">
                        Staff_Backend_Python.pdf
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      98% Match
                    </span>
                  </div>

                  {/* Resolved Match Matrix Chip */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                    <span>Match Matrix: <strong>98%</strong></span>
                    <span>Gap: <span className="text-emerald-700 dark:text-emerald-400 font-bold">0% (Resolved)</span></span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                      <span>Screener Answer [Approved]:</span>
                      <span className="font-mono text-[10px] uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        Review Passed
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 mt-1.5 leading-relaxed">
                      &quot;8+ years scaling Redis & Kafka message brokers to 20M+ daily events with zero downtime.&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-emerald-600" /> Dispatched in 1.4s
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      Browser Session Active
                    </span>
                  </div>
                </div>

                {/* Card 2 Footer */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400 uppercase tracking-wider text-[11px]">
                    DISPATCH MATCH MATRIX
                  </span>
                  <span className="font-bold text-[#104e43] dark:text-[#4fcfbc] text-sm">
                    98<span className="text-stone-400 font-normal"> / 100</span>
                  </span>
                </div>
              </motion.div>

              {/* Connecting Multi-Agent Animated SVG Path & Traveling Glow Stream */}
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 760 560" fill="none">
                  {/* Subtle Background Guide Track */}
                  <path
                    d="M 180 250 C 260 180, 340 310, 420 230 C 480 170, 560 250, 620 240"
                    stroke="#104e43"
                    strokeWidth="2.5"
                    strokeOpacity="0.25"
                  />
                  {/* Flowing animated dash stream from Discover to Applied */}
                  <motion.path
                    d="M 180 250 C 260 180, 340 310, 420 230 C 480 170, 560 250, 620 240"
                    stroke="#104e43"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    animate={shouldReduceMotion ? {} : { strokeDashoffset: [0, -48] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                    className="dark:stroke-[#4fcfbc]"
                  />
                </svg>

                {/* 5 Sequential Interactive Agent Pipeline Nodes */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  
                  {/* Node 1: DISCOVER */}
                  <div className="absolute left-[24%] sm:left-[25%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      {/* Active beacon pulse ring */}
                      {activeStep === 0 && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute -inset-1 rounded-full border-2 border-[#104e43] dark:border-[#4fcfbc] pointer-events-none"
                        />
                      )}
                      <div
                        className={`size-9 sm:size-10 rounded-full border-2 transition-all duration-300 shadow-md flex items-center justify-center text-xs font-bold ${
                          activeStep === 0
                            ? 'bg-[#104e43] text-white border-[#104e43] scale-110 shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                            : 'bg-white dark:bg-stone-900 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc]'
                        }`}
                      >
                        <Check className="size-4 stroke-[3]" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs transition-all duration-300 ${
                        activeStep === 0
                          ? 'bg-[#104e43] text-white shadow-md scale-105'
                          : 'bg-white/95 dark:bg-stone-800/95 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      1 · DISCOVER
                    </span>
                  </div>

                  {/* Node 2: GAP MATRIX (Matching Resume2Hire's BarChart Gap Analysis Node) */}
                  <div className="absolute left-[38%] sm:left-[39%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      {activeStep === 1 && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute -inset-1 rounded-full border-2 border-[#104e43] dark:border-[#4fcfbc] pointer-events-none"
                        />
                      )}
                      <div
                        className={`size-9 sm:size-10 rounded-full border-2 transition-all duration-300 shadow-md flex items-center justify-center text-xs font-bold ${
                          activeStep === 1
                            ? 'bg-[#104e43] text-white border-[#104e43] scale-110 shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                            : 'bg-white dark:bg-stone-900 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc]'
                        }`}
                      >
                        <BarChart3 className="size-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs transition-all duration-300 ${
                        activeStep === 1
                          ? 'bg-[#104e43] text-white shadow-md scale-105'
                          : 'bg-white/95 dark:bg-stone-800/95 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      2 · GAP MATRIX
                    </span>
                  </div>

                  {/* Node 3: AUTOFILL */}
                  <div className="absolute left-[52%] sm:left-[53%] top-[36%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      {activeStep === 2 && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute -inset-1 rounded-full border-2 border-[#104e43] dark:border-[#4fcfbc] pointer-events-none"
                        />
                      )}
                      <div
                        className={`size-9 sm:size-10 rounded-full border-2 transition-all duration-300 shadow-md flex items-center justify-center text-xs font-bold ${
                          activeStep === 2
                            ? 'bg-[#104e43] text-white border-[#104e43] scale-110 shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                            : 'bg-white dark:bg-stone-900 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc]'
                        }`}
                      >
                        <Sliders className="size-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs transition-all duration-300 ${
                        activeStep === 2
                          ? 'bg-[#104e43] text-white shadow-md scale-105'
                          : 'bg-white/95 dark:bg-stone-800/95 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      3 · AUTOFILL
                    </span>
                  </div>

                  {/* Node 4: REVIEW */}
                  <div className="absolute left-[66%] sm:left-[67%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      {activeStep === 3 && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute -inset-1 rounded-full border-2 border-[#104e43] dark:border-[#4fcfbc] pointer-events-none"
                        />
                      )}
                      <div
                        className={`size-9 sm:size-10 rounded-full border-2 transition-all duration-300 shadow-md flex items-center justify-center text-xs font-bold ${
                          activeStep === 3
                            ? 'bg-[#104e43] text-white border-[#104e43] scale-110 shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                            : 'bg-white dark:bg-stone-900 border-[#104e43] text-[#104e43] dark:text-[#4fcfbc]'
                        }`}
                      >
                        <Check className="size-4 stroke-[3]" />
                      </div>
                    </div>
                    <span
                      className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs transition-all duration-300 ${
                        activeStep === 3
                          ? 'bg-[#104e43] text-white shadow-md scale-105'
                          : 'bg-white/95 dark:bg-stone-800/95 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      4 · REVIEW
                    </span>
                  </div>

                  {/* Node 5: APPLIED with Animated Bobbing DISPATCH Tooltip */}
                  <div className="absolute left-[80%] sm:left-[81%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-40">
                    <div className="relative">
                      {/* Floating / Bobbing Tooltip Banner matching Resume2Hire */}
                      <motion.div
                        animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#104e43] text-white text-[11px] font-mono font-bold px-3 py-1 rounded-md shadow-lg flex items-center gap-1.5"
                      >
                        <Send className="size-3" />
                        <span>DISPATCH</span>
                        {/* Little triangle tail */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#104e43]" />
                      </motion.div>

                      {/* Terminal node active pulse ring */}
                      {activeStep === 4 && (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          className="absolute -inset-1.5 rounded-full border-2 border-[#104e43] dark:border-[#4fcfbc] pointer-events-none"
                        />
                      )}

                      <div
                        className={`size-10 sm:size-11 rounded-full shadow-xl flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-stone-900 transition-all duration-300 ${
                          activeStep === 4
                            ? 'bg-[#0b3830] text-[#61ebd7] scale-110'
                            : 'bg-[#104e43] text-[#61ebd7]'
                        }`}
                      >
                        <Check className="size-4 sm:size-5 stroke-[3]" />
                      </div>
                    </div>
                    <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#104e43] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                      5 · APPLIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
