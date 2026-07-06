import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`
              relative w-full ${sizes[size] || sizes.md} my-6
              rounded-2xl bg-white dark:bg-zinc-900
              border border-zinc-100 dark:border-zinc-800
              shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]
              dark:shadow-[0_8px_60px_rgba(0,0,0,0.6)]
              overflow-hidden z-10 flex flex-col max-h-[88vh]
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex-shrink-0">
                {title && (
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-zinc-600 dark:text-zinc-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;