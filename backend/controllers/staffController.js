const db = require('../config/db');
const bcrypt = require('bcryptjs');

const staffController = {
  async getAllStaff(req, res) {
    try {
      const [rows] = await db.query('SELECT id, name, email, role, company_name, phone, address, status, created_at FROM users WHERE role = ?', ['staff']);
      res.status(200).json({ success: true, count: rows.length, staff: rows });
    } catch (err) {
      console.error('[Get All Staff Error]', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve staff team members.' });
    }
  },

  async createStaff(req, res) {
    try {
      const { name, email, password, phone, department } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      // Check if email already exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'A user account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const companyName = department ? department.trim() : 'Operations & Support';

      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, company_name, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name.trim(), email.trim().toLowerCase(), hashedPassword, 'staff', companyName, phone || null, 'Brightloop HQ', 'active']
      );

      const [newUser] = await db.query('SELECT id, name, email, role, company_name, phone, address, status, created_at FROM users WHERE id = ?', [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Staff member added successfully!',
        staff: newUser[0] || { id: result.insertId, name, email, role: 'staff', company_name: companyName, phone, status: 'active' }
      });
    } catch (err) {
      console.error('[Create Staff Error]', err);
      res.status(500).json({ success: false, message: 'Failed to add staff member: ' + (err.message || 'Server error') });
    }
  },

  async removeStaff(req, res) {
    try {
      const { id } = req.params;
      const staffId = Number(id);

      const [users] = await db.query('SELECT id, name, role FROM users WHERE id = ?', [staffId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'Staff member not found.' });
      }

      const user = users[0];
      if (user.role !== 'staff') {
        return res.status(400).json({ success: false, message: 'Cannot remove this account because it is not a staff account.' });
      }

      if (req.user && req.user.id === staffId) {
        return res.status(400).json({ success: false, message: 'You cannot remove your own active administrator session.' });
      }

      await db.query('DELETE FROM users WHERE id = ?', [staffId]);

      res.status(200).json({ success: true, message: `Staff member ${user.name} removed successfully.` });
    } catch (err) {
      console.error('[Remove Staff Error]', err);
      res.status(500).json({ success: false, message: 'Failed to remove staff member: ' + (err.message || 'Server error') });
    }
  }
};

module.exports = staffController;
