import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import { dashboardApi, renewalsApi } from '../../services/api';
import {
  Users,
  Layers,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const COLORS = ['#0b66fe', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getAdmin();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setToast({ type: 'error', message: err.message || 'Error loading dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTriggerRenewal = async () => {
    setRunningJob(true);
    try {
      const res = await renewalsApi.triggerCheck(7);
      setToast({
        type: 'success',
        message: res.message || 'Renewal check completed successfully!'
      });
      // Refresh dashboard data
      await fetchDashboard();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Renewal trigger failed.'
      });
    } finally {
      setRunningJob(false);
    }
  };

  if (loading) return <Loading message="Loading Brightloop Analytics..." />;

  const { metrics = {}, charts = {}, recentTransactions = [], recentCustomers = [], upcomingRenewals = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive Revenue & Subscription Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated metrics synced with database. Showing subscription lifecycle health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={runningJob}
            onClick={handleTriggerRenewal}
          >
            Run Renewal Check
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/admin/plans')}
          >
            Manage Plans
          </Button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{parseFloat(metrics.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Realized from payments
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR</span>
            <p className="text-2xl font-black text-brand-600 mt-1">
              ₹{parseFloat(metrics.mrr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Normalized monthly run-rate
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.activeSubscriptions || 0}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span>{metrics.expiredSubscriptions || 0} expired</span>
              <span>•</span>
              <span>{metrics.cancelledSubscriptions || 0} cancelled</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalCustomers || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered customer accounts
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Secondary Operational Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Upcoming Renewals */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent bg-white p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-900">Upcoming Renewals (14d)</span>
              <p className="text-xl font-bold text-amber-900">{metrics.upcomingRenewalsCount || 0} Subscriptions</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/admin/renewals')}
          >
            View
          </Button>
        </div>

        {/* Unpaid / Pending Invoices */}
        <div className="bg-gradient-to-r from-rose-500/10 to-transparent bg-white p-4 rounded-xl border border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-900">Unpaid Invoices</span>
              <p className="text-xl font-bold text-rose-900">
                {metrics.unpaidInvoicesCount || 0} (₹{parseFloat(metrics.unpaidInvoicesAmount || 0).toFixed(2)})
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/admin/invoices')}
          >
            Review
          </Button>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-r from-blue-500/10 to-transparent bg-white p-4 rounded-xl border border-blue-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-900">Pending Payments</span>
              <p className="text-xl font-bold text-blue-900">{metrics.pendingPaymentsCount || 0} Transactions</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/admin/payments')}
          >
            Audit
          </Button>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card
          title="Monthly Revenue Trend (₹)"
          subtitle="Past 6-month automated billing & payment collections"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b66fe" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0b66fe" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0b66fe" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subscription Plan Distribution */}
        <Card
          title="Plan Distribution"
          subtitle="Breakdown of customer subscriptions"
        >
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={charts.distributionChart || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(charts.distributionChart || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} subscriptions`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 mt-2">
              {(charts.distributionChart || []).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Growth Chart */}
      <Card
        title="Subscription Growth & Net Retention"
        subtitle="Tracking active accounts, new subscriptions, and churned accounts"
      >
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.growthChart || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="active" name="Total Active" stroke="#0b66fe" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="newSubs" name="New Subscriptions" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="churned" name="Cancelled" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Tables: Upcoming Renewals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals Table */}
        <Card
          title="Upcoming Renewals (Immediate Attention)"
          subtitle="Subscriptions due for renewal invoicing"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/admin/renewals')}
            >
              All Renewals
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingRenewals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No renewals approaching within current window.
                    </td>
                  </tr>
                ) : (
                  upcomingRenewals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">{item.customer_name}</p>
                        <p className="text-[10px] text-slate-400">{item.customer_email}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{item.plan_name}</span>
                        <span className="text-[10px] text-slate-400 block">₹{item.plan_price}/{item.billing_cycle}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {item.next_billing_date}
                        <span className="text-[10px] text-amber-600 font-semibold block">
                          in {item.days_until_renewal} day(s)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          status={item.has_pending_invoice ? 'pending' : 'scheduled'}
                          label={item.has_pending_invoice ? 'Invoice Pending' : 'Scheduled'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Transactions Table */}
        <Card
          title="Recent Transactions"
          subtitle="Latest simulated payment settlements"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/admin/payments')}
            >
              All Payments
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <p className="font-mono font-semibold text-slate-900">{tx.transaction_reference}</p>
                        <p className="text-[10px] text-slate-400">{tx.payment_method}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">{tx.customer_name}</p>
                        <p className="text-[10px] text-slate-400">{tx.invoice_number}</p>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        ₹{parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge status={tx.payment_status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
