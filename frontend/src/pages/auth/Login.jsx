import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Layers, Lock, Mail, Shield, User, ArrowRight, CheckCircle2, Zap, Sparkles } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.user?.role === 'admin' || res.user?.role === 'staff') {
        onNavigate('/admin');
      } else {
        onNavigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPass);
      if (res.user?.role === 'admin' || res.user?.role === 'staff') {
        onNavigate('/admin');
      } else {
        onNavigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/30 mb-4">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Brightloop Software
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Subscription Lifecycle & Automated Billing Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-white/20">
          {/* Quick Demo Role Switcher (Shown on login screen after sign-out) */}
          <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                Demo Role Switcher
              </span>
              <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                1-Click Switch
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemoLogin('admin@brightloop.com', 'admin123')}
                className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/60 text-center transition-all shadow-xs hover:scale-[1.02] active:scale-98 cursor-pointer group disabled:opacity-50"
                title="Instant switch to Admin role"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 mb-1.5 transition-colors">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-900">Admin</p>
                <p className="text-[10px] text-slate-500">Alexander</p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemoLogin('staff@brightloop.com', 'staff123')}
                className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/60 text-center transition-all shadow-xs hover:scale-[1.02] active:scale-98 cursor-pointer group disabled:opacity-50"
                title="Instant switch to Staff role"
              >
                <div className="h-8 w-8 rounded-lg bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center text-teal-700 mb-1.5 transition-colors">
                  <Zap className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-900">Staff</p>
                <p className="text-[10px] text-slate-500">Emma</p>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleInstantDemoLogin('sarah.jenkins@acme.com', 'customer123')}
                className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50/60 text-center transition-all shadow-xs hover:scale-[1.02] active:scale-98 cursor-pointer group disabled:opacity-50"
                title="Instant switch to Customer role"
              >
                <div className="h-8 w-8 rounded-lg bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center text-brand-700 mb-1.5 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-900">Customer</p>
                <p className="text-[10px] text-slate-500">Sarah</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              icon={Mail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Register as Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
