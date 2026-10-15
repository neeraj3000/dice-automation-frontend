import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, UserCheck, StopCircle, Lock, Eye, Database } from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function TrustSection() {
  const shouldReduceMotion = useReducedMotion();

  const trustPoints = [
    {
      icon: UserCheck,
      title: 'Human-in-the-Loop Safeguards',
      description:
        'Apply2Hire never submits blindly when an employer asks novel or ambiguous questions. Unmapped prompts trigger the Review Queue for your explicit confirmation.',
    },
    {
      icon: StopCircle,
      title: 'Atomic Cancel & Stop',
      description:
        'You can stop any queued or running application with a single click. The background dispatcher immediately halts browser execution and updates job state.',
    },
    {
      icon: Lock,
      title: 'Strict Multi-Tenant Isolation',
      description:
        'Every resume, search profile, and application document is strictly scoped to your authenticated account ID. Cross-user data leakage is architecturally prohibited.',
    },
    {
      icon: Database,
      title: 'Local Session Storage',
      description:
        'Job board session tokens are stored securely in your host environment. Apply2Hire never shares or exports your session cookies across users.',
    },
    {
      icon: Eye,
      title: 'Complete Audit Transparency',
      description:
        'Inspect every phase of automation: when the portal was accessed, which resume was attached, and the exact response received from the employer portal.',
    },
    {
      icon: ShieldCheck,
      title: 'Duplicate Submission Shield',
      description:
        'Built-in deduplication prevents multiple submissions to the same posting ID, protecting your professional reputation with recruiters.',
    },
  ];

  return (
    <section id="trust" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-5">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>04 · PLATFORM TRUST & CONTROL</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            You remain in{' '}
            <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
              total control
              <WavyUnderline />
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Career automation demands absolute accountability. Here is how Apply2Hire protects your identity, data, and recruiter relationships.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;

            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.08 }}
                className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-7 shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60 mb-5">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                  {point.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
