import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Printer, Download, CreditCard, Layers, CheckCircle2, Shield } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose, invoice, onPayNow }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUnpaid = invoice.payment_status === 'pending' || invoice.payment_status === 'overdue';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoice.invoice_number}`}
      subtitle={`Created on ${invoice.invoice_date}`}
      maxWidth="max-w-3xl"
    >
      <div id="printable-invoice" className="bg-white p-2 sm:p-4 text-slate-800 space-y-6">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Brightloop Software Inc.</h2>
              <p className="text-xs text-slate-500">100 Innovation Way, Suite 400, San Francisco, CA 94107</p>
              <p className="text-xs text-slate-500">support@brightloop.com • +1 (555) 019-2834</p>
            </div>
          </div>

          <div className="sm:text-right">
            <Badge status={invoice.payment_status} size="md" />
            <p className="text-xs font-mono font-bold text-slate-900 mt-2">{invoice.invoice_number}</p>
            <p className="text-xs text-slate-500">Due: {invoice.due_date}</p>
          </div>
        </div>

        {/* Customer & Subscription Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To</h4>
            <p className="text-sm font-bold text-slate-900">{invoice.customer_name}</p>
            {invoice.company_name && <p className="text-xs text-slate-600 font-medium">{invoice.company_name}</p>}
            <p className="text-xs text-slate-500">{invoice.customer_email}</p>
            {invoice.customer_address && <p className="text-xs text-slate-500 mt-1">{invoice.customer_address}</p>}
          </div>

          <div className="sm:text-right">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Subscription Details</h4>
            <p className="text-xs text-slate-600 font-medium">Subscription Code: <span className="font-mono font-semibold text-slate-900">{invoice.subscription_code || 'N/A'}</span></p>
            <p className="text-xs text-slate-600">Type: <span className="font-semibold capitalize">{invoice.invoice_type ? invoice.invoice_type.replace('_', ' ') : 'Subscription'}</span></p>
            <p className="text-xs text-slate-600">Issued Date: <span className="font-medium text-slate-900">{invoice.invoice_date}</span></p>
            {invoice.paid_at && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ✓ Paid on {invoice.paid_at.slice(0, 10)}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-center">Billing Cycle</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="py-4 px-4">
                  <p className="font-semibold text-slate-900">{invoice.plan_name} Plan Subscription</p>
                  <p className="text-xs text-slate-500">Access to all plan features and continuous automated renewals</p>
                </td>
                <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium capitalize">
                  Recurring
                </td>
                <td className="py-4 px-4 text-right font-medium text-slate-900">
                  ${parseFloat(invoice.amount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">${parseFloat(invoice.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tax (10% GST/VAT):</span>
              <span className="font-medium text-slate-900">${parseFloat(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Due:</span>
              <span className="text-brand-600 text-base">${parseFloat(invoice.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          <p>Thank you for choosing Brightloop Software. For billing inquiries, contact billing@brightloop.com.</p>
        </div>
      </div>

      {/* Action Buttons in Modal footer */}
      <div className="no-print mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isUnpaid && onPayNow && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => {
                onClose();
                onPayNow(invoice);
              }}
            >
              Pay Now (${parseFloat(invoice.total_amount).toFixed(2)})
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
