const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function seedSupabase() {
  console.log('--- Seeding Live Supabase Database ---');
  console.log('Project URL:', process.env.SUPABASE_URL);

  const adminHash = bcrypt.hashSync('admin123', 10);
  const custHash = bcrypt.hashSync('customer123', 10);

  // 1. Users
  console.log('Checking users...');
  const { data: existingUsers } = await supabase.from('users').select('id');
  if (!existingUsers || existingUsers.length === 0) {
    const users = [
      {
        id: 1,
        name: 'Alexander Wright',
        email: 'admin@brightloop.com',
        password: adminHash,
        role: 'admin',
        company_name: 'Brightloop Software HQ',
        phone: '+1 (555) 019-2834',
        address: '100 Innovation Way, Suite 400, San Francisco, CA 94107',
        status: 'active'
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
        status: 'active'
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
        status: 'active'
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
        status: 'active'
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
        status: 'active'
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
        status: 'active'
      }
    ];
    const { error: userErr } = await supabase.from('users').upsert(users);
    if (userErr) console.warn('Users insert error:', userErr.message);
    else console.log('✓ Inserted 6 demo users into Supabase');
  } else {
    console.log(`Users already exist (${existingUsers.length} records).`);
  }

  // 2. Plans
  console.log('Checking subscription_plans...');
  const { data: existingPlans } = await supabase.from('subscription_plans').select('id');
  if (!existingPlans || existingPlans.length === 0) {
    const plans = [
      {
        id: 1,
        name: 'Starter',
        description: 'Essential subscription infrastructure for early-stage startups and small projects.',
        price: 29.00,
        billing_cycle: 'monthly',
        features: [
          'Up to 5 team members',
          'Core subscription management',
          'Standard payment gateway',
          'Automated email invoices',
          '5GB secure storage',
          'Community & email support'
        ],
        status: 'active'
      },
      {
        id: 2,
        name: 'Professional',
        description: 'Powerful subscription automation, recurring revenue analytics, and priority handling.',
        price: 79.00,
        billing_cycle: 'monthly',
        features: [
          'Up to 25 team members',
          'Real-time MRR & churn reports',
          'Multi-method simulated payment',
          'Automated renewal alerts & dunning',
          'Priority email & chat support',
          'Customizable invoice templates',
          'Full audit & export logs'
        ],
        status: 'active'
      },
      {
        id: 3,
        name: 'Enterprise',
        description: 'Dedicated infrastructure, high-volume automated renewals, custom SLA, and team roles.',
        price: 199.00,
        billing_cycle: 'monthly',
        features: [
          'Unlimited team members',
          'Dedicated database instance',
          'Real-time financial analytics',
          'Automated renewal pipeline',
          '24/7 priority phone & Slack SLA',
          'Custom domain & branding',
          'Role-based permissions',
          'Dedicated Account Manager'
        ],
        status: 'active'
      },
      {
        id: 4,
        name: 'Growth Annual',
        description: 'Cost-effective annual bundle with 2 months free and full feature access.',
        price: 790.00,
        billing_cycle: 'yearly',
        features: [
          'Up to 20 team members',
          'Full financial analytics suite',
          'Unlimited invoices & payments',
          'Automated annual renewal handling',
          'Priority 24/7 support',
          'Custom exports'
        ],
        status: 'active'
      }
    ];
    const { error: planErr } = await supabase.from('subscription_plans').upsert(plans);
    if (planErr) console.warn('Plans insert error:', planErr.message);
    else console.log('✓ Inserted 4 subscription plans into Supabase');
  } else {
    console.log(`Plans already exist (${existingPlans.length} records).`);
  }

  // 3. Subscriptions
  console.log('Checking subscriptions...');
  const { data: existingSubs } = await supabase.from('subscriptions').select('id');
  if (!existingSubs || existingSubs.length === 0) {
    const subs = [
      {
        id: 1,
        subscription_code: 'SUB-2026-00101',
        user_id: 2,
        plan_id: 2,
        status: 'active',
        start_date: '2026-10-03',
        next_billing_date: '2026-11-03',
        expiry_date: '2026-11-03',
        auto_renew: true
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
        auto_renew: true
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
        auto_renew: true
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
        auto_renew: false
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
        auto_renew: false,
        cancelled_at: '2026-09-08T17:00:00Z',
        cancellation_reason: 'Project downsizing and budget reallocation'
      }
    ];
    const { error: subErr } = await supabase.from('subscriptions').upsert(subs);
    if (subErr) console.warn('Subs insert error:', subErr.message);
    else console.log('✓ Inserted 5 subscriptions into Supabase');
  }

  // 4. Invoices
  console.log('Checking invoices...');
  const { data: existingInvs } = await supabase.from('invoices').select('id');
  if (!existingInvs || existingInvs.length === 0) {
    const invoices = [
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
        paid_at: '2026-10-03T10:05:00Z'
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
        paid_at: '2026-10-15T11:35:00Z'
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
        paid_at: '2026-10-05T14:10:00Z'
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
        invoice_type: 'subscription_renewal'
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
        invoice_type: 'subscription_renewal'
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
        invoice_type: 'subscription_renewal'
      }
    ];
    const { error: invErr } = await supabase.from('invoices').upsert(invoices);
    if (invErr) console.warn('Invoices insert error:', invErr.message);
    else console.log('✓ Inserted 6 invoices into Supabase');
  }

  // 5. Payments
  console.log('Checking payments...');
  const { data: existingPays } = await supabase.from('payments').select('id');
  if (!existingPays || existingPays.length === 0) {
    const payments = [
      {
        id: 1,
        payment_code: 'PAY-2026-50001',
        user_id: 2,
        invoice_id: 1,
        amount: 86.90,
        payment_date: '2026-10-03T10:05:00Z',
        payment_method: 'Credit Card',
        transaction_reference: 'TXN-SIM-901823901',
        payment_status: 'successful',
        gateway_response: { auth_code: 'AUTH98213', card_brand: 'Visa', last4: '4242', gateway: 'Brightloop Simulated Gateway' }
      },
      {
        id: 2,
        payment_code: 'PAY-2026-50002',
        user_id: 3,
        invoice_id: 2,
        amount: 218.90,
        payment_date: '2026-10-15T11:35:00Z',
        payment_method: 'Net Banking',
        transaction_reference: 'TXN-SIM-783921045',
        payment_status: 'successful',
        gateway_response: { auth_code: 'AUTH11244', bank_name: 'Chase Commercial', gateway: 'Brightloop Simulated Gateway' }
      },
      {
        id: 3,
        payment_code: 'PAY-2026-50003',
        user_id: 4,
        invoice_id: 3,
        amount: 31.90,
        payment_date: '2026-10-05T14:10:00Z',
        payment_method: 'UPI',
        transaction_reference: 'TXN-SIM-662391084',
        payment_status: 'successful',
        gateway_response: { auth_code: 'AUTH66712', vpa: 'elena@okaxis', gateway: 'Brightloop Simulated Gateway' }
      }
    ];
    const { error: payErr } = await supabase.from('payments').upsert(payments);
    if (payErr) console.warn('Payments insert error:', payErr.message);
    else console.log('✓ Inserted 3 payments into Supabase');
  }

  // 6. Renewal History
  console.log('Checking renewal_history...');
  const { data: existingRenewals } = await supabase.from('renewal_history').select('id');
  if (!existingRenewals || existingRenewals.length === 0) {
    const renewals = [
      {
        id: 1,
        subscription_id: 1,
        invoice_id: 4,
        previous_billing_date: '2026-10-03',
        new_billing_date: '2026-11-03',
        renewal_date: '2026-10-27T00:00:00Z',
        renewal_status: 'scheduled',
        notes: 'Automated renewal invoice generated 7 days ahead of expiry.'
      },
      {
        id: 2,
        subscription_id: 3,
        invoice_id: 6,
        previous_billing_date: '2026-10-05',
        new_billing_date: '2026-11-05',
        renewal_date: '2026-10-29T00:00:00Z',
        renewal_status: 'scheduled',
        notes: 'Automated renewal invoice generated 7 days ahead of expiry.'
      }
    ];
    const { error: renErr } = await supabase.from('renewal_history').upsert(renewals);
    if (renErr) console.warn('Renewal history insert error:', renErr.message);
    else console.log('✓ Inserted 2 renewal history logs into Supabase');
  }

  console.log('--- Supabase Seeding Complete! ---');
}

seedSupabase().catch(console.error);
