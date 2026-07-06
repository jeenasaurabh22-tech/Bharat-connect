import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Trash2, Loader2, CheckCircle2, XCircle,
  AlertCircle, FileText, ChevronDown, Bot, User as UserIcon,
  RefreshCw, BookOpen, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  chatWithAssistant, clearChatHistory,
  explainSchemeEligibility, getChatHistory,
} from '../../services/ai.service.js';
import { getSchemes } from '../../services/scheme.service.js';
import useAuthStore from '../../store/useAuthStore.js';
const SUGGESTED_PROMPTS = [
  'What schemes am I eligible for?',
  'How do I apply for PM Kisan Samman Nidhi?',
  'What documents do I need for PM Awas Yojana?',
  'Explain the benefits of Ayushman Bharat',
  'Which schemes are available for women entrepreneurs?',
  'Am I eligible for any education scholarships?',
];
const statusConfig = {
  Eligible: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  'Likely Eligible': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: CheckCircle2 },
  Ineligible: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', icon: XCircle },
  'Needs Information': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: AlertCircle },
};
function EligibilityResult({ result, schemeName }) {
  const cfg = statusConfig[result.status] || statusConfig['Needs Information'];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 space-y-4 ${cfg.bg}`}
    >
      {}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{schemeName}</p>
          <div className={`flex items-center gap-2 text-base font-bold ${cfg.color}`}>
            <Icon className="w-5 h-5" />
            {result.status}
          </div>
        </div>
      </div>
      {/* Explanation */}
      {result.explanation && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300">
          <ReactMarkdown>{result.explanation}</ReactMarkdown>
        </div>
      )}
      {/* Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.matchingDocuments?.length > 0 && (
          <div className="rounded-xl bg-white/60 dark:bg-zinc-800/40 p-3 border border-emerald-200/60 dark:border-emerald-800/40">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Documents You Have
            </p>
            <ul className="space-y-1">
              {result.matchingDocuments.map((doc) => (
                <li key={doc} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.missingDocuments?.length > 0 && (
          <div className="rounded-xl bg-white/60 dark:bg-zinc-800/40 p-3 border border-red-200/60 dark:border-red-800/40">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Missing Documents
            </p>
            <ul className="space-y-1">
              {result.missingDocuments.map((doc) => (
                <li key={doc} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Next Steps */}
      {result.nextSteps && (
        <div className="rounded-xl bg-white/60 dark:bg-zinc-800/40 p-3 border border-zinc-200/40 dark:border-zinc-700/40">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> Next Steps
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{result.nextSteps}</p>
        </div>
      )}
    </motion.div>
  );
}
// ── Chat Message ──────────────────────────────────────────────────────────────
function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
        ${isUser
          ? 'bg-indigo-600'
          : 'bg-emerald-600'
        }`}
      >
        {isUser
          ? <UserIcon className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-white" />
        }
      </div>
      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-100 rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-indigo-200' : 'text-zinc-400'}`}>
          {message.time}
        </p>
      </div>
    </motion.div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function AiEligibility() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const prefilledSchemeId = searchParams.get('schemeId');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste **${user?.name?.split(' ')[0] || 'there'}**! 🙏\n\nI'm your BharatConnect AI assistant. I can help you:\n- Check eligibility for government schemes\n- Explain scheme benefits and requirements\n- Guide you through the application process\n\nWhat would you like to know today?`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedSchemeId, setSelectedSchemeId] = useState(prefilledSchemeId || '');
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [selectedSchemeName, setSelectedSchemeName] = useState('');
  const messagesEndRef = useRef(null);

  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  const { data: historyData } = useQuery({
    queryKey: ['chat-history'],
    queryFn: getChatHistory,
    staleTime: 0,
  });

  useEffect(() => {
    if (historyData?.history && historyData.history.length > 0 && !hasLoadedHistory) {
      const formatted = historyData.history.map(msg => {
        let textContent = '';
        if (typeof msg.parts === 'string') {
          textContent = msg.parts;
        } else if (Array.isArray(msg.parts) && msg.parts.length > 0 && msg.parts[0]) {
          textContent = msg.parts[0].text || msg.parts[0] || '';
        } else {
          textContent = msg.content || '';
        }
        return {
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: textContent,
          time: msg.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      });
      setMessages([
        {
          role: 'assistant',
          content: `Welcome back **${user?.name?.split(' ')[0] || 'there'}**! 🙏\n\nHere is our previous chat history. What else would you like to know?`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...formatted
      ]);
      setHasLoadedHistory(true);
    }
  }, [historyData, user, hasLoadedHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Fetch schemes for dropdown
  const { data: schemesData } = useQuery({
    queryKey: ['schemes-list'],
    queryFn: () => getSchemes({ limit: 50 }),
    staleTime: 1000 * 60 * 10,
  });
  const schemes = schemesData?.schemes || [];
  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: chatWithAssistant,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
    onError: () => toast.error('Failed to get AI response. Please try again.'),
  });
  // Eligibility check mutation
  const eligibilityMutation = useMutation({
    mutationFn: explainSchemeEligibility,
    onSuccess: (data) => {
      setEligibilityResult(data);
      const scheme = schemes.find((s) => s._id === selectedSchemeId);
      setSelectedSchemeName(scheme?.title || 'Selected Scheme');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to check eligibility.'),
  });
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmed,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    chatMutation.mutate(trimmed);
  };
  const handlePrompt = (prompt) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: prompt,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    chatMutation.mutate(prompt);
  };
  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat history cleared. How can I help you today?`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }]);
    clearChatHistory()
      .then(() => {
        queryClient.setQueryData(['chat-history'], { history: [] });
      })
      .catch(() => {});
    setEligibilityResult(null);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-500" /> AI Assistant
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Ask anything about government schemes and your eligibility
        </p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Chat Panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 flex flex-col"
            style={{ height: '600px' }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">BharatConnect AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Suggested Prompts (show only when chat is empty) */}
            {messages.length <= 1 && (
              <div className="px-5 pb-3">
                <p className="text-xs text-zinc-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePrompt(prompt)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700
                        bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400
                        hover:border-indigo-300 hover:text-indigo-600 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Input Bar */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
              <div className="flex gap-2">
                <input
                  id="ai-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about any scheme or your eligibility…"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                />
                <button
                  id="ai-chat-send"
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_18px_rgba(79,70,229,0.3)] transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {chatMutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        {/* ── Right: Eligibility Checker + Prompts ─────────────────────── */}
        <div className="space-y-5">
          {/* Eligibility Checker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5"
          >
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Eligibility Checker
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Select a scheme for a detailed AI-powered eligibility analysis
            </p>
            <select
              value={selectedSchemeId}
              onChange={(e) => {
                setSelectedSchemeId(e.target.value);
                setEligibilityResult(null);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300
                focus:outline-none focus:border-indigo-400 mb-3"
            >
              <option value="">Select a scheme...</option>
              {schemes.map((s) => (
                <option key={s._id} value={s._id}>{s.title}</option>
              ))}
            </select>
            <button
              id="check-eligibility-btn"
              onClick={() => eligibilityMutation.mutate(selectedSchemeId)}
              disabled={!selectedSchemeId || eligibilityMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_12px_rgba(5,150,105,0.2)] transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {eligibilityMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                : <><Sparkles className="w-4 h-4" /> Check Eligibility</>
              }
            </button>
          </motion.div>
          {/* Eligibility Result */}
          <AnimatePresence>
            {eligibilityResult && (
              <EligibilityResult result={eligibilityResult} schemeName={selectedSchemeName} />
            )}
          </AnimatePresence>
          {/* Quick Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-5"
          >
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Suggested Questions
            </h2>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePrompt(prompt)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700
                    bg-white/60 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400
                    hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400
                    hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-2 group"
                >
                  <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}