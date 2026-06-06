import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { documentsApi } from '../api/documents';
import { rfqsApi } from '../api/rfqs';
import { quotationsApi } from '../api/quotations';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate } from '../utils/format';

export default function PurchaseOrdersPage() {
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isOfficer = user?.role === 'procurement_officer';

  const [orders, setOrders] = useState([]);
  const [approvedQuotes, setApprovedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: poData } = await documentsApi.listPOs();
      setOrders(poData);

      if (isOfficer) {
        const { data: rfqs } = await rfqsApi.list();
        const approved = [];
        for (const rfq of rfqs) {
          try {
            const { data: quotes } = await quotationsApi.listByRfq(rfq._id);
            quotes
              .filter((q) => q.status === 'approved')
              .forEach((q) => approved.push({ ...q, rfqTitle: rfq.title }));
          } catch {
            /* skip */
          }
        }
        setApprovedQuotes(approved);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generatePO = async (quotationId) => {
    setGenerating(quotationId);
    try {
      await documentsApi.generatePO(quotationId);
      fetchData();
    } catch {
      /* ignore */
    } finally {
      setGenerating(null);
    }
  };

  return (
    <>
      <Header title="Purchase Orders" subtitle="Official procurement documents" onMenuClick={onMenuClick} />

      <div className="px-6 py-8 lg:px-8 space-y-8">
        {isOfficer && approvedQuotes.length > 0 && (
          <div className="rounded-2xl border border-accent/20 bg-accent-soft/30 p-6">
            <h3 className="font-display font-semibold text-ink">Approved quotations ready for PO</h3>
            <div className="mt-4 space-y-2">
              {approvedQuotes.map((q) => (
                <div
                  key={q._id}
                  className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{q.rfqTitle}</p>
                    <p className="text-xs text-muted">
                      {q.vendorId?.companyName} · {formatCurrency(q.totalAmount)}
                    </p>
                  </div>
                  <Button size="sm" loading={generating === q._id} onClick={() => generatePO(q._id)}>
                    Generate PO
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No purchase orders yet" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/50">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">PO Number</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">RFQ</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Vendor</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Total</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((po) => (
                  <tr key={po._id} className="hover:bg-canvas/30">
                    <td className="px-5 py-4 font-mono font-medium text-ink">{po.poNumber}</td>
                    <td className="px-5 py-4 text-muted">{po.rfqId?.title || '—'}</td>
                    <td className="px-5 py-4 text-muted">{po.vendorId?.companyName || '—'}</td>
                    <td className="px-5 py-4 font-mono">{formatCurrency(po.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">{formatDate(po.createdAt)}</td>
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
