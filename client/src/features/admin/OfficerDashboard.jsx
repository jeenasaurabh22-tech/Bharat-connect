import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, XCircle, Clock, RefreshCw,
  ChevronDown, ChevronUp, User, FileText, Calendar,
  Search, Loader2, Eye, MessageSquare, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
const getPendingApplications = () =>
  api.get('/applications', { params: { status: 'Submitted,Under Review,Action Required', limit: 20 } }).then((r) => r.data);
const updateStatus = ({ id, status, comment }) =>
  api.patch(`/applications/${id}/status`, { status, comment }).then((r) => r.data);
const statusConfig = {
  Submitted:      { color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30',    icon: Clock },
  'Under Review': { color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30',  icon: RefreshCw },
  Approved:       { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  Rejected:       { color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30',      icon: XCircle },
};
function ReviewModal({ app, onClose, onSubmit, isSubmitting }) {
  const [decision, setDecision] = useState('');
  const [comment, setComment] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 shadow-2xl p-6 space-y-5"
      >
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Review Application</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {app.scheme?.title} · {app.citizen?.name}
          </p>
        </div>
        {/* Submitted Documents */}
        {app.submittedDocuments?.length > 0 && (
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700 p-4">
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Submitted Documents
            </p>
            <div className="space-y-1">
              {app.submittedDocuments.map((doc, i) => {
                const liveStatus = doc.documentRef?.verifiedStatus || 'Pending';
                return (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100/50 dark:border-zinc-800/30 last:border-0">
                    <span className="text-zinc-600 dark:text-zinc-400">{doc.documentType}</span>
                    <span className={liveStatus === 'Verified'
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : liveStatus === 'Failed'
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-amber-600 dark:text-amber-400 font-semibold'
                    }>
                      {liveStatus === 'Verified' ? '✓ Approved' : liveStatus === 'Failed' ? '✗ Rejected' : 'Pending Verification'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Decision */}
        {(() => {
          const allDocumentsApproved = app.submittedDocuments?.every(
            (doc) => doc.documentRef?.verifiedStatus === 'Verified'
          );
          return (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Decision</label>
              <div className="grid grid-cols-3 gap-2">
                {['Under Review', 'Approved', 'Rejected'].map((s) => {
                  const isDisabled = s === 'Approved' && !allDocumentsApproved;
                  return (
                    <button
                      key={s}
                      disabled={isDisabled}
                      onClick={() => setDecision(s)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all
                        ${decision === s
                          ? s === 'Approved' ? 'bg-emerald-500 border-emerald-500 text-white'
                            : s === 'Rejected' ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-amber-500 border-amber-500 text-white'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                        }
                        ${isDisabled ? 'opacity-40 cursor-not-allowed hover:border-zinc-200' : ''}
                      `}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {!allDocumentsApproved && (
                <p className="text-[10px] text-amber-500 font-medium mt-2 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  All submitted documents must be approved/verified in the "Document Verification" portal before you can approve this application.
                </p>
              )}
            </div>
          );
        })()}
        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Officer Comment
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your review comments..."
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400
              focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 resize-none transition-all"
          />
        </div>
        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
              text-sm font-semibold text-zinc-600 dark:text-zinc-400
              hover:border-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ id: app._id, status: decision, comment })}
            disabled={!decision || isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-indigo-600
              hover:bg-indigo-500
              shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all
              flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Decision'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
// ── Application Row ───────────────────────────────────────────────────────────
function AppRow({ app, onReview }) {
  const cfg = statusConfig[app.status] || statusConfig.Submitted;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
          {app.scheme?.title || 'Scheme Application'}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
          <User className="w-3 h-3" /> {app.citizen?.name || 'Citizen'}
          <Calendar className="w-3 h-3 ml-1" />
          {new Date(app.createdAt).toLocaleDateString('en-IN')}
        </p>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
        <Icon className="w-3 h-3" /> {app.status}
      </span>
      <button
        onClick={() => onReview(app)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold
          bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400
          border border-indigo-200 dark:border-indigo-800
          hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex-shrink-0"
      >
        <Eye className="w-3.5 h-3.5" /> Review
      </button>
    </motion.div>
  );
}
// Officer Dashboard Component
export default function OfficerDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [reviewApp, setReviewApp] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['pendingApplications'],
    queryFn: getPendingApplications,
    staleTime: 1000 * 30,
  });
  const applications = data?.applications || [];
  const filtered = search
    ? applications.filter((a) =>
        a.scheme?.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.citizen?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : applications;
  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      toast.success('Application status updated!');
      setReviewApp(null);
      queryClient.invalidateQueries(['pendingApplications']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status.'),
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-500" /> Officer Dashboard
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Review and process citizen scheme applications
        </p>
      </motion.div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: applications.length, color: 'from-indigo-500 to-violet-600', icon: ClipboardList },
          { label: 'Submitted', value: applications.filter((a) => a.status === 'Submitted').length, color: 'from-blue-500 to-sky-600', icon: Clock },
          { label: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length, color: 'from-amber-500 to-orange-500', icon: RefreshCw },
          { label: 'Processed Today', value: 0, color: 'from-emerald-500 to-teal-600', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-4"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold text-zinc-900 dark:text-white">{isLoading ? '—' : value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          </motion.div>
        ))}
      </div>
      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Applications Queue</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300
                placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400 transition-all w-48"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">All caught up!</p>
            <p className="text-xs text-zinc-400 mt-1">No pending applications to review</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map((app) => (
              <AppRow key={app._id} app={app} onReview={setReviewApp} />
            ))}
          </div>
        )}
      </motion.div>
      {/* Review Modal */}
      {reviewApp && (
        <ReviewModal
          app={reviewApp}
          onClose={() => setReviewApp(null)}
          onSubmit={mutation.mutate}
          isSubmitting={mutation.isPending}
        />
      )}
    </div>
  );
}