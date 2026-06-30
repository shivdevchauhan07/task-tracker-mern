const express = require('express');
const router = express.Router();
const User = require('../models/User');

const checkAdminKey = (req, res, next) => {
  const key = req.query.key || req.headers['x-admin-key'];
  if (key !== (process.env.ADMIN_KEY || 'changeme123')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.get('/stats', checkAdminKey, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find().select('name email createdAt').sort({ createdAt: -1 });
    res.json({ totalUsers, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;