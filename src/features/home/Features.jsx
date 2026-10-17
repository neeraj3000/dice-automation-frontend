import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  SlidersHorizontal,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Features() {
  const shouldReduceMotion = useReducedMotion();
  const [activeResumeTab, setActiveResumeTab] = useState('architect');

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-4">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>02 · CORE CAPABILITIES</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            Engineered for Scanner Precision{' '}
            <span className="italic text-[#104e43] dark:text-[#4fcfbc] font-bold">
              and Editorial Speed
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Apply2Hire eliminates mechanical form repetition with a verified multi-resume pairing architecture. Discover openings, evaluate semantic keyword coverage, and supervise authentic browser submissions.
          </p>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Featured Capability Centerpiece (Spans 7 of 12 columns on desktop) */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 rounded-3xl border border-[#e6dfd1] dark:border-stone-800 bg-[#faf6ee] dark:bg-[#121614] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 transition-all duration-300 relative overflow-hidden"
          >
            {/* Ambient Background Gradient Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#104e43]/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header Label */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60 text-xs font-semibold">
                  <Sparkles className="size-3.5" />
                  <span>Featured Centerpiece</span>
                </div>
                <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-stone-500">
                  Semantic Pairing Engine
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                One Library. Algorithmic Resume-to-Job Matching.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Upload your specialized resumes once. Apply2Hire computes multi-dimensional keyword and experience vectors, pairing each target opening with your highest-converting CV.
              </p>

              {/* Realistic Product-Interface Preview */}
              <div className="mt-6 rounded-2xl border border-[#e5dfd2] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs">
                {/* Target Job Listing Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f0ebd9] dark:border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[#104e43] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Dice Verified Opening
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">#D-88291</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1">
                      Lead Cloud & Distributed Systems Architect
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                      $195k – $225k · Remote
                    </span>
                  </div>
                </div>

                {/* Required Tech Stack Chips */}
                <div className="pt-3 pb-4">
                  <div className="text-[11px] font-mono uppercase text-stone-500 mb-2">
                    Extracted Target Requirements:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['AWS ECS / EKS', 'Distributed Go', 'Kubernetes', 'Kafka', 'Terraform', 'Zero-Trust'].map(
                      (tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-[#faf6ee] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-[#e5dfd2] dark:border-stone-700"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Interactive Multi-Resume Comparison Selector */}
                <div className="space-y-2 pt-2 border-t border-[#f0ebd9] dark:border-stone-800">
                  <div className="text-[11px] font-mono uppercase text-stone-500 flex items-center justify-between">
                    <span>Resume Library Evaluation:</span>
                    <span>Pairing Score</span>
                  </div>

                  {/* Resume Option 1 (Selected/Winning Match) */}
                  <div
                    onClick={() => setActiveResumeTab('architect')}
                    className={`cursor-pointer rounded-xl p-3 border transition-all ${
                      activeResumeTab === 'architect'
                        ? 'border-[#104e43] dark:border-emerald-600 bg-white dark:bg-stone-900 shadow-xs ring-1 ring-[#104e43]/15'
                        : 'border-[#e5dfd2] dark:border-stone-800 bg-[#faf6ee]/70 dark:bg-stone-900/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="size-4 text-[#104e43] dark:text-emerald-400" />
                        <div>
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            Cloud_Architect_Lead_2026.pdf
                          </span>
                          <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[#104e43] dark:text-emerald-300 font-medium">
                            Auto-Selected
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        96% Fit
                      </span>
                    </div>

                    {/* Progress Bar & Keywords */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#104e43] dark:bg-emerald-400 rounded-full w-[96%]" />
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">15/15 Match</span>
                    </div>
                  </div>

                  {/* Resume Option 2 (Alternative) */}
                  <div
                    onClick={() => setActiveResumeTab('fullstack')}
                    className={`cursor-pointer rounded-xl p-3 border transition-all ${
                      activeResumeTab === 'fullstack'
                        ? 'border-[#104e43] dark:border-emerald-600 bg-white dark:bg-stone-900 shadow-xs ring-1 ring-[#104e43]/15'
                        : 'border-[#e5dfd2] dark:border-stone-800 bg-[#faf6ee]/70 dark:bg-stone-900/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="size-4 text-stone-400" />
                        <div>
                          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                            FullStack_Platform_Staff.pdf
                          </span>
                          <span className="ml-2 text-[10px] font-mono text-stone-400">Alternative</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-stone-500">74% Fit</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-400 dark:bg-stone-600 rounded-full w-[74%]" />
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">Skill Gap: Go</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 pt-3 border-t border-[#f0ebd9] dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                    <CheckCircle2 className="size-4 text-[#104e43] dark:text-emerald-400" />
                    <span className="font-medium">Deterministic Match Verified</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#104e43] dark:text-emerald-400 bg-[#e8efe9] dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold">
                    Status: Staged for Supervised Dispatch
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Guarantee Footer */}
            <div className="mt-6 pt-4 border-t border-[#e5dfd2] dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono">Engine: Multi-Vector Gap Matrix</span>
              <span className="text-[#104e43] dark:text-emerald-400 font-medium">Zero Blind Submissions</span>
            </div>
          </motion.div>

          {/* Right Column Supporting Capabilities (Spans 5 of 12 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Supporting Block 1: Search Aggregation & Deduplication */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="rounded-3xl border border-[#e6dfd1] dark:border-stone-800 bg-[#faf6ee] dark:bg-[#121614] p-6 sm:p-7 shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 transition-all duration-300 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                    <SlidersHorizontal className="size-5" />
                  </span>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-[#e5dfd2] dark:border-stone-700">
                    Board Aggregation
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Target Search Profiles Without Duplicate Fatigue
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  Configure persistent searches with title, remote, and salary filters. Apply2Hire aggregates verified postings from Dice while automatically screening out roles you have already applied to.
                </p>

                {/* Inline Profile Filter Preview */}
                <div className="mt-4 rounded-xl border border-[#e5dfd2] dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-xs font-mono space-y-1.5 shadow-2xs">
                  <div className="text-stone-500 text-[10px] uppercase">Active Target Profile:</div>
                  <div className="flex flex-wrap gap-1.5 text-stone-700 dark:text-stone-300">
                    <span className="px-2 py-0.5 rounded bg-[#faf6ee] dark:bg-stone-800 border border-[#e5dfd2] dark:border-stone-700">
                      Role: Staff / Lead Architect
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#faf6ee] dark:bg-stone-800 border border-[#e5dfd2] dark:border-stone-700">
                      Remote Only
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#faf6ee] dark:bg-stone-800 border border-[#e5dfd2] dark:border-stone-700">
                      Min: $180k
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1 flex items-center justify-between">
                    <span>148 scanned</span>
                    <span className="font-semibold">38 duplicates filtered</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e5dfd2] dark:border-stone-800 flex items-center gap-1.5 text-xs text-[#104e43] dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Compound Key Deduplication</span>
              </div>
            </motion.div>

            {/* Supporting Block 2: Human-in-the-Loop Review Queue */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
              className="rounded-3xl border border-[#e6dfd1] dark:border-stone-800 bg-[#faf6ee] dark:bg-[#121614] p-6 sm:p-7 shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 transition-all duration-300 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                    <HelpCircle className="size-5" />
                  </span>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    Human Review Queue
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Human-in-the-Loop for Ambiguous Screeners
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  Employer questionnaires with novel or sensitive questions are held in an interactive review queue. You verify or customize your answer once, maintaining absolute control over what is submitted.
                </p>

                {/* Inline Review Queue Pill Preview */}
                <div className="mt-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-stone-900 p-3 text-xs shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-amber-800 dark:text-amber-400 font-semibold mb-1">
                    Checkpoint Screener:
                  </div>
                  <div className="text-stone-800 dark:text-stone-200 font-medium">
                    &ldquo;Do you require visa sponsorship now or in the future?&rdquo;
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-stone-600 dark:text-stone-300 bg-[#faf6ee] dark:bg-stone-800 px-2 py-0.5 rounded border border-[#e5dfd2] dark:border-stone-700">
                      Answer: &ldquo;No&rdquo;
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Awaiting 1-Click Confirmation
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#e5dfd2] dark:border-stone-800 flex items-center gap-1.5 text-xs text-[#104e43] dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Zero Hallucinated Answers</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
