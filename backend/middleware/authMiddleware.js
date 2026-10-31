const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_hackathon_2026_x89!';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }

    const [users] = await db.query('SELECT id, name, email, role, company_name, phone, address, status FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    res.status(500).json({ success: false, message: 'Internal server authorization error.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

function requireStaffOrAdmin(req, res, next) {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Staff or Administrator privileges required.' });
  }
  next();
}

function requireStaff(req, res, next) {
  if (!req.user || req.user.role !== 'staff') {
    return res.status(403).json({ success: false, message: 'Access denied. Staff privileges required.' });
  }
  next();
}

function requireCustomer(req, res, next) {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ success: false, message: 'Access denied. Customer privileges required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireStaffOrAdmin,
  requireStaff,
  requireCustomer
};
