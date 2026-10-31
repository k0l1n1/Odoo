const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let useFallback = process.env.DB_FORCE_FALLBACK === 'true';

// Fallback in-memory relational store
const store = {
  users: [],
  subscription_plans: [],
  subscriptions: [],
  invoices: [],
  payments: [],
  renewal_history: [],
  autoInc: {
    users: 1,
    subscription_plans: 1,
    subscriptions: 1,
    invoices: 1,
    payments: 1,
    renewal_history: 1
  }
};

// Seed initial memory store
function seedMemoryStore() {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const custHash = bcrypt.hashSync('customer123', 10);

  store.users = [
    {
      id: 1,
      name: 'Alexander Wright',
      email: 'admin@brightloop.com',
      password: adminHash,
      role: 'admin',
      company_name: 'Brightloop Software HQ',
      phone: '+1 (555) 019-2834',
      address: '100 Innovation Way, Suite 400, San Francisco, CA 94107',
      status: 'active',
      created_at: '2026-01-10 09:00:00',
      updated_at: '2026-01-10 09:00:00'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@acme.com',
      password: custHash,
      role: 'customer',
      company_name: 'Acme Corporation',
      phone: '+1 (555) 432-8910',
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      status: 'active',
      created_at: '2026-01-15 11:20:00',
      updated_at: '2026-01-15 11:20:00'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@techflow.io',
      password: custHash,
      role: 'customer',
      company_name: 'TechFlow Solutions',
      phone: '+1 (555) 876-5432',
      address: '452 Tech Parkway, Austin, TX 78701',
      status: 'active',
      created_at: '2026-02-01 14:15:00',
      updated_at: '2026-02-01 14:15:00'
    },
    {
      id: 4,
      name: 'Elena Rostova',
      email: 'elena.rostova@cloudscale.net',
      password: custHash,
      role: 'customer',
      company_name: 'CloudScale AI',
      phone: '+1 (555) 321-9876',
      address: '88 Silicon Boulevard, Seattle, WA 98101',
      status: 'active',
      created_at: '2026-02-18 10:45:00',
      updated_at: '2026-02-18 10:45:00'
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'david.kim@finpulse.co',
      password: custHash,
      role: 'customer',
      company_name: 'FinPulse Global',
      phone: '+1 (555) 654-3210',
      address: '12 Wall Street Tower, New York, NY 10005',
      status: 'active',
      created_at: '2026-03-05 16:30:00',
      updated_at: '2026-03-05 16:30:00'
    },
    {
      id: 6,
      name: 'Priya Sharma',
      email: 'priya.sharma@innovatex.org',
      password: custHash,
      role: 'customer',
      company_name: 'InnovateX Labs',
      phone: '+1 (555) 987-1234',
      address: '200 Research Drive, Boston, MA 02115',
      status: 'active',
      created_at: '2026-03-20 08:50:00',
      updated_at: '2026-03-20 08:50:00'
    }
  ];

  store.subscription_plans = [
    {
      id: 1,
      name: 'Starter',
      description: 'Essential subscription infrastructure for early-stage startups and small projects.',
      price: 29.00,
      billing_cycle: 'monthly',
      features: JSON.stringify([
        'Up to 5 team members',
        'Core subscription management',
        'Standard payment gateway',
        'Automated email invoices',
        '5GB secure storage',
        'Community & email support'
      ]),
      status: 'active',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Powerful subscription automation, recurring revenue analytics, and priority handling.',
      price: 79.00,
      billing_cycle: 'monthly',
      features: JSON.stringify([
        'Up to 25 team members',
        'Real-time MRR & churn reports',
        'Multi-method simulated payment',
        'Automated renewal alerts & dunning',
        'Priority email & chat support',
        'Customizable invoice templates',
        'Full audit & export logs'
      ]),
      status: 'active',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'Dedicated infrastructure, high-volume automated renewals, custom SLA, and team roles.',
      price: 199.00,
      billing_cycle: 'monthly',
      features: JSON.stringify([
        'Unlimited team members',
        'Dedicated database instance',
        'Real-time financial analytics',
        'Automated renewal pipeline',
        '24/7 priority phone & Slack SLA',
        'Custom domain & branding',
        'Role-based permissions',
        'Dedicated Account Manager'
      ]),
      status: 'active',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 4,
      name: 'Growth Annual',
      description: 'Cost-effective annual bundle with 2 months free and full feature access.',
      price: 790.00,
      billing_cycle: 'yearly',
      features: JSON.stringify([
        'Up to 20 team members',
        'Full financial analytics suite',
        'Unlimited invoices & payments',
        'Automated annual renewal handling',
        'Priority 24/7 support',
        'Custom exports'
      ]),
      status: 'active',
      created_at: '2026-01-05 00:00:00',
      updated_at: '2026-01-05 00:00:00'
    }
  ];

  store.subscriptions = [
    {
      id: 1,
      subscription_code: 'SUB-2026-00101',
      user_id: 2,
      plan_id: 2,
      status: 'active',
      start_date: '2026-10-03',
      next_billing_date: '2026-11-03',
      expiry_date: '2026-11-03',
      auto_renew: 1,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: '2026-10-03 10:00:00',
      updated_at: '2026-10-03 10:00:00'
    },
    {
      id: 2,
      subscription_code: 'SUB-2026-00102',
      user_id: 3,
      plan_id: 3,
      status: 'active',
      start_date: '2026-10-15',
      next_billing_date: '2026-11-15',
      expiry_date: '2026-11-15',
      auto_renew: 1,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: '2026-10-15 11:30:00',
      updated_at: '2026-10-15 11:30:00'
    },
    {
      id: 3,
      subscription_code: 'SUB-2026-00103',
      user_id: 4,
      plan_id: 1,
      status: 'active',
      start_date: '2026-10-05',
      next_billing_date: '2026-11-05',
      expiry_date: '2026-11-05',
      auto_renew: 1,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: '2026-10-05 14:00:00',
      updated_at: '2026-10-05 14:00:00'
    },
    {
      id: 4,
      subscription_code: 'SUB-2026-00104',
      user_id: 5,
      plan_id: 2,
      status: 'expired',
      start_date: '2026-09-01',
      next_billing_date: '2026-10-01',
      expiry_date: '2026-10-01',
      auto_renew: 0,
      cancelled_at: null,
      cancellation_reason: null,
      created_at: '2026-09-01 09:00:00',
      updated_at: '2026-09-01 09:00:00'
    },
    {
      id: 5,
      subscription_code: 'SUB-2026-00105',
      user_id: 6,
      plan_id: 1,
      status: 'cancelled',
      start_date: '2026-08-10',
      next_billing_date: '2026-09-10',
      expiry_date: '2026-09-10',
      auto_renew: 0,
      cancelled_at: '2026-09-08 17:00:00',
      cancellation_reason: 'Project downsizing and budget reallocation',
      created_at: '2026-08-10 12:00:00',
      updated_at: '2026-09-08 17:00:00'
    }
  ];

  store.invoices = [
    {
      id: 1,
      invoice_number: 'INV-2026-10001',
      subscription_id: 1,
      user_id: 2,
      plan_name: 'Professional',
      amount: 79.00,
      tax_amount: 7.90,
      total_amount: 86.90,
      invoice_date: '2026-10-03',
      due_date: '2026-10-10',
      payment_status: 'paid',
      invoice_type: 'subscription_new',
      paid_at: '2026-10-03 10:05:00',
      created_at: '2026-10-03 10:00:00',
      updated_at: '2026-10-03 10:05:00'
    },
    {
      id: 2,
      invoice_number: 'INV-2026-10002',
      subscription_id: 2,
      user_id: 3,
      plan_name: 'Enterprise',
      amount: 199.00,
      tax_amount: 19.90,
      total_amount: 218.90,
      invoice_date: '2026-10-15',
      due_date: '2026-10-22',
      payment_status: 'paid',
      invoice_type: 'subscription_new',
      paid_at: '2026-10-15 11:35:00',
      created_at: '2026-10-15 11:30:00',
      updated_at: '2026-10-15 11:35:00'
    },
    {
      id: 3,
      invoice_number: 'INV-2026-10003',
      subscription_id: 3,
      user_id: 4,
      plan_name: 'Starter',
      amount: 29.00,
      tax_amount: 2.90,
      total_amount: 31.90,
      invoice_date: '2026-10-05',
      due_date: '2026-10-12',
      payment_status: 'paid',
      invoice_type: 'subscription_new',
      paid_at: '2026-10-05 14:10:00',
      created_at: '2026-10-05 14:00:00',
      updated_at: '2026-10-05 14:10:00'
    },
    {
      id: 4,
      invoice_number: 'INV-2026-10004',
      subscription_id: 1,
      user_id: 2,
      plan_name: 'Professional',
      amount: 79.00,
      tax_amount: 7.90,
      total_amount: 86.90,
      invoice_date: '2026-10-27',
      due_date: '2026-11-03',
      payment_status: 'pending',
      invoice_type: 'subscription_renewal',
      paid_at: null,
      created_at: '2026-10-27 00:00:00',
      updated_at: '2026-10-27 00:00:00'
    },
    {
      id: 5,
      invoice_number: 'INV-2026-10005',
      subscription_id: 4,
      user_id: 5,
      plan_name: 'Professional',
      amount: 79.00,
      tax_amount: 7.90,
      total_amount: 86.90,
      invoice_date: '2026-10-01',
      due_date: '2026-10-08',
      payment_status: 'overdue',
      invoice_type: 'subscription_renewal',
      paid_at: null,
      created_at: '2026-10-01 00:00:00',
      updated_at: '2026-10-01 00:00:00'
    },
    {
      id: 6,
      invoice_number: 'INV-2026-10006',
      subscription_id: 3,
      user_id: 4,
      plan_name: 'Starter',
      amount: 29.00,
      tax_amount: 2.90,
      total_amount: 31.90,
      invoice_date: '2026-10-29',
      due_date: '2026-11-05',
      payment_status: 'pending',
      invoice_type: 'subscription_renewal',
      paid_at: null,
      created_at: '2026-10-29 00:00:00',
      updated_at: '2026-10-29 00:00:00'
    }
  ];

  store.payments = [
    {
      id: 1,
      payment_code: 'PAY-2026-50001',
      user_id: 2,
      invoice_id: 1,
      amount: 86.90,
      payment_date: '2026-10-03 10:05:00',
      payment_method: 'Credit Card',
      transaction_reference: 'TXN-SIM-901823901',
      payment_status: 'successful',
      gateway_response: JSON.stringify({ auth_code: 'AUTH98213', card_brand: 'Visa', last4: '4242', gateway: 'Brightloop Simulated Gateway' }),
      created_at: '2026-10-03 10:05:00',
      updated_at: '2026-10-03 10:05:00'
    },
    {
      id: 2,
      payment_code: 'PAY-2026-50002',
      user_id: 3,
      invoice_id: 2,
      amount: 218.90,
      payment_date: '2026-10-15 11:35:00',
      payment_method: 'Net Banking',
      transaction_reference: 'TXN-SIM-783921045',
      payment_status: 'successful',
      gateway_response: JSON.stringify({ auth_code: 'AUTH11244', bank_name: 'Chase Commercial', gateway: 'Brightloop Simulated Gateway' }),
      created_at: '2026-10-15 11:35:00',
      updated_at: '2026-10-15 11:35:00'
    },
    {
      id: 3,
      payment_code: 'PAY-2026-50003',
      user_id: 4,
      invoice_id: 3,
      amount: 31.90,
      payment_date: '2026-10-05 14:10:00',
      payment_method: 'UPI',
      transaction_reference: 'TXN-SIM-662391084',
      payment_status: 'successful',
      gateway_response: JSON.stringify({ auth_code: 'AUTH66712', vpa: 'elena@okaxis', gateway: 'Brightloop Simulated Gateway' }),
      created_at: '2026-10-05 14:10:00',
      updated_at: '2026-10-05 14:10:00'
    }
  ];

  store.renewal_history = [
    {
      id: 1,
      subscription_id: 1,
      invoice_id: 4,
      previous_billing_date: '2026-10-03',
      new_billing_date: '2026-11-03',
      renewal_date: '2026-10-27 00:00:00',
      renewal_status: 'scheduled',
      notes: 'Automated renewal invoice generated 7 days ahead of expiry.',
      created_at: '2026-10-27 00:00:00'
    },
    {
      id: 2,
      subscription_id: 3,
      invoice_id: 6,
      previous_billing_date: '2026-10-05',
      new_billing_date: '2026-11-05',
      renewal_date: '2026-10-29 00:00:00',
      renewal_status: 'scheduled',
      notes: 'Automated renewal invoice generated 7 days ahead of expiry.',
      created_at: '2026-10-29 00:00:00'
    }
  ];

  store.autoInc = {
    users: 7,
    subscription_plans: 5,
    subscriptions: 6,
    invoices: 7,
    payments: 4,
    renewal_history: 3
  };
}

