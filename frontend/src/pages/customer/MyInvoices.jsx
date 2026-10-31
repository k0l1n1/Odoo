import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import PaymentModal from '../../components/payments/PaymentModal';
import { invoicesApi } from '../../services/api';
import { Search, FileText, CreditCard, Eye, Printer, RefreshCw } from 'lucide-react';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payInvoice, setPayInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await invoicesApi.getMy();
      if (res.success) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch invoices.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.payment_status.toLowerCase() === filterStatus.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.plan_name.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: 'Invoice #',
      render: (row) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedInvoice(row)}
            className="font-mono font-bold text-brand-600 hover:text-brand-800 text-xs hover:underline block"
          >
            {row.invoice_number}
          </button>
          <span className="text-[10px] text-slate-400 capitalize">
            {row.invoice_type ? row.invoice_type.replace('_', ' ') : 'Standard'}
          </span>
        </div>
      )
    },
    {
      header: 'Plan Tier',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs">{row.plan_name}</span>
          <span className="text-[10px] text-slate-400 block font-mono">Sub: {row.subscription_code || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Issue / Due Date',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-500 block">Issued: {row.invoice_date}</span>
          <span className="font-semibold text-slate-800 block">Due: {row.due_date}</span>
        </div>
      )
    },
    {
      header: 'Amount Due',
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs">
            ₹{parseFloat(row.total_amount).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            (Net: ₹{parseFloat(row.amount).toFixed(2)} + Tax: ₹{parseFloat(row.tax_amount || 0).toFixed(2)})
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.payment_status} size="sm" />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setSelectedInvoice(row)}
          >
            View PDF
          </Button>

          {(row.payment_status === 'pending' || row.payment_status === 'overdue') && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => setPayInvoice(row)}
            >
              Pay Now
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Invoices & Billing Statements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Downloadable itemized invoices, payment receipts, and tax records.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => { setLoading(true); fetchInvoices(); }}
        >
          Refresh Invoices
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl">
            {['all', 'paid', 'pending', 'overdue'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filterStatus === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search invoice number..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
          isLoading={loading}
          emptyMessage="No invoices match the selected criteria."
        />
      </Card>

      {/* Invoice PDF Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          onPayNow={(inv) => setPayInvoice(inv)}
        />
      )}

      {/* Payment Gateway Modal */}
      {payInvoice && (
        <PaymentModal
          isOpen={!!payInvoice}
          onClose={() => setPayInvoice(null)}
          invoice={payInvoice}
          onSuccess={(res) => {
            setToast({ type: 'success', message: 'Invoice paid successfully! Subscription is active.' });
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}
