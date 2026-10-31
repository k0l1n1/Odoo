const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const PAGE_CONTEXTS = {
  '/admin': {
    title: 'Admin Dashboard (Executive Analytics)',
    description: 'Provides real-time SaaS revenue and subscription performance metrics, including Total Revenue (₹), MRR (₹), Active/Expired/Cancelled subscription counts, past 6-month revenue trend chart, plan distribution chart, upcoming renewals, and recent payments. Includes a manual "Run Renewal Check" trigger.',
    availableActions: ['View revenue trends', 'Run renewal check', 'Inspect recent transactions', 'Navigate to any admin section'],
    suggestedNav: [
      { path: '/admin/plans', label: 'Subscription Plans' },
      { path: '/admin/subscriptions', label: 'Manage Subscriptions' },
      { path: '/admin/invoices', label: 'Invoices' },
      { path: '/admin/renewals', label: 'Renewal Tracker' }
    ]
  },
  '/admin/plans': {
    title: 'Subscription Plan Management',
    description: 'Enables administrators to create, edit, activate/deactivate, and delete subscription tiers. Supports setting percentage discounts (0% to 100%) with automated strikethrough pricing and badge highlights, horizontal smooth scrolling, and custom feature list configuration.',
    availableActions: ['Add a new subscription plan', 'Edit base price or discount percentage', 'Toggle plan active/inactive status', 'Delete obsolete plans'],
    suggestedNav: [
      { path: '/admin/subscriptions', label: 'Active Subscriptions' },
      { path: '/admin/invoices', label: 'Invoices' }
    ]
  },
  '/admin/subscriptions': {
    title: 'All Customer Subscriptions',
    description: 'Comprehensive table of all customer subscriptions with status (active, pending, expired, cancelled), subscription codes, plan tiers, billing cycles, start dates, and next renewal dates.',
    availableActions: ['Search subscriptions', 'Filter by status', 'Cancel a subscription with reason', 'View customer details'],
    suggestedNav: [
      { path: '/admin/renewals', label: 'Renewal Tracker' },
      { path: '/admin/invoices', label: 'Invoices' }
    ]
  },
  '/admin/invoices': {
    title: 'Invoice Management',
    description: 'Centralized invoice ledger showing invoice numbers, customer names, net amounts, GST tax, total amounts in ₹, issue dates, due dates, and statuses (paid, pending, overdue, failed). Includes printable PDF preview modal.',
    availableActions: ['Review invoices', 'Filter by payment status', 'Open printable invoice modal with PDF save/print', 'Mark invoice status'],
    suggestedNav: [
      { path: '/admin/payments', label: 'Payment Ledger' },
      { path: '/admin/subscriptions', label: 'Subscriptions' }
    ]
  },
  '/admin/payments': {
    title: 'Payment Transactions Ledger',
    description: 'Detailed audit log of simulated payment gateway transactions, including transaction references, payment methods (Credit Card, UPI, Net Banking), timestamps, gateway response payloads, and settlement statuses.',
    availableActions: ['Search transactions', 'Audit payment gateway responses', 'Track payment methods'],
    suggestedNav: [
      { path: '/admin/invoices', label: 'Invoices' }
    ]
  },
  '/admin/renewals': {
    title: 'Automated Renewal Tracker',
    description: 'Monitors the automated background renewal engine. Shows countdown to next renewal dates, active status, dunning alerts for overdue invoices, and complete renewal history log.',
    availableActions: ['Trigger manual renewal check worker', 'Inspect upcoming renewal schedule', 'Review renewal history logs'],
    suggestedNav: [
      { path: '/admin/subscriptions', label: 'Subscriptions' },
      { path: '/admin/invoices', label: 'Invoices' }
    ]
  },
  '/admin/customers': {
    title: 'Customer Directory & Accounts',
    description: 'Customer relationship view displaying customer names, corporate email addresses, company names, contact numbers, total paid in ₹, total invoice count, and active/inactive account status toggles.',
    availableActions: ['Search customers', 'Toggle account activation status', 'Inspect lifetime revenue per customer'],
    suggestedNav: [
      { path: '/admin/subscriptions', label: 'Subscriptions' },
      { path: '/admin/staff', label: 'Staff Team' }
    ]
  },
  '/admin/staff': {
    title: 'Staff Team Management',
    description: 'Allows Administrators to manage operational team members. Admin can authorize and add new staff members (with name, work email, temporary password, department, and phone), monitor team permissions, and remove staff members when needed.',
    availableActions: ['Add new staff member with credentials', 'Search staff directory', 'Remove staff member', 'Review operational roles'],
    suggestedNav: [
      { path: '/admin/customers', label: 'Customer Management' },
      { path: '/admin', label: 'Dashboard' }
    ]
  },
  '/customer': {
    title: 'Customer Dashboard (Workspace)',
    description: 'Overview for customers showing current active plan hero card, payment due action banner with immediate "Pay Now" trigger, lifetime spending summary in ₹, and recent simulated payment activity.',
    availableActions: ['Pay pending invoice immediately', 'Review active subscription status', 'Explore upgrade/new plans'],
    suggestedNav: [
      { path: '/customer/plans', label: 'Browse Plans' },
      { path: '/customer/subscriptions', label: 'My Subscriptions' },
      { path: '/customer/invoices', label: 'My Invoices' }
    ]
  },
  '/customer/plans': {
    title: 'Browse Subscription Plans',
    description: 'Pricing showcase with horizontal scrolling where customers can view all available tiers (Starter, Professional, Enterprise, Annual), original vs discounted prices with discount tags (e.g. 20% OFF), feature checklists, and subscribe.',
    availableActions: ['Browse monthly & annual plans', 'Review included features and discounts', 'Click Subscribe to confirm tier and proceed to payment'],
    suggestedNav: [
      { path: '/customer/subscriptions', label: 'My Subscriptions' },
      { path: '/customer', label: 'Dashboard' }
    ]
  },
  '/customer/subscriptions': {
    title: 'My Subscriptions & History',
    description: 'Shows the customer\'s single current active subscription with renewal date and auto-renewal status, along with full past subscription history and cancellation modal.',
    availableActions: ['View current active subscription', 'Toggle auto-renew setting', 'Cancel subscription with reason', 'Review past cancelled/expired tiers'],
    suggestedNav: [
      { path: '/customer/plans', label: 'Explore Plans' },
      { path: '/customer/invoices', label: 'My Invoices' }
    ]
  },
  '/customer/invoices': {
    title: 'My Invoices & Billing',
    description: 'Lists all customer invoices with itemized subtotal, 10% GST, and total in ₹. Unpaid or pending invoices have an immediate "Pay Now" button opening the payment gateway modal.',
    availableActions: ['Pay pending invoice', 'View itemized printable invoice with PDF export', 'Filter by status'],
    suggestedNav: [
      { path: '/customer/payments', label: 'Payment History' },
      { path: '/customer/subscriptions', label: 'My Subscriptions' }
    ]
  },
  '/customer/payments': {
    title: 'Payment History',
    description: 'Historical record of all payments made by this customer with transaction reference, date, payment method, and amount in ₹.',
    availableActions: ['Track past payments', 'View settlement receipts'],
    suggestedNav: [
      { path: '/customer/invoices', label: 'My Invoices' }
    ]
  },
  '/customer/profile': {
    title: 'Customer Profile',
    description: 'View customer contact information, company name, address, and account creation details.',
    availableActions: ['Review profile information', 'Verify billing address'],
    suggestedNav: [
      { path: '/customer', label: 'Dashboard' }
    ]
  }
};

