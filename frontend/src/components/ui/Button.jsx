import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-surface text-ink border border-border hover:border-ink/20 hover:bg-canvas disabled:opacity-50',
  ghost: 'text-muted hover:text-ink hover:bg-canvas disabled:opacity-50',
  google:
    'bg-surface text-ink border border-border hover:border-ink/30 hover:shadow-sm disabled:opacity-50',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm font-medium',
  lg: 'px-8 py-3.5 text-base font-medium',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body tracking-wide transition-all duration-200 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Please wait</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
