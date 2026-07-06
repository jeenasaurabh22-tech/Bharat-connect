import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Clock, XCircle, RefreshCw,
  ChevronDown, ChevronUp, Calendar, User, Building2,
  ArrowRight, Search, Filter,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getMyApplications } from '../../services/application.service.js';
const statusConfig = {
  Submitted:      { icon: Clock,        color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30',    bar: '#3b82f6', step: 1 },
  'Under Review': { icon: RefreshCw,    color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30',  bar: '#f59e0b', step: 2 },
  Approved:       { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', bar: '#10b981', step: 4 },
  Rejected:       { icon: XCircle,      color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30',      bar: '#ef4444', step: 4 },
  Draft:          { icon: FileText,     color: 'text-zinc-600 dark:text-zinc-400',  bg: 'bg-zinc-100 dark:bg-zinc-800',     bar: '#94a3b8', step: 0 },
};
const TIMELINE_STEPS = ['Submitted', 'Under Review', 'Decision Pending', 'Approved / Rejected'];
function Timeline({ currentStatus }) {
  const currentStep = statusConfig[currentStatus]?.step || 0;
  const isRejected = currentStatus === 'Rejected';
  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE_STEPS.map((step, i) => {
        const isActive = i < currentStep;
        const isCurrent = i === currentStep - 1;
        const isLast = i === TIMELINE_STEPS.length - 1;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all text-[10px] font-bold
                ${isActive && !isRejected ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isCurrent && isRejected ? 'bg-red-500 border-red-500 text-white' :
                  isActive ? 'bg-emerald-500 border-emerald-500 text-white' :
                  'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600 text-zinc-400'
                }`}>
                {isActive ? '✓' : i + 1}
              </div>
              <p className={`text-[8px] mt-1 text-center leading-tight max-w-[52px]
                ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}`}>
                {step}
              </p>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-4 transition-all ${i < currentStep - 1 ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
function ApplicationCard({ app }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[app.status] || statusConfig.Draft;
  const Icon = cfg.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden"
    >
      {}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {app.scheme?.title || 'Government Scheme Application'}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Applied {new Date(app.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" /> {app.status}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-zinc-400" />
            : <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </div>
      </div>
      {}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 dark:border-zinc-800"
          >
            <div className="p-5 space-y-4">
              {}
              <Timeline currentStatus={app.status} />
              {/* Scheme Details */}
              {app.scheme && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700 p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">Category</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">
                      {app.scheme.category || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">Ministry</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-0.5 truncate">
                      {app.scheme.ministry || '—'}
                    </p>
                  </div>
                </div>
              )}
              {/* Status Timeline History */}
              {app.statusTimeline?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Status History</p>
                  <div className="space-y-2">
                    {app.statusTimeline.map((entry, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {entry.status}
                          </p>
                          {entry.comment && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">{entry.comment}</p>
                          )}
                          {entry.updatedAt && (
                            <p className="text-[10px] text-zinc-400">
                              {new Date(entry.updatedAt).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
        <p className="text-sm font-bold text-indigo-500">{payload[0].value} applications</p>
      </div>
    );
  }
  return null;
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function MyApplications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { data, isLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: getMyApplications,
    staleTime: 1000 * 60 * 2,
  });
  const applications = data?.applications || [];
  // Status counts for chart
  const chartData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count, fill: statusConfig[status]?.bar || '#94a3b8' }));
  // Filter
  const filtered = applications.filter((app) => {
    const matchSearch = search
      ? app.scheme?.title?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === 'All' ? true : app.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const statuses = ['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">My Applications</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Track the status of all your government scheme applications
        </p>
      </motion.div>
      {/* Stats + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 content-start">
          {[
            { label: 'Total Applied', value: applications.length, color: 'from-indigo-500 to-violet-600', icon: FileText },
            { label: 'Approved', value: applications.filter((a) => a.status === 'Approved').length, color: 'from-emerald-500 to-teal-600', icon: CheckCircle2 },
            { label: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length, color: 'from-amber-500 to-orange-500', icon: RefreshCw },
            { label: 'Rejected', value: applications.filter((a) => a.status === 'Rejected').length, color: 'from-red-500 to-rose-600', icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-4"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{isLoading ? '—' : value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5"
        >
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">Application Status Breakdown</p>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
              No application data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={40} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400
              focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border
                ${statusFilter === s
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
      {/* Application List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 animate-pulse flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">
            {search || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet'}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {search || statusFilter !== 'All' ? 'Try different filters' : 'Browse schemes and start applying'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard key={app._id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}