import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { rfqsApi } from '../api/rfqs';
import { quotationsApi } from '../api/quotations';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/format';

export default function RfqComparePage() {
  const { id } = useParams();
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isOfficer = user?.role === 'procurement_officer';
  const [rfq, setRfq] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: rfqData }, { data: compareData }] = await Promise.all([
        rfqsApi.get(id),
        quotationsApi.compare(id, sortBy || undefined),
      ]);
      setRfq(rfqData);
      setComparison(compareData);
    } catch {
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, sortBy]);

  const sendForApproval = async (quotationId) => {
    setActionLoading(quotationId);
    try {
      await quotationsApi.initiateApproval(quotationId);
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Header
        title="Compare quotations"
        subtitle={rfq?.title}
        onMenuClick={onMenuClick}
      />

      <div className="px-6 py-8 lg:px-8">
        <Link to={`/rfqs/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Back to RFQ
        </Link>

        <div className="mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="">Sort by price</option>
            <option value="delivery">Sort by delivery</option>
            <option value="rating">Sort by rating</option>
          </select>
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-border/50" />
        ) : !comparison?.quotations?.length ? (
          <EmptyState title="No quotations to compare" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/50">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Vendor</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Total</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Delivery</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Rating</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
                  {isOfficer && (
                    <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.quotations.map((q) => (
                  <tr
                    key={q._id}
                    className={q.isLowestPrice ? 'bg-accent-soft/50' : ''}
                  >
                    <td className="px-5 py-4 font-medium text-ink">
                      {q.vendorId?.companyName}
                      {q.isLowestPrice && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-accent">Lowest</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono">{formatCurrency(q.totalAmount)}</td>
                    <td className="px-5 py-4 text-muted">{q.deliveryTimeline}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Star size={12} className="text-accent" fill="currentColor" />
                        {q.vendorId?.rating?.toFixed(1) || '0.0'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={q.status} />
                    </td>
                    {isOfficer && (
                      <td className="px-5 py-4">
                        {q.status === 'submitted' && (
                          <Button
                            size="sm"
                            loading={actionLoading === q._id}
                            onClick={() => sendForApproval(q._id)}
                          >
                            Send for approval
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
