import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WavyUnderline from './WavyUnderline';
import HeroDemo from './HeroDemo';

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

          {/* Right Column: Animated product preview (search -> scrape -> auto apply) */}
          <div className="lg:col-span-7 relative pt-4 lg:pt-0">
            <HeroDemo />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
