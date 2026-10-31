import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Loading from './components/common/Loading';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import PlanManagement from './pages/admin/PlanManagement';
import SubscriptionList from './pages/admin/SubscriptionList';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import RenewalTracker from './pages/admin/RenewalTracker';
import CustomerManagement from './pages/admin/CustomerManagement';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowsePlans from './pages/customer/BrowsePlans';
import MySubscriptions from './pages/customer/MySubscriptions';
import MyInvoices from './pages/customer/MyInvoices';
import MyPayments from './pages/customer/MyPayments';
import Profile from './pages/customer/Profile';

export default function App() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return <Loading fullScreen message="Initializing Brightloop System..." />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <Register onNavigate={navigate} />;
    }
    return <Login onNavigate={navigate} />;
  }

  // Route metadata
  let title = 'Dashboard';
  let subtitle = '';
  let PageComponent = null;

  if (isAdmin) {
    switch (currentPath) {
      case '/admin':
      case '/':
        title = 'Executive Analytics Dashboard';
        subtitle = 'Revenue metrics, active subscriptions, and renewal tracking';
        PageComponent = <AdminDashboard onNavigate={navigate} />;
        break;
      case '/admin/subscriptions':
        title = 'Subscription Management';
        subtitle = 'All client subscriptions and lifecycle progression';
        PageComponent = <SubscriptionList onNavigate={navigate} />;
        break;
      case '/admin/plans':
        title = 'Subscription Plans';
        subtitle = 'Configure tiers, pricing intervals, and feature sets';
        PageComponent = <PlanManagement onNavigate={navigate} />;
        break;
      case '/admin/invoices':
        title = 'Invoice Ledger';
        subtitle = 'Automated billing, receivables, and PDF invoices';
        PageComponent = <InvoiceManagement onNavigate={navigate} />;
        break;
      case '/admin/payments':
        title = 'Payment Transactions';
        subtitle = 'Auditing simulated gateway settlements and auth codes';
        PageComponent = <PaymentManagement onNavigate={navigate} />;
        break;
      case '/admin/renewals':
        title = 'Renewal Automation Tracker';
        subtitle = 'Approaching expirations, renewal history, and manual trigger';
        PageComponent = <RenewalTracker onNavigate={navigate} />;
        break;
      case '/admin/customers':
        title = 'Customer Accounts';
        subtitle = 'Client directory, active subscriptions, and lifetime value';
        PageComponent = <CustomerManagement onNavigate={navigate} />;
        break;
      default:
        title = 'Executive Analytics Dashboard';
        subtitle = 'Revenue metrics, active subscriptions, and renewal tracking';
        PageComponent = <AdminDashboard onNavigate={navigate} />;
    }
  } else {
    // Customer
    switch (currentPath) {
      case '/customer':
      case '/':
        title = 'Customer Workspace';
        subtitle = `Welcome, ${user?.name || 'Customer'}`;
        PageComponent = <CustomerDashboard onNavigate={navigate} />;
        break;
      case '/customer/plans':
        title = 'Browse Subscription Plans';
        subtitle = 'Choose or upgrade your subscription tier';
        PageComponent = <BrowsePlans onNavigate={navigate} />;
        break;
      case '/customer/subscriptions':
        title = 'My Subscriptions';
        subtitle = 'Active plans, renewal schedules, and history';
        PageComponent = <MySubscriptions onNavigate={navigate} />;
        break;
      case '/customer/invoices':
        title = 'My Invoices';
        subtitle = 'Download PDF invoices and settle pending payments';
        PageComponent = <MyInvoices onNavigate={navigate} />;
        break;
      case '/customer/payments':
        title = 'Payment Receipts';
        subtitle = 'Completed transaction receipts and verification codes';
        PageComponent = <MyPayments onNavigate={navigate} />;
        break;
      case '/customer/profile':
        title = 'Account Profile';
        subtitle = 'Company details, contact info, and billing address';
        PageComponent = <Profile onNavigate={navigate} />;
        break;
      default:
        title = 'Customer Workspace';
        subtitle = `Welcome, ${user?.name || 'Customer'}`;
        PageComponent = <CustomerDashboard onNavigate={navigate} />;
    }
  }

  return (
    <MainLayout
      currentPath={currentPath}
      onNavigate={navigate}
      title={title}
      subtitle={subtitle}
    >
      {PageComponent}
    </MainLayout>
  );
}
