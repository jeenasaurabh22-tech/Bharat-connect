import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, MailCheck, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyEmailOTP } from '../../services/auth.service.js';
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const role  = location.state?.role  || 'citizen';
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please register again.');
      navigate('/register');
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyEmailOTP(email, otpString, role);
      toast.success('Email verified! Please log in.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP. Try again.';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      toast.success('A new OTP has been sent to your email.');
      setCountdown(60);
    } catch (err) {
      toast.error('Failed to resend OTP. Try again shortly.');
    } finally {
      setResending(false);
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
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Check your email</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            We sent a 6-digit verification code to
          </p>
          <p className="text-sm font-semibold text-indigo-500 break-all">{email}</p>
        </div>
        {/* OTP Input Boxes */}
        <div className="flex items-center justify-center gap-2.5 my-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
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
        {/* Verify Button */}
        <button
          id="verify-otp-submit"
          onClick={handleVerify}
          disabled={isSubmitting || otp.join('').length !== 6}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-base shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
          ) : (
            <>
              <span>Verify Email</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        {/* Resend OTP */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-zinc-400 font-medium">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-500 hover:text-indigo-600 font-bold transition-colors inline-flex items-center gap-1"
            >
              {resending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Resend OTP
            </button>
          )}
        </div>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <Link
            to="/register"
            className="text-sm font-semibold text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            ← Back to Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}