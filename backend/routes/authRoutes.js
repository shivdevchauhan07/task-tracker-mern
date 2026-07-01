const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d'
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'A valid email is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'A valid email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'A valid email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Delete old OTPs
    await OTP.deleteMany({ email: email.toLowerCase().trim() });

    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase().trim(), otp });
    await sendOTPEmail(user.email, otp, user.name);

    res.json({ message: 'OTP sent to your email successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Try again.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const record = await OTP.findOne({
      email: email.toLowerCase().trim(),
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    record.used = true;
    await record.save();

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const record = await OTP.findOne({
      email: email.toLowerCase().trim(),
      otp,
      used: true
    });

    if (!record) return res.status(400).json({ message: 'OTP not verified' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email: email.toLowerCase().trim() });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile stats
router.get('/profile/stats', protect, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const formatted = { todo: 0, 'in-progress': 0, completed: 0, total: 0 };
    stats.forEach(s => {
      formatted[s._id] = s.count;
      formatted.total += s.count;
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;