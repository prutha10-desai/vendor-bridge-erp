const ROLE_OPTIONS = [
  { value: 'procurement_officer', label: 'Procurement Officer', desc: 'Create RFQs, POs & invoices' },
  { value: 'vendor', label: 'Vendor', desc: 'Submit quotations & track RFQs' },
  { value: 'manager', label: 'Manager / Approver', desc: 'Approve procurement requests' },
  { value: 'admin', label: 'Admin', desc: 'Manage users & system settings' },
];

export { ROLE_OPTIONS };

export default function RoleSelect({ value, onChange, error }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Your role</p>
      <div className="grid gap-2">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
              value === role.value
                ? 'border-accent bg-accent-soft ring-1 ring-accent/30'
                : 'border-border bg-surface hover:border-ink/20'
            }`}
          >
            <span className="text-sm font-medium text-ink">{role.label}</span>
            <span className="text-xs text-muted">{role.desc}</span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
