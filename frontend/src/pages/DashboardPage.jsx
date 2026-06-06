import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  ShoppingCart,
  Receipt,
  Building2,
  Clock,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { greeting, formatDate, formatCurrency } from '../utils/format';
import { ROLE_LABELS } from '../utils/roles';

function ListSection({ title, items, emptyTitle, renderItem }) {
  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {items?.length > 0 ? (
          items.map(renderItem)
        ) : (
          <div className="p-6">
            <EmptyState title={emptyTitle} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { onMenuClick } = useOutletContext();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const analytics = data?.analytics || {};

  return (
    <>
      <Header
        title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle={`${ROLE_LABELS[user?.role]} workspace · ${formatDate(new Date())}`}
        onMenuClick={onMenuClick}
      />

      <div className="px-6 py-8 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-border/50" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total RFQs"
                value={analytics.totalRFQs ?? 0}
                hint={`${data?.activeRFQs?.length ?? 0} currently active`}
                icon={FileText}
                delay={0}
              />
              <StatCard
                label="Purchase Orders"
                value={analytics.totalPurchaseOrders ?? 0}
                hint="All time"
                icon={ShoppingCart}
                delay={0.05}
              />
              <StatCard
                label="Invoices"
                value={analytics.totalInvoices ?? 0}
                hint="Generated documents"
                icon={Receipt}
                delay={0.1}
              />
              <StatCard
                label="Vendors"
                value={analytics.totalVendors ?? 0}
                hint="Registered suppliers"
                icon={Building2}
                delay={0.15}
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'procurement_officer') && (
                <ListSection
                  title="Pending Approvals"
                  items={data?.pendingApprovals}
                  emptyTitle="No pending approvals"
                  renderItem={(item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-canvas/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {item.rfqId?.title || 'RFQ'}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {item.vendorId?.companyName} · {formatCurrency(item.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </motion.div>
                  )}
                />
              )}

              <ListSection
                title="Active RFQs"
                items={data?.activeRFQs}
                emptyTitle="No active RFQs"
                renderItem={(item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-canvas/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <Clock size={12} />
                        Deadline {formatDate(item.deadline)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                )}
              />

              <ListSection
                title="Recent Purchase Orders"
                items={data?.recentPurchaseOrders}
                emptyTitle="No purchase orders yet"
                renderItem={(item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-canvas/50"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-ink">{item.poNumber}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.vendorId?.companyName} · {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                )}
              />

              <ListSection
                title="Recent Invoices"
                items={data?.recentInvoices}
                emptyTitle="No invoices yet"
                renderItem={(item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-canvas/50"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-ink">{item.invoiceNumber}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.vendorId?.companyName} · {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                )}
              />
            </div>

            {user?.role === 'vendor' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl border border-accent/20 bg-accent-soft p-6"
              >
                <p className="font-display text-lg font-semibold text-ink">Vendor portal</p>
                <p className="mt-2 max-w-lg text-sm text-muted">
                  View assigned RFQs and submit quotations from upcoming modules. Your dashboard
                  shows procurement activity across the platform.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
}
