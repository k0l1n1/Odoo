function generateSubCode() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SUB-2026-${rand}`;
}

function generateInvoiceNumber() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-2026-${rand}`;
}

function generatePaymentCode() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PAY-2026-${rand}`;
}

function generateTxnRef() {
  const rand = Math.floor(100000000 + Math.random() * 900000000);
  return `TXN-SIM-${rand}`;
}

function formatDate(d) {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateBillingDates(startDateInput, billingCycle = 'monthly') {
  const start = new Date(startDateInput || new Date());
  const next = new Date(start);

  const cycle = (billingCycle || 'monthly').toLowerCase();
  if (cycle === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  } else if (cycle === 'quarterly') {
    next.setMonth(next.getMonth() + 3);
  } else {
    // monthly
    next.setMonth(next.getMonth() + 1);
  }

  const startDate = formatDate(start);
  const nextBillingDate = formatDate(next);
  const expiryDate = nextBillingDate;

  return { startDate, nextBillingDate, expiryDate };
}

function calculateInvoiceDueDate(invoiceDateInput, days = 7) {
  const inv = new Date(invoiceDateInput || new Date());
  inv.setDate(inv.getDate() + days);
  return formatDate(inv);
}

module.exports = {
  generateSubCode,
  generateInvoiceNumber,
  generatePaymentCode,
  generateTxnRef,
  formatDate,
  calculateBillingDates,
  calculateInvoiceDueDate
};
