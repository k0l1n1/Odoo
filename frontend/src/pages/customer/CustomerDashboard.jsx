import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import PaymentModal from '../../components/payments/PaymentModal';
import CancelModal from '../../components/subscriptions/CancelModal';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Layers,
  CreditCard,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Clock
} from 'lucide-react';

export default function CustomerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [cancelModalSub, setCancelModalSub] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getCustomer();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
      setToast({ type: 'error', message: err.message || 'Error loading dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading message="Loading your workspace..." />;

  const { activeSubscription, pendingInvoices = [], totalPaid = 0, recentPayments = [], availablePlans = [] } = data || {};

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2 border border-brand-500/30">
              <Sparkles className="h-3 w-3" />
              <span>Customer Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Customer'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {user?.company_name ? `${user.company_name} • ` : ''}Manage your active subscriptions, pay recurring invoices, and track billing history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => onNavigate('/customer/invoices')}
            >
              My Invoices
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => onNavigate('/customer/plans')}
            >
              Browse Plans
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Invoices Urgent Banner (if any) */}
      {pendingInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent bg-white border border-amber-200/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {pendingInvoices.length} Pending Invoice(s) Awaiting Payment
                </span>
                <Badge status="pending" size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Invoice #{pendingInvoices[0].invoice_number} ({pendingInvoices[0].plan_name}) for ₹{parseFloat(pendingInvoices[0].total_amount).toFixed(2)} is due on {pendingInvoices[0].due_date}.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={CreditCard}
            onClick={() => setPayModalInvoice(pendingInvoices[0])}
          >
            Pay Now (₹{parseFloat(pendingInvoices[0].total_amount).toFixed(2)})
          </Button>
        </div>
      )}

      {/* Main Grid: Active Subscription Card & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subscription Hero Card */}
        <div className="lg:col-span-2">
          {activeSubscription ? (
            <Card
              title="Current Subscription"
              subtitle={`Code: ${activeSubscription.subscription_code}`}
              actions={
                <Badge status={activeSubscription.status} size="sm" />
              }
            >
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      Selected Plan
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      {activeSubscription.plan_name} Tier
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Billing interval: <span className="font-semibold capitalize text-slate-700">{activeSubscription.billing_cycle}</span>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{parseFloat(activeSubscription.plan_price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{activeSubscription.billing_cycle}</span>
                  </div>
                </div>

                {/* Billing Dates Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Started</span>
                    <span className="text-xs font-bold text-slate-800">{activeSubscription.start_date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Next Renewal</span>
                    <span className="text-xs font-bold text-brand-600">{activeSubscription.next_billing_date}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Auto-Renew</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {activeSubscription.auto_renew ? 'Active (Auto)' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Plan Features Preview */}
                {activeSubscription.features && activeSubscription.features.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-700 mb-2 block">
                      Tier Capabilities & Inclusions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeSubscription.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => setCancelModalSub(activeSubscription)}
                  >
                    Cancel Subscription
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('/customer/plans')}
                  >
                    Change / Upgrade Plan
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card
              title="No Active Subscription"
              subtitle="You do not currently have an active subscription"
            >
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                  <Layers className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Choose a Plan to Get Started</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Explore our flexible Starter, Professional, and Enterprise plans with automated billing.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => onNavigate('/customer/plans')}
                >
                  Browse Available Plans
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Account Metrics */}
        <div className="space-y-4">
          <Card title="Billing Summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500">Lifetime Payments</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{parseFloat(totalPaid).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500">Pending Invoices</span>
                <Badge
                  status={pendingInvoices.length > 0 ? 'pending' : 'active'}
                  label={pendingInvoices.length > 0 ? `${pendingInvoices.length} Pending` : 'All Paid'}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Subscription Status</span>
                <Badge
                  status={activeSubscription ? 'active' : 'inactive'}
                  label={activeSubscription ? 'Active' : 'No Plan'}
                  size="sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate('/customer/invoices')}
                >
                  View All Invoices
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Help Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Automated Renewal Guarantee
            </span>
            <p>
              Your subscription renews automatically. We issue an invoice 7 days before due date so you always maintain uninterrupted access.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <Card
        title="Recent Payment History"
        subtitle="Latest transactions processed through the simulated gateway"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/customer/payments')}
          >
            All Receipts
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No payment receipts found.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {p.transaction_reference}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {p.payment_method}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {p.payment_date?.slice(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      ₹{parseFloat(p.amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge status={p.payment_status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      {payModalInvoice && (
        <PaymentModal
          isOpen={!!payModalInvoice}
          onClose={() => setPayModalInvoice(null)}
          invoice={payModalInvoice}
          onSuccess={(res) => {
            setToast({ type: 'success', message: 'Payment processed successfully! Your subscription is active.' });
            fetchDashboard();
          }}
        />
      )}

      {cancelModalSub && (
        <CancelModal
          isOpen={!!cancelModalSub}
          onClose={() => setCancelModalSub(null)}
          subscription={cancelModalSub}
          onSuccess={(sub) => {
            setToast({ type: 'success', message: 'Subscription cancelled.' });
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}
