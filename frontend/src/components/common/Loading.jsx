import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-600 border-t-transparent mb-3" />
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-2" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
