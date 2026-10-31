import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import AiHelpDrawer from '../components/help/AiHelpDrawer';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children, currentPath, onNavigate, title, subtitle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiHelpOpen, setAiHelpOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenAiHelp={() => setAiHelpOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          onOpenAiHelp={() => setAiHelpOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Floating AI Help Trigger Button */}
      <button
        type="button"
        onClick={() => setAiHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-white/20"
        title="Open AI Help Copilot"
      >
        <div className="relative">
          <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
          </span>
        </div>
        <span className="font-semibold text-xs sm:text-sm tracking-wide">AI Help</span>
      </button>

      {/* AI Help Drawer */}
      <AiHelpDrawer
        isOpen={aiHelpOpen}
        onClose={() => setAiHelpOpen(false)}
        currentPath={currentPath}
        onNavigate={onNavigate}
        userRole={user?.role || 'admin'}
      />
    </div>
  );
}
