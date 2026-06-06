import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Building2,
  Star,
  Pencil,
  Trash2,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { vendorsApi } from '../api/vendors';
import { useAuthStore } from '../store/authStore';
import { VENDOR_STATUSES } from '../utils/roles';

const EMPTY_VENDOR = {
  companyName: '',
  category: '',
  gstNumber: '',
  address: '',
  status: 'pending',
  contacts: [{ name: '', email: '', phone: '', designation: '' }],
};

export default function VendorsPage() {
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const canEdit = ['admin', 'procurement_officer'].includes(user?.role);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('card');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_VENDOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await vendorsApi.list(params);
      setVendors(data);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchVendors, 300);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_VENDOR);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditing(vendor);
    setForm({
      companyName: vendor.companyName,
      category: vendor.category,
      gstNumber: vendor.gstNumber,
      address: vendor.address,
      status: vendor.status,
      contacts: vendor.contacts?.length
        ? vendor.contacts
        : [{ name: '', email: '', phone: '', designation: '' }],
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        companyName: form.companyName,
        category: form.category,
        gstNumber: form.gstNumber,
        address: form.address,
        contacts: form.contacts.filter((c) => c.name && c.email),
      };
      if (editing) {
        await vendorsApi.update(editing._id, payload);
      } else {
        await vendorsApi.create({ ...payload, status: form.status });
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (vendor, status) => {
    try {
      await vendorsApi.updateStatus(vendor._id, status);
      fetchVendors();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vendorsApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const updateContact = (index, field, value) => {
    const contacts = [...form.contacts];
    contacts[index] = { ...contacts[index], [field]: value };
    setForm({ ...form, contacts });
  };

  return (
    <>
      <Header
        title="Vendors"
        subtitle={`${vendors.length} registered supplier${vendors.length !== 1 ? 's' : ''}`}
        onMenuClick={onMenuClick}
        actions={
          canEdit && (
            <Button onClick={openCreate} size="sm">
              <Plus size={16} />
              Register vendor
            </Button>
          )
        }
      />

      <div className="px-6 py-8 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search company or GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="">All statuses</option>
              {VENDOR_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex rounded-full border border-border bg-canvas p-1">
              <button
                type="button"
                onClick={() => setView('card')}
                className={`rounded-full p-2 transition-colors ${view === 'card' ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-full p-2 transition-colors ${view === 'list' ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No vendors found"
            description="Register your first supplier to start procurement workflows."
            action={
              canEdit && (
                <Button onClick={openCreate}>
                  <Plus size={16} />
                  Register vendor
                </Button>
              )
            }
          />
        ) : view === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {vendors.map((vendor, i) => (
                <motion.div
                  key={vendor._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold text-ink">
                        {vendor.companyName}
                      </h3>
                      <p className="mt-1 text-xs text-muted">{vendor.category}</p>
                    </div>
                    <StatusBadge status={vendor.status} />
                  </div>
                  <p className="mt-3 font-mono text-xs text-muted">{vendor.gstNumber}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted">
                    <Star size={12} className="text-accent" fill="currentColor" />
                    {vendor.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                    {canEdit && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(vendor)}>
                          <Pencil size={14} />
                          Edit
                        </Button>
                        <select
                          value={vendor.status}
                          onChange={(e) => handleStatusChange(vendor, e.target.value)}
                          className="flex-1 rounded-full border border-border bg-canvas px-3 py-1.5 text-xs outline-none"
                        >
                          {VENDOR_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(vendor)}
                        className="rounded-full p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/50">
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Company</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Category</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">GST</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Rating</th>
                  {canEdit && (
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="transition-colors hover:bg-canvas/30">
                    <td className="px-5 py-4 font-medium text-ink">{vendor.companyName}</td>
                    <td className="px-5 py-4 text-muted">{vendor.category}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted">{vendor.gstNumber}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">{vendor.rating?.toFixed(1) || '0.0'}</td>
                    {canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(vendor)}
                            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink"
                          >
                            <Pencil size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(vendor)}
                              className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit vendor' : 'Register vendor'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              placeholder="Industrial, IT, Logistics..."
            />
          </div>
          <Input
            label="GST number"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            required
          />
          <Textarea
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          {!editing && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={VENDOR_STATUSES}
            />
          )}
          <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Primary contact</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Name"
                value={form.contacts[0]?.name || ''}
                onChange={(e) => updateContact(0, 'name', e.target.value)}
              />
              <Input
                label="Designation"
                value={form.contacts[0]?.designation || ''}
                onChange={(e) => updateContact(0, 'designation', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={form.contacts[0]?.email || ''}
                onChange={(e) => updateContact(0, 'email', e.target.value)}
              />
              <Input
                label="Phone"
                value={form.contacts[0]?.phone || ''}
                onChange={(e) => updateContact(0, 'phone', e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Register vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete vendor"
        message={`Permanently delete "${deleteTarget?.companyName}"? This cannot be undone. Linked users will be unlinked.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}
