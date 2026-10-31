import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import CancelModal from '../../components/subscriptions/CancelModal';
import { subscriptionsApi } from '../../services/api';
import { Layers, Calendar, RefreshCw, XCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MySubscriptions({ onNavigate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await subscriptionsApi.getMy();
      if (res.success) {
        setSubscriptions(res.subscriptions);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch subscriptions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) return <Loading message="Loading your subscriptions..." />;

  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'pending');
  const pastSubs = subscriptions.filter(s => s.status === 'expired' || s.status === 'cancelled');

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Subscriptions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Overview of current active plans, next renewal dates, and subscription history.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={() => onNavigate('/customer/plans')}
        >
          Explore New Plans
        </Button>
      </div>

      {/* Active Subscriptions Section */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Active & Pending Subscriptions
        </h3>

        {activeSubs.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm font-medium">No active subscriptions currently.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onNavigate('/customer/plans')}
              >
                Browse Plans
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-600 block">
                        {sub.subscription_code}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">{sub.plan_name}</h4>
                    </div>
                    <Badge status={sub.status} size="sm" />
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-black text-slate-900">
                      ${parseFloat(sub.plan_price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{sub.billing_cycle}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100 my-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Date:</span>
                      <span className="font-medium text-slate-800">{sub.start_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Renewal:</span>
                      <span className="font-semibold text-brand-600">{sub.next_billing_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auto Renewal:</span>
                      <span className="font-semibold text-emerald-600">
                        {sub.auto_renew ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('/customer/invoices')}
                  >
                    View Invoices
                  </Button>

                  {sub.status === 'active' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setSelectedForCancel(sub)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription History (Expired / Cancelled) */}
      {pastSubs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Subscription History
          </h3>
          <div className="space-y-3">
            {pastSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{sub.subscription_code}</span>
                    <Badge status={sub.status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {sub.plan_name} • Started: {sub.start_date} • Ended: {sub.expiry_date}
                  </p>
                  {sub.cancellation_reason && (
                    <p className="text-slate-400 italic mt-0.5">Reason: {sub.cancellation_reason}</p>
                  )}
                </div>

                <span className="font-bold text-slate-700 text-sm">
                  ${parseFloat(sub.plan_price || 0).toFixed(2)}/{sub.billing_cycle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedForCancel && (
        <CancelModal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          subscription={selectedForCancel}
          onSuccess={(sub) => {
            setToast({ type: 'success', message: 'Subscription cancelled.' });
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
