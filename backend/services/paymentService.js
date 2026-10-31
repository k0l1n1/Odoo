const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const RenewalHistory = require('../models/RenewalHistory');
const { generatePaymentCode, generateTxnRef, calculateBillingDates, formatDate } = require('../utils/helpers');

const paymentService = {
  async processSimulatedPayment({ userId, invoiceId, paymentMethod = 'Credit Card', simulationOutcome = 'successful', details = {} }) {
    // 1. Validate invoice
    const invoice = await Invoice.getById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found.');
    }

    if (invoice.user_id !== userId) {
      throw new Error('Unauthorized to pay this invoice.');
    }

    if (invoice.payment_status === 'paid') {
      throw new Error('This invoice has already been fully paid.');
    }

    const paymentCode = generatePaymentCode();
    const txnRef = generateTxnRef();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let gatewayResponse = {
      simulation: true,
      outcome: simulationOutcome,
      timestamp: now,
      paymentMethod,
      details: {
        cardLast4: details.cardNumber ? details.cardNumber.slice(-4) : '4242',
        upiId: details.upiId || 'demo@upi',
        bankName: details.bankName || 'Chase Simulated Commercial'
      }
    };

    // 2. Handle outcome states
    if (simulationOutcome === 'successful') {
      gatewayResponse.authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create successful payment
      const paymentId = await Payment.create({
        payment_code: paymentCode,
        user_id: userId,
        invoice_id: invoiceId,
        amount: invoice.total_amount,
        payment_date: now,
        payment_method: paymentMethod,
        transaction_reference: txnRef,
        payment_status: 'successful',
        gateway_response: gatewayResponse
      });

      // Update invoice to paid
      await Invoice.updatePaymentStatus(invoiceId, 'paid', now);

      // Handle subscription activation / renewal
      const sub = await Subscription.getById(invoice.subscription_id);
      if (sub) {
        if (sub.status === 'pending' || invoice.invoice_type === 'subscription_new') {
          // New subscription activation
          await Subscription.updateStatus(sub.id, 'active');
        } else if (invoice.invoice_type === 'subscription_renewal') {
          // Subscription renewal processing
          const { nextBillingDate, expiryDate } = calculateBillingDates(sub.next_billing_date, sub.billing_cycle);
          await Subscription.updateBillingDates(sub.id, 'active', nextBillingDate, expiryDate);

          // Record in renewal history
          await RenewalHistory.create({
            subscription_id: sub.id,
            invoice_id: invoice.id,
            previous_billing_date: sub.next_billing_date,
            new_billing_date: nextBillingDate,
            renewal_date: now,
            renewal_status: 'processed',
            notes: `Successfully renewed via ${paymentMethod} (${txnRef}). Next billing date set to ${nextBillingDate}.`
          });
        }
      }

      const createdPayment = await Payment.getById(paymentId);
      const updatedInvoice = await Invoice.getById(invoiceId);
      const updatedSubscription = sub ? await Subscription.getById(sub.id) : null;

      return {
        success: true,
        payment: createdPayment,
        invoice: updatedInvoice,
        subscription: updatedSubscription,
        message: 'Payment processed successfully! Your subscription is active.'
      };

    } else if (simulationOutcome === 'failed') {
      gatewayResponse.failureReason = details.failureReason || 'Simulated Card Declined / Insufficient Funds';

      const paymentId = await Payment.create({
        payment_code: paymentCode,
        user_id: userId,
        invoice_id: invoiceId,
        amount: invoice.total_amount,
        payment_date: now,
        payment_method: paymentMethod,
        transaction_reference: txnRef,
        payment_status: 'failed',
        gateway_response: gatewayResponse
      });

      await Invoice.updatePaymentStatus(invoiceId, 'failed');

      const createdPayment = await Payment.getById(paymentId);
      const updatedInvoice = await Invoice.getById(invoiceId);

      return {
        success: false,
        payment: createdPayment,
        invoice: updatedInvoice,
        message: `Payment failed: ${gatewayResponse.failureReason}. Please try another payment method.`
      };

    } else {
      // Pending outcome
      gatewayResponse.pendingNotice = 'Payment initiated; awaiting settlement confirmation.';

      const paymentId = await Payment.create({
        payment_code: paymentCode,
        user_id: userId,
        invoice_id: invoiceId,
        amount: invoice.total_amount,
        payment_date: now,
        payment_method: paymentMethod,
        transaction_reference: txnRef,
        payment_status: 'pending',
        gateway_response: gatewayResponse
      });

      const createdPayment = await Payment.getById(paymentId);
      return {
        success: true,
        payment: createdPayment,
        invoice,
        message: 'Payment is pending verification. Status will update once settled.'
      };
    }
  }
};

module.exports = paymentService;
