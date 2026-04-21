const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [userRows] = await db.query(
      'SELECT id, username, faction, adminLvl, userLevel FROM vrp_users WHERE id = ?',
      [req.user.id]
    );

    const [dataRows] = await db.query(
      'SELECT money, bank FROM vrp_user_data WHERE user_id = ?',
      [req.user.id]
    );

    const user = userRows[0];
    const userData = dataRows[0] || { money: 0, bank: 0 };

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        faction: user.faction,
        level: user.userLevel,
        admin: user.adminLvl,
        money: userData.money,
        bank: userData.bank
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user purchases
router.get('/purchases', requireAuth, async (req, res) => {
  try {
    const [purchases] = await db.query(
      'SELECT * FROM purchases WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json({ success: true, purchases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user vehicles
router.get('/vehicles', requireAuth, async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT * FROM user_vehicles WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user preference
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const { preferences } = req.body;
    // Store user preferences if needed
    res.json({ success: true, message: 'Preferences updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
