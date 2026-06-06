const styles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-gray-100 text-gray-600 ring-gray-200',
  blacklisted: 'bg-red-50 text-red-700 ring-red-200',
  draft: 'bg-gray-100 text-gray-600 ring-gray-200',
  published: 'bg-blue-50 text-blue-700 ring-blue-200',
  closed: 'bg-gray-100 text-gray-600 ring-gray-200',
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  selected: 'bg-accent-soft text-accent ring-accent/20',
  issued: 'bg-blue-50 text-blue-700 ring-blue-200',
  generated: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  sent: 'bg-purple-50 text-purple-700 ring-purple-200',
};

const labels = {
  under_review: 'Under Review',
  procurement_officer: 'Procurement Officer',
  blacklisted: 'Blacklisted',
};

export default function StatusBadge({ status, className = '' }) {
  const key = status?.toLowerCase?.() || 'pending';
  const label = labels[key] || key.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${styles[key] || styles.pending} ${className}`}
    >
      {label}
    </span>
  );
}
