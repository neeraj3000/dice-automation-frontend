import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  UploadCloud,
  Sliders,
  Cpu,
  SendHorizontal,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Default to stage 03 (Match Engine)

  const stages = [
    {
      step: '01',
      navLabel: '01 Ingest',
      tag: 'Preparation',
      icon: UploadCloud,
      title: 'Resume Library Ingestion',
      subtitle: 'Structured skill vectors',
      description:
        'Upload your specialized resumes once. Apply2Hire parses technical competencies, years of experience, and summary points to build semantic matching vectors.',
      previewLabel: 'Extracted Profile Vectors',
      metric: '3 Specialized Resumes Ready',
      details: [
        { label: 'PDF Parsing', value: 'Complete AST Extraction' },
        { label: 'Vector Dimension', value: '1,536 Semantic Weights' },
        { label: 'Competencies', value: 'Distributed Go, AWS EKS, Kafka, Terraform' },
      ],
      chips: ['Distributed Go', 'AWS EKS', 'Kafka', 'Terraform'],
    },
    {
      step: '02',
      navLabel: '02 Filter',
      tag: 'Targeting',
      icon: Sliders,
      title: 'Search Profile Configuration',
      subtitle: 'Board query filters',
      description:
        'Specify roles, keywords, location filters, and salary targets. The engine continuously aggregates fresh opportunities and filters out duplicate listings.',
      previewLabel: 'Active Dice Criteria',
      metric: 'Duplicate Filtering: Active',
      details: [
        { label: 'Target Roles', value: 'Lead / Staff Cloud Architect' },
        { label: 'Salary Floor', value: '$190,000+ Base' },
        { label: 'Location & Board', value: 'Remote (US) · Dice Aggregator' },
      ],
      chips: ['Staff Architect', 'Remote (US)', '$190k+'],
    },
    {
      step: '03',
      navLabel: '03 Match',
      tag: 'Match Engine',
      icon: Cpu,
      title: 'Semantic Gap Matrix & Pairing',
      subtitle: 'Algorithmic alignment',
      description:
        'For every candidate opening, Apply2Hire analyzes the job description, scores compatibility, and resolves the single highest-matching resume.',
      previewLabel: 'Vector Compatibility Score',
      metric: 'Matched: Cloud_Architect_2026.pdf',
      details: [
        { label: 'Semantic Fit', value: '96% Keyword & Stack Alignment' },
        { label: 'Skill Gaps', value: '0 Critical Deficits Found' },
        { label: 'Selected CV', value: 'Cloud_Architect_Lead_2026.pdf (Auto-Assigned)' },
      ],
      chips: ['96% Keyword Fit', '0 Skill Gaps', 'Resume #1 Picked'],
    },
    {
      step: '04',
      navLabel: '04 Dispatch',
      tag: 'Execution',
      icon: SendHorizontal,
      title: 'Supervised Dispatch & Tracking',
      subtitle: 'Authentic browser session',
      description:
        'Forms are populated via your authentic browser session. Custom screener questions trigger the human review queue, and final status is recorded in real time.',
      previewLabel: 'Dispatch Execution State',
      metric: 'Outcome: Verified Submitted',
      details: [
        { label: 'DOM Execution', value: 'Native Chromium Playwright Instance' },
        { label: 'Human Review', value: 'Screener Checkpoint Verified' },
        { label: 'Audit Trail', value: 'Timestamped Delivery Receipt #D-88291' },
      ],
      chips: ['Review Checkpoint: Passed', 'Playwright DOM Run', 'Audit Logged'],
    },
  ];

  const currentStage = stages[activeStageIndex];
  const CurrentIcon = currentStage.icon;

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading — Centered */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-4">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>03 · APPLICATION PIPELINE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            How Apply2Hire works from{' '}
            <span className="italic text-[#104e43] dark:text-[#4fcfbc] font-bold">
              discovery to confirmed dispatch
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            A transparent, directional pipeline that moves from your resume library to authentic browser dispatch with zero blind submissions and complete human review.
          </p>
        </div>

        {/* Top Connected Timeline Segmented Controller */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#faf6ee] dark:bg-[#121614] border border-[#e6dfd1] dark:border-stone-800 shadow-xs">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStageIndex === idx;

              return (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => setActiveStageIndex(idx)}
                  className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#104e43] text-white shadow-xs dark:bg-emerald-600'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/80 dark:hover:bg-stone-900/60'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{stage.navLabel}</span>
                  {isActive && <span className="size-1.5 rounded-full bg-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Spotlight Pipeline Showcase (Spacious, Clean, High-Impact) */}
        <motion.div
          key={currentStage.step}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-[#e6dfd1] dark:border-stone-800 bg-[#faf6ee] dark:bg-[#121614] p-6 sm:p-10 shadow-sm relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#104e43]/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Narrative & Architecture */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                    <CurrentIcon className="size-6" />
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#104e43] dark:text-emerald-300">
                      Phase {currentStage.step} of 04 · {currentStage.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-0.5">
                      {currentStage.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 mt-3">
                  {currentStage.description}
                </p>

                {/* Structured Key System Safeguards */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-[#e5dfd2] dark:border-stone-800">
                  {currentStage.details.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-[#f0ebd9] dark:border-stone-800/70"
                    >
                      <span className="font-mono text-stone-500 dark:text-stone-400">
                        {item.label}
                      </span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Phase Quick Navigation */}
              <div className="mt-8 pt-4 flex items-center justify-between text-xs font-mono text-stone-500 border-t border-[#e5dfd2] dark:border-stone-800">
                <span className="flex items-center gap-1.5 text-[#104e43] dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4" />
                  <span>{currentStage.metric}</span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setActiveStageIndex((prev) => (prev + 1) % stages.length)
                  }
                  className="inline-flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200 hover:text-[#104e43] dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Next: {stages[(activeStageIndex + 1) % stages.length].navLabel}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Live Visual Interface Demonstration */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#e5dfd2] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-7 shadow-xs">
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#f0ebd9] dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#104e43] dark:bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      {currentStage.previewLabel}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#e8efe9] dark:bg-emerald-950 text-[#104e43] dark:text-emerald-300 font-semibold">
                    Stage {currentStage.step} Active
                  </span>
                </div>

                {/* Interactive Chips / Metric Flow */}
                <div className="py-6 space-y-4">
                  <div className="text-xs text-stone-500 font-mono">
                    Runtime Parameters & Vectors:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentStage.chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#faf6ee] dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-[#e5dfd2] dark:border-stone-700 shadow-2xs flex items-center gap-1.5"
                      >
                        <Check className="size-3 text-[#104e43] dark:text-emerald-400" />
                        <span>{chip}</span>
                      </span>
                    ))}
                  </div>

                  {/* Stage-Specific Graphic Visualization */}
                  <div className="mt-6 rounded-xl border border-[#e5dfd2] dark:border-stone-800 bg-[#faf6ee] dark:bg-stone-800/60 p-4">
                    {activeStageIndex === 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-600 dark:text-stone-300 font-medium">Cloud_Architect_2026.pdf</span>
                          <span className="text-[#104e43] dark:text-emerald-400 font-bold">Parsed · 15 Vectors</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#104e43] dark:bg-emerald-500 rounded-full w-[100%]" />
                        </div>
                      </div>
                    )}

                    {activeStageIndex === 1 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-600 dark:text-stone-300 font-medium">Dice Aggregator Poll</span>
                          <span className="text-[#104e43] dark:text-emerald-400 font-bold">148 Found · 38 Excluded</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#104e43] dark:bg-emerald-500 rounded-full w-[82%]" />
                        </div>
                      </div>
                    )}

                    {activeStageIndex === 2 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-600 dark:text-stone-300 font-medium">Semantic Match Matrix</span>
                          <span className="text-[#104e43] dark:text-emerald-400 font-bold">96% Optimal Match</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#104e43] dark:bg-emerald-400 rounded-full w-[96%]" />
                        </div>
                      </div>
                    )}

                    {activeStageIndex === 3 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-stone-600 dark:text-stone-300 font-medium">Chromium Browser Session</span>
                          <span className="text-[#104e43] dark:text-emerald-400 font-bold">Dispatched & Verified</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-[#104e43] dark:bg-emerald-400 rounded-full w-[100%]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f0ebd9] dark:border-stone-800 flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>Inspection Engine: Continuous</span>
                  <span className="text-[#104e43] dark:text-emerald-400 font-bold">
                    Zero Blind Submissions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Horizontal Pipeline Overview Cards (Clean, Connected, Uncluttered) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((st, i) => {
            const isSelected = activeStageIndex === i;
            const Icon = st.icon;

            return (
              <div
                key={st.step}
                onClick={() => setActiveStageIndex(i)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#111718] border-[#104e43] dark:border-emerald-600 shadow-sm ring-1 ring-[#104e43]/20'
                    : 'bg-[#faf6ee]/80 dark:bg-stone-900/40 border-[#e5dfd2] dark:border-stone-800 hover:bg-white dark:hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-stone-400">
                    {st.step}
                  </span>
                  <Icon
                    className={`size-4 ${
                      isSelected ? 'text-[#104e43] dark:text-emerald-400' : 'text-stone-400'
                    }`}
                  />
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {st.title}
                </div>
                <div className="text-xs text-stone-500 mt-1 line-clamp-1">
                  {st.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
