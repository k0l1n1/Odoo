const db = require('../config/db');

const Subscription = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             p.name as plan_name, p.price as plan_price, p.billing_cycle
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.id DESC
    `);
    return rows;
  },

  async getByUserId(userId) {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             p.name as plan_name, p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.id DESC
    `, [userId]);
    return rows.map(r => ({
      ...r,
      features: r.features ? (typeof r.features === 'string' ? JSON.parse(r.features) : r.features) : []
    }));
  },

  async getActiveByUserId(userId) {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as customer_name, u.email as customer_email,
             p.name as plan_name, p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ? AND s.status = 'active'
      ORDER BY s.id DESC
    `, [userId]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      features: rows[0].features ? (typeof rows[0].features === 'string' ? JSON.parse(rows[0].features) : rows[0].features) : []
    };
  },

  async getActiveOrPendingByUserId(userId) {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as customer_name, u.email as customer_email,
             p.name as plan_name, p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ? AND s.status IN ('active', 'pending')
      ORDER BY s.id DESC
    `, [userId]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      features: rows[0].features ? (typeof rows[0].features === 'string' ? JSON.parse(rows[0].features) : rows[0].features) : []
    };
  },

  async getById(id) {
    const [rows] = await db.query(`
      SELECT s.*, 
             u.name as customer_name, u.email as customer_email, u.company_name,
             p.name as plan_name, p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ?
    `, [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      features: rows[0].features ? (typeof rows[0].features === 'string' ? JSON.parse(rows[0].features) : rows[0].features) : []
    };
  },

  async create({ subscription_code, user_id, plan_id, status = 'pending', start_date, next_billing_date, expiry_date, auto_renew = 1 }) {
    const [result] = await db.query(
      'INSERT INTO subscriptions (subscription_code, user_id, plan_id, status, start_date, next_billing_date, expiry_date, auto_renew) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [subscription_code, user_id, plan_id, status, start_date, next_billing_date, expiry_date, auto_renew]
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    const [result] = await db.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async updateBillingDates(id, status, nextBillingDate, expiryDate) {
    const [result] = await db.query(
      'UPDATE subscriptions SET status = ?, next_billing_date = ?, expiry_date = ? WHERE id = ?',
      [status, nextBillingDate, expiryDate, id]
    );
    return result.affectedRows > 0;
  },

  async cancel(id, reason = 'Cancelled by user') {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await db.query(
      'UPDATE subscriptions SET status = ?, cancelled_at = ?, cancellation_reason = ? WHERE id = ?',
      ['cancelled', now, reason, id]
    );
    return result.affectedRows > 0;
  },

  async setAutoRenew(id, autoRenew) {
    const [result] = await db.query('UPDATE subscriptions SET auto_renew = ? WHERE id = ?', [autoRenew ? 1 : 0, id]);
    return result.affectedRows > 0;
  }
};

module.exports = Subscription;
