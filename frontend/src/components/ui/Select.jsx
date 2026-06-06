export default function Select({ label, error, options, className = '', id, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full appearance-none rounded-xl border bg-surface px-4 py-3.5 font-body text-sm text-ink outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/15 ${
          error ? 'border-red-400' : 'border-border'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
