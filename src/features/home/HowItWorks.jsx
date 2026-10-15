import { motion, useReducedMotion } from 'framer-motion';
import { UploadCloud, Sliders, Cpu, SendHorizontal } from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      step: '01',
      icon: UploadCloud,
      title: 'Upload Your Resume Library',
      description:
        'Upload your specialized resumes. Apply2Hire parses technical competencies, years of experience, and summary points to build semantic matching vectors.',
    },
    {
      step: '02',
      icon: Sliders,
      title: 'Set Target Search Profiles',
      description:
        'Specify roles, keywords, location filters, and salary targets. The engine continuously aggregates fresh opportunities and filters out duplicate listings.',
    },
    {
      step: '03',
      icon: Cpu,
      title: 'Automated Match & Preparation',
      description:
        'For every candidate opening, Apply2Hire analyzes the job description, scores compatibility, and resolves the single highest-matching resume.',
    },
    {
      step: '04',
      icon: SendHorizontal,
      title: 'Supervised Dispatch & Tracking',
      description:
        'Forms are populated via your authentic browser session. Custom screener questions trigger the human review queue, and final status is recorded in real time.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-5">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>03 · APPLICATION PIPELINE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            How Apply2Hire works to{' '}
            <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
              get you hired
              <WavyUnderline />
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300">
            A transparent, deterministic four-step pipeline from discovery to confirmed application.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.1 }}
                className="relative rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-[#104e43]/40 dark:hover:border-emerald-700/50 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#104e43] dark:text-[#4fcfbc]">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
