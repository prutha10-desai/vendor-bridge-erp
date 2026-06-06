import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Editorial left panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col lg:justify-between"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1510 50%, #2a1f14 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute -left-20 top-20 h-96 w-96 rounded-full blur-3xl"
            style={{ background: '#c17a2e' }}
          />
          <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 p-12 xl:p-16">
          <Link to="/" className="inline-block">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Vendor<span className="text-accent">Bridge</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-accent">
              Procurement ERP
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">
              Structured
              <br />
              procurement,
              <br />
              <span className="text-white/40">refined.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/50">
              Manage vendors, RFQs, quotations, approvals, purchase orders and invoices — all in
              one editorial workspace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-10"
          >
            {[
              { label: 'Vendors', value: '∞' },
              { label: 'Workflows', value: '8' },
              { label: 'Roles', value: '4' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-2xl font-medium text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 p-12 xl:p-16">
          <p className="font-mono text-xs text-white/30">© 2026 VendorBridge</p>
        </div>
      </motion.div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
              Vendor<span className="text-accent">Bridge</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-8"
          >
            {children}
          </motion.div>

          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
