import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, Briefcase, GraduationCap, IndianRupee,
  Shield, Calendar, Loader2, Save, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile } from '../../services/profile.service.js';
import useAuthStore from '../../store/useAuthStore.js';
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1).max(120).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Transgender', 'Other', 'Prefer not to say', '']).optional(),
  annualIncome: z.coerce.number().min(0).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  education: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(60).optional().or(z.literal('')),
  district: z.string().max(60).optional().or(z.literal('')),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS', '']).optional(),
  isDisabled: z.boolean().optional(),
  disabilityDetails: z.string().max(200).optional().or(z.literal('')),
});
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli',
  'Daman and Diu','Delhi','Lakshadweep','Puducherry','Ladakh','Jammu and Kashmir',
];
function FormInput({ label, id, icon: Icon, error, type = 'text', ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />}
        <input
          id={id}
          type={type}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none
            bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            ${error
              ? 'border-red-400 focus:ring-2 focus:ring-red-300'
              : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
            }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
function FormSelect({ label, id, icon: Icon, error, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />}
        <select
          id={id}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none appearance-none
            bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100
            ${error
              ? 'border-red-400 focus:ring-2 focus:ring-red-300'
              : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
            }`}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
// ── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}
// ── Main Component ────────────────────────────────────────────────────────────
export default function UserProfile() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
  });
  const user = data?.user;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      annualIncome: '',
      occupation: '',
      education: '',
      state: '',
      district: '',
      category: '',
      isDisabled: false,
      disabilityDetails: '',
    },
  });
  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        age: user.profile?.age || '',
        gender: user.profile?.gender || '',
        annualIncome: user.profile?.annualIncome || '',
        occupation: user.profile?.occupation || '',
        education: user.profile?.education || '',
        state: user.profile?.state || '',
        district: user.profile?.district || '',
        category: user.profile?.category || '',
        isDisabled: user.profile?.isDisabled || false,
        disabilityDetails: user.profile?.disabilityDetails || '',
      });
    }
  }, [user, reset]);
  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setUser(data.user);
      queryClient.invalidateQueries(['myProfile']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });
  const onSubmit = (data) => {
    const { name, ...profileFields } = data;
    // Clean empty strings to undefined
    const cleanProfile = Object.fromEntries(
      Object.entries(profileFields).filter(([, v]) => v !== '' && v !== undefined)
    );
    mutation.mutate({ name, profile: cleanProfile });
  };
  const isDisabled = watch('isDisabled');
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }
  // Compute profile completeness
  const profileFields = ['age', 'gender', 'annualIncome', 'occupation', 'state', 'district', 'category', 'education'];
  const filledFields = profileFields.filter((f) => user?.profile?.[f]);
  const completeness = Math.round((filledFields.length / profileFields.length) * 100);
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            Keep your profile complete for better AI eligibility matching
          </p>
        </div>
        {/* Completeness Badge */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900/60 rounded-xl px-4 py-2.5 border border-zinc-200/60 dark:border-zinc-700/60">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-zinc-700" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                strokeDasharray={`${completeness} ${100 - completeness}`}
                strokeLinecap="round"
                className="text-indigo-500 transition-all duration-700"
                stroke="currentColor"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
              {completeness}%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Profile Complete</p>
            <p className="text-[10px] text-zinc-400">{filledFields.length}/{profileFields.length} fields filled</p>
          </div>
        </div>
      </motion.div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="Basic Information" icon={User}>
            <div className="sm:col-span-2">
              <FormInput
                label="Full Name"
                id="profile-name"
                icon={User}
                placeholder="Your full name"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">Email cannot be changed</p>
            </div>
            <FormInput
              label="Age"
              id="profile-age"
              icon={Calendar}
              type="number"
              placeholder="Your age"
              error={errors.age?.message}
              {...register('age')}
            />
          </Section>
        </motion.div>
        {/* Personal Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Personal Details" icon={Shield}>
            <FormSelect
              label="Gender"
              id="profile-gender"
              error={errors.gender?.message}
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </FormSelect>
            <FormSelect
              label="Caste Category"
              id="profile-category"
              error={errors.category?.message}
              {...register('category')}
            >
              <option value="">Select category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </FormSelect>
            <FormInput
              label="Annual Income (₹)"
              id="profile-income"
              icon={IndianRupee}
              type="number"
              placeholder="e.g. 250000"
              error={errors.annualIncome?.message}
              {...register('annualIncome')}
            />
            <FormInput
              label="Occupation"
              id="profile-occupation"
              icon={Briefcase}
              placeholder="e.g. Farmer, Student, Self-employed"
              error={errors.occupation?.message}
              {...register('occupation')}
            />
            <FormInput
              label="Education"
              id="profile-education"
              icon={GraduationCap}
              placeholder="e.g. 10th Pass, Graduate"
              error={errors.education?.message}
              {...register('education')}
            />
            {/* Disability Toggle */}
            <div className="sm:col-span-2 flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
              <input
                id="profile-disabled"
                type="checkbox"
                {...register('isDisabled')}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
              <div>
                <label htmlFor="profile-disabled" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  I have a disability
                </label>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This helps us match you with disability-specific government schemes
                </p>
              </div>
            </div>
            {isDisabled && (
              <div className="sm:col-span-2">
                <FormInput
                  label="Disability Details"
                  id="profile-disability-details"
                  placeholder="Brief description of disability"
                  error={errors.disabilityDetails?.message}
                  {...register('disabilityDetails')}
                />
              </div>
            )}
          </Section>
        </motion.div>
        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Location" icon={MapPin}>
            <FormSelect
              label="State"
              id="profile-state"
              icon={MapPin}
              error={errors.state?.message}
              {...register('state')}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FormSelect>
            <FormInput
              label="District"
              id="profile-district"
              icon={MapPin}
              placeholder="e.g. Pune, Jaipur"
              error={errors.district?.message}
              {...register('district')}
            />
          </Section>
        </motion.div>
        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex justify-end"
        >
          <button
            id="save-profile-submit"
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
              bg-indigo-600
              hover:bg-indigo-500
              text-white text-sm font-semibold
              shadow-md hover:shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : mutation.isSuccess ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}