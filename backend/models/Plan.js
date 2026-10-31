const db = require('../config/db');

const Plan = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM subscription_plans ORDER BY price ASC');
    return rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features
    }));
  },

  async getActive() {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE status = ? ORDER BY price ASC', ['active']);
    return rows.map(r => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features
    }));
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      features: typeof rows[0].features === 'string' ? JSON.parse(rows[0].features) : rows[0].features
    };
  },

  async create({ name, description, price, billing_cycle = 'monthly', features = [], status = 'active' }) {
    const featuresJson = JSON.stringify(features);
    const [result] = await db.query(
      'INSERT INTO subscription_plans (name, description, price, billing_cycle, features, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, billing_cycle, featuresJson, status]
    );
    return result.insertId;
  },

  async update(id, { name, description, price, billing_cycle, features, status }) {
    const featuresJson = JSON.stringify(features);
    const [result] = await db.query(
      'UPDATE subscription_plans SET name = ?, description = ?, price = ?, billing_cycle = ?, features = ?, status = ? WHERE id = ?',
      [name, description, price, billing_cycle, featuresJson, status, id]
    );
    return result.affectedRows > 0;
  },

  async toggleStatus(id, status) {
    const [result] = await db.query('UPDATE subscription_plans SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Plan;
