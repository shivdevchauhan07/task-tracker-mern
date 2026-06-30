const express = require('express');
const router = express.Router();
const User = require('../models/User');

// View total registered users (simple, no auth - for your own checking)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find().select('name email createdAt').sort({ createdAt: -1 });
    res.json({ totalUsers, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;