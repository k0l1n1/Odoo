-- ==========================================================
-- Brightloop Subscription Management System
-- Seed Data for Supabase (PostgreSQL)
-- Demo Accounts:
-- Admin: admin@brightloop.com / admin123
-- Customers: customer123
-- ==========================================================

-- Clean existing data
TRUNCATE TABLE renewal_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE invoices RESTART IDENTITY CASCADE;
TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE;
TRUNCATE TABLE subscription_plans RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------
INSERT INTO users (id, name, email, password, role, company_name, phone, address, status, created_at) VALUES
(1, 'Alexander Wright', 'admin@brightloop.com', '$2a$10$QO0R5x5/uTqfR7YI9D6X6O9sZfZ3X4qZgR6lC9hE7U1.zM1tC8Y8e', 'admin', 'Brightloop Software HQ', '+1 (555) 019-2834', '100 Innovation Way, Suite 400, San Francisco, CA 94107', 'active', '2026-01-10 09:00:00+00'),
(2, 'Sarah Jenkins', 'sarah.jenkins@acme.com', '$2a$10$2VzWcOqBfJtW1qK7V8hSHeoBf9n5M9mH.p3x6.eA1R3Y2s7fK4X8m', 'customer', 'Acme Corporation', '+1 (555) 432-8910', '742 Evergreen Terrace, Springfield, OR 97477', 'active', '2026-01-15 11:20:00+00'),
(3, 'Michael Chen', 'michael.chen@techflow.io', '$2a$10$2VzWcOqBfJtW1qK7V8hSHeoBf9n5M9mH.p3x6.eA1R3Y2s7fK4X8m', 'customer', 'TechFlow Solutions', '+1 (555) 876-5432', '452 Tech Parkway, Austin, TX 78701', 'active', '2026-02-01 14:15:00+00'),
(4, 'Elena Rostova', 'elena.rostova@cloudscale.net', '$2a$10$2VzWcOqBfJtW1qK7V8hSHeoBf9n5M9mH.p3x6.eA1R3Y2s7fK4X8m', 'customer', 'CloudScale AI', '+1 (555) 321-9876', '88 Silicon Boulevard, Seattle, WA 98101', 'active', '2026-02-18 10:45:00+00'),
(5, 'David Kim', 'david.kim@finpulse.co', '$2a$10$2VzWcOqBfJtW1qK7V8hSHeoBf9n5M9mH.p3x6.eA1R3Y2s7fK4X8m', 'customer', 'FinPulse Global', '+1 (555) 654-3210', '12 Wall Street Tower, New York, NY 10005', 'active', '2026-03-05 16:30:00+00'),
(6, 'Priya Sharma', 'priya.sharma@innovatex.org', '$2a$10$2VzWcOqBfJtW1qK7V8hSHeoBf9n5M9mH.p3x6.eA1R3Y2s7fK4X8m', 'customer', 'InnovateX Labs', '+1 (555) 987-1234', '200 Research Drive, Boston, MA 02115', 'active', '2026-03-20 08:50:00+00');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------
-- 2. SUBSCRIPTION PLANS
-- ----------------------------------------------------------
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features, status, created_at) VALUES
(1, 'Starter', 'Essential subscription infrastructure for early-stage startups and small projects.', 29.00, 'monthly', 
 '["Up to 5 team members", "Core subscription management", "Standard payment gateway", "Automated email invoices", "5GB secure storage", "Community & email support"]'::jsonb, 'active', '2026-01-01 00:00:00+00'),

(2, 'Professional', 'Powerful subscription automation, recurring revenue analytics, and priority handling.', 79.00, 'monthly', 
 '["Up to 25 team members", "Real-time MRR & churn reports", "Multi-method simulated payment", "Automated renewal alerts & dunning", "Priority email & chat support", "Customizable invoice templates", "Full audit & export logs"]'::jsonb, 'active', '2026-01-01 00:00:00+00'),

(3, 'Enterprise', 'Dedicated infrastructure, high-volume automated renewals, custom SLA, and team roles.', 199.00, 'monthly', 
 '["Unlimited team members", "Dedicated database instance", "Real-time financial analytics", "Automated renewal pipeline", "24/7 priority phone & Slack SLA", "Custom domain & branding", "Role-based permissions", "Dedicated Account Manager"]'::jsonb, 'active', '2026-01-01 00:00:00+00'),

(4, 'Growth Annual', 'Cost-effective annual bundle with 2 months free and full feature access.', 790.00, 'yearly', 
 '["Up to 20 team members", "Full financial analytics suite", "Unlimited invoices & payments", "Automated annual renewal handling", "Priority 24/7 support", "Custom exports"]'::jsonb, 'active', '2026-01-05 00:00:00+00');

SELECT setval('subscription_plans_id_seq', (SELECT MAX(id) FROM subscription_plans));

