import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { paymentsApi } from '../../services/api';
import { CreditCard, QrCode, Building2, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [simulationOutcome, setSimulationOutcome] = useState('successful');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('Acme Corporation');
  const [upiId, setUpiId] = useState('acme@okhdfcbank');
  const [bankName, setBankName] = useState('Chase Commercial Bank');

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate real-time gateway network latency
      await new Promise(r => setTimeout(r, 900));

      const res = await paymentsApi.processPayment({
        invoice_id: invoice.id,
        payment_method: paymentMethod,
        simulation_outcome: simulationOutcome,
        card_details: { number: cardNumber },
        upi_details: { vpa: upiId },
        bank_name: bankName
      });

      if (res.success) {
        if (onSuccess) onSuccess(res);
        onClose();
      } else {
        setError(res.message || 'Payment simulation failed.');
      }
    } catch (err) {
      setError(err.message || 'Payment processing error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulated Payment Gateway"
      subtitle={`Invoice #${invoice.invoice_number} • Total Due: $${parseFloat(invoice.total_amount).toFixed(2)}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Invoice Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Selected Plan</span>
            <p className="text-sm font-bold text-slate-900">{invoice.plan_name}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">Amount Due</span>
            <p className="text-lg font-extrabold text-brand-600">${parseFloat(invoice.total_amount).toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Credit Card', icon: CreditCard, label: 'Card' },
              { id: 'UPI', icon: QrCode, label: 'UPI / QR' },
              { id: 'Net Banking', icon: Building2, label: 'Net Banking' }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = paymentMethod === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentMethod(tab.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 text-brand-700 shadow-xs ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method-specific Inputs */}
        {paymentMethod === 'Credit Card' && (
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <Input
              label="Cardholder Name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <Input
              label="Card Number (Demo)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              icon={CreditCard}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expires (MM/YY)"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="12/28"
                required
              />
              <Input
                label="CVV"
                type="password"
                maxLength={4}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                placeholder="888"
                required
              />
            </div>
          </div>
        )}

        {paymentMethod === 'UPI' && (
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-center">
            <div className="mx-auto w-32 h-32 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2 shadow-xs">
              <QrCode className="h-24 w-24 text-slate-800" />
            </div>
            <p className="text-xs text-slate-500">Scan QR or enter Virtual Payment Address (VPA)</p>
            <Input
              label="UPI ID / VPA"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@bank"
              required
            />
          </div>
        )}

        {paymentMethod === 'Net Banking' && (
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Bank
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            >
              <option value="Chase Commercial Bank">Chase Commercial Bank</option>
              <option value="Bank of America Corporate">Bank of America Corporate</option>
              <option value="Wells Fargo Financial">Wells Fargo Financial</option>
              <option value="Citibank Global">Citibank Global</option>
              <option value="HSBC Premier">HSBC Premier</option>
            </select>
          </div>
        )}

        {/* Hackathon Simulation Mode Selector */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Hackathon Testing Gateway Simulation Controls</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'successful', label: 'Simulate Success', color: 'text-emerald-700' },
              { id: 'failed', label: 'Simulate Failure', color: 'text-rose-700' },
              { id: 'pending', label: 'Simulate Pending', color: 'text-amber-700' },
            ].map((sim) => (
              <label
                key={sim.id}
                className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  simulationOutcome === sim.id
                    ? 'border-amber-400 bg-white font-semibold shadow-xs'
                    : 'border-transparent hover:bg-amber-100/40 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="simulationOutcome"
                  value={sim.id}
                  checked={simulationOutcome === sim.id}
                  onChange={() => setSimulationOutcome(sim.id)}
                  className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span className={sim.color}>{sim.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={ShieldCheck}
          >
            Pay ${parseFloat(invoice.total_amount).toFixed(2)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
