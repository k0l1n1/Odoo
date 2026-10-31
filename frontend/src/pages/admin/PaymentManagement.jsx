import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { paymentsApi } from '../../services/api';
import { Search, CreditCard, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const fetchPayments = async () => {
    try {
      const res = await paymentsApi.getAll();
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch payments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.payment_status.toLowerCase() === filterStatus.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      p.payment_code.toLowerCase().includes(q) ||
      p.transaction_reference.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q) ||
      p.customer_email.toLowerCase().includes(q) ||
      p.invoice_number.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: 'Payment ID / Txn Ref',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{row.payment_code}</span>
          <p className="font-mono text-[10px] text-slate-500 mt-0.5">{row.transaction_reference}</p>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.customer_name}</p>
          <p className="text-[11px] text-slate-500">{row.customer_email}</p>
          {row.company_name && <p className="text-[10px] text-slate-400">{row.company_name}</p>}
        </div>
      )
    },
    {
      header: 'Invoice #',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-brand-600 text-xs">{row.invoice_number}</span>
          <span className="text-[10px] text-slate-400 block">{row.plan_name}</span>
        </div>
      )
    },
    {
      header: 'Amount Paid',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs">
          ₹{parseFloat(row.amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Method & Gateway',
      render: (row) => {
        let authCode = '';
        try {
          const resp = typeof row.gateway_response === 'string' ? JSON.parse(row.gateway_response) : row.gateway_response;
          authCode = resp?.authCode || resp?.auth_code || '';
        } catch (e) {}

        return (
          <div className="text-xs">
            <span className="font-medium text-slate-800 block">{row.payment_method}</span>
            {authCode && (
              <span className="text-[10px] text-emerald-600 font-mono block">Auth: {authCode}</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.payment_date}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.payment_status} size="sm" />
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Gateway Settlements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditing transactions from the simulated gateway across Cards, UPI, and Net Banking.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => { setLoading(true); fetchPayments(); }}
        >
          Refresh Logs
        </Button>
      </div>

      <Card>
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl">
            {['all', 'successful', 'pending', 'failed'].map((tab) => (
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
              placeholder="Search txn ref, payment code..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Payments Table */}
        <Table
          columns={columns}
          data={filteredPayments}
          isLoading={loading}
          emptyMessage="No payments match the selected filter."
        />
      </Card>
    </div>
  );
}
