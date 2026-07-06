import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, FileCheck2, Bot, ShieldCheck,
  Users, Search, Zap, ChevronRight, CheckCircle2,
} from 'lucide-react';
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});
function MockSchemeCard({ title, tag, score, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] w-64"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">{title}</p>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
          {tag}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: delay + 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>
        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">{score}%</span>
      </div>
      <p className="text-[10px] text-zinc-400 mt-1.5">Eligibility match</p>
    </motion.div>
  );
}
/* ── hero floating badge ───────────────────────────────────────────── */
function FloatingBadge({ icon: Icon, text, delay, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] text-xs font-semibold text-zinc-700 dark:text-zinc-200 ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-indigo-500" />
      {text}
    </motion.div>
  );
}
/* ── stat number ───────────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{label}</span>
    </div>
  );
}
/* ── feature row (alternating) ─────────────────────────────────────── */
function FeatureRow({ icon: Icon, eyebrow, title, desc, bullets, reverse, accent, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}
    >
      {/* Visual side */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`w-full max-w-sm aspect-[4/3] rounded-3xl flex items-center justify-center border ${accent.border} ${accent.bg}`}>
          <Icon className={`w-16 h-16 ${accent.icon} opacity-80`} strokeWidth={1} />
        </div>
      </div>
      {/* Text side */}
      <div className="flex-1 flex flex-col gap-5">
        <span className={`text-xs font-bold uppercase tracking-[0.12em] ${accent.eyebrow}`}>
          {eyebrow}
        </span>
        <h3 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm lg:text-base">
          {desc}
        </p>
        <ul className="flex flex-col gap-2.5 mt-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${accent.check}`} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
/* ── main component ────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="w-full flex flex-col">
      {/* ══ HERO ══ */}
      <section className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet-500/4 dark:bg-violet-500/6 rounded-full blur-[100px]" />
        </div>
        {/* Left: copy */}
        <div className="relative flex-1 flex flex-col gap-7 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
          >
            <Sparkles className="w-3 h-3" />
            Now live — BharatConnect AI
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-[-0.03em] leading-[1.1]"
          >
            Find the schemes{' '}
            <span className="bg-gradient-to-r from-orange-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              built for you.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base lg:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl"
          >
            Upload your documents once. BharatConnect reads your profile,
            checks 500+ central and state schemes, and tells you exactly
            what you qualify for — in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/register">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_14px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] transition-all duration-200 active:scale-[0.98]">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/login">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]">
                Sign in
              </button>
            </Link>
          </motion.div>
          {/* Proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2"
          >
            {[
              'Free for all citizens',
              'No credit card',
              '500+ schemes covered',
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
        {/* Right: floating UI */}
        <div className="relative flex-1 flex justify-center lg:justify-end items-center min-h-[320px]">
          <div className="relative">
            <MockSchemeCard title="PM Kisan Samman Nidhi" tag="Agriculture" score={92} delay={0.5} />
            <div className="absolute -right-10 top-28 z-10">
              <MockSchemeCard title="Ayushman Bharat PM-JAY" tag="Healthcare" score={78} delay={0.7} />
            </div>
            <div className="absolute -left-6 -bottom-6 z-20">
              <FloatingBadge icon={Bot} text="AI matched 8 schemes" delay={0.9} />
            </div>
            <div className="absolute right-4 -top-8 z-20">
              <FloatingBadge icon={ShieldCheck} text="Documents verified" delay={1.0} />
            </div>
          </div>
        </div>
      </section>
      {/* ══ STATS STRIP ══ */}
      <motion.section
        {...fadeIn(0.1)}
        className="border-y border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="500+" label="Government schemes" />
          <Stat value="28" label="States covered" />
          <Stat value="< 3s" label="Eligibility check" />
          <Stat value="99.9%" label="Uptime" />
        </div>
      </motion.section>
      {/* ══ FEATURES ══ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32 flex flex-col gap-24 lg:gap-36">
        <FeatureRow
          icon={Search}
          eyebrow="Scheme Discovery"
          title="Stop guessing. Start knowing."
          desc="Type what you need in plain language. Our search understands context — 'help for my farm', 'loan to start a shop', 'daughter's education support' — and surfaces the most relevant schemes instantly."
          bullets={[
            'Natural language search across 500+ schemes',
            'Filter by state, income, age, and caste category',
            'Ranked by your personal eligibility score',
          ]}
          accent={{
            bg: 'bg-indigo-50/40 dark:bg-indigo-950/10',
            border: 'border-indigo-100 dark:border-indigo-900/30',
            icon: 'text-indigo-400',
            eyebrow: 'text-indigo-600 dark:text-indigo-400',
            check: 'text-indigo-500',
          }}
          delay={0}
        />
        <FeatureRow
          icon={FileCheck2}
          eyebrow="Document Vault"
          title="Upload once. Use everywhere."
          desc="Drag in your Aadhaar, PAN, income certificate, or caste document. We extract the key fields automatically, check them against scheme requirements, and tell you what's missing."
          bullets={[
            'Automatic OCR extracts fields from uploaded documents',
            'Officers verify documents directly in the portal',
            'Secure, encrypted storage — only you control access',
          ]}
          reverse
          accent={{
            bg: 'bg-orange-50/40 dark:bg-orange-950/10',
            border: 'border-orange-100 dark:border-orange-900/30',
            icon: 'text-orange-400',
            eyebrow: 'text-orange-600 dark:text-orange-400',
            check: 'text-orange-500',
          }}
          delay={0.05}
        />
        <FeatureRow
          icon={Bot}
          eyebrow="AI Assistant"
          title="Ask anything about your eligibility."
          desc="Chat directly with an AI assistant that knows your uploaded documents, your profile, and the full scheme catalogue. Get clear, personalised answers instead of dense government PDFs."
          bullets={[
            'Reads your profile and documents before answering',
            'Explains eligibility criteria in plain language',
            'Tells you exactly which documents are still missing',
          ]}
          accent={{
            bg: 'bg-violet-50/40 dark:bg-violet-950/10',
            border: 'border-violet-100 dark:border-violet-900/30',
            icon: 'text-violet-400',
            eyebrow: 'text-violet-600 dark:text-violet-400',
            check: 'text-violet-500',
          }}
          delay={0}
        />
      </section>
      {/* ══ ROLE CARDS ══ */}
      <section className="bg-zinc-50/60 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24 flex flex-col items-center gap-12">
          <motion.div {...fadeUp()} className="text-center flex flex-col gap-3 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">Who uses BharatConnect</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Built for citizens, officers, and administrators.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {[
              {
                role: 'Citizen',
                emoji: '🧑‍🌾',
                desc: 'Discover schemes, upload documents, and track your applications — all in one place.',
                accent: 'border-indigo-200/60 dark:border-indigo-900/40 hover:border-indigo-400/50 dark:hover:border-indigo-700/60',
                tag: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
              },
              {
                role: 'Field Officer',
                emoji: '🏛️',
                desc: 'Review citizen document requests, verify uploads, and manage state-level approvals efficiently.',
                accent: 'border-orange-200/60 dark:border-orange-900/40 hover:border-orange-400/50 dark:hover:border-orange-700/60',
                tag: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
              },
              {
                role: 'Administrator',
                emoji: '⚙️',
                desc: 'Manage the full scheme catalogue, monitor platform usage, and oversee officer activity.',
                accent: 'border-violet-200/60 dark:border-violet-900/40 hover:border-violet-400/50 dark:hover:border-violet-700/60',
                tag: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
              },
            ].map(({ role, emoji, desc, accent, tag }, i) => (
              <motion.div
                key={role}
                {...fadeUp(i * 0.08)}
                className={`flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border transition-all duration-300 ${accent}`}
              >
                <span className="text-3xl">{emoji}</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{role}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tag}`}>
                    Role
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mt-auto group"
                >
                  Get started <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ══ CTA ══ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <motion.div
          {...fadeUp()}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-10 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
          {/* Glow orbs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex flex-col gap-3 max-w-lg">
            <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Your benefits are waiting.
              <br />
              It takes two minutes.
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Create an account, complete your profile, and let BharatConnect do the rest.
              No paperwork. No queues. No guesswork.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/register">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-indigo-700 bg-white hover:bg-indigo-50 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-[0.98]">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/login">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/25 hover:bg-white/10 transition-all duration-200 active:scale-[0.98]">
                Sign in
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}