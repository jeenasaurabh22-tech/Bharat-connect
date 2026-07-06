import React from 'react';
const Card = ({
  children,
  className = '',
  isHoverable = false,
  isGlass = false,
  ...props
}) => {
  const baseStyle = "rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 p-6 bg-white dark:bg-zinc-900/60 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out";
  const hoverStyle = isHoverable ? "hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.02)] hover:border-slate-350 dark:hover:border-zinc-700/60" : "";
  const glassStyle = isGlass ? "bg-white dark:bg-zinc-900" : "";
  return (
    <div
      className={`${isGlass ? '' : baseStyle} ${hoverStyle} ${glassStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;