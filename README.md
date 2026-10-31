# Brightloop Software – Subscription Management System

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)

A centralized, professional SaaS platform built for **Brightloop Software** to automate the end-to-end subscription lifecycle with **Supabase (PostgreSQL)**. It orchestrates customer registrations, plan subscriptions, recurring billing, automated renewals, tax-compliant invoice generation, and simulated payment processing.

---

## 🚀 Live Application URLs

| Service | Port / URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | React 18, Vite 5, Tailwind CSS, Recharts |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express, JWT, Bcrypt, Node-Cron |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Supabase Engine & Health Status |

---

## 🔑 Demo Login Credentials

For quick evaluation, pre-seeded accounts are provided. The login page also features **1-click quick-fill buttons** and a **live Role Switcher** in the top navigation bar:

| Role | Email | Password | Account Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@brightloop.com` | `admin123` | Alexander Wright (Brightloop HQ) |
| **Customer 1** | `sarah.jenkins@acme.com` | `customer123` | Sarah Jenkins (Acme Corp) – Active Professional Tier |
| **Customer 2** | `michael.chen@techflow.io` | `customer123` | Michael Chen (TechFlow Solutions) – Enterprise Tier |
| **Customer 3** | `elena.rostova@cloudscale.net` | `customer123` | Elena Rostova (CloudScale AI) – Starter Tier |
| **Customer 4** | `david.kim@finpulse.co` | `customer123` | David Kim (FinPulse Global) – Expired Subscription |
| **Customer 5** | `priya.sharma@innovatex.org` | `customer123` | Priya Sharma (InnovateX Labs) – Cancelled Subscription |

---

## ⚡ Supabase Setup (PostgreSQL)

The database schema and seed records are located in:
- Schema: [`database/schema.sql`](database/schema.sql)
- Seed Data: [`database/seed.sql`](database/seed.sql)

### Option A: Run in Supabase Web Dashboard
1. Log in to [Supabase](https://supabase.com/) and open your project.
2. Navigate to **SQL Editor** on the left menu.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Paste the contents of `database/seed.sql` and click **Run**.
5. Copy your **Project URL** and **anon/service_role key** from **Project Settings → API**.
6. Paste them into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```

### Option B: Zero-Setup Embedded Engine
If you are evaluating locally without Supabase credentials yet, the application automatically runs its smart embedded relational store with the exact same data and schema. **Zero configuration required to run immediately!**

---

## 🌟 Key Features

1. **Role-Based Auth**: Admin and Customer portals, JWT sessions, bcrypt hashing, profile updates.
2. **Subscription Plans**: Starter ($29/mo), Professional ($79/mo), Enterprise ($199/mo), Growth Annual ($790/yr). Admin CRUD & Customer comparison.
3. **Lifecycle Management**: Unique IDs (`SUB-2026-XXXXX`), auto billing dates, cancellation workflow, duplicate subscription prevention.
4. **Automated Invoices**: Auto-issued on subscription & renewal, 10% tax breakdown, downloadable/printable PDF view (`@media print`).
5. **Simulated Payment Gateway**: Card, UPI/QR, Net Banking with Success, Failure, and Pending simulation triggers.
6. **Automated Renewal Cron**: Proactive detection of expiring subscriptions (within 7 days) and renewal invoice issuance.
7. **Executive Dashboard**: 8 KPI metric cards, Monthly Revenue Area Chart, Subscription Growth Line Chart, Plan Distribution Donut Chart.

---

## 🛠️ Quickstart Commands

### 1. Backend Server
```bash
cd backend
npm install
npm start
```
Starts on **http://localhost:5000**.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Starts on **http://localhost:3000**.

### 3. Run Automated E2E Verification
```bash
cd backend
node test-e2e.js
```
Runs the 11-step automated test suite verifying auth, subscriptions, invoicing, payments, renewals, and metrics.
