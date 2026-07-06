import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit3, Trash2, X, Save, ChevronLeft, ChevronRight,
  Layers, AlertTriangle, CheckCircle, Tag, MapPin, IndianRupee,
  Users, Calendar, FileText, Loader2, Eye, Filter,
} from 'lucide-react';
import {
  getSchemes, createScheme, updateScheme, deleteScheme,
} from '../../services/scheme.service.js';
const CATEGORIES = ['Agriculture', 'Education', 'Healthcare', 'Housing', 'Social Welfare', 'Business'];
const GENDERS    = ['All', 'Male', 'Female'];
const CATEGORIES_CASTE = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'];
const STATES_LIST = [
  'Central', 'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi',
];
const DOC_OPTIONS = [
  'Aadhaar', 'PAN', 'Income Certificate', 'Caste Certificate', 'Domicile',
  'Bank Passbook', 'Ration Card', 'Age Proof', 'Disability Certificate',
  'Land Records', 'Birth Certificate', 'Voter ID', 'Passport Photo',
  'Previous Year Marksheet', 'Business Proof', 'Project Report',
];
const EMPTY_FORM = {
  title: '', description: '', benefits: '', applicationLink: '',
  state: 'Central', category: 'Agriculture',
  requiredDocuments: [],
  tags: '',
  eligibilityRules: {
    maxIncome: 200000, minAge: 18, maxAge: 100,
    genders: ['All'], categories: ['All'], states: ['All'],
    occupations: ['All'], educationLevels: ['All'], disabilityRequired: false,
  },
};
const categoryColor = {
  Agriculture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Education:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Healthcare:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Housing:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Social Welfare': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Business:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition ${className}`}
      {...props}
    />
  );
}
function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
function Textarea({ className = '', ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition resize-none ${className}`}
      {...props}
    />
  );
}
// Multi-select checkbox group (for genders, caste categories, etc.)
function MultiCheckGroup({ label, options, value, onChange }) {
  const toggle = (opt) => {
    if (opt === 'All') return onChange(['All']);
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt && v !== 'All')
      : [...value.filter((v) => v !== 'All'), opt];
    onChange(next.length ? next : ['All']);
  };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              value.includes(opt)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
// Document checkbox selector
function DocSelector({ value, onChange }) {
  const toggle = (doc) => {
    onChange(value.includes(doc) ? value.filter((d) => d !== doc) : [...value, doc]);
  };
  return (
    <div>
      <FieldLabel required>Required Documents</FieldLabel>
      <div className="flex flex-wrap gap-2 mt-1">
        {DOC_OPTIONS.map((doc) => (
          <button
            key={doc}
            type="button"
            onClick={() => toggle(doc)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
              value.includes(doc)
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-violet-400'
            }`}
          >
            {doc}
          </button>
        ))}
      </div>
    </div>
  );
}
// ── Scheme Form Modal ─────────────────────────────────────────────────────────
function SchemeFormModal({ mode, scheme, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && scheme) {
      return {
        ...scheme,
        tags: Array.isArray(scheme.tags) ? scheme.tags.join(', ') : scheme.tags || '',
        eligibilityRules: {
          ...EMPTY_FORM.eligibilityRules,
          ...scheme.eligibilityRules,
        },
      };
    }
    return { ...EMPTY_FORM };
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setRule = (key, val) =>
    setForm((f) => ({ ...f, eligibilityRules: { ...f.eligibilityRules, [key]: val } }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.benefits.trim()) {
      toast.error('Title, Description, and Benefits are required.');
      return;
    }
    if (!form.requiredDocuments.length) {
      toast.error('Select at least one required document.');
      return;
    }
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full max-w-3xl my-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/60 dark:border-zinc-700/60"
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-zinc-800 rounded-t-3xl bg-gradient-to-r ${mode === 'edit' ? 'from-amber-500 to-orange-500' : 'from-indigo-600 to-violet-600'}`}>
            <div className="flex items-center gap-3">
              {mode === 'edit' ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              <h2 className="text-lg font-bold text-white">
                {mode === 'edit' ? 'Edit Scheme' : 'Add New Scheme'}
              </h2>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <form onSubmit={handleSubmit} className="p-7 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 pb-2">
                Basic Information
              </h3>
              <div>
                <FieldLabel required>Scheme Title</FieldLabel>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Pradhan Mantri Mudra Yojana" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <FieldLabel required>State</FieldLabel>
                  <Select value={form.state} onChange={(e) => set('state', e.target.value)}>
                    {STATES_LIST.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <FieldLabel required>Description</FieldLabel>
                <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="A clear, concise description of the scheme..." />
              </div>
              <div>
                <FieldLabel required>Benefits</FieldLabel>
                <Textarea value={form.benefits} onChange={(e) => set('benefits', e.target.value)} placeholder="Describe the financial/non-financial benefits..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Application Link</FieldLabel>
                  <Input value={form.applicationLink} onChange={(e) => set('applicationLink', e.target.value)} placeholder="https://pmkisan.gov.in/" />
                </div>
                <div>
                  <FieldLabel>Tags (comma separated)</FieldLabel>
                  <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Farmer, Income Support, DBT" />
                </div>
              </div>
            </div>
            {/* Required Documents */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 pb-2 mb-3">
                Documents Required
              </h3>
              <DocSelector value={form.requiredDocuments} onChange={(val) => set('requiredDocuments', val)} />
            </div>
            {/* Eligibility Rules */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 pb-2">
                Eligibility Rules
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel>Max Annual Income (₹)</FieldLabel>
                  <Input type="number" value={form.eligibilityRules.maxIncome} onChange={(e) => setRule('maxIncome', Number(e.target.value))} placeholder="0 = No Limit" />
                </div>
                <div>
                  <FieldLabel>Min Age</FieldLabel>
                  <Input type="number" min={0} max={120} value={form.eligibilityRules.minAge} onChange={(e) => setRule('minAge', Number(e.target.value))} />
                </div>
                <div>
                  <FieldLabel>Max Age</FieldLabel>
                  <Input type="number" min={0} max={120} value={form.eligibilityRules.maxAge} onChange={(e) => setRule('maxAge', Number(e.target.value))} />
                </div>
              </div>
              <MultiCheckGroup label="Eligible Genders" options={GENDERS} value={form.eligibilityRules.genders} onChange={(v) => setRule('genders', v)} />
              <MultiCheckGroup label="Eligible Caste Categories" options={CATEGORIES_CASTE} value={form.eligibilityRules.categories} onChange={(v) => setRule('categories', v)} />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disabilityRequired"
                  checked={form.eligibilityRules.disabilityRequired}
                  onChange={(e) => setRule('disabilityRequired', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor="disabilityRequired" className="text-sm text-zinc-700 dark:text-zinc-300 select-none">
                  Requires Disability Certificate (only for disabled persons)
                </label>
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
                  mode === 'edit'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-indigo-600 hover:from-indigo-700 hover:to-violet-700'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> {mode === 'edit' ? 'Update Scheme' : 'Create Scheme'}</>
                }
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ scheme, onClose, onConfirm, deleting }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-7 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Delete Scheme?</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">You are about to permanently delete:</p>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-2 mb-5">
            "{scheme?.title}"
          </p>
          <p className="text-xs text-red-500 mb-6">⚠️ This action cannot be undone. The scheme will be removed from search results immediately.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
            >
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
// ── Scheme Row ────────────────────────────────────────────────────────────────
function SchemeRow({ scheme, onEdit, onDelete, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group border-b border-slate-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
    >
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug line-clamp-2 max-w-xs">{scheme.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{scheme.description}</p>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryColor[scheme.category] || 'bg-zinc-100 text-zinc-600'}`}>
          <Layers className="w-3 h-3" />
          {scheme.category}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          <MapPin className="w-3 h-3" />{scheme.state}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <IndianRupee className="w-3 h-3" />
          {scheme.eligibilityRules?.maxIncome
            ? `≤ ₹${scheme.eligibilityRules.maxIncome.toLocaleString('en-IN')}`
            : 'No Limit'}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {scheme.eligibilityRules?.genders?.join(', ')}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(scheme)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition"
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(scheme)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSchemeManager() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [state, setState]           = useState('');
  const [page, setPage]             = useState(1);
  const [modal, setModal]           = useState(null);   // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected]     = useState(null);
  const limit = 10;
  const queryParams = {
    search: search || undefined,
    category: category || undefined,
    state: state || undefined,
    page,
    limit,
  };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-schemes', queryParams],
    queryFn: () => getSchemes(queryParams),
    keepPreviousData: true,
  });
  const schemes    = data?.schemes || [];
  const total      = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: doCreate, isLoading: creating } = useMutation({
    mutationFn: createScheme,
    onSuccess: () => {
      toast.success('Scheme created successfully!');
      qc.invalidateQueries({ queryKey: ['admin-schemes'] });
      setModal(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create scheme.'),
  });
  const { mutate: doUpdate, isLoading: updating } = useMutation({
    mutationFn: ({ id, data }) => updateScheme(id, data),
    onSuccess: () => {
      toast.success('Scheme updated successfully!');
      qc.invalidateQueries({ queryKey: ['admin-schemes'] });
      setModal(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update scheme.'),
  });
  const { mutate: doDelete, isLoading: deleting } = useMutation({
    mutationFn: deleteScheme,
    onSuccess: () => {
      toast.success('Scheme deleted.');
      qc.invalidateQueries({ queryKey: ['admin-schemes'] });
      setModal(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete scheme.'),
  });
  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);
  const handleSave = useCallback((payload) => {
    if (modal === 'create') doCreate(payload);
    else if (modal === 'edit') doUpdate({ id: selected._id, data: payload });
  }, [modal, selected, doCreate, doUpdate]);
  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            Scheme Manager
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {total} schemes in database &bull; Create, edit, or delete government schemes
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Scheme
        </button>
      </motion.div>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-4"
      >
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search schemes by name or keyword..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
            />
          </div>
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-44">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} className="w-44">
            <option value="">All States</option>
            {STATES_LIST.map((s) => <option key={s}>{s}</option>)}
          </Select>
          {(search || category || state) && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setCategory(''); setState(''); setPage(1); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
          {isFetching && !isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500 ml-auto" />
          )}
        </div>
      </motion.div>
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm text-zinc-400">Loading schemes...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-600" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No schemes found</p>
            <p className="text-xs text-zinc-400">Try adjusting your filters or create a new scheme</p>
            <button onClick={() => setModal('create')} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition">
              <Plus className="w-4 h-4" /> Add First Scheme
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700">
                  {['Scheme', 'Category', 'State', 'Income Limit', 'Gender', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {schemes.map((s, i) => (
                  <SchemeRow
                    key={s._id}
                    scheme={s}
                    index={i}
                    onEdit={(sc) => { setSelected(sc); setModal('edit'); }}
                    onDelete={(sc) => { setSelected(sc); setModal('delete'); }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} schemes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 px-2">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <SchemeFormModal
          mode={modal}
          scheme={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onSave={handleSave}
          saving={creating || updating}
        />
      )}
      {modal === 'delete' && (
        <DeleteModal
          scheme={selected}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={() => doDelete(selected._id)}
          deleting={deleting}
        />
      )}
    </div>
  );
}