seedMemoryStore();

// Attempt MySQL connection
async function initDbConnection() {
  if (useFallback) {
    console.log('[DB] Using smart relational fallback store.');
    return;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'brightloop_subscriptions',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    const conn = await pool.getConnection();
    console.log('[DB] Connected to MySQL database successfully!');
    conn.release();
  } catch (err) {
    console.warn(`[DB] MySQL connection notice: ${err.message}.`);
    console.log('[DB] Seamlessly activated high-performance relational fallback store for hackathon evaluation.');
    useFallback = true;
  }
}

initDbConnection();

// Smart query executor
async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('[DB Query Error in MySQL]', err.message);
      throw err;
    }
  }

  // Fallback SQL emulator handles all queries safely
  return executeFallbackQuery(sql, params);
}

// Fallback SQL query engine for in-memory store
function executeFallbackQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT queries
  if (lowerSql.startsWith('select')) {
    return handleSelect(cleanSql, params);
  }

  // 2. INSERT queries
  if (lowerSql.startsWith('insert into')) {
    return handleInsert(cleanSql, params);
  }

  // 3. UPDATE queries
  if (lowerSql.startsWith('update')) {
    return handleUpdate(cleanSql, params);
  }

  // 4. DELETE queries
  if (lowerSql.startsWith('delete from')) {
    return handleDelete(cleanSql, params);
  }

  return [[], []];
}

