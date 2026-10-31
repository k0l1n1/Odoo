import React from 'react';

const statusConfig = {
  // Subscription / Plan statuses
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20', label: 'Active', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10', label: 'Inactive', dot: 'bg-slate-400' },
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20', label: 'Pending', dot: 'bg-amber-500' },
  expired: { bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20', label: 'Expired', dot: 'bg-rose-500' },
  cancelled: { bg: 'bg-zinc-100 text-zinc-700 border-zinc-200 ring-zinc-500/10', label: 'Cancelled', dot: 'bg-zinc-400' },
  
  // Invoice & Payment statuses
  paid: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20', label: 'Paid', dot: 'bg-emerald-500' },
  successful: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20', label: 'Successful', dot: 'bg-emerald-500' },
  failed: { bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20', label: 'Failed', dot: 'bg-rose-500' },
  overdue: { bg: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20', label: 'Overdue', dot: 'bg-orange-500' },
  
  // Roles
  admin: { bg: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20', label: 'Admin', dot: 'bg-purple-500' },
  customer: { bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20', label: 'Customer', dot: 'bg-blue-500' },

  // Renewal
  scheduled: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20', label: 'Scheduled', dot: 'bg-indigo-500' },
  processed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20', label: 'Processed', dot: 'bg-emerald-500' }
};

export default function Badge({ status, label, showDot = true, size = 'md' }) {
  const normalized = (status || '').toLowerCase();
  const config = statusConfig[normalized] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10',
    label: status || 'Unknown',
    dot: 'bg-slate-400'
  };

  const displayLabel = label || config.label;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 ring-inset ${config.bg} ${sizeClasses}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
      {displayLabel}
    </span>
  );
}
