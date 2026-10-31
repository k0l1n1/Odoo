import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { subscriptionsApi } from '../../services/api';
import { Check, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function SubscribeModal({ isOpen, onClose, plan, onSuccess }) {
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!plan) return null;

  const features = Array.isArray(plan.features) ? plan.features : [];

  const handleConfirmSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionsApi.subscribe({
        plan_id: plan.id,
        auto_renew: autoRenew
      });
      if (res.success) {
        if (onSuccess) onSuccess(res.subscription, res.invoice);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Subscription: ${plan.name}`}
      subtitle="Review plan tier details and activate your subscription"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Plan Feature Highlight */}
        <div className="bg-gradient-to-br from-brand-50 to-indigo-50/40 p-4 rounded-xl border border-brand-100">
          <div className="flex items-baseline justify-between mb-2">
            <h4 className="text-base font-bold text-slate-900">{plan.name} Tier</h4>
            <div className="text-right">
              <span className="text-2xl font-black text-brand-600">${parseFloat(plan.price).toFixed(2)}</span>
              <span className="text-xs text-slate-500 font-medium">/{plan.billing_cycle}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">{plan.description}</p>

          <div className="space-y-1.5 pt-2 border-t border-brand-200/50">
            {features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                <Check className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Renew Setting */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-900">Enable Automated Renewal</span>
            <p className="text-slate-500 mt-0.5">
              Automatically issue renewal invoices before expiration date to prevent service disruption.
            </p>
          </div>
        </label>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            icon={ShieldCheck}
            onClick={handleConfirmSubscribe}
          >
            Confirm & Proceed to Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
