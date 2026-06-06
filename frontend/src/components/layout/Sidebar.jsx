import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV_ITEMS, canAccess, ROLE_LABELS } from '../../utils/roles';

const ICONS = { LayoutDashboard, Building2, Users, FileText, CheckCircle, ShoppingCart, Receipt };

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter((item) => canAccess(user?.role, item));

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      <div className={`flex h-16 items-center border-b border-border ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        {!collapsed ? (
          <span className="font-display text-lg font-bold tracking-tight text-ink">
            Vendor<span className="text-accent">Bridge</span>
          </span>
        ) : (
          <span className="font-display text-lg font-bold text-accent">V</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleNav.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-muted hover:bg-canvas hover:text-ink'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={1.75} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-xl bg-canvas px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-600 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} strokeWidth={1.75} />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 flex w-full items-center justify-center rounded-xl py-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
