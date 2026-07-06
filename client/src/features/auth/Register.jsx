import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, Mail, Lock, User, Loader2,
  Briefcase, Shield, CheckCircle2, ShieldCheck,
  Award, Globe, Check, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../services/auth.service.js';
const ROLES = [
  { id: 'citizen', label: 'Citizen',  icon: User,      desc: 'Apply for schemes',         bg: 'bg-indigo-600' },
  { id: 'officer', label: 'Officer',  icon: Briefcase, desc: 'Verify & review',           bg: 'bg-orange-500' },
  { id: 'admin',   label: 'Admin',    icon: Shield,    desc: 'Manage platform',           bg: 'bg-violet-600' },
];
const baseSchema = z.object({
  name:            z.string().min(2, 'At least 2 characters'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
const officerSchema = z.object({
  name:            z.string().min(2, 'At least 2 characters'),
  email:           z.string().email('Enter a valid email address'),
  password:        z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
  employeeId:      z.string().min(3, 'Required'),
  department:      z.string().min(2, 'Required'),
  state:           z.string().min(2, 'Required'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(role === 'officer' ? officerSchema : baseSchema),
  });
  const handleRoleChange = (r) => { setRole(r); reset(); };
  const onSubmit = async (data) => {
    try {
      await registerUser({ ...data, role });
      setRegisteredEmail(data.email);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };
  if (done) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 sm:p-10 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg flex flex-col items-center gap-6 text-center z-10"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Verify your email</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              We sent a one-time code to{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{registeredEmail}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/verify-email', { state: { email: registeredEmail, role } })}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-base shadow-[0_4px_14px_rgba(79,70,229,0.25)] transition-all duration-200 active:scale-[0.98]"
          >
            Enter OTP →
          </button>
          <p className="text-xs text-zinc-400">
            Already verified?{' '}
            <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden font-sans">
      {/* Background Gradients & Mesh Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-500/5 dark:bg-violet-500/2 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      {/* Left side: Brand Experience */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 relative lg:min-h-screen">
        {/* Brand Header */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg select-none shrink-0 shadow-[0_4px_12px_rgba(79,70,229,0.3)] dark:shadow-[0_4px_12px_rgba(79,70,229,0.15)] group-hover:bg-indigo-500 transition-colors">
              🇮🇳
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              BharatConnect <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200/30">AI</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Digital Empowerment Mission
          </span>
        </div>
        {/* Hero Copy & Mockups */}
        <div className="my-auto py-12 lg:py-0 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.1] text-zinc-900 dark:text-white">
              Access Government <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent">Benefits Faster.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-lg leading-relaxed">
              Create an account in minutes to start scanning documents, matching benefits, and auto-applying for welfare schemes seamlessly.
            </p>
          </motion.div>
          {/* Floating Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 relative">
            {/* Card 1: Verified Documents */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-55 bg-opacity-10 dark:bg-indigo-950/50 flex items-center justify-center mb-3 border border-indigo-100/50 dark:border-indigo-900/30">
                <Check className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-500 transition-colors">Verified Documents</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Encrypted storehouse keeping your critical cards safe.</p>
            </motion.div>
            {/* Card 2: Direct Benefit Transfer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-3 border border-emerald-100/50 dark:border-emerald-900/30">
                <Award className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-emerald-500 transition-colors">DBT Tracker</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Direct benefit status tracking from linked bank profiles.</p>
            </motion.div>
            {/* Card 3: Multi-lingual Support */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-3 border border-blue-100/50 dark:border-blue-900/30">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-500 transition-colors">Regional Language</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Access government schemes translated in 12 major Indian languages.</p>
            </motion.div>
            {/* Card 4: Secure SSO Access */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center mb-3 border border-orange-100/50 dark:border-orange-900/30">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-orange-500 transition-colors">Encrypted SSO</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Your digital identity is secure, auditable, and platform private.</p>
            </motion.div>
          </div>
        </div>
        {/* Brand Footer */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-zinc-400 dark:text-zinc-500">
          <span>AES-256 State-Level Encryption Standard</span>
          <span>•</span>
          <span>Digital India Initiative</span>
        </div>
      </div>
      {/* Right side: Register Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[460px] p-8 sm:p-10 rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Create account
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Start your government benefits profile
            </p>
          </div>
          {/* Account type selector */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Account type</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ id, label, icon: Icon, desc, bg }) => {
                const active = role === id;
                return (
                  <button key={id} type="button" onClick={() => handleRoleChange(id)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      active
                        ? 'border-indigo-500 dark:border-indigo-400 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${active ? bg : 'bg-zinc-100 dark:bg-zinc-800'} flex items-center justify-center transition-all`}>
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-zinc-400'}`} />
                    </div>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-name" className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input id="reg-name" type="text" placeholder="Your full name" {...register('name')}
                  className={`h-14 pl-12 pr-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                    errors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input id="reg-email" type="email" placeholder="you@example.com" {...register('email')}
                  className={`h-14 pl-12 pr-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            {/* Officer-only Fields */}
            {role === 'officer' && (
              <div className="flex flex-col gap-3 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-orange-600 dark:text-orange-400">Officer credentials</p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Government ID</label>
                  <input id="reg-empid" type="text" placeholder="GOV-2024-XXXXX" {...register('employeeId')}
                    className={`h-14 px-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                      errors.employeeId
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                  />
                  {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Department</label>
                    <input id="reg-dept" type="text" placeholder="Ministry / Dept" {...register('department')}
                      className={`h-14 px-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                        errors.department
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                    {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">State</label>
                    <input id="reg-state" type="text" placeholder="Maharashtra" {...register('state')}
                      className={`h-14 px-4 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                        errors.state
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                  </div>
                </div>
              </div>
            )}
            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input id="reg-password" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" {...register('password')}
                  className={`h-14 pl-12 pr-10 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="reg-confirm" className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input id="reg-confirm" type={showCPw ? 'text' : 'password'} placeholder="Re-enter password" {...register('confirmPassword')}
                  className={`h-14 pl-12 pr-10 w-full rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowCPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
            {/* Submit */}
            <button id="register-submit" type="submit" disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-base shadow-[0_4px_20px_rgba(79,70,229,0.35)] dark:shadow-[0_4px_30px_rgba(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating profile…</>
              ) : (
                <>
                  <span>Create {role.charAt(0).toUpperCase() + role.slice(1)} Profile</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}