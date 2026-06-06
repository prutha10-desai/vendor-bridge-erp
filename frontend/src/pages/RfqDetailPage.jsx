import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { rfqsApi } from '../api/rfqs';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatDateTime } from '../utils/format';

export default function RfqDetailPage() {
  const { id } = useParams();
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isOfficer = user?.role === 'procurement_officer';
  const isVendor = user?.role === 'vendor';
  const canCompare = ['procurement_officer', 'manager'].includes(user?.role);

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRfq = async () => {
    setLoading(true);
    try {
      const { data } = await rfqsApi.get(id);
      setRfq(data);
    } catch {
      setRfq(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfq();
  }, [id]);

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await rfqsApi.publish(id);
      fetchRfq();
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    setActionLoading(true);
    try {
      await rfqsApi.close(id);
      fetchRfq();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="RFQ Details" onMenuClick={onMenuClick} />
        <div className="px-6 py-8">
          <div className="h-64 animate-pulse rounded-2xl bg-border/50" />
        </div>
      </>
    );
  }

  if (!rfq) {
    return (
      <>
        <Header title="RFQ not found" onMenuClick={onMenuClick} />
        <div className="px-6 py-8">
          <Link to="/rfqs" className="text-sm text-accent hover:underline">
            ← Back to RFQs
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={rfq.title}
        subtitle={`Deadline ${formatDate(rfq.deadline)}`}
        onMenuClick={onMenuClick}
        actions={
          <div className="flex flex-wrap gap-2">
            {isOfficer && rfq.status === 'draft' && (
              <Button size="sm" loading={actionLoading} onClick={handlePublish}>
                Publish
              </Button>
            )}
            {isOfficer && rfq.status === 'published' && (
              <Button size="sm" variant="secondary" loading={actionLoading} onClick={handleClose}>
                Close RFQ
              </Button>
            )}
            {canCompare && rfq.status !== 'draft' && (
              <Link to={`/rfqs/${id}/compare`}>
                <Button size="sm" variant="secondary">
                  Compare quotations
                </Button>
              </Link>
            )}
            {isVendor && rfq.status === 'published' && (
              <Link to={`/rfqs/${id}/quote`}>
                <Button size="sm">Submit quotation</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="px-6 py-8 lg:px-8">
        <Link to="/rfqs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Back to RFQs
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">Overview</h3>
                <StatusBadge status={rfq.status} />
              </div>
              {rfq.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted">{rfq.description}</p>
              )}
              <p className="mt-4 text-xs text-muted">
                Created by {rfq.createdBy?.name} · {formatDateTime(rfq.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-display font-semibold text-ink">Line items</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-canvas/50">
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted">Item</th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted">Qty</th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rfq.lineItems?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3 text-ink">{item.productService}</td>
                      <td className="px-6 py-3 text-muted">{item.quantity}</td>
                      <td className="px-6 py-3 text-muted">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold text-ink">Assigned vendors</h3>
            <ul className="mt-4 space-y-2">
              {rfq.assignedVendors?.length > 0 ? (
                rfq.assignedVendors.map((v) => (
                  <li key={v._id} className="rounded-xl bg-canvas px-3 py-2 text-sm text-ink">
                    {v.companyName}
                    <span className="ml-2 text-xs text-muted">{v.category}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted">No vendors assigned</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
