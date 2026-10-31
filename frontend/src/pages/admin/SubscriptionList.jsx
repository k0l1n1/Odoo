import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import CancelModal from '../../components/subscriptions/CancelModal';
import { subscriptionsApi } from '../../services/api';
import { Search, Layers, XCircle, RefreshCw, Filter } from 'lucide-react';

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForCancel, setSelectedForCancel] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await subscriptionsApi.getAll();
      if (res.success) {
        setSubscriptions(res.subscriptions);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch subscriptions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubs = subscriptions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      sub.subscription_code.toLowerCase().includes(q) ||
      sub.customer_name.toLowerCase().includes(q) ||
      sub.customer_email.toLowerCase().includes(q) ||
      sub.plan_name.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      header: 'Subscription ID',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{row.subscription_code}</span>
          <p className="text-[10px] text-slate-400">Created: {row.created_at?.slice(0, 10)}</p>
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
      header: 'Plan & Tier',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs">{row.plan_name}</span>
          <p className="text-[11px] text-brand-600 font-medium">
            ₹{parseFloat(row.plan_price || 0).toFixed(2)} / <span className="capitalize">{row.billing_cycle}</span>
          </p>
        </div>
      )
    },
    {
      header: 'Start Date',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">{row.start_date}</span>
      )
    },
    {
      header: 'Next Billing Date',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800">{row.next_billing_date}</span>
          {row.auto_renew ? (
            <span className="block text-[10px] text-emerald-600 font-medium">Auto-renew ON</span>
          ) : (
            <span className="block text-[10px] text-slate-400 font-medium">Auto-renew OFF</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status} size="sm" />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'active' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={XCircle}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setSelectedForCancel(row)}
            >
              Cancel
            </Button>
          )}
          {row.status === 'cancelled' && (
            <span className="text-[10px] text-slate-400 italic">
              {row.cancellation_reason || 'Cancelled'}
            </span>
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active & Historical Subscriptions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of client subscriptions, renewal schedules, and lifecycle states.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => { setLoading(true); fetchSubscriptions(); }}
        >
          Refresh Data
        </Button>
      </div>

      <Card>
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto bg-slate-100/80 p-1 rounded-xl">
            {['all', 'active', 'pending', 'expired', 'cancelled'].map((tab) => (
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

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search code, customer, plan..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <Table
          columns={columns}
          data={filteredSubs}
          isLoading={loading}
          emptyMessage="No subscriptions match current criteria."
        />
      </Card>

      {/* Cancellation Modal */}
      {selectedForCancel && (
        <CancelModal
          isOpen={!!selectedForCancel}
          onClose={() => setSelectedForCancel(null)}
          subscription={selectedForCancel}
          onSuccess={(updated) => {
            setToast({ type: 'success', message: `Subscription ${updated.subscription_code} cancelled.` });
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
