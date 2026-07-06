import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, FolderOpen, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Sparkles, Upload, Search, TrendingUp,
  ChevronRight, XCircle, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getMyApplications } from '../../services/application.service.js';
import { getMyDocuments } from '../../services/document.service.js';
import useAuthStore from '../../store/useAuthStore.js';
const up = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
});
const STATUS = {
  Submitted:     { label: 'Submitted',    dot: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/20'    },
  'Under Review': { label: 'In Review',   dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/20'  },
  Approved:      { label: 'Approved',     dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  Rejected:      { label: 'Rejected',     dot: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/20'      },
  Draft:         { label: 'Draft',        dot: 'bg-zinc-400',    text: 'text-zinc-500 dark:text-zinc-400',    bg: 'bg-zinc-50 dark:bg-zinc-900'       },
};
function StatusPill({ status }) {
  const cfg = STATUS[status] || STATUS.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.text} ${cfg.bg} border border-current/10`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
function StatCard({ icon: Icon, label, value, accent, delay }) {
  return (
    <motion.div {...up(delay)} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{value ?? '—'}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
function Action({ to, icon: Icon, label, sub, dot }) {
  return (
    <Link to={to}>
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-150 group cursor-pointer">
        <div className={`w-8 h-8 rounded-lg ${dot} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">{label}</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{sub}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <p className="text-[11px] text-zinc-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-indigo-500">{payload[0].value} applications</p>
    </div>
  );
}
/* ── main ────────────────────────────────────────────────────────── */
export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: getMyApplications,
    staleTime: 120_000,
  });
  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: getMyDocuments,
    staleTime: 120_000,
  });
  const applications = appsData?.applications || [];
  const documents    = docsData?.documents    || [];
  const stats = useMemo(() => ({
    total:     applications.length,
    approved:  applications.filter(a => a.status === 'Approved').length,
    pending:   applications.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length,
    documents: documents.length,
    verified:  documents.filter(d => d.verifiedStatus === 'Verified').length,
  }), [applications, documents]);
  const chartData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const counts = Array(12).fill(0);
    applications.forEach(a => counts[new Date(a.createdAt).getMonth()]++);
    const now = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const idx = (now - 5 + i + 12) % 12;
      return { month: months[idx], count: counts[idx] };
    });
  }, [applications]);
  const recent = applications.slice(0, 5);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Greeting */}
      <motion.div {...up(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            Here's what's happening with your account
          </p>
        </div>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all duration-200 active:scale-[0.98]"
        >
          <Search className="w-4 h-4" /> Find schemes
        </Link>
      </motion.div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0.05} icon={FileText}     label="Applications"   value={appsLoading ? '…' : stats.total}     accent="bg-indigo-600" />
        <StatCard delay={0.1}  icon={CheckCircle2} label="Approved"       value={appsLoading ? '…' : stats.approved}  accent="bg-emerald-600" />
        <StatCard delay={0.15} icon={Clock}        label="In progress"    value={appsLoading ? '…' : stats.pending}   accent="bg-amber-500" />
        <StatCard delay={0.2}  icon={FolderOpen}   label="Documents"      value={docsLoading ? '…' : stats.documents} accent="bg-violet-600" />
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {}
        <motion.div {...up(0.25)} className="lg:col-span-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Application activity</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Last 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#fill)"
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        {}
        <motion.div {...up(0.3)} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-2">Quick actions</h2>
          <Action to="/schemes"        icon={Search}   label="Find schemes"       sub="500+ central & state schemes"    dot="bg-indigo-600" />
          <Action to="/documents"      icon={Upload}   label="Upload document"    sub="Aadhaar, PAN, certificates"      dot="bg-sky-600" />
          <Action to="/ai-eligibility" icon={Sparkles} label="Ask the assistant"  sub="Check eligibility in plain language" dot="bg-violet-600" />
          <Action to="/applications"   icon={FileText} label="My applications"    sub="Track all submissions"           dot="bg-amber-500" />
        </motion.div>
      </div>
      {/* Recent Applications */}
      <motion.div {...up(0.35)} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Recent applications</h2>
          <Link to="/applications" className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {appsLoading ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  <div className="h-2.5 w-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-full" />
                </div>
                <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
              <FileText className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">No applications yet</p>
            <Link to="/schemes" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors">
              <Search className="w-3.5 h-3.5" /> Browse schemes
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
            {recent.map((app, i) => (
              <motion.div key={app._id} {...up(i * 0.04)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                    {app.scheme?.title || 'Scheme Application'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <StatusPill status={app.status} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      {/* Document health */}
      {!docsLoading && documents.length > 0 && (
        <motion.div {...up(0.4)} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Document status</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">{stats.verified} of {stats.documents} verified</p>
            </div>
            <Link to="/documents" className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4">
            {documents.slice(0, 6).map((doc) => {
              const ok  = doc.verifiedStatus === 'Verified';
              const pnd = doc.verifiedStatus === 'Pending';
              return (
                <div key={doc._id} className={`rounded-xl p-3 border text-center ${
                  ok  ? 'border-emerald-100 bg-emerald-50/60 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                  : pnd ? 'border-amber-100 bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-900/30'
                  : 'border-zinc-100 bg-zinc-50 dark:bg-zinc-800/40 dark:border-zinc-800'
                }`}>
                  <div className="flex justify-center mb-1.5">
                    {ok  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : pnd ? <Clock className="w-4 h-4 text-amber-500" />
                    : <AlertCircle className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 leading-tight">{doc.documentType}</p>
                  <p className={`text-[9px] mt-0.5 font-bold uppercase tracking-wide ${ok ? 'text-emerald-600' : pnd ? 'text-amber-600' : 'text-zinc-400'}`}>
                    {doc.verifiedStatus}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}