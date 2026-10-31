const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_hackathon_2026_x89!';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn }
  );
}

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, company_name, phone, address } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      const existingUser = await User.findByEmail(email.trim().toLowerCase());
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userId = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: 'customer',
        company_name: company_name ? company_name.trim() : null,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null
      });

      const user = await User.findById(userId);
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_name: user.company_name,
          phone: user.phone,
          address: user.address,
          status: user.status
        }
      });
    } catch (err) {
      console.error('[Register Error]', err);
      res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await User.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_name: user.company_name,
          phone: user.phone,
          address: user.address,
          status: user.status
        }
      });
    } catch (err) {
      console.error('[Login Error]', err);
      res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.status(200).json({ success: true, user });
    } catch (err) {
      console.error('[Get Profile Error]', err);
      res.status(500).json({ success: false, message: 'Error fetching profile.' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, company_name, phone, address } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }

      await User.updateProfile(req.user.id, {
        name: name.trim(),
        company_name: company_name ? company_name.trim() : null,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null
      });

      const updatedUser = await User.findById(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: updatedUser
      });
    } catch (err) {
      console.error('[Update Profile Error]', err);
      res.status(500).json({ success: false, message: 'Error updating profile.' });
    }
  }
};

module.exports = authController;
