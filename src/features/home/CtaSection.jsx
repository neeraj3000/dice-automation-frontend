import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import WavyUnderline from './WavyUnderline';

export default function CtaSection() {
  const shouldReduceMotion = useReducedMotion();

  const GRID_STYLE = {
    backgroundImage:
      'linear-gradient(rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
    maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)',
  };

  return (
    <section className="py-12 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] bg-[#104e43] px-8 py-10 sm:px-14 sm:py-12 text-center text-white shadow-xl"
        >
          {/* Subtle grid background and ambient glow */}
          <div className="pointer-events-none absolute inset-0" style={GRID_STYLE} />
          <div className="pointer-events-none absolute -top-24 -left-24 size-[300px] rounded-full bg-[#166557]/60 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 size-[300px] rounded-full bg-[#61ebd7]/20 blur-[90px]" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-mono font-medium uppercase tracking-wider text-[#61ebd7] mb-4">
              <Sparkles className="size-3.5" />
              <span>Accelerate Your Search</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-tight">
              Spend your time on{' '}
              <span className="relative inline-block italic text-[#61ebd7] font-bold pb-0.5">
                interviews
                <WavyUnderline className="text-[#61ebd7]" />
              </span>
              , not applications.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl mx-auto">
              Automate multi-step applications, preserve customized screener control, and keep your full candidate history organized in one workspace.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#61ebd7] px-7 py-3 text-sm sm:text-base font-semibold text-[#0a3632] shadow-sm hover:bg-[#86f0e0] transition-all duration-150 ease-out hover:-translate-y-0.5"
              >
                <span>Get Started with Apply2Hire</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm sm:text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                <span>Sign In to Account</span>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5 sm:gap-8 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#61ebd7]" />
                100% Private Resume Library
              </span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Instant setup</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
