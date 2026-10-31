import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { paymentsApi } from '../../services/api';
import { Receipt, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchPayments = async () => {
    try {
      const res = await paymentsApi.getMy();
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch payment records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    {
      header: 'Payment Code',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{row.payment_code}</span>
          <p className="font-mono text-[10px] text-slate-400 mt-0.5">{row.transaction_reference}</p>
        </div>
      )
    },
    {
      header: 'Invoice & Tier',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-brand-600 text-xs block">{row.invoice_number}</span>
          <span className="text-[10px] text-slate-500">{row.plan_name}</span>
        </div>
      )
    },
    {
      header: 'Payment Method',
      render: (row) => (
        <span className="text-xs font-medium text-slate-800">{row.payment_method}</span>
      )
    },
    {
      header: 'Amount Paid',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs">
          ${parseFloat(row.amount).toFixed(2)}
        </span>
      )
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Receipts & History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed settlements and payment verification codes for your account.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => { setLoading(true); fetchPayments(); }}
        >
          Refresh Receipts
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={payments}
          isLoading={loading}
          emptyMessage="No payment receipts found."
        />
      </Card>
    </div>
  );
}
