import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle, onToggleMobile, onOpenAiHelp }) {
  const { user, isAdmin, isStaff } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
            {title || 'Overview'}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* AI Help Copilot Trigger - Customers Only */}
        {!isAdmin && !isStaff && onOpenAiHelp && (
          <button
            type="button"
            onClick={onOpenAiHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 hover:from-brand-100 hover:to-purple-100 text-xs font-semibold text-indigo-700 transition-all shadow-2xs hover:scale-[1.02] active:scale-98 cursor-pointer"
            title="Open Brightloop AI Copilot"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            <span>AI Help</span>
          </button>
        )}

        {/* System Pulse Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] text-emerald-700 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Cron Active</span>
        </div>

        {/* User Avatar & Role Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className={`h-8 w-8 rounded-full font-semibold text-xs flex items-center justify-center shadow-xs text-white ${
            isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' :
            (isStaff ? 'bg-gradient-to-tr from-teal-600 to-emerald-600' : 'bg-gradient-to-tr from-brand-600 to-blue-600')
          }`}>
            {user?.name?.slice(0, 1) || 'U'}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">{user?.name || 'User'}</p>
            <p className="text-[10px] font-semibold text-slate-400 capitalize">
              {isAdmin ? 'Admin' : (isStaff ? 'Staff' : 'Customer')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
