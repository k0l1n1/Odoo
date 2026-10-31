import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { customersApi } from '../../services/api';
import { Search, Users, RefreshCw, Mail, Phone, Building } from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await customersApi.getAll();
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch customers.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    try {
      await customersApi.toggleStatus(customer.id, newStatus);
      setToast({ type: 'success', message: `Customer account ${newStatus === 'active' ? 'activated' : 'deactivated'}.` });
      fetchCustomers();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    return !searchTerm ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company_name && c.company_name.toLowerCase().includes(q));
  });

  const columns = [
    {
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs uppercase">
            {row.name.slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Company & Phone',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{row.company_name || 'Individual'}</span>
          <span className="text-[11px] text-slate-500">{row.phone || 'No phone'}</span>
        </div>
      )
    },
    {
      header: 'Current Subscription',
      render: (row) => (
        <div>
          <span className="font-semibold text-brand-600 text-xs block">{row.active_plan}</span>
          <span className="text-[10px] text-slate-400 capitalize">{row.subscription_status}</span>
        </div>
      )
    },
    {
      header: 'Total Paid ($)',
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs block">
            ${parseFloat(row.total_paid || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400">{row.total_invoices || 0} invoices</span>
        </div>
      )
    },
    {
      header: 'Account Status',
      render: (row) => <Badge status={row.status} size="sm" />
    },
    {
      header: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row)}
          className={`text-xs font-semibold hover:underline ${
            row.status === 'active' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
          }`}
        >
          {row.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Accounts & Subscriptions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered SaaS clients, active subscriptions, and lifetime revenue.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => { setLoading(true); fetchCustomers(); }}
        >
          Refresh Directory
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by customer name, company, or email..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            {filteredCustomers.length} client account(s)
          </span>
        </div>

        <Table
          columns={columns}
          data={filteredCustomers}
          isLoading={loading}
          emptyMessage="No customer accounts match your search."
        />
      </Card>
    </div>
  );
}
