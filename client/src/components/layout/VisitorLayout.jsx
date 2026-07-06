import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore.js';
import { Sun, Moon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../ui/PageTransition.jsx';
const VisitorLayout = () => {
  const { theme, toggleTheme, applyTheme } = useThemeStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isLanding = location.pathname === '/';
  useEffect(() => { applyTheme(); }, [applyTheme]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const AUTH_PATHS = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
  if (AUTH_PATHS.includes(location.pathname)) {
    return <Outlet />;
  }
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-300">
      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 h-14 flex items-center justify-between px-6 lg:px-12 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
            : 'bg-transparent'
        }`}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="BharatConnect home">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-base select-none shrink-0 group-hover:bg-indigo-500 transition-colors">
            🇮🇳
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            BharatConnect
          </span>
        </Link>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4" />
            }
          </button>
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_2px_8px_rgba(79,70,229,0.2)] transition-all duration-150 active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </header>
      {/* ── Page Content ── */}
      <main className={`flex-1 flex flex-col ${isLanding ? '' : 'items-center justify-center py-16 px-4'} relative overflow-hidden`}>
        {/* subtle ambient — kept very small so it doesn't bleed */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/3 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" aria-hidden />
        <div className={`relative z-10 ${isLanding ? 'w-full' : 'w-full flex justify-center'}`}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
      </main>
      {/* ── Footer ── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800/60 py-5 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950">
        <span>© {new Date().getFullYear()} BharatConnect — Ministry of Digital Governance</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Sign in</Link>
          <Link to="/register" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
};
export default VisitorLayout;