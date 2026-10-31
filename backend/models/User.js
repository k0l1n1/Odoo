const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, company_name, phone, address, status, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, email, password, role = 'customer', company_name = null, phone = null, address = null }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, company_name, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, role, company_name, phone, address, 'active']
    );
    return result.insertId;
  },

  async updateProfile(id, { name, company_name, phone, address }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, company_name = ?, phone = ?, address = ? WHERE id = ?',
      [name, company_name, phone, address, id]
    );
    return result.affectedRows > 0;
  },

  async updateStatus(id, status) {
    const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async getAllCustomers() {
    const [rows] = await db.query('SELECT id, name, email, role, company_name, phone, address, status, created_at FROM users WHERE role = ? ORDER BY id DESC', ['customer']);
    return rows;
  },

  async countCustomers() {
    const [rows] = await db.query('SELECT id FROM users WHERE role = ?', ['customer']);
    return rows.length;
  }
};

module.exports = User;