-- ----------------------------------------------------------
-- 3. SUBSCRIPTIONS
-- ----------------------------------------------------------
INSERT INTO subscriptions (id, subscription_code, user_id, plan_id, status, start_date, next_billing_date, expiry_date, auto_renew, cancelled_at, cancellation_reason, created_at) VALUES
(1, 'SUB-2026-00101', 2, 2, 'active', '2026-10-03', '2026-11-03', '2026-11-03', TRUE, NULL, NULL, '2026-10-03 10:00:00+00'),
(2, 'SUB-2026-00102', 3, 3, 'active', '2026-10-15', '2026-11-15', '2026-11-15', TRUE, NULL, NULL, '2026-10-15 11:30:00+00'),
(3, 'SUB-2026-00103', 4, 1, 'active', '2026-10-05', '2026-11-05', '2026-11-05', TRUE, NULL, NULL, '2026-10-05 14:00:00+00'),
(4, 'SUB-2026-00104', 5, 2, 'expired', '2026-09-01', '2026-10-01', '2026-10-01', FALSE, NULL, NULL, '2026-09-01 09:00:00+00'),
(5, 'SUB-2026-00105', 6, 1, 'cancelled', '2026-08-10', '2026-09-10', '2026-09-10', FALSE, '2026-09-08 17:00:00+00', 'Project downsizing and budget reallocation', '2026-08-10 12:00:00+00');

SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));

-- ----------------------------------------------------------
-- 4. INVOICES
-- ----------------------------------------------------------
INSERT INTO invoices (id, invoice_number, subscription_id, user_id, plan_name, amount, tax_amount, total_amount, invoice_date, due_date, payment_status, invoice_type, paid_at, created_at) VALUES
(1, 'INV-2026-10001', 1, 2, 'Professional', 79.00, 7.90, 86.90, '2026-10-03', '2026-10-10', 'paid', 'subscription_new', '2026-10-03 10:05:00+00', '2026-10-03 10:00:00+00'),
(2, 'INV-2026-10002', 2, 3, 'Enterprise', 199.00, 19.90, 218.90, '2026-10-15', '2026-10-22', 'paid', 'subscription_new', '2026-10-15 11:35:00+00', '2026-10-15 11:30:00+00'),
(3, 'INV-2026-10003', 3, 4, 'Starter', 29.00, 2.90, 31.90, '2026-10-05', '2026-10-12', 'paid', 'subscription_new', '2026-10-05 14:10:00+00', '2026-10-05 14:00:00+00'),
(4, 'INV-2026-10004', 1, 2, 'Professional', 79.00, 7.90, 86.90, '2026-10-27', '2026-11-03', 'pending', 'subscription_renewal', NULL, '2026-10-27 00:00:00+00'),
(5, 'INV-2026-10005', 4, 5, 'Professional', 79.00, 7.90, 86.90, '2026-10-01', '2026-10-08', 'overdue', 'subscription_renewal', NULL, '2026-10-01 00:00:00+00'),
(6, 'INV-2026-10006', 3, 4, 'Starter', 29.00, 2.90, 31.90, '2026-10-29', '2026-11-05', 'pending', 'subscription_renewal', NULL, '2026-10-29 00:00:00+00');

SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices));

-- ----------------------------------------------------------
-- 5. PAYMENTS
-- ----------------------------------------------------------
INSERT INTO payments (id, payment_code, user_id, invoice_id, amount, payment_date, payment_method, transaction_reference, payment_status, gateway_response, created_at) VALUES
(1, 'PAY-2026-50001', 2, 1, 86.90, '2026-10-03 10:05:00+00', 'Credit Card', 'TXN-SIM-901823901', 'successful', '{"auth_code": "AUTH98213", "card_brand": "Visa", "last4": "4242", "gateway": "Brightloop Simulated Gateway"}'::jsonb, '2026-10-03 10:05:00+00'),
(2, 'PAY-2026-50002', 3, 2, 218.90, '2026-10-15 11:35:00+00', 'Net Banking', 'TXN-SIM-783921045', 'successful', '{"auth_code": "AUTH11244", "bank_name": "Chase Commercial", "gateway": "Brightloop Simulated Gateway"}'::jsonb, '2026-10-15 11:35:00+00'),
(3, 'PAY-2026-50003', 4, 3, 31.90, '2026-10-05 14:10:00+00', 'UPI', 'TXN-SIM-662391084', 'successful', '{"auth_code": "AUTH66712", "vpa": "elena@okaxis", "gateway": "Brightloop Simulated Gateway"}'::jsonb, '2026-10-05 14:10:00+00');

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));

-- ----------------------------------------------------------
-- 6. RENEWAL HISTORY
-- ----------------------------------------------------------
INSERT INTO renewal_history (id, subscription_id, invoice_id, previous_billing_date, new_billing_date, renewal_date, renewal_status, notes, created_at) VALUES
(1, 1, 4, '2026-10-03', '2026-11-03', '2026-10-27 00:00:00+00', 'scheduled', 'Automated renewal invoice generated 7 days ahead of expiry.', '2026-10-27 00:00:00+00'),
(2, 3, 6, '2026-10-05', '2026-11-05', '2026-10-29 00:00:00+00', 'scheduled', 'Automated renewal invoice generated 7 days ahead of expiry.', '2026-10-29 00:00:00+00');

SELECT setval('renewal_history_id_seq', (SELECT MAX(id) FROM renewal_history));
