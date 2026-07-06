import React from 'react';
const Badge = ({
  children,
  className = '',
  variant = 'neutral',
  ...props
}) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider select-none border transition-all duration-200";
  const variants = {
    neutral: "bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-800",
    primary: "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
    success: "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
    warning: "bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-105 dark:border-amber-900/40",
    danger: "bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40",
  };
  const currentVariant = variants[variant] || variants.neutral;
  return (
    <span className={`${baseStyle} ${currentVariant} ${className}`} {...props}>
      {children}
    </span>
  );
};
export default Badge;