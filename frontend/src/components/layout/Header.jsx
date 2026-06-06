import { Menu } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/roles';
import { useAuthStore } from '../../store/authStore';

export default function Header({ title, subtitle, actions, onMenuClick }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-muted transition-colors hover:bg-canvas hover:text-ink lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <div className="hidden sm:flex items-center gap-3 rounded-full border border-border bg-canvas pl-1 pr-4 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-ink">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
