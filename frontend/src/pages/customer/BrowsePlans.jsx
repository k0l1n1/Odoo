import React, { useState, useEffect } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import SubscribeModal from '../../components/subscriptions/SubscribeModal';
import PaymentModal from '../../components/payments/PaymentModal';
import { plansApi, subscriptionsApi } from '../../services/api';
import { Check, Sparkles, Zap, Shield, Star } from 'lucide-react';

export default function BrowsePlans({ onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycleFilter, setCycleFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await plansApi.getActive();
      if (res.success) {
        setPlans(res.plans);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load plans.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(p => {
    if (cycleFilter === 'all') return true;
    return p.billing_cycle.toLowerCase() === cycleFilter.toLowerCase();
  });

  const handleSubscribeSuccess = (sub, invoice) => {
    const planName = sub?.plan_name || selectedPlan?.name || 'Selected Plan';
    setToast({
      type: 'success',
      message: `Subscribed to ${planName}! Please complete payment to activate.`
    });
    // Open payment modal immediately
    if (invoice) {
      setInvoiceToPay(invoice);
    }
  };

  const handlePaymentSuccess = () => {
    setToast({
      type: 'success',
      message: 'Subscription successfully activated and paid!'
    });
    setTimeout(() => {
      onNavigate('/customer');
    }, 1200);
  };

  if (loading) return <Loading message="Loading subscription tiers..." />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <span>Transparent, Flexible Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Choose the Perfect Plan for Your Team
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Automate subscription lifecycle, receive itemized invoices, and enjoy seamless renewals.
        </p>

        {/* Billing cycle tabs */}
        <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          {[
            { id: 'all', label: 'All Tiers' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Annual (Save 15%)' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCycleFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                cycleFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {filteredPlans.map((plan) => {
          const isPopular = plan.name.toLowerCase().includes('professional');
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isPopular
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xl shadow-brand-500/10'
                  : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <Badge status="active" size="sm" label="Available" />
                </div>

                <p className="text-xs text-slate-500 min-h-[32px] line-clamp-2">
                  {plan.description || 'Full-featured tier.'}
                </p>

                <div className="my-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">
                      ${parseFloat(plan.price).toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      /{plan.billing_cycle}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                    ✓ Billed automatically every {plan.billing_cycle}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="h-4 w-4 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <Button
                  type="button"
                  variant={isPopular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => setSelectedPlan(plan)}
                >
                  Subscribe to {plan.name}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscribe Modal */}
      {selectedPlan && (
        <SubscribeModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
          onSuccess={handleSubscribeSuccess}
        />
      )}

      {/* Payment Modal for immediate checkout after subscribing */}
      {invoiceToPay && (
        <PaymentModal
          isOpen={!!invoiceToPay}
          onClose={() => setInvoiceToPay(null)}
          invoice={invoiceToPay}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
