import axios from 'axios';

/**
 * Downloads a genuine PDF file for the given invoice from the backend
 */
export async function downloadInvoicePdf(invoiceId, invoiceNumber = 'invoice') {
  try {
    const token = localStorage.getItem('brightloop_token');
    const response = await axios.get(`/api/invoices/${invoiceId}/download`, {
      responseType: 'blob',
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Failed to download invoice PDF:', error);
    throw new Error(error.response?.data?.message || 'Failed to download invoice PDF.');
  }
}

/**
 * Prints the invoice cleanly by generating an isolated A4 print document
 * in a temporary hidden iframe without modal artifacts or dark backgrounds.
 */
export function printInvoiceDocument(invoice) {
  if (!invoice) return;

  const isPaid = invoice.payment_status === 'paid';
  const isOverdue = invoice.payment_status === 'overdue';
  const statusColor = isPaid ? '#059669' : (isOverdue ? '#dc2626' : '#d97706');
  const statusBg = isPaid ? '#ecfdf5' : (isOverdue ? '#fef2f2' : '#fffbeb');
  const statusBorder = isPaid ? '#a7f3d0' : (isOverdue ? '#fecaca' : '#fde68a');

  const netAmount = parseFloat(invoice.amount || 0).toFixed(2);
  const taxAmount = parseFloat(invoice.tax_amount || 0).toFixed(2);
  const totalAmount = parseFloat(invoice.total_amount || 0).toFixed(2);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${invoice.invoice_number} - Brightloop</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .invoice-card {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 20px;
        }
        .brand-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: 900;
          color: #1e1b4b;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .invoice-num {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          color: #4f46e5;
          font-size: 13px;
          margin: 0;
        }
        .invoice-date {
          font-size: 11px;
          color: #64748b;
          margin: 3px 0 0 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${statusColor};
          background: ${statusBg};
          border: 1px solid ${statusBorder};
          margin-top: 6px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .details-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .details-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .details-name {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .details-text {
          font-size: 11px;
          color: #475569;
          margin: 2px 0;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th.text-right {
          text-align: right;
        }
        th.text-center {
          text-align: center;
        }
        td {
          padding: 14px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .item-title {
          font-weight: 700;
          color: #0f172a;
          font-size: 13px;
        }
        .item-desc {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .totals-box {
          width: 260px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .totals-row.final {
          border-top: 2px solid #e2e8f0;
          padding-top: 8px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        .totals-row.final span.amount {
          color: #4f46e5;
          font-size: 16px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div class="brand">
            <div class="brand-logo">B</div>
            <div>
              <h1 class="brand-name">Brightloop Software Inc.</h1>
              <p class="brand-sub">Subscription Lifecycle & Billing Automation</p>
              <p class="brand-sub">support@brightloop.com • +1 (555) 019-2834</p>
            </div>
          </div>
          <div class="invoice-meta">
            <h2 class="invoice-title">TAX INVOICE</h2>
            <p class="invoice-num">#${invoice.invoice_number}</p>
            <p class="invoice-date">Issued: ${invoice.invoice_date}</p>
            <p class="invoice-date">Due: ${invoice.due_date || invoice.invoice_date}</p>
            <div>
              <span class="status-badge">${invoice.payment_status}</span>
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-box">
            <div class="details-label">Billed To</div>
            <div class="details-name">${invoice.customer_name || 'Customer'}</div>
            ${invoice.company_name ? `<div class="details-text"><strong>${invoice.company_name}</strong></div>` : ''}
            <div class="details-text">${invoice.customer_email || ''}</div>
            ${invoice.customer_address ? `<div class="details-text">${invoice.customer_address}</div>` : ''}
          </div>

          <div class="details-box" style="text-align: right;">
            <div class="details-label">Subscription Details</div>
            <div class="details-text">Subscription Code: <strong>${invoice.subscription_code || 'N/A'}</strong></div>
            <div class="details-text">Plan: <strong>${invoice.plan_name || 'Standard'}</strong></div>
            <div class="details-text">Billing: <strong>Recurring Monthly/Annual</strong></div>
            ${invoice.paid_at ? `<div class="details-text" style="color: #059669; font-weight: 700; margin-top: 4px;">✓ Paid on ${invoice.paid_at.slice(0, 10)}</div>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center" style="width: 120px;">Billing Cycle</th>
              <th class="text-right" style="width: 120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-title">${invoice.plan_name} Plan Subscription</div>
                <div class="item-desc">Access to full premium features, cloud automation, and renewal management</div>
              </td>
              <td class="text-center" style="color: #475569; font-size: 11px;">
                Recurring
              </td>
              <td class="text-right" style="font-weight: 700;">
                ₹${netAmount}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #0f172a;">₹${netAmount}</span>
            </div>
            <div class="totals-row">
              <span>Tax (10% GST):</span>
              <span style="font-weight: 600; color: #0f172a;">₹${taxAmount}</span>
            </div>
            <div class="totals-row final">
              <span>Total Due:</span>
              <span class="amount">₹${totalAmount}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This invoice is electronically generated and legally valid. For billing questions, contact support@brightloop.com.</p>
          <p>© ${new Date().getFullYear()} Brightloop Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create isolated hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 350);
}
