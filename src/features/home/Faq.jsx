import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const faqs = [
    {
      q: 'What is Apply2Hire?',
      a: 'Apply2Hire is an automated career platform designed for professionals and consultants. It aggregates matching job postings, resolves the best resume from your private library, pre-fills employer application portals via your authenticated browser, and keeps you in command with real-time status tracking.',
    },
    {
      q: 'Does Apply2Hire submit applications without my oversight?',
      a: 'No. Apply2Hire includes a built-in Human-in-the-Loop Review Queue. Whenever an application presents novel or unmapped screener questions, the system pauses and alerts you to confirm your answer before submission. You also have the ability to review matched jobs before queuing.',
    },
    {
      q: 'Which job boards are currently supported?',
      a: 'Apply2Hire currently provides deep direct integration with Dice, running in authenticated browser sessions using host-local session storage. Additional tech board adapters are structured inside our modular board registry.',
    },
    {
      q: 'How does the platform pick which resume to submit?',
      a: 'When you upload resumes to your library, Apply2Hire analyzes the text, skills, and target seniority. When a job description is evaluated, our semantic matching engine calculates compatibility scores across all your resumes and selects the highest-scoring candidate CV.',
    },
    {
      q: 'Can I stop an application once it has started?',
      a: 'Yes. Any queued or active application can be cancelled immediately from the Applications dashboard. An atomic cancellation signal halts browser execution, releases the job, and updates your status logs instantaneously.',
    },
    {
      q: 'Is my resume and session data kept private?',
      a: 'Yes. Every user account operates in a strictly isolated tenant scope. Resume documents are encrypted in private Cloudinary storage, while Dice authentication sessions are managed locally on your host and never shared with other users or external third parties.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-5">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>05 · FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            Frequently asked{' '}
            <span className="relative inline-block italic text-[#104e43] dark:text-[#4fcfbc] font-bold pb-1">
              questions
              <WavyUnderline />
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300">
            Everything you need to know about automation, matching, and account control.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.q}
                className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-800/50 focus-visible:outline-2 focus-visible:outline-signal"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`grid size-8 place-items-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#e8efe9] text-[#104e43] dark:bg-emerald-950/60 dark:text-emerald-300' : ''
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
