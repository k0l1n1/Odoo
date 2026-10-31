const PDFDocument = require('pdfkit');

const pdfService = {
  generateInvoicePdf(invoice, res, isDownload = true) {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      info: {
        Title: `Invoice ${invoice.invoice_number}`,
        Author: 'Brightloop SaaS Billing System',
        Subject: `Invoice for ${invoice.customer_name}`,
        Keywords: 'invoice, subscription, brightloop, billing'
      }
    });

    const filename = `Invoice-${invoice.invoice_number}.pdf`;
    const disposition = isDownload ? 'attachment' : 'inline';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

    doc.pipe(res);

    // Color Palette
    const primaryBrand = '#4f46e5'; // Indigo/Brand
    const primaryDark = '#1e1b4b';
    const textDark = '#0f172a';
    const textMuted = '#64748b';
    const borderSubtle = '#e2e8f0';
    const bgLight = '#f8fafc';
    const statusPaid = '#059669'; // Emerald
    const statusPending = '#d97706'; // Amber
    const statusOverdue = '#dc2626'; // Red

    const statusColor = invoice.payment_status === 'paid'
      ? statusPaid
      : (invoice.payment_status === 'overdue' ? statusOverdue : statusPending);

    // --- 1. Top Decorative Brand Banner ---
    doc.rect(40, 40, 515, 72).fill('#f1f5f9');

    // Brand Title & Info
    doc.fillColor(primaryBrand).fontSize(20).font('Helvetica-Bold').text('BRIGHTLOOP SAAS', 56, 52);
    doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text('Subscription Lifecycle & Automated Billing Automation', 56, 76);
    doc.text('Support: support@brightloop.com • Web: https://brightloop.io', 56, 88);

    // Invoice Number & Date (Right Header)
    doc.fillColor(primaryDark).fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 380, 52, { align: 'right', width: 160 });
    doc.fillColor(textDark).fontSize(9.5).font('Helvetica-Bold').text(`#${invoice.invoice_number}`, 380, 72, { align: 'right', width: 160 });
    doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(`Issued: ${invoice.invoice_date}`, 380, 86, { align: 'right', width: 160 });

    // --- 2. Information Cards ---
    const cardY = 126;
    const cardHeight = 88;

    // Billed To Card (Left)
    doc.rect(40, cardY, 250, cardHeight).fillAndStroke(bgLight, borderSubtle);
    doc.fillColor(primaryBrand).fontSize(8).font('Helvetica-Bold').text('BILLED TO', 54, cardY + 10);
    doc.fillColor(textDark).fontSize(10.5).font('Helvetica-Bold').text(invoice.customer_name || 'Valued Customer', 54, cardY + 23);
    
    let currentTextY = cardY + 38;
    if (invoice.company_name) {
      doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(invoice.company_name, 54, currentTextY);
      currentTextY += 13;
    }
    doc.fillColor(textMuted).fontSize(8.5).font('Helvetica').text(invoice.customer_email || '', 54, currentTextY);
    currentTextY += 13;
    if (invoice.customer_address) {
      doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(invoice.customer_address, 54, currentTextY, { width: 230, lineBreak: false });
    }

    // Subscription & Billing Status Card (Right)
    doc.rect(305, cardY, 250, cardHeight).fillAndStroke(bgLight, borderSubtle);
    doc.fillColor(primaryBrand).fontSize(8).font('Helvetica-Bold').text('INVOICE & SUBSCRIPTION DETAILS', 319, cardY + 10);
    doc.fillColor(textDark).fontSize(9).font('Helvetica').text('Subscription Code:', 319, cardY + 24);
    doc.font('Helvetica-Bold').text(invoice.subscription_code || 'N/A', 415, cardY + 24);

    doc.font('Helvetica').text('Payment Due Date:', 319, cardY + 38);
    doc.font('Helvetica-Bold').text(invoice.due_date || invoice.invoice_date, 415, cardY + 38);

    doc.font('Helvetica').text('Billing Type:', 319, cardY + 52);
    doc.font('Helvetica').text(invoice.invoice_type ? invoice.invoice_type.replace('_', ' ').toUpperCase() : 'SUBSCRIPTION', 415, cardY + 52);

    // Status Pill
    const statusText = (invoice.payment_status || 'PENDING').toUpperCase();
    doc.rect(319, cardY + 66, 75, 14).fill(statusColor);
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(statusText, 319, cardY + 69.5, { width: 75, align: 'center' });

    if (invoice.paid_at && invoice.payment_status === 'paid') {
      doc.fillColor(statusPaid).fontSize(8).font('Helvetica').text(`Paid on: ${invoice.paid_at.slice(0, 10)}`, 402, cardY + 68);
    }

    // --- 3. Itemized Table ---
    const tableHeaderY = 230;
    doc.rect(40, tableHeaderY, 515, 24).fill(primaryBrand);
    doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
    doc.text('ITEM DESCRIPTION', 54, tableHeaderY + 7);
    doc.text('BILLING CYCLE', 310, tableHeaderY + 7, { width: 90, align: 'center' });
    doc.text('AMOUNT (INR)', 430, tableHeaderY + 7, { width: 110, align: 'right' });

    // Table Content Row
    const rowY = tableHeaderY + 24;
    const rowHeight = 44;
    doc.rect(40, rowY, 515, rowHeight).fillAndStroke('#ffffff', borderSubtle);

    doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold').text(`${invoice.plan_name || 'Standard'} Plan Subscription`, 54, rowY + 9);
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('Access to all tier features, cloud infrastructure, and recurring billing', 54, rowY + 24);

    doc.fillColor(textDark).fontSize(9).font('Helvetica').text('Recurring', 310, rowY + 16, { width: 90, align: 'center' });

    const netAmount = parseFloat(invoice.amount || 0).toFixed(2);
    doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold').text(`Rs. ${netAmount}`, 430, rowY + 16, { width: 110, align: 'right' });

    // --- 4. Summary & Totals Box ---
    const totalsY = rowY + rowHeight + 16;
    const totalsWidth = 230;
    const totalsX = 555 - totalsWidth;

    doc.rect(totalsX, totalsY, totalsWidth, 86).fillAndStroke(bgLight, borderSubtle);

    // Subtotal
    doc.fillColor(textMuted).fontSize(9).font('Helvetica').text('Subtotal:', totalsX + 16, totalsY + 12);
    doc.fillColor(textDark).font('Helvetica-Bold').text(`Rs. ${netAmount}`, totalsX + 110, totalsY + 12, { width: 104, align: 'right' });

    // Tax (GST)
    const taxAmount = parseFloat(invoice.tax_amount || 0).toFixed(2);
    doc.fillColor(textMuted).font('Helvetica').text('Tax (10% GST):', totalsX + 16, totalsY + 29);
    doc.fillColor(textDark).font('Helvetica-Bold').text(`Rs. ${taxAmount}`, totalsX + 110, totalsY + 29, { width: 104, align: 'right' });

    // Divider Line
    doc.rect(totalsX + 16, totalsY + 47, totalsWidth - 32, 1).fill(borderSubtle);

    // Total Due
    const totalAmount = parseFloat(invoice.total_amount || 0).toFixed(2);
    doc.fillColor(primaryBrand).fontSize(11).font('Helvetica-Bold').text('Total Due:', totalsX + 16, totalsY + 58);
    doc.text(`Rs. ${totalAmount}`, totalsX + 100, totalsY + 58, { width: 114, align: 'right' });

    // --- 5. Legal & Footer Terms ---
    const footerY = 690;
    doc.rect(40, footerY, 515, 1).fill(borderSubtle);

    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text('Terms & Payment Information', 40, footerY + 12, { align: 'center', width: 515 });
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(
      'This invoice is computer-generated and legally valid under the Information Technology Act. All amounts are in Indian Rupees (INR / Rs.). For invoice reconciliations, please write to billing@brightloop.com.',
      40, footerY + 26, { align: 'center', width: 515 }
    );
    doc.text('Brightloop SaaS Billing Platform • Thank you for your partnership!', 40, footerY + 44, { align: 'center', width: 515 });

    doc.end();
  }
};

module.exports = pdfService;
