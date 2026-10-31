import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
    }
  }[type] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    icon: <Info className="h-5 w-5 text-slate-600 flex-shrink-0" />
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${typeConfig.bg} animate-in fade-in slide-in-from-top-2 duration-200`}>
      {typeConfig.icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
