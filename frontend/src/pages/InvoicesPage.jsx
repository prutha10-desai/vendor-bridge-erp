import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Receipt, Download, Printer, Mail } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { documentsApi } from '../api/documents';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate } from '../utils/format';

export default function InvoicesPage() {
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const isOfficer = user?.role === 'procurement_officer';

  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: invData }, { data: poData }] = await Promise.all([
        documentsApi.listInvoices(),
        documentsApi.listPOs(),
      ]);
      setInvoices(invData);
      if (isOfficer) {
        const invoicedPoIds = new Set(invData.map((i) => i.purchaseOrderId?._id || i.purchaseOrderId));
        setOrders(poData.filter((po) => !invoicedPoIds.has(po._id)));
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateInvoice = async (purchaseOrderId) => {
    setGenerating(purchaseOrderId);
    try {
      await documentsApi.generateInvoice(purchaseOrderId);
      fetchData();
    } finally {
      setGenerating(null);
    }
  };

  const downloadPdf = async (invoice) => {
    const { data } = await documentsApi.downloadInvoice(invoice._id);
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const printPdf = async (invoice) => {
    const { data } = await documentsApi.printInvoice(invoice._id);
    const url = window.URL.createObjectURL(new Blob([data]));
    window.open(url, '_blank');
  };

  const sendEmail = async () => {
    if (!emailModal) return;
    setEmailLoading(true);
    try {
      await documentsApi.emailInvoice(emailModal._id, emailTo || undefined);
      setEmailModal(null);
      setEmailTo('');
      fetchData();
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <Header title="Invoices" subtitle="Generated procurement invoices" onMenuClick={onMenuClick} />

      <div className="px-6 py-8 lg:px-8 space-y-8">
        {isOfficer && orders.length > 0 && (
          <div className="rounded-2xl border border-accent/20 bg-accent-soft/30 p-6">
            <h3 className="font-display font-semibold text-ink">Purchase orders ready for invoice</h3>
            <div className="mt-4 space-y-2">
              {orders.map((po) => (
                <div
                  key={po._id}
                  className="flex flex-col gap-3 rounded-xl bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{po.poNumber}</p>
                    <p className="text-xs text-muted">
                      {po.vendorId?.companyName} · {formatCurrency(po.totalAmount)}
                    </p>
                  </div>
                  <Button size="sm" loading={generating === po._id} onClick={() => generateInvoice(po._id)}>
                    Generate invoice
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
        ) : invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/50">
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Invoice</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">PO</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Vendor</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Total</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-canvas/30">
                    <td className="px-5 py-4 font-mono font-medium text-ink">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-muted">{inv.purchaseOrderId?.poNumber || '—'}</td>
                    <td className="px-5 py-4 text-muted">{inv.vendorId?.companyName || '—'}</td>
                    <td className="px-5 py-4 font-mono">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => downloadPdf(inv)}
                          className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => printPdf(inv)}
                          className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink"
                          title="Print"
                        >
                          <Printer size={16} />
                        </button>
                        {isOfficer && (
                          <button
                            type="button"
                            onClick={() => setEmailModal(inv)}
                            className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-accent"
                            title="Email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!emailModal} onClose={() => setEmailModal(null)} title="Email invoice">
        <div className="space-y-4">
          <Input
            label="Recipient email"
            type="email"
            placeholder="vendor@example.com"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEmailModal(null)}>
              Cancel
            </Button>
            <Button loading={emailLoading} onClick={sendEmail}>
              Send invoice
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
