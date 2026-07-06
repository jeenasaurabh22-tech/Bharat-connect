import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Link2, FileText, CheckCircle2, Clock,
  RefreshCw, ExternalLink, Lock, Smartphone, AlertCircle,
  Download, FolderOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
const MOCK_DOCUMENTS = [
  {
    id: 'dl-1',
    name: 'Aadhaar Card',
    issuer: 'UIDAI',
    docId: 'XXXX-XXXX-1234',
    issuedDate: '2021-03-15',
    status: 'valid',
    fileType: 'PDF',
    synced: false,
  },
  {
    id: 'dl-2',
    name: 'Driving Licence',
    issuer: 'Ministry of Road Transport',
    docId: 'DL-MH-0120-12345678',
    issuedDate: '2020-07-22',
    status: 'valid',
    fileType: 'PDF',
    synced: true,
  },
  {
    id: 'dl-3',
    name: 'PAN Card',
    issuer: 'Income Tax Department',
    docId: 'ABCDE1234F',
    issuedDate: '2019-11-10',
    status: 'valid',
    fileType: 'PDF',
    synced: false,
  },
  {
    id: 'dl-4',
    name: 'Class 10 Certificate',
    issuer: 'CBSE',
    docId: 'CBSE/2018/1234567',
    issuedDate: '2018-06-01',
    status: 'valid',
    fileType: 'PDF',
    synced: false,
  },
];
function DigiDocRow({ doc, onSync, syncing }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all
        ${doc.synced
          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/40'
          : 'bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-indigo-300 dark:hover:border-indigo-700'
        }`}
    >
      {}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      {}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{doc.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{doc.issuer} · {doc.docId}</p>
        <p className="text-xs text-zinc-400">Issued: {new Date(doc.issuedDate).toLocaleDateString('en-IN')}</p>
      </div>
      {}
      <div className="flex items-center gap-3 flex-shrink-0">
        {doc.synced ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synced
          </span>
        ) : (
          <button
            onClick={() => onSync(doc.id)}
            disabled={syncing === doc.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400
              border border-indigo-200 dark:border-indigo-800
              hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all
              disabled:opacity-60"
          >
            {syncing === doc.id
              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Syncing...</>
              : <><Download className="w-3 h-3" /> Sync</>
            }
          </button>
        )}
      </div>
    </motion.div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function DigiLocker() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [docs, setDocs] = useState(MOCK_DOCUMENTS);
  const [syncing, setSyncing] = useState(null);
  const handleConnect = () => {
    setConnecting(true);
    // Simulate OAuth redirect + callback
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast.success('DigiLocker connected successfully!');
    }, 2500);
  };
  const handleSync = (id) => {
    setSyncing(id);
    setTimeout(() => {
      setDocs((prev) => prev.map((d) => d.id === id ? { ...d, synced: true } : d));
      setSyncing(null);
      toast.success('Document synced to your Document Vault!');
    }, 2000);
  };
  const syncedCount = docs.filter((d) => d.synced).length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" /> DigiLocker
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          Connect your DigiLocker account to sync government-issued documents
        </p>
      </motion.div>
      {/* Demo Notice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      >
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Demo Mode</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Real DigiLocker integration requires MeitY government approval. This is a simulated flow demonstrating the full UX. Credentials are pre-loaded with mock data.
          </p>
        </div>
      </motion.div>
      {!connected ? (
        /* ── Connect Screen ─────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 p-10 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-5">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Connect DigiLocker
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
            Link your DigiLocker account to automatically import your Aadhaar, PAN, driving licence, certificates and more — directly from the Government of India's secure document repository.
          </p>
          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
            {[
              { icon: Lock, title: 'Bank-grade Security', desc: 'End-to-end encrypted OAuth 2.0 connection' },
              { icon: Smartphone, title: 'One-tap Sync', desc: 'Import all your government documents instantly' },
              { icon: CheckCircle2, title: 'Auto Verified', desc: 'Documents are pre-verified by the issuing authority' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-center">
                <Icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{title}</p>
                <p className="text-xs text-zinc-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <button
            id="connect-digilocker-btn"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700 text-white
              shadow-lg hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all
              disabled:opacity-60"
          >
            {connecting
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting via OAuth...</>
              : <><Link2 className="w-4 h-4" /> Connect with DigiLocker</>
            }
          </button>
          <p className="text-xs text-zinc-400 mt-4 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secured by Government of India DigiLocker OAuth 2.0
          </p>
        </motion.div>
      ) : (
        /* ── Connected Screen ───────────────────────────────────────── */
        <div className="space-y-5">
          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900/60 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">DigiLocker Connected</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{docs.length} documents found · {syncedCount} synced</p>
              </div>
            </div>
            <a
              href="https://digilocker.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
            >
              Open DigiLocker <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
          {/* Documents List */}
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-500" /> Available Documents
              </h2>
              <span className="text-xs text-zinc-400">{docs.length} documents</span>
            </div>
            <div className="p-4 space-y-3">
              {docs.map((doc) => (
                <DigiDocRow key={doc.id} doc={doc} onSync={handleSync} syncing={syncing} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}