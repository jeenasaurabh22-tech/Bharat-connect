import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../ui/PageTransition.jsx';
import {
  LayoutDashboard, Search, User, FolderOpen, FileText, Bell,
  Sun, Moon, LogOut, Menu, X, Shield, Smartphone, Cpu, Settings,
  ShieldCheck, Layers, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore.js';
import useThemeStore from '../../store/useThemeStore.js';
import api from '../../services/api.js';
const ALL_NAV = [
  { label: 'Overview',            path: '/dashboard',        icon: LayoutDashboard, roles: ['citizen', 'officer', 'admin'] },
  { label: 'Scheme Finder',       path: '/schemes',          icon: Search,          roles: ['citizen', 'officer', 'admin'] },
  { label: 'AI Assistant',        path: '/ai-eligibility',   icon: Cpu,             roles: ['citizen'] },
  { label: 'Document Vault',      path: '/documents',        icon: FolderOpen,      roles: ['citizen'] },
  { label: 'DigiLocker',          path: '/digilocker',       icon: Smartphone,      roles: ['citizen'] },
  { label: 'Applications',        path: '/applications',     icon: FileText,        roles: ['citizen'] },
  { label: 'Review Queue',        path: '/officer',          icon: Shield,          roles: ['officer', 'admin'] },
  { label: 'Verify Documents',    path: '/verify-documents', icon: ShieldCheck,     roles: ['officer', 'admin'] },
  { label: 'Scheme Manager',      path: '/admin/schemes',    icon: Layers,          roles: ['admin'] },
  { label: 'Admin Portal',        path: '/admin',            icon: Settings,        roles: ['admin'] },
];
const ROLE_COLOR = {
  citizen: 'bg-indigo-600',
  officer:  'bg-orange-500',
  admin:    'bg-violet-600',
};
function NavLink({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
      <span className="truncate">{item.label}</span>
      {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
    </Link>
  );
}
function Sidebar({ user, navItems, onLogout, onClose }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const avatarColor = ROLE_COLOR[user?.role] || 'bg-indigo-600';
  return (
    <div className="flex flex-col h-full">
      {}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-100 dark:border-zinc-800/70 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm select-none shrink-0">🇮🇳</div>
        <span className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight">BharatConnect</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} onClick={onClose} />
        ))}
      </nav>
      {/* User footer */}
      <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800/70 flex-shrink-0 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full ${avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 select-none`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">{user?.name}</p>
          <p className="text-[10px] text-zinc-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
/* ── main layout ──────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, applyTheme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { applyTheme(); }, [applyTheme]);
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, [user]);
  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    navigate('/login');
  };
  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };
  const navItems = ALL_NAV.filter(i => i.roles.includes(user?.role));
  const unread = notifications.filter(n => !n.isRead).length;
  /* page title from path */
  const pageTitle = navItems.find(i => i.path === location.pathname)?.label || 'Dashboard';
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex transition-colors duration-300">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800/70 sticky top-0 h-screen z-20 flex-shrink-0">
        <Sidebar user={user} navItems={navItems} onLogout={handleLogout} />
      </aside>
      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 lg:px-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Page title */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
            <span className="font-medium text-zinc-800 dark:text-zinc-100">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotifyOpen(o => !o)}
                aria-label="Notifications"
                className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
              <AnimatePresence>
                {isNotifyOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifyOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/60">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-xs text-zinc-400">
                            No notifications
                          </div>
                        ) : notifications.map((n) => (
                          <div key={n._id} className={`px-4 py-3 ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}>
                            <p className={`text-xs font-semibold mb-0.5 ${!n.isRead ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                              {n.type}
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {/* Profile avatar */}
            <Link
              to="/profile"
              className={`w-8 h-8 rounded-full ${ROLE_COLOR[user?.role] || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center select-none hover:ring-2 hover:ring-indigo-500/40 hover:ring-offset-1 transition-all`}
              aria-label="View profile"
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Link>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="absolute left-0 top-0 bottom-0 w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 z-10"
            >
              <Sidebar user={user} navItems={navItems} onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DashboardLayout;