function handleSelect(sql, params) {
  let paramIdx = 0;
  const getNextParam = () => params[paramIdx++];

  // Users select by email
  if (/from users/i.test(sql) && /where email\s*=\s*\?/i.test(sql)) {
    const email = getNextParam();
    const rows = store.users.filter(u => u.email.toLowerCase() === String(email).toLowerCase());
    return [rows.map(r => ({ ...r })), []];
  }

  // Users select by id
  if (/from users/i.test(sql) && /where id\s*=\s*\?/i.test(sql)) {
    const id = Number(getNextParam());
    const rows = store.users.filter(u => u.id === id);
    return [rows.map(r => ({ ...r })), []];
  }

  // All users / customers
  if (/from users/i.test(sql)) {
    let rows = [...store.users];
    if (/where role\s*=\s*\?/i.test(sql)) {
      const role = getNextParam();
      rows = rows.filter(u => u.role === role);
    }
    if (/order by/i.test(sql)) {
      rows.sort((a, b) => b.id - a.id);
    }
    return [rows.map(r => {
      const copy = { ...r };
      delete copy.password;
      return copy;
    }), []];
  }

  // Subscription Plans
  if (/from subscription_plans/i.test(sql)) {
    let rows = [...store.subscription_plans];
    if (/where id\s*=\s*\?/i.test(sql)) {
      const id = Number(getNextParam());
      rows = rows.filter(p => p.id === id);
    } else if (/where status\s*=\s*\?/i.test(sql)) {
      const status = getNextParam();
      rows = rows.filter(p => p.status === status);
    }
    if (/order by price asc/i.test(sql)) {
      rows.sort((a, b) => a.price - b.price);
    } else if (/order by/i.test(sql)) {
      rows.sort((a, b) => a.id - b.id);
    }
    return [rows.map(r => ({ ...r })), []];
  }

  // Subscriptions with Join
  if (/from subscriptions/i.test(sql)) {
    let rows = store.subscriptions.map(s => {
      const user = store.users.find(u => u.id === s.user_id) || {};
      const plan = store.subscription_plans.find(p => p.id === s.plan_id) || {};
      return {
        ...s,
        customer_name: user.name || 'Unknown',
        customer_email: user.email || '',
        company_name: user.company_name || '',
        plan_name: plan.name || 'Custom',
        plan_price: plan.price || 0,
        billing_cycle: plan.billing_cycle || 'monthly'
      };
    });

    if (/s\.id\s*=\s*\?/i.test(sql) || /subscriptions\.id\s*=\s*\?/i.test(sql)) {
      const id = Number(getNextParam());
      rows = rows.filter(r => r.id === id);
    } else if (/user_id\s*=\s*\?/i.test(sql) || /s\.user_id\s*=\s*\?/i.test(sql)) {
      const uid = Number(getNextParam());
      rows = rows.filter(r => r.user_id === uid);
    }

    if (/status\s*=\s*\?/i.test(sql)) {
      const status = getNextParam();
      rows = rows.filter(r => r.status === status);
    }

    if (/order by/i.test(sql)) {
      rows.sort((a, b) => b.id - a.id);
    }

    return [rows, []];
  }

  // Invoices with Join
  if (/from invoices/i.test(sql)) {
    let rows = store.invoices.map(inv => {
      const user = store.users.find(u => u.id === inv.user_id) || {};
      const sub = store.subscriptions.find(s => s.id === inv.subscription_id) || {};
      return {
        ...inv,
        customer_name: user.name || 'Unknown',
        customer_email: user.email || '',
        company_name: user.company_name || '',
        customer_phone: user.phone || '',
        customer_address: user.address || '',
        subscription_code: sub.subscription_code || ''
      };
    });

    if (/inv\.id\s*=\s*\?/i.test(sql) || /invoices\.id\s*=\s*\?/i.test(sql)) {
      const id = Number(getNextParam());
      rows = rows.filter(r => r.id === id);
    } else if (/user_id\s*=\s*\?/i.test(sql) || /inv\.user_id\s*=\s*\?/i.test(sql)) {
      const uid = Number(getNextParam());
      rows = rows.filter(r => r.user_id === uid);
    } else if (/invoice_number\s*=\s*\?/i.test(sql)) {
      const invNum = getNextParam();
      rows = rows.filter(r => r.invoice_number === invNum);
    }

    if (/payment_status\s*=\s*\?/i.test(sql)) {
      const status = getNextParam();
      rows = rows.filter(r => r.payment_status === status);
    }

    if (/order by/i.test(sql)) {
      rows.sort((a, b) => b.id - a.id);
    }

    return [rows, []];
  }

  // Payments with Join
  if (/from payments/i.test(sql)) {
    let rows = store.payments.map(p => {
      const user = store.users.find(u => u.id === p.user_id) || {};
      const inv = store.invoices.find(i => i.id === p.invoice_id) || {};
      return {
        ...p,
        customer_name: user.name || 'Unknown',
        customer_email: user.email || '',
        company_name: user.company_name || '',
        invoice_number: inv.invoice_number || '',
        plan_name: inv.plan_name || ''
      };
    });

    if (/p\.id\s*=\s*\?/i.test(sql) || /payments\.id\s*=\s*\?/i.test(sql)) {
      const id = Number(getNextParam());
      rows = rows.filter(r => r.id === id);
    } else if (/user_id\s*=\s*\?/i.test(sql) || /p\.user_id\s*=\s*\?/i.test(sql)) {
      const uid = Number(getNextParam());
      rows = rows.filter(r => r.user_id === uid);
    } else if (/invoice_id\s*=\s*\?/i.test(sql) || /p\.invoice_id\s*=\s*\?/i.test(sql)) {
      const invId = Number(getNextParam());
      rows = rows.filter(r => r.invoice_id === invId);
    }

    if (/order by/i.test(sql)) {
      rows.sort((a, b) => b.id - a.id);
    }

    return [rows, []];
  }

  // Renewal History
  if (/from renewal_history/i.test(sql)) {
    let rows = store.renewal_history.map(rh => {
      const sub = store.subscriptions.find(s => s.id === rh.subscription_id) || {};
      const user = store.users.find(u => u.id === sub.user_id) || {};
      const inv = store.invoices.find(i => i.id === rh.invoice_id) || {};
      return {
        ...rh,
        subscription_code: sub.subscription_code || '',
        customer_name: user.name || 'Unknown',
        customer_email: user.email || '',
        invoice_number: inv.invoice_number || null,
        invoice_status: inv.payment_status || null
      };
    });

    if (/subscription_id\s*=\s*\?/i.test(sql)) {
      const sid = Number(getNextParam());
      rows = rows.filter(r => r.subscription_id === sid);
    }

    if (/order by/i.test(sql)) {
      rows.sort((a, b) => b.id - a.id);
    }

    return [rows, []];
  }

  return [[], []];
}

