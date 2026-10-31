const db = require('../config/db');

const RenewalHistory = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT rh.*,
             s.subscription_code,
             u.name as customer_name, u.email as customer_email,
             inv.invoice_number, inv.payment_status as invoice_status
      FROM renewal_history rh
      JOIN subscriptions s ON rh.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN invoices inv ON rh.invoice_id = inv.id
      ORDER BY rh.id DESC
    `);
    return rows;
  },

  async getBySubscriptionId(subId) {
    const [rows] = await db.query(`
      SELECT rh.*,
             s.subscription_code,
             inv.invoice_number, inv.payment_status as invoice_status
      FROM renewal_history rh
      JOIN subscriptions s ON rh.subscription_id = s.id
      LEFT JOIN invoices inv ON rh.invoice_id = inv.id
      WHERE rh.subscription_id = ?
      ORDER BY rh.id DESC
    `, [subId]);
    return rows;
  },

  async create({ subscription_id, invoice_id = null, previous_billing_date, new_billing_date, renewal_date, renewal_status = 'processed', notes = null }) {
    const [result] = await db.query(
      'INSERT INTO renewal_history (subscription_id, invoice_id, previous_billing_date, new_billing_date, renewal_date, renewal_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [subscription_id, invoice_id, previous_billing_date, new_billing_date, renewal_date, renewal_status, notes]
    );
    return result.insertId;
  }
};

module.exports = RenewalHistory;
