import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, XCircle, Eye, FileText, User,
  CheckCircle2, Clock, Loader2, Search, Filter,
  Calendar, FileScan, AlertCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
const getAllDocuments = (filter) =>
  api.get('/documents/all', { params: filter }).then((r) => r.data);
const verifyDocument = ({ id, status, note }) =>
  api.patch(`/documents/${id}/verify`, { status, note }).then((r) => r.data);
const statusCfg = {
  Verified: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  Pending:  { icon: Clock,        color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  Failed:   { icon: XCircle,      color: 'text-red-600 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};
function VerifyModal({ doc, onClose, onSubmit, isSubmitting }) {
  const [decision, setDecision] = useState(doc.verifiedStatus === 'Pending' ? '' : doc.verifiedStatus);
  const [note, setNote] = useState(doc.officerNote || '');
  const parsedFields = doc.ocrMetadata?.parsedFields
    ? Object.entries(
        doc.ocrMetadata.parsedFields instanceof Map
          ? Object.fromEntries(doc.ocrMetadata.parsedFields)
          : doc.ocrMetadata.parsedFields
      ).filter(([, v]) => v && typeof v === 'string')
    : [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 shadow-2xl overflow-hidden"
      >
        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Verify Document</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{doc.documentType} · {doc.citizen?.name || 'Citizen'}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {}
          {doc.cloudinaryUrl && (
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
              {doc.cloudinaryUrl.endsWith('.pdf') ? (
                <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-4 text-sm text-indigo-500 font-medium hover:text-indigo-600">
                  <FileText className="w-5 h-5" /> Open PDF Document
                </a>
              ) : (
                <img src={doc.cloudinaryUrl} alt={doc.documentType}
                  className="w-full max-h-48 object-contain p-2" />
              )}
            </div>
          )}
          {}
          {parsedFields.length > 0 && (
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700 p-4">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <FileScan className="w-3.5 h-3.5" /> OCR Extracted Data
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {parsedFields.map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-slate-700/40 rounded-lg p-2.5">
                    <p className="text-[9px] text-zinc-400 uppercase font-semibold">{key.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${doc.ocrMetadata?.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${doc.ocrMetadata?.confidence || 0}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{doc.ocrMetadata?.confidence || 0}% OCR confidence</span>
              </div>
            </div>
          )}
          {/* Citizen Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{doc.citizen?.name || '—'}</p>
              <p className="text-xs text-zinc-400">{doc.citizen?.email || '—'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-zinc-400">Uploaded</p>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {new Date(doc.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
          {/* Decision */}
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Officer Decision</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDecision('Verified')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                  ${decision === 'Verified'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400 hover:text-emerald-600'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => setDecision('Failed')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                  ${decision === 'Failed'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-red-400 hover:text-red-600'
                  }`}
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Officer Note <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Document is clear and matches eligibility criteria..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100
                placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400
                focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 resize-none transition-all"
            />
          </div>
        </div>
        {/* Footer Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:border-slate-300 transition-all">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ id: doc._id, status: decision, note })}
            disabled={!decision || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-indigo-600 hover:bg-indigo-500
              shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><ShieldCheck className="w-4 h-4" /> Submit Decision</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
// ── Document Row ──────────────────────────────────────────────────────────────
function DocRow({ doc, onVerify }) {
  const cfg = statusCfg[doc.verifiedStatus] || statusCfg.Pending;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
    >
      {/* Doc icon */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{doc.documentType}</p>
        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
          <User className="w-3 h-3" /> {doc.citizen?.name || 'Unknown citizen'}
          <Calendar className="w-3 h-3 ml-1" />
          {new Date(doc.createdAt).toLocaleDateString('en-IN')}
        </p>
      </div>
      {/* OCR Confidence */}
      {doc.ocrMetadata?.confidence > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
          <FileScan className="w-3.5 h-3.5" />
          {doc.ocrMetadata.confidence}%
        </div>
      )}
      {/* Status */}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
        <Icon className="w-3 h-3" /> {doc.verifiedStatus}
      </span>
      {/* Action */}
      <button
        onClick={() => onVerify(doc)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0
          bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400
          border border-indigo-200 dark:border-indigo-800
          hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
      >
        <Eye className="w-3.5 h-3.5" /> Review
      </button>
    </motion.div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function DocumentVerification() {
  const queryClient = useQueryClient();
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allDocuments', statusFilter],
    queryFn: () => getAllDocuments({ status: statusFilter === 'All' ? undefined : statusFilter }),
    staleTime: 1000 * 30,
  });
  const documents = data?.documents || [];
  const filtered = search
    ? documents.filter((d) =>
        d.documentType?.toLowerCase().includes(search.toLowerCase()) ||
        d.citizen?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : documents;
  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.verifiedStatus === 'Pending').length,
    verified: documents.filter((d) => d.verifiedStatus === 'Verified').length,
    failed: documents.filter((d) => d.verifiedStatus === 'Failed').length,
  };
  const mutation = useMutation({
    mutationFn: verifyDocument,
    onSuccess: (_, vars) => {
      toast.success(`Document ${vars.status === 'Verified' ? 'approved ✅' : 'rejected ❌'}`);
      setVerifyDoc(null);
      queryClient.invalidateQueries(['allDocuments']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update document.'),
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" /> Document Verification
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Review OCR-scanned citizen documents and approve or reject them
        </p>
      </motion.div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: stats.total,    color: 'from-indigo-500 to-violet-600', icon: FileText },
          { label: 'Pending Review',  value: stats.pending,  color: 'from-amber-500 to-orange-500',  icon: Clock },
          { label: 'Verified',        value: stats.verified, color: 'from-emerald-500 to-teal-600',  icon: CheckCircle2 },
          { label: 'Rejected',        value: stats.failed,   color: 'from-red-500 to-rose-600',      icon: XCircle },
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
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input type="text" placeholder="Search by document type or citizen name..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300
                placeholder:text-zinc-400 focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {['All', 'Pending', 'Verified', 'Failed'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                  ${statusFilter === s
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                  }`}>
                {s}
              </button>
            ))}
            <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Rows */}
        {isLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {search || statusFilter !== 'All' ? 'No matching documents' : 'No documents uploaded yet'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Citizens need to upload documents first</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.map((doc) => (
              <DocRow key={doc._id} doc={doc} onVerify={setVerifyDoc} />
            ))}
          </div>
        )}
      </motion.div>
      {/* Verify Modal */}
      <AnimatePresence>
        {verifyDoc && (
          <VerifyModal
            doc={verifyDoc}
            onClose={() => setVerifyDoc(null)}
            onSubmit={mutation.mutate}
            isSubmitting={mutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}