export default function AuthTabs({ active, onChange, mode = 'login' }) {
  const tabs = [
    { id: 'email', label: 'Email' },
    { id: 'google', label: 'Google' },
    { id: 'otp', label: 'OTP' },
  ];

  return (
    <div className="mb-8 flex rounded-full border border-border bg-canvas p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-full py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
            active === tab.id
              ? 'bg-ink text-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
