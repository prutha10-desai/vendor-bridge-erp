import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Trash2, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { ROLE_LABELS, AUTH_PROVIDER_LABELS } from '../utils/roles';
import { formatDateTime } from '../utils/format';

export default function AdminUsersPage() {
  const { onMenuClick } = useOutletContext();
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    setToggling(user._id);
    try {
      await usersApi.update(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch {
      /* ignore */
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Header
        title="User management"
        subtitle="Manage accounts, roles, and access"
        onMenuClick={onMenuClick}
      />

      <div className="px-6 py-8 lg:px-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-border/50" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/50">
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">User</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Role</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Provider</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Joined</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSelf = user._id === currentUser?._id;
                  return (
                    <tr key={user._id} className="transition-colors hover:bg-canvas/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 text-[10px] uppercase tracking-wider text-accent">You</span>
                              )}
                            </p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-ink">
                          {user.role === 'admin' && <Shield size={12} className="text-accent" />}
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {AUTH_PROVIDER_LABELS[user.authProvider] || user.authProvider || 'Email'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">{formatDateTime(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {!isSelf && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                loading={toggling === user._id}
                                onClick={() => handleToggleActive(user)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(user)}
                                className="rounded-full p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={`Permanently delete "${deleteTarget?.name}" (${deleteTarget?.email})? This cannot be undone.`}
        confirmLabel="Delete user"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
