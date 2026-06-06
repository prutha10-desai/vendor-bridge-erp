import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import StatusBadge from '../components/ui/StatusBadge';
import { rfqsApi } from '../api/rfqs';
import { quotationsApi } from '../api/quotations';
import { formatCurrency } from '../utils/format';

export default function VendorQuotePage() {
  const { id } = useParams();
  const { onMenuClick } = useOutletContext();
  const [rfq, setRfq] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    deliveryTimeline: '',
    deliveryDays: 0,
    notes: '',
    lineItems: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: rfqData } = await rfqsApi.get(id);
        setRfq(rfqData);
        setForm((f) => ({
          ...f,
          lineItems: rfqData.lineItems.map((item) => ({
            productService: item.productService,
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
          })),
        }));
      } catch {
        setRfq(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updatePrice = (index, unitPrice) => {
    const lineItems = [...form.lineItems];
    const qty = lineItems[index].quantity;
    lineItems[index] = {
      ...lineItems[index],
      unitPrice: Number(unitPrice),
      totalPrice: Number(unitPrice) * qty,
    };
    setForm({ ...form, lineItems });
  };

  const total = form.lineItems.reduce((s, i) => s + (i.totalPrice || 0), 0);

  const saveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      if (quotation?._id) {
        const { data } = await quotationsApi.update(quotation._id, form);
        setQuotation(data);
      } else {
        const { data } = await quotationsApi.create({ rfqId: id, ...form });
        setQuotation(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  const submitQuote = async () => {
    setSaving(true);
    setError('');
    try {
      let q = quotation;
      if (!q?._id) {
        const { data } = await quotationsApi.create({ rfqId: id, ...form });
        q = data;
        setQuotation(data);
      } else {
        const { data } = await quotationsApi.update(q._id, form);
        q = data;
        setQuotation(data);
      }
      const { data: submitted } = await quotationsApi.submit(q._id);
      setQuotation(submitted);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setSaving(false);
    }
  };

  const readOnly = quotation && !['draft', 'submitted'].includes(quotation.status);

  if (loading) {
    return (
      <>
        <Header title="Submit quotation" onMenuClick={onMenuClick} />
        <div className="px-6 py-8">
          <div className="h-64 animate-pulse rounded-2xl bg-border/50" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Submit quotation" subtitle={rfq?.title} onMenuClick={onMenuClick} />

      <div className="px-6 py-8 lg:px-8">
        <Link to={`/rfqs/${id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} />
          Back to RFQ
        </Link>

        {quotation?.status && (
          <div className="mb-6">
            <StatusBadge status={quotation.status} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {form.lineItems.map((item, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface p-5">
                <p className="font-medium text-ink">{item.productService}</p>
                <p className="mt-1 text-xs text-muted">Qty: {item.quantity}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Unit price"
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) => updatePrice(index, e.target.value)}
                    disabled={readOnly}
                  />
                  <Input
                    label="Line total"
                    value={formatCurrency(item.totalPrice)}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            ))}

            <Input
              label="Delivery timeline"
              value={form.deliveryTimeline}
              onChange={(e) => setForm({ ...form, deliveryTimeline: e.target.value })}
              disabled={readOnly}
              required
            />
            <Input
              label="Delivery days"
              type="number"
              min={0}
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: Number(e.target.value) })}
              disabled={readOnly}
            />
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={readOnly}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 h-fit sticky top-24">
            <p className="text-xs uppercase tracking-widest text-muted">Total amount</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-ink">{formatCurrency(total)}</p>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!readOnly && (
              <div className="mt-6 space-y-2">
                <Button className="w-full" variant="secondary" loading={saving} onClick={saveDraft}>
                  Save draft
                </Button>
                <Button className="w-full" loading={saving} onClick={submitQuote}>
                  Submit quotation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
