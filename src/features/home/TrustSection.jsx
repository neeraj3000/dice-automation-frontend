import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  UserCheck,
  StopCircle,
  Lock,
  Eye,
  Database,
  CheckCircle2,
  AlertCircle,
  Server,
  Terminal,
  Key,
  FileCheck2,
} from 'lucide-react';

export default function TrustSection() {
  const shouldReduceMotion = useReducedMotion();
  const [activeGateId, setActiveGateId] = useState('gate-3'); // Default to human checkpoint

  const architectureGates = [
    {
      id: 'gate-1',
      step: '01',
      title: 'Authenticated Tenant Boundary',
      category: 'Data Isolation',
      icon: Lock,
      status: 'Enforced at API Gateway',
      summary:
        'Every resume, search profile, and application record is strictly parameterized by authenticated user ID. Cross-tenant queries are architecturally blocked in MongoDB.',
      detail:
        'JWT tokens cryptographically sign user identity. All backend database operations strictly inject user_id from the verified authentication dependency, ensuring tenant data separation.',
      metric: 'User ID Scoped Isolation',
    },
    {
      id: 'gate-2',
      step: '02',
      title: 'Local Session & Token Isolation',
      category: 'Credential Security',
      icon: Key,
      status: 'Restricted to Host Session',
      summary:
        'Job board session cookies are transferred securely from your Chrome extension to your isolated local session profile. Cookies are never pooled or exported across accounts.',
      detail:
        'The Dice Chrome Extension pairs directly with your authenticated instance. Session tokens remain bound to your browser profile, preventing unauthorized cookie sharing or third-party leakage.',
      metric: 'Local Session Scope',
    },
    {
      id: 'gate-3',
      step: '03',
      title: 'Review Queue & Atomic Stop Control',
      category: 'Human Supervision',
      icon: StopCircle,
      status: 'Interactive Human-in-the-Loop',
      summary:
        'Novel screener questions pause the execution pipeline for explicit approval. You can halt any active or queued application instantly with a single click.',
      detail:
        'If an employer form presents unpredicted questions (e.g. salary, clearance, sponsorship), the worker transitions to REVIEW_REQUIRED. The /stop endpoint immediately terminates browser Playwright processes.',
      metric: '1-Click Immediate Halt',
    },
    {
      id: 'gate-4',
      step: '04',
      title: 'Deduplication Shield & Audit Trail',
      category: 'Operational Guardrails',
      icon: Terminal,
      status: 'Compound Key Mutex',
      summary:
        'Built-in compound unique constraints prohibit submitting twice to the same job ID. Every dispatch state transition is written to an immutable audit log.',
      detail:
        'Applications are indexed by (user_id, job_id). Time-bound worker leases allow safe background crash recovery, while millisecond timestamps record exactly which resume was attached and the portal outcome.',
      metric: 'Zero Double-Submissions',
    },
  ];

  const activeGate = architectureGates.find((g) => g.id === activeGateId) || architectureGates[2];

  return (
    <section id="trust" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d3e2d6] dark:border-emerald-800/60 bg-[#e8efe9] dark:bg-emerald-950/40 px-4 py-1.5 text-xs font-mono font-medium tracking-wider uppercase text-[#104e43] dark:text-emerald-300 shadow-xs mb-4">
            <span className="size-1.5 rounded-full bg-[#104e43] dark:bg-emerald-300 animate-pulse" />
            <span>04 · PLATFORM TRUST & CONTROL</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#161a18] dark:text-[#edf2f0] leading-tight">
            Architected for total user control{' '}
            <span className="italic text-[#104e43] dark:text-[#4fcfbc] font-bold">
              and verifiable privacy
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Career automation demands absolute accountability. Apply2Hire provides verified tenant isolation, 1-click execution halt, and complete audit logging so you always remain in command.
          </p>
        </div>

        {/* Central Trust Architecture Canvas (Warm Creme Technical Blueprint) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl bg-[#faf6ee] dark:bg-[#121614] text-[#161a18] dark:text-[#edf2f0] border border-[#e6dfd1] dark:border-stone-800 shadow-md p-6 sm:p-10 lg:p-12 relative overflow-hidden"
        >
          {/* Subtle Technical Blueprint Grid Texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(16, 78, 67, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 78, 67, 0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#104e43]/5 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Bar of Architecture Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e5dfd2] dark:border-stone-800">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#e8efe9] dark:bg-emerald-950/60 border border-[#d3e2d6] dark:border-emerald-800/60 text-[#104e43] dark:text-emerald-300">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Verified Execution & Security Gates
                  </h3>
                  <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    4 Deterministic Boundary Safeguards
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#104e43] dark:bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#104e43] dark:text-emerald-400 font-semibold">
                  Continuous Guardrails Active
                </span>
              </div>
            </div>

            {/* 4 Interactive Security Gates Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
              {architectureGates.map((gate) => {
                const Icon = gate.icon;
                const isActive = activeGateId === gate.id;

                return (
                  <button
                    key={gate.id}
                    type="button"
                    onClick={() => setActiveGateId(gate.id)}
                    className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                      isActive
                        ? 'bg-white dark:bg-stone-900 border-[#104e43] dark:border-emerald-500 shadow-sm ring-2 ring-[#104e43]/15'
                        : 'bg-white/70 dark:bg-stone-900/40 border-[#e5dfd2] dark:border-stone-800 hover:bg-white dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-[#104e43] dark:text-emerald-400 font-bold">
                        GATE {gate.step}
                      </span>
                      <Icon className="size-4 text-[#104e43] dark:text-emerald-400" />
                    </div>

                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                      {gate.title}
                    </div>
                    <div className="mt-1 text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {gate.category}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f0ebd9] dark:border-stone-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#104e43] dark:text-emerald-400 font-semibold">{gate.metric}</span>
                      <span className={isActive ? 'text-stone-900 dark:text-white font-bold' : 'text-stone-400'}>
                        {isActive ? '● Selected' : 'Inspect'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Gate Deep-Dive Inspector Panel */}
            <div className="rounded-2xl border border-[#e5dfd2] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-7 relative shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#f0ebd9] dark:border-stone-800">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#104e43] dark:text-emerald-400 font-bold">
                    Active Architecture Inspector · Gate {activeGate.step}
                  </span>
                  <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {activeGate.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#e8efe9] dark:bg-emerald-950/60 text-[#104e43] dark:text-emerald-300 border border-[#d3e2d6] dark:border-emerald-800/60 font-semibold">
                    Status: {activeGate.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#104e43] dark:text-emerald-400 font-semibold mb-1">
                    System Safeguard:
                  </div>
                  <p>{activeGate.summary}</p>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#104e43] dark:text-emerald-400 font-semibold mb-1">
                    Verified Implementation:
                  </div>
                  <p>{activeGate.detail}</p>
                </div>
              </div>
            </div>

            {/* 3 Structured Trust Pillars (Separated by fine architectural dividers, not white cards!) */}
            <div className="mt-10 pt-8 border-t border-[#e5dfd2] dark:border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: User Control */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm tracking-tight">
                  <UserCheck className="size-4 text-[#104e43] dark:text-emerald-400" />
                  <span>Absolute User Control</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>1-Click Atomic Stop:</strong> Halt active browser automation immediately with a single click.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Review Queue:</strong> Ambiguous questions require explicit confirmation before submission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Resume Override:</strong> Manually re-assign preferred CV anytime before dispatch.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2: Data & Session Isolation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm tracking-tight">
                  <Lock className="size-4 text-[#104e43] dark:text-emerald-400" />
                  <span>Cryptographic Data Scoping</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Multi-Tenant Database:</strong> All collections strictly filtered by authenticated user ID.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Local Session Cookies:</strong> Dice session tokens stored locally; never pooled across users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Native DOM Automation:</strong> Real browser contexts prevent bot flags and captcha lockouts.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Operational Accountability */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm tracking-tight">
                  <Terminal className="size-4 text-[#104e43] dark:text-emerald-400" />
                  <span>Operational Accountability</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Duplicate Shield:</strong> Compound unique keys prevent re-applying to the same job posting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Worker Leases:</strong> Background worker crash recovery without re-firing applications.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#104e43] dark:text-emerald-400 font-mono mt-0.5 font-bold">✓</span>
                    <span><strong>Timestamped Audit Logs:</strong> Full record of attached CVs, portal responses, and outcomes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
