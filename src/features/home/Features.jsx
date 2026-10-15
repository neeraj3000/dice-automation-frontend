import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Search,
  Globe,
  HelpCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function Features() {
  const shouldReduceMotion = useReducedMotion();

  const featureCards = [
    {
      icon: FileText,
      tag: 'Adaptive Matching',
      title: 'One library. Tailored submissions for every role.',
      description:
        'Upload your specialized resumes once. Apply2Hire extracts structured skill profiles, calculates semantic job-fit scores, and dynamically selects the most persuasive resume for each target opening.',
    },
    {
      icon: Search,
      tag: 'Board Aggregation',
      title: 'Automated job discovery without duplicate fatigue.',
      description:
        'Create persistent search profiles tailored to your target titles, salary bands, and remote preferences. The discovery engine fetches verified postings from Dice while automatically filtering out roles you have already applied to.',
    },
    {
      icon: HelpCircle,
      tag: 'Review Queue',
      title: 'Human-in-the-loop control for screener questions.',
      description:
        'Employer questionnaires with unexpected questions are held in an interactive review queue. You verify or customize your answer once, keeping total control over what is submitted in your name.',
    },
    {
      icon: Globe,
      tag: 'Browser Context',
      title: 'Authentic session execution without bot blocks.',
      description:
        'Applications run inside real browser instances utilizing your own authenticated credentials. No fragile API tricks or captcha dead-ends — just reliable form automation.',
    },
    {
      icon: Activity,
      tag: 'Deterministic Engine',
      title: 'Audit logs, worker leases, and zero double-submits.',
      description:
        'Every status transition is logged with millisecond timestamps. Lease-protected background workers ensure crash recovery without re-submitting to the same employer twice.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-5">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>02 · CORE CAPABILITIES</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            Built for Scanner Precision{' '}
            <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
              and Editorial Speed
              <WavyUnderline />
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Apply2Hire eliminates repetitive form filling while keeping you in full command of every CV, application answer, and dispatch state.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            const isWide = index === 0 || index === 1;

            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.08 }}
                className={`rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200 ${
                  isWide ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-stone-500">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-xs font-medium text-[#104e43] dark:text-[#4fcfbc]">
                  <CheckCircle2 className="size-3.5" />
                  <span>Verified Architecture</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
