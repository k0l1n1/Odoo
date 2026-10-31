import React, { useState, useEffect, useRef } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import SubscribeModal from '../../components/subscriptions/SubscribeModal';
import PaymentModal from '../../components/payments/PaymentModal';
import { plansApi, subscriptionsApi } from '../../services/api';
import { Check, Sparkles, Zap, Shield, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const scrollContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  // Enable mouse wheel horizontal scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.2;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [filteredPlans]);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('input')) return;
    setIsMouseDown(true);
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: scrollContainerRef.current ? scrollContainerRef.current.scrollLeft : 0
    };
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartRef.current.x) * 1.5;
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
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

        {/* Billing cycle tabs & Scroll controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
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

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={scrollLeft}
              title="Scroll left"
              className="p-2 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              title="Scroll right"
              className="p-2 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Horizontal Scroll Row */}
      <div className="relative w-full max-w-full min-w-0">
        {/* Floating Side Scroll Buttons */}
        <button
          type="button"
          onClick={scrollLeft}
          title="Scroll Left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-300 items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={scrollRight}
          title="Scroll Right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-300 items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full max-w-full overflow-x-auto overflow-y-hidden flex flex-nowrap items-stretch gap-6 pb-6 pt-4 px-1 horizontal-plans-scroll scroll-smooth select-none ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
        {filteredPlans.map((plan) => {
          const isPopular = plan.name.toLowerCase().includes('professional');
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <div
              key={plan.id}
              className={`w-[300px] min-w-[300px] max-w-[320px] flex-shrink-0 relative bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
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
