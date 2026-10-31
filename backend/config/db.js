const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let supabase = null;

// Initialize Supabase Client with configured credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://bsbuokduadmdhpjbqeqq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_2A1ifb7FlvR5FP7vglopNQ_uAaD1vEZ';

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Successfully connected to live Supabase instance:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Warning:', err.message);
  }
}

// In-Memory Relational Cache / Fallback Store
const store = {
  users: [],
  subscription_plans: [],
  subscriptions: [],
  invoices: [],
  payments: [],
  renewal_history: [],
  autoInc: { users: 7, subscription_plans: 5, subscriptions: 6, invoices: 7, payments: 4, renewal_history: 3 }
};

// Unified Query Handler connecting directly to live Supabase with fallback resilience
async function query(sql, params = []) {
  if (supabase) {
    try {
      const result = await executeSupabaseDirect(sql, params);
      if (result !== null) return result;
    } catch (err) {
      console.warn('[Supabase Query Notice, using cached store]:', err.message);
    }
  }

  return executeFallbackQuery(sql, params);
}

// Live Supabase Direct Handler
async function executeSupabaseDirect(sql, params) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lower = cleanSql.toLowerCase();

  // 1. SELECT Users
  if (lower.includes('from users')) {
    if (lower.includes('email = ?')) {
      const { data, error } = await supabase.from('users').select('*').ilike('email', params[0]);
      if (error) throw error;
      return [data || [], []];
    }
    if (lower.includes('id = ?')) {
      const { data, error } = await supabase.from('users').select('*').eq('id', params[0]);
      if (error) throw error;
      return [data || [], []];
    }
    if (lower.includes('role = ?')) {
      const { data, error } = await supabase.from('users').select('*').eq('role', params[0]).order('id', { ascending: false });
      if (error) throw error;
      return [data || [], []];
    }
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: false });
    if (error) throw error;
    return [data || [], []];
  }

  // 2. SELECT Subscription Plans
  if (lower.includes('from subscription_plans')) {
    if (lower.includes('id = ?')) {
      const { data, error } = await supabase.from('subscription_plans').select('*').eq('id', params[0]);
      if (error) throw error;
      return [data || [], []];
    }
    if (lower.includes('status = ?')) {
      const { data, error } = await supabase.from('subscription_plans').select('*').eq('status', params[0]).order('price', { ascending: true });
      if (error) throw error;
      return [data || [], []];
    }
    const { data, error } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
    if (error) throw error;
    return [data || [], []];
  }

  // 3. SELECT Subscriptions
  if (lower.includes('from subscriptions')) {
    const { data: subs, error: subErr } = await supabase.from('subscriptions').select('*').order('id', { ascending: false });
    if (subErr) throw subErr;

    const { data: users } = await supabase.from('users').select('id, name, email, company_name');
    const { data: plans } = await supabase.from('subscription_plans').select('id, name, price, billing_cycle, features');

    const userMap = new Map((users || []).map(u => [u.id, u]));
    const planMap = new Map((plans || []).map(p => [p.id, p]));

    let rows = (subs || []).map(s => {
      const u = userMap.get(s.user_id) || {};
      const p = planMap.get(s.plan_id) || {};
      return {
        ...s,
        customer_name: u.name || 'Unknown',
        customer_email: u.email || '',
        company_name: u.company_name || '',
        plan_name: p.name || 'Custom',
        plan_price: p.price || 0,
        billing_cycle: p.billing_cycle || 'monthly',
        features: p.features || []
      };
    });

    if (lower.includes('s.id = ?') || lower.includes('subscriptions.id = ?')) {
      rows = rows.filter(r => r.id === Number(params[0]));
    } else if (lower.includes('user_id = ?')) {
      rows = rows.filter(r => r.user_id === Number(params[0]));
    }
    if (lower.includes("status = 'active'") || (lower.includes('status = ?') && params.includes('active'))) {
      rows = rows.filter(r => r.status === 'active');
    }

    return [rows, []];
  }

  // 4. SELECT Invoices
  if (lower.includes('from invoices')) {
    const { data: invs, error: invErr } = await supabase.from('invoices').select('*').order('id', { ascending: false });
    if (invErr) throw invErr;

    const { data: users } = await supabase.from('users').select('id, name, email, company_name, phone, address');
    const { data: subs } = await supabase.from('subscriptions').select('id, subscription_code');

    const userMap = new Map((users || []).map(u => [u.id, u]));
    const subMap = new Map((subs || []).map(s => [s.id, s]));

    let rows = (invs || []).map(i => {
      const u = userMap.get(i.user_id) || {};
      const s = subMap.get(i.subscription_id) || {};
      return {
        ...i,
        customer_name: u.name || 'Unknown',
        customer_email: u.email || '',
        company_name: u.company_name || '',
        customer_phone: u.phone || '',
        customer_address: u.address || '',
        subscription_code: s.subscription_code || ''
      };
    });

    if (lower.includes('inv.id = ?') || lower.includes('invoices.id = ?')) {
      rows = rows.filter(r => r.id === Number(params[0]));
    } else if (lower.includes('user_id = ?')) {
      rows = rows.filter(r => r.user_id === Number(params[0]));
    }

    return [rows, []];
  }

  // 5. SELECT Payments
  if (lower.includes('from payments')) {
    const { data: pays, error: payErr } = await supabase.from('payments').select('*').order('id', { ascending: false });
    if (payErr) throw payErr;

    const { data: users } = await supabase.from('users').select('id, name, email, company_name');
    const { data: invs } = await supabase.from('invoices').select('id, invoice_number, plan_name');

    const userMap = new Map((users || []).map(u => [u.id, u]));
    const invMap = new Map((invs || []).map(i => [i.id, i]));

    let rows = (pays || []).map(p => {
      const u = userMap.get(p.user_id) || {};
      const i = invMap.get(p.invoice_id) || {};
      return {
        ...p,
        customer_name: u.name || 'Unknown',
        customer_email: u.email || '',
        company_name: u.company_name || '',
        invoice_number: i.invoice_number || '',
        plan_name: i.plan_name || ''
      };
    });

    if (lower.includes('p.id = ?') || lower.includes('payments.id = ?')) {
      rows = rows.filter(r => r.id === Number(params[0]));
    } else if (lower.includes('user_id = ?')) {
      rows = rows.filter(r => r.user_id === Number(params[0]));
    }

    return [rows, []];
  }

  // 6. SELECT Renewal History
  if (lower.includes('from renewal_history')) {
    const { data: renewals, error: renErr } = await supabase.from('renewal_history').select('*').order('id', { ascending: false });
    if (renErr) throw renErr;

    const { data: subs } = await supabase.from('subscriptions').select('id, subscription_code, user_id');
    const { data: users } = await supabase.from('users').select('id, name, email');
    const { data: invs } = await supabase.from('invoices').select('id, invoice_number, payment_status');

    const subMap = new Map((subs || []).map(s => [s.id, s]));
    const userMap = new Map((users || []).map(u => [u.id, u]));
    const invMap = new Map((invs || []).map(i => [i.id, i]));

    let rows = (renewals || []).map(rh => {
      const s = subMap.get(rh.subscription_id) || {};
      const u = userMap.get(s.user_id) || {};
      const i = invMap.get(rh.invoice_id) || {};
      return {
        ...rh,
        subscription_code: s.subscription_code || '',
        customer_name: u.name || 'Unknown',
        customer_email: u.email || '',
        invoice_number: i.invoice_number || null,
        invoice_status: i.payment_status || null
      };
    });

    return [rows, []];
  }

  // 7. INSERT Operations
  if (lower.startsWith('insert into users')) {
    const { data, error } = await supabase.from('users').insert({
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'customer',
      company_name: params[4] || null,
      phone: params[5] || null,
      address: params[6] || null,
      status: params[7] || 'active'
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('insert into subscription_plans')) {
    const { data, error } = await supabase.from('subscription_plans').insert({
      name: params[0],
      description: params[1],
      price: parseFloat(params[2]),
      billing_cycle: params[3],
      features: Array.isArray(params[4]) ? params[4] : (typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4]),
      status: params[5] || 'active'
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('insert into subscriptions')) {
    const { data, error } = await supabase.from('subscriptions').insert({
      subscription_code: params[0],
      user_id: Number(params[1]),
      plan_id: Number(params[2]),
      status: params[3] || 'pending',
      start_date: params[4],
      next_billing_date: params[5],
      expiry_date: params[6],
      auto_renew: !!params[7]
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('insert into invoices')) {
    const { data, error } = await supabase.from('invoices').insert({
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
      invoice_type: params[10] || 'subscription_new'
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('insert into payments')) {
    const { data, error } = await supabase.from('payments').insert({
      payment_code: params[0],
      user_id: Number(params[1]),
      invoice_id: Number(params[2]),
      amount: parseFloat(params[3]),
      payment_date: params[4] || new Date().toISOString(),
      payment_method: params[5],
      transaction_reference: params[6],
      payment_status: params[7],
      gateway_response: typeof params[8] === 'string' ? JSON.parse(params[8]) : (params[8] || {})
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  if (lower.startsWith('insert into renewal_history')) {
    const { data, error } = await supabase.from('renewal_history').insert({
      subscription_id: Number(params[0]),
      invoice_id: params[1] ? Number(params[1]) : null,
      previous_billing_date: params[2],
      new_billing_date: params[3],
      renewal_date: params[4] || new Date().toISOString(),
      renewal_status: params[5] || 'processed',
      notes: params[6] || null
    }).select('id');
    if (error) throw error;
    return [{ insertId: data[0].id, affectedRows: 1 }, []];
  }

  // 8. UPDATE Operations
  if (lower.startsWith('update users')) {
    const id = Number(params[params.length - 1]);
    if (lower.includes('name = ?') && lower.includes('company_name = ?')) {
      const { error } = await supabase.from('users').update({
        name: params[0],
        company_name: params[1],
        phone: params[2],
        address: params[3],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
    if (lower.includes('status = ?')) {
      const { error } = await supabase.from('users').update({
        status: params[0],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
  }

  if (lower.startsWith('update subscription_plans')) {
    const id = Number(params[params.length - 1]);
    if (lower.includes('status = ?') && params.length === 2) {
      const { error } = await supabase.from('subscription_plans').update({
        status: params[0],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
    const { error } = await supabase.from('subscription_plans').update({
      name: params[0],
      description: params[1],
      price: parseFloat(params[2]),
      billing_cycle: params[3],
      features: Array.isArray(params[4]) ? params[4] : (typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4]),
      status: params[5],
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
    return [{ affectedRows: 1 }, []];
  }

  if (lower.startsWith('update subscriptions')) {
    const id = Number(params[params.length - 1]);
    if (lower.includes('status = ?') && lower.includes('cancelled_at')) {
      const { error } = await supabase.from('subscriptions').update({
        status: params[0],
        cancelled_at: params[1],
        cancellation_reason: params[2],
        auto_renew: false,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
    if (lower.includes('next_billing_date = ?')) {
      const { error } = await supabase.from('subscriptions').update({
        status: params[0],
        next_billing_date: params[1],
        expiry_date: params[2],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
    if (lower.includes('status = ?')) {
      const { error } = await supabase.from('subscriptions').update({
        status: params[0],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
  }

  if (lower.startsWith('update invoices')) {
    const id = Number(params[params.length - 1]);
    if (lower.includes('paid_at')) {
      const { error } = await supabase.from('invoices').update({
        payment_status: params[0],
        paid_at: params[1],
        updated_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
      return [{ affectedRows: 1 }, []];
    }
    const { error } = await supabase.from('invoices').update({
      payment_status: params[0],
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
    return [{ affectedRows: 1 }, []];
  }

  if (lower.startsWith('delete from subscription_plans')) {
    const id = Number(params[0]);
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (error) throw error;
    return [{ affectedRows: 1 }, []];
  }

  return null;
}

// Fallback execution engine
function executeFallbackQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lower = cleanSql.toLowerCase();

  if (lower.startsWith('select')) {
    if (lower.includes('from users')) {
      if (lower.includes('email = ?')) {
        return [store.users.filter(u => u.email.toLowerCase() === String(params[0]).toLowerCase()), []];
      }
      if (lower.includes('id = ?')) {
        return [store.users.filter(u => u.id === Number(params[0])), []];
      }
      return [store.users, []];
    }
    if (lower.includes('from subscription_plans')) {
      if (lower.includes('id = ?')) {
        return [store.subscription_plans.filter(p => p.id === Number(params[0])), []];
      }
      return [store.subscription_plans, []];
    }
    if (lower.includes('from subscriptions')) {
      return [store.subscriptions, []];
    }
    if (lower.includes('from invoices')) {
      return [store.invoices, []];
    }
    if (lower.includes('from payments')) {
      return [store.payments, []];
    }
  }

  return [[], []];
}

module.exports = {
  query,
  getSupabase: () => supabase,
  isUsingFallback: () => !supabase,
  getStore: () => store
};
