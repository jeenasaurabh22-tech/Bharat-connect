import React from 'react';
const Input = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  className = '',
  iconLeft,
  iconRight,
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
      <div className="relative flex items-center">
        {iconLeft && (
          <div className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none flex items-center justify-center z-10">
            {iconLeft}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          className={`
            w-full rounded-xl px-3.5 py-2.5 text-sm
            bg-white dark:bg-zinc-900
            border text-zinc-900 dark:text-zinc-100
            placeholder-zinc-400 dark:placeholder-zinc-600
            transition-all duration-200 ease-out
            focus:outline-none
            ${error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 dark:focus:ring-red-500/20'
              : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:focus:ring-indigo-500/20'
            }
            ${iconLeft ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
          `}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3.5 text-zinc-400 dark:text-zinc-500 flex items-center justify-center z-10">
            {iconRight}
          </div>
        )}
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
Input.displayName = 'Input';
export default Input;