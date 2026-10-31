import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loading from '../../components/common/Loading';
import { renewalsApi } from '../../services/api';
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, Calendar, Sparkles } from 'lucide-react';

export default function RenewalTracker() {
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const [upRes, histRes] = await Promise.all([
        renewalsApi.getUpcoming(14),
        renewalsApi.getHistory()
      ]);
      if (upRes.success) setUpcoming(upRes.upcoming);
      if (histRes.success) setHistory(histRes.history);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load renewal data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerJob = async () => {
    setRunningJob(true);
    try {
      const res = await renewalsApi.triggerCheck(7);
      setToast({
        type: 'success',
        message: res.message || 'Automated renewal cycle executed!'
      });
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to trigger renewal check.' });
    } finally {
      setRunningJob(false);
    }
  };

  if (loading) return <Loading message="Loading renewal automation pipeline..." />;

  const upcomingColumns = [
    {
      header: 'Subscription',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{row.subscription_code}</span>
          <span className="text-[10px] text-slate-400 block">{row.plan_name} (${row.plan_price}/{row.billing_cycle})</span>
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
      header: 'Next Billing Date',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs">{row.next_billing_date}</span>
          <span className="text-[10px] text-amber-600 font-bold block">
            {row.days_until_renewal <= 0 ? 'Due Today / Overdue' : `in ${row.days_until_renewal} days`}
          </span>
        </div>
      )
    },
    {
      header: 'Renewal Invoicing',
      render: (row) => (
        <div>
          {row.has_pending_invoice ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Invoice {row.pending_invoice_number} Issued
            </span>
          ) : (
            <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              Scheduled for generation
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Renewal Status',
      render: (row) => (
        <Badge
          status={row.has_pending_invoice ? 'pending' : 'scheduled'}
          label={row.has_pending_invoice ? 'Awaiting Payment' : 'Auto-Renew Ready'}
          size="sm"
        />
      )
    }
  ];

  const historyColumns = [
    {
      header: 'Subscription',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{row.subscription_code}</span>
          <span className="text-[10px] text-slate-400 block">{row.customer_name}</span>
        </div>
      )
    },
    {
      header: 'Billing Progression',
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-500 line-through mr-1">{row.previous_billing_date}</span>
          <span className="font-semibold text-brand-600">→ {row.new_billing_date}</span>
        </div>
      )
    },
    {
      header: 'Invoice Generated',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {row.invoice_number || 'N/A'}
        </span>
      )
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.renewal_date || row.created_at}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.renewal_status} size="sm" />
    },
    {
      header: 'Notes & Log',
      render: (row) => (
        <span className="text-xs text-slate-600 italic">
          {row.notes || 'Automated renewal cycle executed successfully.'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Automated Subscription Renewal Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Detects expiring subscriptions, issues renewal invoices ahead of due date, and updates recurring cycles.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={RefreshCw}
          loading={runningJob}
          onClick={handleTriggerJob}
        >
          Run Renewal Cycle Now
        </Button>
      </div>

      {/* Approaching Renewals Table */}
      <Card
        title={`Approaching Renewals (${upcoming.length})`}
        subtitle="Active subscriptions requiring automated renewal invoice generation"
      >
        <Table
          columns={upcomingColumns}
          data={upcoming}
          isLoading={loading}
          emptyMessage="No active subscriptions approaching renewal within the 14-day threshold."
        />
      </Card>

      {/* Renewal History Audit Log */}
      <Card
        title="Renewal History & Audit Trail"
        subtitle="Complete log of scheduled, processed, and settled subscription renewals"
      >
        <Table
          columns={historyColumns}
          data={history}
          isLoading={loading}
          emptyMessage="No renewal history records recorded yet."
        />
      </Card>
    </div>
  );
}
