import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Trash2, CheckCircle2, Clock, AlertCircle,
  Eye, Loader2, ShieldCheck, XCircle, CloudUpload, FileScan,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyDocuments, uploadDocument, deleteDocument } from '../../services/document.service.js';
const DOCUMENT_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Voter ID',
  'Driving Licence',
  'Passport',
  'Income Certificate',
  'Caste Certificate',
  'Domicile Certificate',
  'Birth Certificate',
  'Death Certificate',
  'Marriage Certificate',
  'Disability Certificate',
  'Land Holding Documents',
  'Bank Passbook',
  'Ration Card',
  'Education Certificate',
  'Employment Certificate',
  'Business Registration',
  'Project Report',
  'Minority Proof',
  'School Admission Letter',
  'Admission Fee Slip',
  'Artisan Certificate',
  'Address Proof',
  'Age Proof',
  'Other',
];
const verifiedConfig = {
  Verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  },
  Pending: {
    label: 'OCR Processing',
    icon: Clock,
    className: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
  Failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
};
function DocumentCard({ doc, onDelete, isDeleting }) {
  const cfg = verifiedConfig[doc.verifiedStatus] || verifiedConfig.Pending;
  const Icon = cfg.icon;
  const confidence = doc.ocrMetadata?.confidence || 0;
  const parsedFields = doc.ocrMetadata?.parsedFields
    ? Object.entries(
        doc.ocrMetadata.parsedFields instanceof Map
          ? Object.fromEntries(doc.ocrMetadata.parsedFields)
          : doc.ocrMetadata.parsedFields
      ).filter(([, v]) => v && typeof v === 'string').slice(0, 4)
    : [];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 space-y-4"
    >
      {}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
              {doc.documentType}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Uploaded {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>
        {}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${cfg.badgeBg} ${cfg.className}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
      {/* Confidence Bar */}
      {doc.verifiedStatus === 'Verified' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <FileScan className="w-3 h-3" /> OCR Confidence
            </p>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{confidence}%</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                confidence >= 80 ? 'bg-emerald-500' :
                confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      )}
      {}
      {parsedFields.length > 0 && (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-700/60 p-3">
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> OCR Extracted Data
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {parsedFields.map(([key, value]) => (
              <div key={key}>
                <p className="text-[9px] text-zinc-400 uppercase">{key.replace(/_/g, ' ')}</p>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Pending OCR Message */}
      {doc.verifiedStatus === 'Pending' && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5 border border-amber-200 dark:border-amber-800">
          <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
          OCR is processing your document in the background. You'll be notified when complete.
        </div>
      )}
      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {doc.cloudinaryUrl && (
          <a
            href={doc.cloudinaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Document
          </a>
        )}
        <button
          onClick={() => onDelete(doc._id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-500 transition-colors ml-auto"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
    </motion.div>
  );
}
// ── Upload Dropzone ───────────────────────────────────────────────────────────
function UploadDropzone({ selectedType, setSelectedType, onUpload, isUploading }) {
  const onDrop = useCallback((accepted) => {
    if (!selectedType) {
      toast.error('Please select the document type first.');
      return;
    }
    if (accepted.length > 0) onUpload(accepted[0]);
  }, [selectedType, onUpload]);
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: () => toast.error('File rejected. Max size 10MB, only images/PDFs allowed.'),
  });
  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Document Type <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
            bg-white dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100
            focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
        >
          <option value="">Select document type</option>
          {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
          ${!isDragActive && !isDragReject ? 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
            ${isDragActive ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-zinc-100 dark:bg-zinc-800'}`}
          >
            {isUploading
              ? <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
              : <CloudUpload className={`w-7 h-7 ${isDragActive ? 'text-indigo-500' : 'text-zinc-400'}`} />
            }
          </div>
          {isUploading ? (
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Uploading & queuing OCR...</p>
              <p className="text-xs text-zinc-400 mt-1">Please wait</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your document'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                or <span className="text-indigo-500 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-zinc-400 mt-2">Supported: JPG, PNG, PDF · Max 10MB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function DocumentVault() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: getMyDocuments,
    refetchInterval: 30000, // poll every 30s to catch OCR status updates
  });
  const documents = data?.documents || [];
  const verifiedCount = documents.filter((d) => d.verifiedStatus === 'Verified').length;
  const pendingCount = documents.filter((d) => d.verifiedStatus === 'Pending').length;
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', selectedType);
      return uploadDocument(formData);
    },
    onSuccess: () => {
      toast.success('Document uploaded! OCR processing started in background.');
      setSelectedType('');
      queryClient.invalidateQueries(['myDocuments']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      setDeletingId(id);
      return deleteDocument(id);
    },
    onSuccess: () => {
      toast.success('Document removed.');
      setDeletingId(null);
      queryClient.invalidateQueries(['myDocuments']);
    },
    onError: () => {
      toast.error('Failed to delete document.');
      setDeletingId(null);
    },
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Document Vault</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Upload and manage your documents · OCR extracts data automatically
        </p>
      </motion.div>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Documents', value: documents.length, icon: FileText, color: 'from-indigo-500 to-violet-600' },
          { label: 'Verified', value: verifiedCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
          { label: 'Processing', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{isLoading ? '—' : value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-6"
        >
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 mb-5">
            <Upload className="w-4 h-4 text-indigo-500" /> Upload New Document
          </h2>
          <UploadDropzone
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onUpload={uploadMutation.mutate}
            isUploading={uploadMutation.isPending}
          />
          {/* OCR Info */}
          <div className="mt-4 flex items-start gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>Documents are scanned using OCR to automatically extract fields like name, date of birth, and ID numbers.</p>
          </div>
        </motion.div>
        {/* Documents Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 animate-pulse space-y-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">No documents yet</p>
              <p className="text-sm text-zinc-400 mt-1">
                Upload your first document using the panel on the left
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onDelete={deleteMutation.mutate}
                    isDeleting={deletingId === doc._id && deleteMutation.isPending}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}