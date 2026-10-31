const db = require('../config/db');

function parsePlan(r) {
  if (!r) return null;
  let description = r.description || '';
  let discountPercentage = 0;

  if (r.discount_percentage !== undefined && r.discount_percentage !== null) {
    discountPercentage = parseFloat(r.discount_percentage) || 0;
  } else if (description) {
    const match = description.match(/^\[DISCOUNT:(\d+(?:\.\d+)?)\]\s*(.*)$/s);
    if (match) {
      discountPercentage = parseFloat(match[1]);
      description = match[2];
    }
  }

  const price = parseFloat(r.price) || 0;
  const discountedPrice = discountPercentage > 0
    ? Math.round(price * (1 - discountPercentage / 100) * 100) / 100
    : price;

  return {
    ...r,
    description,
    price,
    discount_percentage: discountPercentage,
    discounted_price: discountedPrice,
    features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || [])
  };
}

const Plan = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM subscription_plans ORDER BY price ASC');
    return rows.map(parsePlan);
  },

  async getActive() {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE status = ? ORDER BY price ASC', ['active']);
    return rows.map(parsePlan);
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
    if (!rows[0]) return null;
    return parsePlan(rows[0]);
  },

  async create({ name, description, price, discount_percentage = 0, billing_cycle = 'monthly', features = [], status = 'active' }) {
    const discount = parseFloat(discount_percentage) || 0;
    const finalDescription = discount > 0 ? `[DISCOUNT:${discount}] ${description || ''}`.trim() : (description || '');
    const featuresJson = JSON.stringify(features);
    const [result] = await db.query(
      'INSERT INTO subscription_plans (name, description, price, billing_cycle, features, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, finalDescription, price, billing_cycle, featuresJson, status]
    );
    return result.insertId;
  },

  async update(id, { name, description, price, discount_percentage = 0, billing_cycle, features, status }) {
    const discount = parseFloat(discount_percentage) || 0;
    const finalDescription = discount > 0 ? `[DISCOUNT:${discount}] ${description || ''}`.trim() : (description || '');
    const featuresJson = JSON.stringify(features);
    const [result] = await db.query(
      'UPDATE subscription_plans SET name = ?, description = ?, price = ?, billing_cycle = ?, features = ?, status = ? WHERE id = ?',
      [name, finalDescription, price, billing_cycle, featuresJson, status, id]
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
