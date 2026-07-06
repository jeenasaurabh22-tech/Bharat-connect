import React from 'react';
import { ChevronDown } from 'lucide-react';
const Select = React.forwardRef(({
  label,
  name,
  error,
  options = [],
  children,
  className = '',
  required = false,
  hint,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          name={name}
          id={name}
          className={`
            w-full rounded-xl px-3.5 py-2.5 pr-9 text-sm
            bg-white dark:bg-zinc-900
            border text-zinc-900 dark:text-zinc-100
            appearance-none cursor-pointer
            transition-all duration-200 ease-out
            focus:outline-none
            ${error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
              : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:focus:ring-indigo-500/20'
            }
          `}
          {...props}
        >
          {children || (
            <>
              <option value="">Select option</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {hint && !error && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] font-medium text-red-500 dark:text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
});
Select.displayName = 'Select';
export default Select;