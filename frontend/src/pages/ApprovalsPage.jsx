import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { rfqsApi } from '../api/rfqs';
import { quotationsApi } from '../api/quotations';
import { formatCurrency } from '../utils/format';

export default function ApprovalsPage() {
  const { onMenuClick } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const { data: rfqs } = await rfqsApi.list();
      const all = [];
      for (const rfq of rfqs) {
        try {
          const { data: quotes } = await quotationsApi.listByRfq(rfq._id);
          quotes
            .filter((q) => q.status === 'under_review')
            .forEach((q) => all.push({ ...q, rfqTitle: rfq.title }));
        } catch {
          /* skip */
        }
      }
      setItems(all);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (action) => {
    if (!selected) return;
    setSaving(true);
    try {
      if (action === 'approve') {
        await quotationsApi.approve(selected._id, remarks);
      } else {
        await quotationsApi.reject(selected._id, remarks);
      }
      setSelected(null);
      setRemarks('');
      fetchApprovals();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Approvals"
        subtitle="Review quotations pending your decision"
        onMenuClick={onMenuClick}
      />

      <div className="px-6 py-8 lg:px-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={CheckCircle} title="No pending approvals" />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display font-semibold text-ink">{item.rfqTitle}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.vendorId?.companyName} · {formatCurrency(item.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <Button size="sm" onClick={() => setSelected(item)}>
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setRemarks('');
        }}
        title="Review quotation"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {selected.vendorId?.companyName} · {formatCurrency(selected.totalAmount)}
            </p>
            <Textarea
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add approval or rejection notes..."
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                loading={saving}
                onClick={() => handleAction('reject')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button loading={saving} onClick={() => handleAction('approve')}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
