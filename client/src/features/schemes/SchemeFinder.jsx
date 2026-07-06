import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  IndianRupee, MapPin, Users, Tag, Sparkles, ArrowRight,
  FileText, Loader2, AlertCircle, BookOpen, Globe, Volume2, VolumeX,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSchemes } from '../../services/scheme.service.js';
import { submitApplication } from '../../services/application.service.js';
import { translateSchemeContent } from '../../services/ai.service.js';
import useAuthStore from '../../store/useAuthStore.js';
const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
];
const CATEGORIES = ['Agriculture','Education','Health','Housing','Employment','Women Welfare','Financial Inclusion','Social Welfare'];
const catColors = {
  Agriculture: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Education:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Health:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Housing:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Employment:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Women Welfare': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Financial Inclusion': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Social Welfare': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};
function SchemeCard({ scheme, onApply, isApplying }) {
  const catColor = catColors[scheme.category] || 'bg-zinc-100 text-zinc-600';
  const [lang, setLang] = useState('English');
  const [translatedData, setTranslatedData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const handleLangChange = async (targetLang) => {
    if (targetLang === 'English') {
      setLang('English');
      setTranslatedData(null);
      return;
    }
    setIsTranslating(true);
    try {
      const data = await translateSchemeContent(scheme.title, scheme.description, scheme.benefits, targetLang);
      setTranslatedData(data);
      setLang(targetLang);
    } catch (err) {
      toast.error('Failed to translate content. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  const displayTitle = translatedData ? translatedData.title : scheme.title;
  const displayDescription = translatedData ? translatedData.description : scheme.description;
  const speakText = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = `${displayTitle}. ${displayDescription}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Bengali: 'bn-IN',
      Telugu: 'te-IN',
      Marathi: 'mr-IN',
      Tamil: 'ta-IN',
      Gujarati: 'gu-IN',
      Kannada: 'kn-IN',
      Malayalam: 'ml-IN',
      Odia: 'or-IN',
      Punjabi: 'pa-IN',
      Assamese: 'as-IN',
      Urdu: 'ur-IN'
    };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 flex flex-col"
    >
      {}
      <div className="p-5 flex-1">
        {}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-current/10 ${catColor}`}>
            <Tag className="w-3 h-3" /> {scheme.category}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-200/40 dark:border-zinc-700/40">
              <Globe className="w-3 h-3 text-zinc-400" />
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                disabled={isTranslating}
                className="text-[10px] font-semibold bg-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 outline-none border-none cursor-pointer disabled:opacity-50"
              >
                <option value="English" className="bg-white dark:bg-zinc-900">English</option>
                <option value="Hindi" className="bg-white dark:bg-zinc-900">हिन्दी (Hindi)</option>
                <option value="Bengali" className="bg-white dark:bg-zinc-900">বাংলা (Bengali)</option>
                <option value="Telugu" className="bg-white dark:bg-zinc-900">తెలుగు (Telugu)</option>
                <option value="Marathi" className="bg-white dark:bg-zinc-900">मराठी (Marathi)</option>
                <option value="Tamil" className="bg-white dark:bg-zinc-900">தமிழ் (Tamil)</option>
                <option value="Gujarati" className="bg-white dark:bg-zinc-900">ગુજરાતી (Gujarati)</option>
                <option value="Kannada" className="bg-white dark:bg-zinc-900">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam" className="bg-white dark:bg-zinc-900">മലയാളം (Malayalam)</option>
                <option value="Odia" className="bg-white dark:bg-zinc-900">ଓଡ଼ିଆ (Odia)</option>
                <option value="Punjabi" className="bg-white dark:bg-zinc-900">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="Assamese" className="bg-white dark:bg-zinc-900">অসমীয়া (Assamese)</option>
                <option value="Urdu" className="bg-white dark:bg-zinc-900">اردو (Urdu)</option>
              </select>
            </div>
            <button
              onClick={speakText}
              className={`p-1 rounded-md border transition-all duration-150 active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                  : 'bg-zinc-50 border-zinc-200/40 text-zinc-400 hover:text-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700/40 dark:hover:text-zinc-200'
              }`}
              title={isSpeaking ? "Stop Voice Announcement" : "Listen to Announcement"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-snug mb-2">
          {isTranslating ? (
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              Translating to {lang}...
            </span>
          ) : (
            displayTitle
          )}
        </h3>
        {}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-4">
          {!isTranslating && displayDescription}
        </p>
        {/* Eligibility Pills */}
        <div className="flex flex-wrap gap-1.5">
          {scheme.eligibilityRules?.maxIncome && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
              bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <IndianRupee className="w-2.5 h-2.5" />
              Income ≤ ₹{scheme.eligibilityRules.maxIncome.toLocaleString('en-IN')}
            </span>
          )}
          {scheme.state && scheme.state !== 'All' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
              bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40">
              <MapPin className="w-2.5 h-2.5" /> {scheme.state}
            </span>
          )}
          {scheme.eligibilityRules?.categories?.length > 0 && !scheme.eligibilityRules.categories.includes('All') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
              bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/40">
              <Users className="w-2.5 h-2.5" /> {scheme.eligibilityRules.categories.join(', ')}
            </span>
          )}
          {lang !== 'English' && !isTranslating && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200/40">
              Translated ({lang})
            </span>
          )}
        </div>
      </div>
      {/* Divider */}
      <div className="h-px bg-zinc-100 dark:bg-zinc-800/60" />
      {/* Footer Actions */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-2">
        <Link
          to={`/ai-eligibility?schemeId=${scheme._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Check Eligibility
        </Link>
        <button
          onClick={() => onApply(scheme._id)}
          disabled={isApplying}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_2px_8px_rgba(79,70,229,0.2)] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
          Apply
        </button>
      </div>
    </motion.div>
  );
}
// ── Filter Sidebar ────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onReset, isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 z-40 lg:relative lg:z-auto
              bg-white dark:bg-zinc-900/60 border-r border-zinc-200/80 dark:border-zinc-700/60
              p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Filters
              </h3>
              <button onClick={onReset} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                Reset all
              </button>
            </div>
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  Category
                </label>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.category === cat}
                        onChange={() => onChange('category', filters.category === cat ? '' : cat)}
                        className="w-3.5 h-3.5 rounded accent-indigo-500"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-slate-200 transition-colors">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => onChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300
                    focus:outline-none focus:border-indigo-400"
                >
                  <option value="">All States</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Caste Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  Caste Category
                </label>
                <select
                  value={filters.casteCategory}
                  onChange={(e) => onChange('casteCategory', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300
                    focus:outline-none focus:border-indigo-400"
                >
                  <option value="">All Categories</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
              {/* Max Income */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  Annual Income (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={filters.income}
                  onChange={(e) => onChange('income', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300
                    focus:outline-none focus:border-indigo-400 placeholder:text-zinc-400"
                />
              </div>
              {/* Close on mobile */}
              <button
                onClick={onClose}
                className="lg:hidden w-full py-2 rounded-lg text-xs font-semibold
                  bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function SchemeFinder() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('keyword');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [filters, setFilters] = useState({
    state: user?.profile?.state || '',
    category: '',
    casteCategory: user?.profile?.category || '',
    income: user?.profile?.annualIncome || '',
  });
  const queryParams = {
    search: search || undefined,
    searchType,
    state: filters.state || undefined,
    category: filters.category || undefined,
    casteCategory: filters.casteCategory || undefined,
    income: filters.income || undefined,
    page,
    limit: 12,
  };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['schemes', queryParams],
    queryFn: () => getSchemes(queryParams),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
  const schemes = data?.schemes || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const applyMutation = useMutation({
    mutationFn: submitApplication,
    onMutate: (id) => setApplyingId(id),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setApplyingId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply. Check your documents.');
      setApplyingId(null);
    },
  });
  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);
  const handleReset = () => {
    setFilters({ state: '', category: '', casteCategory: '', income: '' });
    setSearch('');
    setSearchInput('');
    setPage(1);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Scheme Finder</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          {total.toLocaleString()} schemes — central and state governments
        </p>
      </motion.div>
      {/* Search Bar */}
      <motion.form
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        onSubmit={handleSearch}
        className="flex gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="scheme-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, benefit, or type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Search Type Toggle */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {['keyword', 'semantic'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                searchType === type
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {type === 'semantic' ? '🤖 AI' : '🔍 Keyword'}
            </button>
          ))}
        </div>
        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
            activeFilterCount > 0
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all duration-150 active:scale-[0.98]"
        >
          Search
        </button>
      </motion.form>
      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) =>
            value ? (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                  bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400
                  border border-indigo-200 dark:border-indigo-800"
              >
                {key}: {value}
                <button onClick={() => handleFilterChange(key, '')} className="hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null
          )}
          <button onClick={handleReset} className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
            Clear all
          </button>
        </div>
      )}
      {/* Layout: Filter + Grid */}
      <div className="flex gap-6">
        {/* Desktop Filter */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Filters
              </h3>
              <button onClick={handleReset} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                Reset
              </button>
            </div>
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Category</label>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={filters.category === cat}
                        onChange={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                        className="w-3.5 h-3.5 rounded accent-indigo-500" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-slate-200 transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">State</label>
                <select value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400">
                  <option value="">All States</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Caste */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Caste Category</label>
                <select value={filters.casteCategory} onChange={(e) => handleFilterChange('casteCategory', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400">
                  <option value="">All</option>
                  {['General','OBC','SC','ST','EWS'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Income */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Max Income (₹)</label>
                <input type="number" placeholder="e.g. 250000" value={filters.income}
                  onChange={(e) => handleFilterChange('income', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-400 placeholder:text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
        {/* Scheme Grid */}
        <div className="flex-1 min-w-0">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5 animate-pulse">
                  <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3" />
                  <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-2" />
                  <div className="h-4 w-3/4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg mb-1" />
                  <div className="h-4 w-2/3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                    <div className="h-5 w-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">No schemes found</p>
              <p className="text-sm text-zinc-400 mt-1 mb-4">Try different filters or search terms</p>
              <button onClick={handleReset} className="text-sm font-medium text-indigo-500 hover:text-indigo-600">
                Clear all filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme._id}
                    scheme={scheme}
                    onApply={applyMutation.mutate}
                    isApplying={applyingId === scheme._id && applyMutation.isPending}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
              <p className="text-xs text-zinc-400">
                Page {page} of {totalPages} · {total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Filter Drawer */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}