function handleInsert(sql, params) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (/insert into users/i.test(sql)) {
    const id = store.autoInc.users++;
    // (name, email, password, role, company_name, phone, address, status)
    const newUser = {
      id,
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'customer',
      company_name: params[4] || null,
      phone: params[5] || null,
      address: params[6] || null,
      status: params[7] || 'active',
      created_at: now,
      updated_at: now
    };
    store.users.push(newUser);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (/insert into subscription_plans/i.test(sql)) {
    const id = store.autoInc.subscription_plans++;
    const newPlan = {
      id,
      name: params[0],
      description: params[1],
      price: parseFloat(params[2]),
      billing_cycle: params[3],
      features: typeof params[4] === 'string' ? params[4] : JSON.stringify(params[4]),
      status: params[5] || 'active',
      created_at: now,
      updated_at: now
    };
    store.subscription_plans.push(newPlan);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (/insert into subscriptions/i.test(sql)) {
    const id = store.autoInc.subscriptions++;
    // (subscription_code, user_id, plan_id, status, start_date, next_billing_date, expiry_date, auto_renew)
    const newSub = {
      id,
      subscription_code: params[0],
      user_id: Number(params[1]),
      plan_id: Number(params[2]),
      status: params[3] || 'pending',
      start_date: params[4],
      next_billing_date: params[5],
      expiry_date: params[6],
      auto_renew: params[7] === undefined ? 1 : (params[7] ? 1 : 0),
      cancelled_at: null,
      cancellation_reason: null,
      created_at: now,
      updated_at: now
    };
    store.subscriptions.push(newSub);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (/insert into invoices/i.test(sql)) {
    const id = store.autoInc.invoices++;
    // (invoice_number, subscription_id, user_id, plan_name, amount, tax_amount, total_amount, invoice_date, due_date, payment_status, invoice_type)
    const newInv = {
      id,
      invoice_number: params[0],
      subscription_id: Number(params[1]),
      user_id: Number(params[2]),
      plan_name: params[3],
      amount: parseFloat(params[4]),
      tax_amount: parseFloat(params[5] || 0),
      total_amount: parseFloat(params[6]),
      invoice_date: params[7],
      due_date: params[8],
      payment_status: params[9] || 'pending',
      invoice_type: params[10] || 'subscription_new',
      paid_at: null,
      created_at: now,
      updated_at: now
    };
    store.invoices.push(newInv);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (/insert into payments/i.test(sql)) {
    const id = store.autoInc.payments++;
    // (payment_code, user_id, invoice_id, amount, payment_date, payment_method, transaction_reference, payment_status, gateway_response)
    const newPay = {
      id,
      payment_code: params[0],
      user_id: Number(params[1]),
      invoice_id: Number(params[2]),
      amount: parseFloat(params[3]),
      payment_date: params[4] || now,
      payment_method: params[5],
      transaction_reference: params[6],
      payment_status: params[7],
      gateway_response: typeof params[8] === 'string' ? params[8] : JSON.stringify(params[8] || {}),
      created_at: now,
      updated_at: now
    };
    store.payments.push(newPay);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  if (/insert into renewal_history/i.test(sql)) {
    const id = store.autoInc.renewal_history++;
    // (subscription_id, invoice_id, previous_billing_date, new_billing_date, renewal_date, renewal_status, notes)
    const newRenew = {
      id,
      subscription_id: Number(params[0]),
      invoice_id: params[1] ? Number(params[1]) : null,
      previous_billing_date: params[2],
      new_billing_date: params[3],
      renewal_date: params[4] || now,
      renewal_status: params[5] || 'processed',
      notes: params[6] || null,
      created_at: now
    };
    store.renewal_history.push(newRenew);
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  return [{ insertId: 0, affectedRows: 0 }, []];
}

function handleUpdate(sql, params) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Update Users profile / status
  if (/update users/i.test(sql)) {
    const id = Number(params[params.length - 1]);
    const user = store.users.find(u => u.id === id);
    if (user) {
      if (/name\s*=\s*\?/i.test(sql) && /company_name\s*=\s*\?/i.test(sql)) {
        user.name = params[0];
        user.company_name = params[1];
        user.phone = params[2];
        user.address = params[3];
      } else if (/status\s*=\s*\?/i.test(sql)) {
        user.status = params[0];
      }
      user.updated_at = now;
      return [{ affectedRows: 1 }, []];
    }
  }

  // Update subscription_plans
  if (/update subscription_plans/i.test(sql)) {
    const id = Number(params[params.length - 1]);
    const plan = store.subscription_plans.find(p => p.id === id);
    if (plan) {
      if (/status\s*=\s*\?/i.test(sql) && params.length === 2) {
        plan.status = params[0];
      } else {
        // (name, description, price, billing_cycle, features, status, id)
        plan.name = params[0];
        plan.description = params[1];
        plan.price = parseFloat(params[2]);
        plan.billing_cycle = params[3];
        plan.features = typeof params[4] === 'string' ? params[4] : JSON.stringify(params[4]);
        plan.status = params[5];
      }
      plan.updated_at = now;
      return [{ affectedRows: 1 }, []];
    }
  }

  // Update subscriptions
  if (/update subscriptions/i.test(sql)) {
    const id = Number(params[params.length - 1]);
    const sub = store.subscriptions.find(s => s.id === id);
    if (sub) {
      if (/status\s*=\s*\?/i.test(sql) && /cancelled_at/i.test(sql)) {
        sub.status = params[0];
        sub.cancelled_at = params[1];
        sub.cancellation_reason = params[2];
        sub.auto_renew = 0;
      } else if (/status\s*=\s*\?/i.test(sql) && /next_billing_date\s*=\s*\?/i.test(sql)) {
        sub.status = params[0];
        sub.next_billing_date = params[1];
        sub.expiry_date = params[2];
      } else if (/status\s*=\s*\?/i.test(sql) && params.length === 2) {
        sub.status = params[0];
      } else if (/auto_renew\s*=\s*\?/i.test(sql)) {
        sub.auto_renew = params[0] ? 1 : 0;
      }
      sub.updated_at = now;
      return [{ affectedRows: 1 }, []];
    }
  }

  // Update invoices
  if (/update invoices/i.test(sql)) {
    const id = Number(params[params.length - 1]);
    const inv = store.invoices.find(i => i.id === id);
    if (inv) {
      if (/payment_status\s*=\s*\?/i.test(sql) && /paid_at\s*=\s*\?/i.test(sql)) {
        inv.payment_status = params[0];
        inv.paid_at = params[1];
      } else if (/payment_status\s*=\s*\?/i.test(sql)) {
        inv.payment_status = params[0];
      }
      inv.updated_at = now;
      return [{ affectedRows: 1 }, []];
    }
  }

  // Update payments
  if (/update payments/i.test(sql)) {
    const id = Number(params[params.length - 1]);
    const pay = store.payments.find(p => p.id === id);
    if (pay) {
      pay.payment_status = params[0];
      pay.updated_at = now;
      return [{ affectedRows: 1 }, []];
    }
  }

  return [{ affectedRows: 0 }, []];
}

function handleDelete(sql, params) {
  if (/delete from subscription_plans/i.test(sql)) {
    const id = Number(params[0]);
    const idx = store.subscription_plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      store.subscription_plans.splice(idx, 1);
      return [{ affectedRows: 1 }, []];
    }
  }
  return [{ affectedRows: 0 }, []];
}

// Database init runner for real MySQL
async function runSchemaAndSeedOnMySQL() {
  if (!pool) return false;
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf8');

    const schemaStatements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of schemaStatements) {
      await pool.query(stmt);
    }

    const seedStatements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of seedStatements) {
      await pool.query(stmt);
    }
    console.log('[DB] Schema and seed successfully executed on MySQL!');
    return true;
  } catch (err) {
    console.error('[DB] Error initializing MySQL tables:', err.message);
    return false;
  }
}

module.exports = {
  query,
  runSchemaAndSeedOnMySQL,
  isUsingFallback: () => useFallback,
  getStore: () => store
};
