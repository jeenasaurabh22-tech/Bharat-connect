import React from 'react';
import { motion } from 'framer-motion';
const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40 select-none tracking-tight active:scale-[0.98]";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-505 text-white shadow-[0_1px_2px_rgba(79,70,229,0.1),0_4px_12px_rgba(79,70,229,0.15)] focus-visible:ring-indigo-500",
    secondary: "bg-zinc-100 hover:bg-slate-200/80 active:bg-slate-200 text-zinc-800 dark:bg-zinc-800/80 dark:hover:bg-zinc-850 dark:active:bg-zinc-800 dark:text-zinc-200 border border-zinc-200/40 dark:border-zinc-700/40",
    outline: "bg-transparent border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900/60 dark:text-zinc-300 focus-visible:ring-slate-500",
    ghost: "bg-transparent hover:bg-zinc-100/70 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200",
    danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-[0_1px_2px_rgba(220,38,38,0.1),0_4px_12px_rgba(220,38,38,0.15)] focus-visible:ring-red-500",
    saffron: "bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-[0_4px_12px_rgba(234,88,12,0.15)] focus-visible:ring-orange-500",
    ashoka: "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-[0_4px_12px_rgba(22,163,74,0.15)] focus-visible:ring-emerald-500",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-sm gap-2.5",
  };
  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : children}
    </motion.button>
  );
});
Button.displayName = 'Button';
export default Button;