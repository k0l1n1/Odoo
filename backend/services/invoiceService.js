const Invoice = require('../models/Invoice');
const { generateInvoiceNumber, calculateInvoiceDueDate, formatDate } = require('../utils/helpers');

const invoiceService = {
  async createInvoiceForSubscription({ subscriptionId, userId, planName, amount, invoiceType = 'subscription_new', daysDue = 7 }) {
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = formatDate(new Date());
    const dueDate = calculateInvoiceDueDate(invoiceDate, daysDue);

    const numericAmount = parseFloat(amount);
    const taxAmount = parseFloat((numericAmount * 0.10).toFixed(2)); // 10% standard tax
    const totalAmount = parseFloat((numericAmount + taxAmount).toFixed(2));

    const invoiceId = await Invoice.create({
      invoice_number: invoiceNumber,
      subscription_id: subscriptionId,
      user_id: userId,
      plan_name: planName,
      amount: numericAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      invoice_date: invoiceDate,
      due_date: dueDate,
      payment_status: 'pending',
      invoice_type: invoiceType
    });

    return await Invoice.getById(invoiceId);
  },

  async markAsPaid(invoiceId) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await Invoice.updatePaymentStatus(invoiceId, 'paid', now);
    return await Invoice.getById(invoiceId);
  }
};

module.exports = invoiceService;
