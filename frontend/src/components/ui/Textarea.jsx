export default function Textarea({ label, error, className = '', id, ...props }) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`w-full resize-none rounded-xl border bg-surface px-4 py-3.5 font-body text-sm text-ink outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/15 ${
          error ? 'border-red-400' : 'border-border'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
