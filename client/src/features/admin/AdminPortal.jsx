import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart2, Users, FileText, CheckCircle2, XCircle,
  Clock, TrendingUp, ShieldAlert, Activity, RefreshCw,
  Search, Download,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import api from '../../services/api.js';
const getAnalytics = () => api.get('/admin/analytics').then((r) => r.data);
const getAuditLogs = () => api.get('/admin/audit-logs?limit=20').then((r) => r.data);
function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value ?? '—'}</p>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </motion.div>
  );
}
function ChartTip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-xs">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">{label}</p>
        <p className="text-indigo-500 font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}
// ── Audit Log Row ─────────────────────────────────────────────────────────────
const actionColors = {
  USER_REGISTER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  USER_LOGIN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  USER_LOGOUT: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  DOCUMENT_UPLOAD: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  APPLICATION_SUBMIT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  APPLICATION_STATUS_UPDATE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  SCHEME_CREATE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};
function AuditRow({ log }) {
  const badgeClass = actionColors[log.action] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
      <div className="flex-shrink-0">
        <Activity className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
          {log.actor?.name || 'System'} · <span className="text-zinc-400 font-normal">{log.ipAddress}</span>
        </p>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {new Date(log.createdAt).toLocaleString('en-IN')}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass}`}>
        {log.action.replace(/_/g, ' ')}
      </span>
    </div>
  );
}
// ── Pie Colors ────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];
// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: getAnalytics,
    staleTime: 1000 * 60 * 5,
  });
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: getAuditLogs,
    enabled: activeTab === 'audit',
    staleTime: 1000 * 60,
  });
  const stats = analytics?.stats || {};
  const schemeStats = analytics?.schemeStats || [];
  const statusDist = analytics?.applicationsByStatus || [];
  const auditLogs = auditData?.logs || [];
  // Prepare pie data
  const pieData = statusDist.map((s, i) => ({
    name: s._id || 'Unknown',
    value: s.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));
  // Prepare bar data for top schemes
  const schemeBarData = schemeStats.slice(0, 6).map((s) => ({
    name: s.title?.slice(0, 18) + (s.title?.length > 18 ? '...' : ''),
    applications: s.applicationCount || 0,
  }));
  const TABS = ['overview', 'audit'];
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" /> Admin Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            System-wide analytics, audit logs, and platform management
          </p>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-slate-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"         value={stats.totalUsers}        icon={Users}        gradient="from-indigo-500 to-violet-600" sub="Registered citizens" />
            <StatCard label="Total Applications"  value={stats.totalApplications} icon={FileText}     gradient="from-sky-500 to-blue-600"      sub="All time" />
            <StatCard label="Approved"            value={stats.approvedApps}      icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"  sub="Successfully processed" />
            <StatCard label="Total Schemes"       value={stats.totalSchemes}      icon={BarChart2}    gradient="from-amber-500 to-orange-500"  sub="Active programs" />
          </div>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Distribution (Pie) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-6"
            >
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
                Application Status Distribution
              </h2>
              {analyticsLoading ? (
                <div className="h-44 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : pieData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-zinc-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={3} dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
            {/* Top Schemes by Applications (Bar) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-6"
            >
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
                Top Schemes by Applications
              </h2>
              {analyticsLoading ? (
                <div className="h-44 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : schemeBarData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-zinc-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={schemeBarData} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="applications" radius={[6, 6, 0, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </>
      )}
      {activeTab === 'audit' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> System Audit Logs
            </h2>
            <span className="text-xs text-zinc-400">Last 20 events</span>
          </div>
          {auditLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                  <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-zinc-400">
              No audit logs found
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {auditLogs.map((log) => (
                <AuditRow key={log._id} log={log} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}