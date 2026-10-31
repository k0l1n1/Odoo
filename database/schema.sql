-- ==========================================================
-- Brightloop Subscription Management System
-- Database Schema for Supabase (PostgreSQL 15+)
-- ==========================================================

-- Enable pgcrypto extension if needed for UUID or hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing tables if re-running
DROP TABLE IF EXISTS renewal_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
    company_name VARCHAR(150) DEFAULT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ----------------------------------------------------------
-- 2. SUBSCRIPTION PLANS TABLE
-- ----------------------------------------------------------
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    price NUMERIC(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_status ON subscription_plans(status);
CREATE INDEX idx_plans_cycle ON subscription_plans(billing_cycle);

-- ----------------------------------------------------------
-- 3. SUBSCRIPTIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    subscription_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    start_date DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    cancelled_at TIMESTAMPTZ DEFAULT NULL,
    cancellation_reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subs_code ON subscriptions(subscription_code);
CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
CREATE INDEX idx_subs_next_billing ON subscriptions(next_billing_date);

-- ----------------------------------------------------------
-- 4. INVOICES TABLE
-- ----------------------------------------------------------
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    subscription_id INT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'failed', 'overdue')),
    invoice_type VARCHAR(30) NOT NULL DEFAULT 'subscription_new' CHECK (invoice_type IN ('subscription_new', 'subscription_renewal')),
    paid_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_num ON invoices(invoice_number);
CREATE INDEX idx_inv_sub ON invoices(subscription_id);
CREATE INDEX idx_inv_user ON invoices(user_id);
CREATE INDEX idx_inv_status ON invoices(payment_status);
CREATE INDEX idx_inv_due ON invoices(due_date);

-- ----------------------------------------------------------
-- 5. PAYMENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('successful', 'failed', 'pending')),
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pay_code ON payments(payment_code);
CREATE INDEX idx_pay_user ON payments(user_id);
CREATE INDEX idx_pay_inv ON payments(invoice_id);
CREATE INDEX idx_pay_status ON payments(payment_status);
CREATE INDEX idx_pay_txn ON payments(transaction_reference);

-- ----------------------------------------------------------
-- 6. RENEWAL HISTORY TABLE
-- ----------------------------------------------------------
CREATE TABLE renewal_history (
    id SERIAL PRIMARY KEY,
    subscription_id INT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_id INT REFERENCES invoices(id) ON DELETE SET NULL,
    previous_billing_date DATE NOT NULL,
    new_billing_date DATE NOT NULL,
    renewal_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    renewal_status VARCHAR(20) NOT NULL DEFAULT 'processed' CHECK (renewal_status IN ('scheduled', 'processed', 'failed')),
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_renew_sub ON renewal_history(subscription_id);
CREATE INDEX idx_renew_status ON renewal_history(renewal_status);

-- Enable Row Level Security (RLS) but allow service / public access for API
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_history ENABLE ROW LEVEL SECURITY;

-- Allow anon & service role full access via policies for server API
CREATE POLICY "Allow full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to subscription_plans" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to renewal_history" ON renewal_history FOR ALL USING (true) WITH CHECK (true);
