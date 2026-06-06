import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { rfqsApi } from '../api/rfqs';
import { vendorsApi } from '../api/vendors';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/format';

const emptyLineItem = { productService: '', description: '', quantity: 1, unit: 'unit' };

export default function RfqsPage() {
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isOfficer = user?.role === 'procurement_officer';
  const isVendor = user?.role === 'vendor';

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    lineItems: [{ ...emptyLineItem }],
    assignedVendors: [],
  });

  const fetchRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await rfqsApi.list(params);
      setRfqs(data);
    } catch {
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchRfqs, 300);
    return () => clearTimeout(t);
  }, [fetchRfqs]);

  const openCreate = async () => {
    setError('');
    setForm({
      title: '',
      description: '',
      deadline: '',
      lineItems: [{ ...emptyLineItem }],
      assignedVendors: [],
    });
    try {
      const { data } = await vendorsApi.list({ status: 'active' });
      setVendors(data);
    } catch {
      setVendors([]);
    }
    setModalOpen(true);
  };

  const addLineItem = () => {
    setForm({ ...form, lineItems: [...form.lineItems, { ...emptyLineItem }] });
  };

  const updateLineItem = (index, field, value) => {
    const lineItems = [...form.lineItems];
    lineItems[index] = { ...lineItems[index], [field]: value };
    setForm({ ...form, lineItems });
  };

  const removeLineItem = (index) => {
    if (form.lineItems.length === 1) return;
    setForm({ ...form, lineItems: form.lineItems.filter((_, i) => i !== index) });
  };

  const toggleVendor = (vendorId) => {
    const ids = form.assignedVendors.includes(vendorId)
      ? form.assignedVendors.filter((id) => id !== vendorId)
      : [...form.assignedVendors, vendorId];
    setForm({ ...form, assignedVendors: ids });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await rfqsApi.create(form);
      setModalOpen(false);
      fetchRfqs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="RFQs"
        subtitle={isVendor ? 'Assigned procurement requests' : 'Request for quotation management'}
        onMenuClick={onMenuClick}
        actions={
          isOfficer && (
            <Button onClick={openCreate} size="sm">
              <Plus size={16} />
              New RFQ
            </Button>
          )
        }
      />

      <div className="px-6 py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search RFQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : rfqs.length === 0 ? (
          <EmptyState icon={FileText} title="No RFQs found" />
        ) : (
          <div className="space-y-3">
            {rfqs.map((rfq) => (
              <Link
                key={rfq._id}
                to={`/rfqs/${rfq._id}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 transition-all hover:border-accent/30 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-semibold text-ink">{rfq.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    Deadline {formatDate(rfq.deadline)} · {rfq.assignedVendors?.length || 0} vendors
                  </p>
                </div>
                <StatusBadge status={rfq.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create RFQ" size="xl" scrollable>
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">RFQ details</p>
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="Deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Line items</p>
            {form.lineItems.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-border bg-canvas/50 p-4 sm:grid-cols-4">
                <Input
                  label="Product / Service"
                  value={item.productService}
                  onChange={(e) => updateLineItem(index, 'productService', e.target.value)}
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                  required
                />
                <Input
                  label="Unit"
                  value={item.unit}
                  onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                />
                <div className="flex items-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addLineItem}>
              Add line item
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Assign vendors</p>
            <div className="space-y-2 rounded-xl border border-border p-3">
              {vendors.map((v) => (
                <label key={v._id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-canvas">
                  <input
                    type="checkbox"
                    checked={form.assignedVendors.includes(v._id)}
                    onChange={() => toggleVendor(v._id)}
                    className="accent-accent"
                  />
                  <span className="text-sm text-ink">{v.companyName}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create RFQ
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
