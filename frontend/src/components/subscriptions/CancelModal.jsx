import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { subscriptionsApi } from '../../services/api';
import { AlertTriangle } from 'lucide-react';

export default function CancelModal({ isOpen, onClose, subscription, onSuccess }) {
  const [reason, setReason] = useState('Found an alternative solution');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!subscription) return null;

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalReason = reason === 'Other' ? customReason : reason;
      const res = await subscriptionsApi.cancel(subscription.id, finalReason);
      if (res.success) {
        if (onSuccess) onSuccess(res.subscription);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Subscription"
      subtitle={`Subscription #${subscription.subscription_code} • ${subscription.plan_name}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <span className="font-bold">Are you sure you want to cancel?</span>
            <p className="mt-0.5">
              Your subscription will cease future automatic renewals. Access will remain active until the end of your billing cycle ({subscription.expiry_date || subscription.next_billing_date}).
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Cancellation
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
          >
            <option value="Found an alternative solution">Found an alternative solution</option>
            <option value="Too expensive for current budget">Too expensive for current budget</option>
            <option value="Missing required enterprise features">Missing required enterprise features</option>
            <option value="Project completed / temporary pause">Project completed / temporary pause</option>
            <option value="Other">Other (specify below)</option>
          </select>
        </div>

        {reason === 'Other' && (
          <div>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Tell us what we could have done better..."
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Keep Subscription
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={handleCancel}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
