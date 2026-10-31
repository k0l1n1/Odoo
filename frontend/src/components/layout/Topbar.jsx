import React, { useState } from 'react';
import { Menu, Zap, Shield, User, ArrowLeftRight, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title, subtitle, onToggleMobile }) {
  const { user, isAdmin, login } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleQuickSwitch = async (role) => {
    setSwitching(true);
    setMenuOpen(false);
    try {
      if (role === 'admin') {
        await login('admin@brightloop.com', 'admin123');
      } else {
        await login('sarah.jenkins@acme.com', 'customer123');
      }
    } catch (err) {
      console.error('Failed to switch demo account:', err);
    } finally {
      setSwitching(false);
    }
  };

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
        {/* Quick Demo Switcher Widget */}
        <div className="relative">
          <button
            type="button"
            disabled={switching}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-brand-600" />
            <span className="hidden sm:inline">Demo Switch:</span>
            <span className="font-semibold text-slate-900">{isAdmin ? 'Admin' : 'Customer'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-200/80 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Switch Demo Role
              </div>
              <button
                type="button"
                onClick={() => handleQuickSwitch('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isAdmin ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-purple-600" />
                  <span>Admin (Alexander Wright)</span>
                </div>
                {isAdmin && <Check className="h-3.5 w-3.5 text-purple-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleQuickSwitch('customer')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors mt-1 ${
                  !isAdmin ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-brand-600" />
                  <span>Customer (Sarah Jenkins)</span>
                </div>
                {!isAdmin && <Check className="h-3.5 w-3.5 text-brand-600" />}
              </button>
            </div>
          )}
        </div>

        {/* System Pulse Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] text-emerald-700 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Cron Active</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {user?.name?.slice(0, 1) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