const aiHelpService = {
  async getHelpResponse({ message, currentPage = '/admin', role = 'admin', history = [] }) {
    const pageContext = PAGE_CONTEXTS[currentPage] || {
      title: 'Brightloop Application',
      description: 'Brightloop Subscription Lifecycle Automation & Recurring Billing Management System.',
      availableActions: ['Navigate system', 'Ask questions about features'],
      suggestedNav: []
    };

    const systemPrompt = `You are Brightloop AI Copilot, an intelligent in-app assistant embedded in the Brightloop SaaS Subscription Management & Automated Billing system.
Your mission is to help users understand the current screen, learn how system features work, guide them through workflows, and help them navigate efficiently.

Current User Context:
- Active Role: ${role.toUpperCase()}
- Current Page Path: ${currentPage}
- Current Page Title: ${pageContext.title}
- Current Page Summary: ${pageContext.description}
- Key Actions on This Page: ${pageContext.availableActions.join(', ')}

All Application Routes:
Admin / Staff Routes:
- /admin : Executive Analytics (MRR, Total Revenue in ₹, charts, renewal countdown, recent payments)
- /admin/plans : Subscription Plans (Add/edit plans, discount percentage 0-100%, pricing in ₹, horizontal scroll)
- /admin/subscriptions : All Subscriptions list & cancellation
- /admin/invoices : Invoices ledger & printable PDF modal
- /admin/payments : Payment transactions & gateway response logs
- /admin/renewals : Renewal Tracker & manual renewal engine trigger
- /admin/customers : Customer directory & account activation toggles
- /admin/staff : Staff Team management (Admin can add new staff with work email/password or remove staff)

Customer Routes:
- /customer : Customer Dashboard (Current subscription card, payment due banner, lifetime spend in ₹)
- /customer/plans : Browse Plans (Pricing tiers with discounts, subscribe modal)
- /customer/subscriptions : My Subscriptions (Current active plan, renewal date, cancellation modal, past history)
- /customer/invoices : My Invoices (Itemized invoices in ₹, Pay Now button)
- /customer/payments : Payment History
- /customer/profile : Profile

Guidelines for Your Answers:
1. Be welcoming, clear, concise, and structured (use markdown bullets, bold headings, steps).
2. All currencies in Brightloop are in Indian Rupees (₹). Always use ₹ when mentioning prices or amounts.
3. When the user asks "Explain this page" or "What does this page do?", explain the current page features clearly and provide 2-3 actionable tips.
4. When guiding the user to navigate or when relevant to their question, ALWAYS include interactive navigation tags in this exact format:
   [NAV:/path:Label]
   For example:
   - "To add a discount or create new tiers, go to [NAV:/admin/plans:Subscription Plans]."
   - "To see pending invoices or print invoices, visit [NAV:/admin/invoices:Invoices Management]."
   - "To authorize team members, head over to [NAV:/admin/staff:Staff Team]."
   The frontend UI will automatically parse these into one-click navigation buttons!
5. If the user asks how to do something (e.g. add discount, pay invoice, cancel subscription, add staff), give step-by-step instructions.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6), // Include recent conversation turns for context
      { role: 'user', content: message }
    ];

    try {
      const responseText = await callOpenAI(messages);
      
      // Extract suggested navigation pills from [NAV:/path:Label] in response
      const navRegex = /\[NAV:([^:]+):([^\]]+)\]/g;
      const suggestedNav = [];
      let match;
      while ((match = navRegex.exec(responseText)) !== null) {
        suggestedNav.push({ path: match[1], label: match[2] });
      }

      // If no specific nav tags were in the response but pageContext has default navs, supply them
      const finalNav = suggestedNav.length > 0 ? suggestedNav : (pageContext.suggestedNav || []);

      return {
        success: true,
        reply: responseText,
        pageContext,
        suggestedNav: finalNav
      };
    } catch (err) {
      console.error('[OpenAI API Error]', err);
      // Fallback with rich localized knowledge if OpenAI encounters any network or rate limit issue
      const fallbackReply = generateFallbackHelp(message, currentPage, pageContext, role);
      return {
        success: true,
        reply: fallbackReply,
        pageContext,
        suggestedNav: pageContext.suggestedNav || []
      };
    }
  }
};

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 650
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content || 'I could not generate an answer right now.';
            resolve(content);
          } catch (e) {
            reject(new Error('Failed to parse OpenAI JSON response'));
          }
        } else {
          reject(new Error(`OpenAI API returned error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OpenAI API request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

function generateFallbackHelp(message, currentPage, pageContext, role) {
  return `### ${pageContext.title}

${pageContext.description}

**Available Key Actions on This Screen:**
${pageContext.availableActions.map(a => `- ${a}`).join('\n')}

**Quick Navigation Links:**
${(pageContext.suggestedNav || []).map(n => `- [NAV:${n.path}:${n.label}]`).join('\n')}

*Need help with a specific action like managing discounts, customer invoices, or team staff? Feel free to ask!*`;
}

module.exports = aiHelpService;
