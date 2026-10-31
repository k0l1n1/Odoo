# Brightloop Software – Subscription Management System

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/AI%20Copilot-GPT--4o--mini-FF7A00.svg)](https://openai.com/)
[![PDFKit](https://img.shields.io/badge/PDF%20Engine-PDFKit-E02424.svg)](https://pdfkit.org/)

A centralized, professional SaaS platform built for **Brightloop Software** to automate the end-to-end subscription lifecycle with **Supabase (PostgreSQL)**. All transactions, billing tiers, and analytics are standardized in **Indian Rupees (₹)**. The system features a 3-tier role hierarchy, an intelligent **OpenAI-powered AI Help Copilot** for customers, automated recurring billing, server-side PDF invoice generation, and simulated payment processing.

---

## 🚀 Live Application URLs

| Service | Port / URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | React 18, Vite 5, Tailwind CSS, Lucide Icons, Recharts |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express, JWT, Bcrypt, PDFKit, Node-Cron, OpenAI SDK |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Supabase Engine connection status & server health |

---

## 👥 Three-Tier Role-Based Access Control (RBAC)

The application implements a strict 3-tier role hierarchy with tailored dashboards, dedicated navigation menus, and backend authorization guards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BRIGHTLOOP ROLE HIERARCHY                       │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│   👑 ADMINISTRATOR   │     🛡️ STAFF OPERATIONS   │      👤 CUSTOMER      │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ • Full platform     │ • Operational portal     │ • Self-service portal │
│   governance        │ • View & monitor all     │ • Browse plans with   │
│ • Staff management  │   subscriptions          │   live discounts      │
│   (add / remove)    │ • Inspect invoice ledgers│ • Subscribe / upgrade │
│ • EXCLUSIVE: Assign │ • Trigger manual renewal │ • Pay pending invoices│
│   plan discounts    │   invoices               │ • Real PDF download   │
│ • Financial metrics │ • [RESTRICTED: No staff  │ • Isolated print      │
│   & revenue charts  │   mgmt or discounts]     │ • EXCLUSIVE: OpenAI   │
│ • System audits     │ • [No AI Help Copilot]   │   AI Help Copilot     │
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

### 1. 👑 Administrator (`admin`)
- **Full System Control**: Executive dashboard with 8 KPI metric cards, revenue area charts, growth lines, and plan distribution donuts.
- **Exclusive Plan Discounts**: Only Administrators can set, modify, or remove promotional discounts (0–100%) on subscription plans. Backend routes strictly reject non-admin discount modifications with `HTTP 403 Forbidden`.
- **Staff Operations Management**: Dedicated view (`/admin/staff`) to authorize new operational staff accounts and remove existing ones.
- **Auditing & Oversight**: Comprehensive access to all customer subscriptions, complete invoice ledgers, and audit logs.

### 2. 🛡️ Staff Operations (`staff`)
- **Operational Dashboard**: Monitor real-time system metrics, active subscriber counts, expiring subscriptions, and revenue trends.
- **Lifecycle Monitoring**: Inspect all customer subscriptions, review billing cycles, and track renewal statuses.
- **Invoice Auditing**: Review all customer invoices, payment statuses, and issued receipts.
- **Manual Renewal Trigger**: Operations staff can manually trigger renewal invoice generation for customers whose subscriptions are nearing expiration.
- **Role Boundary**: Staff accounts **cannot** add or remove staff members and **cannot** alter plan discounts. AI Help Copilot is disabled for internal staff.

### 3. 👤 Customer (`customer`)
- **Self-Service Dashboard**: Live subscription overview, next billing date, renewal alerts, and quick actions.
- **Plan Catalog & Discounts**: Browse Starter, Professional, Enterprise, and Growth plans with live strikethrough pricing, discount badges (e.g. `15% OFF`), and calculated savings in Indian Rupees (`₹`).
- **Billing & Invoices**: View all invoices, pay pending balances via Card, UPI/QR, or Net Banking, download real PDF files, or print with an isolated printer engine.
- **Prevent Duplicate Subscriptions**: Paying a pending invoice automatically transitions and reconciles the active subscription seamlessly.
- **Exclusive AI Help Copilot**: Powered by OpenAI `gpt-4o-mini`, providing context-aware guidance and 1-click interactive navigation pills.

---

## 🔑 Demo Login Credentials & Role Switcher

> **Note on Role Switcher**: To maintain a realistic production interface, the demo role switcher has been relocated to the **Login Page** (visible after signing out). The top navigation bar inside the app remains clean and role-specific. When signed out, the Login page offers **1-click quick-fill buttons** for instant switching between Admin, Staff, and Customer accounts.

| Role | Email | Password | Account Details & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@brightloop.com` | `admin123` | Alexander Wright – Full Governance & Discount Control |
| **Staff Operations** | `staff@brightloop.com` | `staff123` | Emma Watson – Operations, Audit & Manual Renewals |
| **Customer 1** | `sarah.jenkins@acme.com` | `customer123` | Sarah Jenkins (Acme Corp) – Professional Tier (Active) |
| **Customer 2** | `michael.chen@techflow.io` | `customer123` | Michael Chen (TechFlow Solutions) – Enterprise Tier (Active) |
| **Customer 3** | `elena.rostova@cloudscale.net` | `customer123` | Elena Rostova (CloudScale AI) – Starter Tier (Active) |
| **Customer 4** | `david.kim@finpulse.co` | `customer123` | David Kim (FinPulse Global) – Expired Subscription |
| **Customer 5** | `priya.sharma@innovatex.org` | `customer123` | Priya Sharma (InnovateX Labs) – Cancelled Subscription |

---

## 🤖 OpenAI-Powered AI Help & Navigation Copilot

The Customer portal includes a native, context-aware AI Assistant powered by OpenAI:

- **Customer-Centric**: Exclusively accessible to customer accounts. The AI drawer button is hidden from Admin and Staff portals.
- **Screen & Context Aware**: When opened, the Copilot automatically ingests the customer's active route, active subscription status, plan name, and pending unpaid invoice count.
- **Interactive Navigation Pills**: The Copilot generates actionable navigation tags in the format `[NAV:/route:Label]`. The frontend parses these into interactive pills that users can click to navigate directly to pages like:
  - `[NAV:/customer/plans:View Subscription Plans]`
  - `[NAV:/customer/invoices:Pay Pending Invoice]`
  - `[NAV:/customer/history:View Payment History]`
  - `[NAV:/customer/profile:Update Profile]`
- **Model**: Defaulted to `gpt-4o-mini` with prompt safeguards tailored for Brightloop SaaS support.
- **API Endpoint**: `POST /api/ai/help` (guarded by JWT auth and Customer role verification).

---

## 💰 Currency Standardization (Indian Rupees ₹)

All financial figures, transactions, calculations, and displays across the entire system use **Indian Rupees (`₹`)**:

| Plan Tier | Billing Interval | Base Price | Features |
| :--- | :--- | :--- | :--- |
| **Starter** | Monthly | `₹2,499 / mo` | Up to 5 users, core analytics, email support |
| **Professional** | Monthly | `₹6,999 / mo` | Up to 25 users, advanced analytics, priority support, API access |
| **Enterprise** | Monthly | `₹16,999 / mo` | Unlimited users, custom integrations, 24/7 dedicated manager |
| **Growth Annual** | Yearly | `₹69,999 / yr` | Full enterprise suite, dedicated account manager, annual billing discount |

- **Tax Handling**: Transparent 10% GST/service tax line item calculated and itemized on every invoice.
- **Promotional Discounts**: Admin can set percentage discounts (0–100%) on any plan. Invoices and payments reflect the discounted net amount.

---

## 📄 Enhanced PDF Downloads & Isolated Printing

### 1. Genuine Server-Side PDF Download
- Implemented with **PDFKit** on the backend (`GET /api/invoices/:id/download`).
- Generates a branded, vector-quality, tax-compliant PDF document directly to disk or HTTP response stream.
- Formatted with Brightloop branding, invoice metadata, customer billing details, line-item breakdowns, tax amounts, and pure Rupee (`₹`) symbols.
- Directly downloadable via the "Download PDF" button in invoice modals and ledger tables.

### 2. Isolated Iframe Print Engine
- Avoids common browser print issues (such as modal backdrop darkening, cut-off tables, or parent element clipping).
- The print utility (`printInvoiceDocument`) clones the clean invoice HTML into a temporary, isolated, hidden iframe with dedicated `@media print` styling before triggering `window.print()`.

---

## ⚡ Supabase Setup (PostgreSQL)

The database schema and seed data are located in:
- Schema: [`database/schema.sql`](database/schema.sql)
- Seed Data: [`database/seed.sql`](database/seed.sql)

### Option A: Run in Supabase Web Dashboard
1. Log in to [Supabase](https://supabase.com/) and open your project.
2. Navigate to **SQL Editor** in the left menu.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Paste the contents of `database/seed.sql` and click **Run**.
5. Copy your **Project URL** and **anon/service_role key** from **Project Settings → API**.
6. Set them in `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```

### Option B: Zero-Setup Embedded Engine
If running locally without Supabase credentials, the backend automatically uses its embedded relational fallback engine with pre-seeded test data. **Zero setup is required to run and test immediately!**

---

## ⚙️ Environment Variables

Create or edit `backend/.env` (see `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=brightloop_super_secret_jwt_key_hackathon_2026_x89!
JWT_EXPIRES_IN=7d

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Auto-Renewal Background Cron (every 15 minutes by default)
RENEWAL_CRON_SCHEDULE=*/15 * * * *

# OpenAI API Configuration (for Customer AI Help Copilot)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

---

## 🛠️ Quickstart Commands

### 1. Backend Server
```bash
cd backend
npm install
npm start
```
Starts backend REST API on **http://localhost:5000**.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Starts frontend application on **http://localhost:3000**.

### 3. Run Automated E2E Verification
```bash
cd backend
node test-e2e.js
```
Executes an automated end-to-end test suite verifying authentication, plan management, discount permissions, subscriptions, invoice creation, payment simulation, and renewal processing.
