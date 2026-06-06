import { motion } from 'framer-motion';

export default function StatCard({ label, value, hint, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-border bg-surface p-6 transition-shadow duration-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">{label}</p>
        {Icon && (
          <div className="rounded-xl bg-canvas p-2 text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent">
            <Icon size={16} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <p className="mt-4 font-mono text-3xl font-semibold tracking-tight text-ink">{value ?? '—'}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}
