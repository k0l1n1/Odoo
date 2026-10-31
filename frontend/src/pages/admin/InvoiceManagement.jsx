import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import InvoiceModal from '../../components/invoices/InvoiceModal';
import { invoicesApi } from '../../services/api';
import { Search, FileText, Printer, CheckCircle, RefreshCw, Eye } from 'lucide-react';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await invoicesApi.getAll();
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

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await invoicesApi.updateStatus(invoiceId, newStatus);
      setToast({ type: 'success', message: `Invoice #${invoiceId} updated to ${newStatus}.` });
      fetchInvoices();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update invoice status.' });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.payment_status.toLowerCase() === filterStatus.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.customer_name.toLowerCase().includes(q) ||
      inv.customer_email.toLowerCase().includes(q) ||
      inv.plan_name.toLowerCase().includes(q) ||
      (inv.subscription_code && inv.subscription_code.toLowerCase().includes(q));
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
            className="font-mono font-bold text-brand-600 hover:text-brand-800 text-xs hover:underline flex items-center gap-1"
          >
            <span>{row.invoice_number}</span>
          </button>
          <span className="text-[10px] text-slate-400 font-mono">Sub: {row.subscription_code || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.customer_name}</p>
          <p className="text-[11px] text-slate-500">{row.customer_email}</p>
        </div>
      )
    },
    {
      header: 'Plan & Type',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs">{row.plan_name}</span>
          <span className="text-[10px] text-slate-400 capitalize block">
            {row.invoice_type ? row.invoice_type.replace('_', ' ') : 'Standard'}
          </span>
        </div>
      )
    },
    {
      header: 'Total Amount',
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs">
            ${parseFloat(row.total_amount).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            (Net: ${parseFloat(row.amount).toFixed(2)} + Tax: ${parseFloat(row.tax_amount || 0).toFixed(2)})
          </span>
        </div>
      )
    },
    {
      header: 'Issue / Due Date',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-600 block">Issued: {row.invoice_date}</span>
          <span className="text-slate-900 font-semibold block">Due: {row.due_date}</span>
        </div>
      )
    },
    {
      header: 'Payment Status',
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
            View
          </Button>

          {row.payment_status !== 'paid' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={CheckCircle}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => handleStatusChange(row.id, 'paid')}
            >
              Mark Paid
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Ledger & Receivables</h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated billing invoices, tax receipts, and payment status tracking.
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
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl">
            {['all', 'paid', 'pending', 'overdue', 'failed'].map((tab) => (
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
              placeholder="Search invoice #, customer..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Invoices Table */}
        <Table
          columns={columns}
          data={filteredInvoices}
          isLoading={loading}
          emptyMessage="No invoices match the selected filter."
        />
      </Card>

      {/* Invoice Modal for Printable/Downloadable PDF */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
