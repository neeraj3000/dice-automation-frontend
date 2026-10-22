import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, Check, Loader2, MousePointer2, Send } from 'lucide-react';

const QUERY = 'Python backend engineer';

const JOBS = [
  { title: 'Senior Python Engineer', company: 'Stripe', location: 'Remote', match: 96 },
  { title: 'Backend Engineer, Platform', company: 'Datadog', location: 'New York, NY', match: 92 },
  { title: 'Staff Software Engineer', company: 'Airbnb', location: 'Remote', match: 89 },
  { title: 'Python Developer', company: 'Capital One', location: 'McLean, VA', match: 87 },
  { title: 'Backend Engineer', company: 'Ramp', location: 'Hybrid', match: 84 },
];

// How long each phase holds before advancing (ms)
const PHASE_DURATION = {
  clickSearch: 1100,
  searching: 1400,
  results: 1500,
  clickApply: 1100,
  done: 3400,
};

const EASE = [0.22, 1, 0.36, 1];

export default function HeroDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(shouldReduceMotion ? 'done' : 'typing');
  const [typed, setTyped] = useState(shouldReduceMotion ? QUERY : '');
  const [applied, setApplied] = useState(shouldReduceMotion ? JOBS.length : 0);
  const [cursor, setCursor] = useState({ x: 280, y: 360, visible: false, pressing: false });

  const frameRef = useRef(null);
  const searchBtnRef = useRef(null);
  const applyBtnRef = useRef(null);

  // Drive the demo timeline: type -> search -> results -> auto apply -> applied one by one -> loop
  useEffect(() => {
    if (shouldReduceMotion) return;
    let timer;
    if (phase === 'typing') {
      timer =
        typed.length < QUERY.length
          ? setTimeout(() => setTyped(QUERY.slice(0, typed.length + 1)), 55)
          : setTimeout(() => setPhase('clickSearch'), 300);
    } else if (phase === 'applying') {
      timer =
        applied < JOBS.length
          ? setTimeout(() => setApplied((n) => n + 1), 900)
          : setTimeout(() => setPhase('done'), 400);
    } else {
      const next = {
        clickSearch: 'searching',
        searching: 'results',
        results: 'clickApply',
        clickApply: 'applying',
      }[phase];
      timer = setTimeout(() => {
        if (next) {
          setPhase(next);
        } else {
          setTyped('');
          setApplied(0);
          setPhase('typing');
        }
      }, PHASE_DURATION[phase]);
    }
    return () => clearTimeout(timer);
  }, [phase, typed, applied, shouldReduceMotion]);

  // Move the fake cursor to whichever button is about to be clicked, then press it
  useEffect(() => {
    if (shouldReduceMotion) return;
    const target =
      phase === 'clickSearch' ? searchBtnRef.current : phase === 'clickApply' ? applyBtnRef.current : null;
    const timers = [];
    if (target && frameRef.current) {
      const frame = frameRef.current.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const x = rect.left - frame.left + rect.width * 0.55;
      const y = rect.top - frame.top + rect.height * 0.55;
      timers.push(setTimeout(() => setCursor({ x, y, visible: true, pressing: false }), 0));
      timers.push(setTimeout(() => setCursor((c) => ({ ...c, pressing: true })), 700));
      timers.push(setTimeout(() => setCursor((c) => ({ ...c, pressing: false })), 880));
    } else {
      timers.push(setTimeout(() => setCursor((c) => ({ ...c, visible: false, pressing: false })), 0));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, shouldReduceMotion]);

  const showResults = ['results', 'clickApply', 'applying', 'done'].includes(phase);
  const isApplying = phase === 'applying';
  const isDone = phase === 'done';
  const searchPressed = phase === 'clickSearch' && cursor.pressing;
  const applyPressed = phase === 'clickApply' && cursor.pressing;

  const statusText = {
    typing: 'Search Dice by keyword',
    clickSearch: 'Search Dice by keyword',
    searching: 'Scanning Dice listings…',
    results: `${JOBS.length} roles match your profile`,
    clickApply: `${JOBS.length} roles match your profile`,
    applying: 'Submitting with your tailored resume',
    done: `${JOBS.length} of ${JOBS.length} applications submitted`,
  }[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
      ref={frameRef}
      className="relative w-full max-w-[560px] mx-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-[0_1px_2px_rgba(16,24,20,0.05),0_32px_64px_-24px_rgba(16,78,67,0.28)] overflow-hidden text-stone-800 dark:text-stone-100"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-stone-200 dark:bg-stone-700" />
          <span className="size-2.5 rounded-full bg-stone-200 dark:bg-stone-700" />
          <span className="size-2.5 rounded-full bg-stone-200 dark:bg-stone-700" />
        </div>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">apply2hire · Dice session</span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 rounded-full bg-[#104e43] dark:bg-[#4fcfbc] opacity-60 animate-ping" />
            <span className="relative size-1.5 rounded-full bg-[#104e43] dark:bg-[#4fcfbc]" />
          </span>
          Live
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-700 px-3 py-2.5 min-w-0">
            <Search className="size-4 shrink-0 text-stone-400" />
            <span className="text-sm text-stone-800 dark:text-stone-100 truncate">
              {typed}
              {phase === 'typing' && (
                <span className="inline-block w-px h-4 align-middle ml-px bg-stone-800 dark:bg-stone-100 animate-pulse" />
              )}
            </span>
            <span className="ml-auto hidden sm:inline text-[11px] text-stone-400 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-0.5 shrink-0">
              Remote
            </span>
          </div>
          <motion.button
            ref={searchBtnRef}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            animate={{ scale: searchPressed ? 0.94 : 1 }}
            transition={{ duration: 0.12 }}
            className="rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium px-4 py-2.5 pointer-events-none"
          >
            Search
          </motion.button>
        </div>

        {/* Status line */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400"
            >
              {phase === 'searching' && <Loader2 className="size-3.5 animate-spin" />}
              {isDone && <Check className="size-3.5 text-[#104e43] dark:text-[#4fcfbc]" />}
              {statusText}
            </motion.span>
          </AnimatePresence>
          {(isApplying || isDone) && (
            <span className="font-mono text-stone-400">
              {applied}/{JOBS.length}
            </span>
          )}
        </div>

        {/* Apply progress */}
        <div className="mt-2 h-px bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <motion.div
            animate={{ width: `${(applied / JOBS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE }}
            className="h-full bg-[#104e43] dark:bg-[#4fcfbc]"
          />
        </div>

        {/* Job list */}
        <ul className="mt-1 h-[300px] sm:h-[310px]">
          {JOBS.map((job, i) => {
            const isApplied = i < applied;
            const isCurrent = isApplying && i === applied;
            return (
              <li key={job.title} className="h-[60px] sm:h-[62px] border-b border-stone-100 dark:border-stone-800 last:border-0">
                <AnimatePresence mode="wait">
                  {showResults ? (
                    <motion.div
                      key="row"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: phase === 'results' ? i * 0.09 : 0, ease: EASE }}
                      className={`h-full flex items-center gap-3 px-2 -mx-2 rounded-lg transition-colors duration-300 ${
                        isCurrent ? 'bg-stone-50 dark:bg-stone-800/50' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{job.title}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <span className="hidden sm:block font-mono text-xs text-stone-400 w-9 text-right">{job.match}%</span>
                      <div className="w-[84px] flex justify-end">
                        <AnimatePresence mode="wait">
                          {isApplied ? (
                            <motion.span
                              key="applied"
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="flex items-center gap-1 text-xs font-medium text-[#104e43] dark:text-[#4fcfbc]"
                            >
                              <Check className="size-3.5 stroke-[2.5]" /> Applied
                            </motion.span>
                          ) : isCurrent ? (
                            <motion.span
                              key="applying"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400"
                            >
                              <Loader2 className="size-3.5 animate-spin" /> Applying
                            </motion.span>
                          ) : (
                            <motion.span key="queued" exit={{ opacity: 0 }} className="text-xs text-stone-300 dark:text-stone-600">
                              Queued
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : phase === 'searching' ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      className="h-full flex flex-col justify-center gap-2"
                    >
                      <span className="h-2.5 w-2/5 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
                      <span className="h-2 w-1/4 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Footer action */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            {isDone ? 'Ready for your review in the dashboard' : 'Resume: Staff_Backend_Python.pdf'}
          </span>
          <motion.button
            ref={applyBtnRef}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            animate={{ scale: applyPressed ? 0.94 : 1, opacity: showResults ? 1 : 0.4 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#104e43] text-white text-sm font-medium px-4 py-2 pointer-events-none"
          >
            {isApplying ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Applying {Math.min(applied + 1, JOBS.length)} of {JOBS.length}
              </>
            ) : isDone ? (
              <>
                <Check className="size-3.5 stroke-[2.5]" /> All applied
              </>
            ) : (
              <>
                <Send className="size-3.5" /> Auto apply
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {isDone && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute left-1/2 -translate-x-1/2 bottom-20 whitespace-nowrap flex items-center gap-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium pl-2 pr-3.5 py-1.5 shadow-lg"
          >
            <span className="size-5 rounded-full bg-[#4fcfbc] text-[#0b3830] flex items-center justify-center">
              <Check className="size-3 stroke-[3]" />
            </span>
            {JOBS.length} applications submitted successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated cursor */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          x: cursor.x,
          y: cursor.y,
          opacity: cursor.visible ? 1 : 0,
          scale: cursor.pressing ? 0.85 : 1,
        }}
        transition={{
          x: { duration: 0.65, ease: EASE },
          y: { duration: 0.65, ease: EASE },
          opacity: { duration: 0.2 },
          scale: { duration: 0.1 },
        }}
        className="pointer-events-none absolute left-0 top-0 z-20"
      >
        <MousePointer2 className="size-5 fill-stone-900 text-white drop-shadow-md dark:fill-white dark:text-stone-900" />
      </motion.div>
    </motion.div>
  );
}
