import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPasswordWithOTP } from '../../services/auth.service.js';
const resetSchema = z
  .object({
    otp: z
      .string()
      .min(6, 'OTP must be 6 digits')
      .max(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only numbers'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please start again.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema) });
  const onSubmit = async (data) => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP first.');
      return;
    }
    try {
      await resetPasswordWithOTP(email, otpString, data.newPassword);
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password. OTP may have expired.';
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
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Reset your password</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter the OTP sent to <span className="font-semibold text-indigo-500">{email}</span>
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* OTP boxes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              6-Digit OTP
            </label>
            <div className="flex items-center justify-center gap-2.5 my-1" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-2xl border transition-all outline-none bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              ))}
            </div>
          </div>
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="reset-new-password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                {...register('newPassword')}
                className={`h-14 pl-12 pr-10 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                  errors.newPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                className={`h-14 pl-12 pr-10 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          {/* Submit */}
          <button
            id="reset-password-submit"
            type="submit"
            disabled={isSubmitting}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-base shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Resetting password...</>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            ← Back to Forgot Password
          </Link>
        </div>
      </motion.div>
    </div>
  );
}