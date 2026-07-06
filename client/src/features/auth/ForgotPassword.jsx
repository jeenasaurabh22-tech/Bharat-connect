import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../../services/auth.service.js';
const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
export default function ForgotPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema) });
  const onSubmit = async (data) => {
    try {
      await requestPasswordReset(data.email);
      toast.success('Password reset OTP sent to your email!');
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email. Try again.';
      toast.error(message);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden font-sans p-6">
      {}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] p-8 sm:p-10 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-6 z-10"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm select-none shrink-0 shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
            🇮🇳
          </div>
          <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
            BharatConnect AI
          </span>
        </div>
        {/* Header */}
        <div className="text-center flex flex-col gap-1.5">
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Forgot password?</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No worries — we'll send you a reset code
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`h-14 pl-12 pr-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <button
            id="forgot-password-submit"
            type="submit"
            disabled={isSubmitting}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-base shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...</>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}