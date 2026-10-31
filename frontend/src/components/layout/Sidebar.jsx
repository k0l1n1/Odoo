import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  FileText,
  Users,
  RefreshCw,
  Receipt,
  UserCheck,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentPath, onNavigate, mobileOpen, setMobileOpen }) {
  const { user, isAdmin, isStaff, isStaffOrAdmin, logout } = useAuth();

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: Layers },
    { name: 'Subscription Plans', path: '/admin/plans', icon: Sparkles },
    { name: 'Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Renewal Tracker', path: '/admin/renewals', icon: RefreshCw },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    ...(isAdmin ? [{ name: 'Staff Team', path: '/admin/staff', icon: UserCheck }] : [])
  ];

  const customerNav = [
    { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'Browse Plans', path: '/customer/plans', icon: Sparkles },
    { name: 'My Subscriptions', path: '/customer/subscriptions', icon: Layers },
    { name: 'My Invoices', path: '/customer/invoices', icon: FileText },
    { name: 'Payment History', path: '/customer/payments', icon: Receipt },
    { name: 'My Profile', path: '/customer/profile', icon: User },
  ];

  const navItems = isStaffOrAdmin ? adminNav : customerNav;

  const handleNavClick = (path) => {
    onNavigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              Brightloop
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                SaaS
              </span>
            </span>
            <p className="text-[11px] text-slate-400">Subscription Automation</p>
          </div>
        </div>

        {/* Role Indicator Banner */}
        <div className="px-4 pt-4">
          <div className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium border ${
            isAdmin
              ? 'bg-purple-950/40 border-purple-800/50 text-purple-300'
              : (isStaff
                  ? 'bg-teal-950/40 border-teal-800/50 text-teal-300'
                  : 'bg-brand-950/40 border-brand-800/50 text-brand-300')
          }`}>
            {isAdmin ? (
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            ) : isStaff ? (
              <Sparkles className="h-4 w-4 text-teal-400" />
            ) : (
              <UserCheck className="h-4 w-4 text-brand-400" />
            )}
            <span>Portal: <strong>{isAdmin ? 'Admin Control' : (isStaff ? 'Staff Operations' : 'Customer Workspace')}</strong></span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="flex-1 text-left">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 mb-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-semibold uppercase">
              {user?.name?.slice(0, 2) || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
