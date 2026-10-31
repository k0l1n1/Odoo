const db = require('../config/db');

const Invoice = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT inv.*, 
             u.name as customer_name, u.email as customer_email, u.company_name, u.phone as customer_phone, u.address as customer_address,
             s.subscription_code
      FROM invoices inv
      JOIN users u ON inv.user_id = u.id
      JOIN subscriptions s ON inv.subscription_id = s.id
      ORDER BY inv.id DESC
    `);
    return rows;
  },

  async getByUserId(userId) {
    const [rows] = await db.query(`
      SELECT inv.*, 
             u.name as customer_name, u.email as customer_email, u.company_name, u.phone as customer_phone, u.address as customer_address,
             s.subscription_code
      FROM invoices inv
      JOIN users u ON inv.user_id = u.id
      JOIN subscriptions s ON inv.subscription_id = s.id
      WHERE inv.user_id = ?
      ORDER BY inv.id DESC
    `, [userId]);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT inv.*, 
             u.name as customer_name, u.email as customer_email, u.company_name, u.phone as customer_phone, u.address as customer_address,
             s.subscription_code
      FROM invoices inv
      JOIN users u ON inv.user_id = u.id
      JOIN subscriptions s ON inv.subscription_id = s.id
      WHERE inv.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async create({ invoice_number, subscription_id, user_id, plan_name, amount, tax_amount = 0, total_amount, invoice_date, due_date, payment_status = 'pending', invoice_type = 'subscription_new' }) {
    const [result] = await db.query(
      'INSERT INTO invoices (invoice_number, subscription_id, user_id, plan_name, amount, tax_amount, total_amount, invoice_date, due_date, payment_status, invoice_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [invoice_number, subscription_id, user_id, plan_name, amount, tax_amount, total_amount, invoice_date, due_date, payment_status, invoice_type]
    );
    return result.insertId;
  },

  async updatePaymentStatus(id, status, paidAt = null) {
    const now = paidAt || (status === 'paid' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null);
    const [result] = await db.query(
      'UPDATE invoices SET payment_status = ?, paid_at = ? WHERE id = ?',
      [status, now, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Invoice;
