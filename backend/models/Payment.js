const db = require('../config/db');

const Payment = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT p.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             inv.invoice_number, inv.plan_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN invoices inv ON p.invoice_id = inv.id
      ORDER BY p.id DESC
    `);
    return rows;
  },

  async getByUserId(userId) {
    const [rows] = await db.query(`
      SELECT p.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             inv.invoice_number, inv.plan_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN invoices inv ON p.invoice_id = inv.id
      WHERE p.user_id = ?
      ORDER BY p.id DESC
    `, [userId]);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT p.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             inv.invoice_number, inv.plan_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN invoices inv ON p.invoice_id = inv.id
      WHERE p.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async create({ payment_code, user_id, invoice_id, amount, payment_date, payment_method, transaction_reference, payment_status = 'pending', gateway_response = {} }) {
    const respJson = typeof gateway_response === 'string' ? gateway_response : JSON.stringify(gateway_response);
    const [result] = await db.query(
      'INSERT INTO payments (payment_code, user_id, invoice_id, amount, payment_date, payment_method, transaction_reference, payment_status, gateway_response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [payment_code, user_id, invoice_id, amount, payment_date, payment_method, transaction_reference, payment_status, respJson]
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    const [result] = await db.query('UPDATE payments SET payment_status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }
};

module.exports = Payment;
