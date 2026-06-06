import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md', scrollable = false }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex w-full flex-col rounded-2xl border border-border bg-surface shadow-2xl ${
                widths[size]
              } ${scrollable ? 'max-h-[90vh]' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className={`px-6 py-5 ${scrollable ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain' : ''}`}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
