const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get server info
router.get('/', async (req, res) => {
  try {
    // Get player count
    const [playerRows] = await db.query('SELECT COUNT(*) as count FROM vrp_users');
    const playerCount = playerRows[0]?.count || 0;

    // Get server version/info
    const serverInfo = {
      name: 'RedLife Romania',
      description: 'A premier FiveM roleplay server with immersive gameplay, custom features, and an active community. Join us for thrilling adventures, challenging jobs, and unlimited possibilities!',
      players: playerCount,
      maxPlayers: 128,
      version: '1.0.0',
      language: 'Romanian',
      uptime: process.uptime(),
      features: [
        'Full RP Experience',
        'Realistic Job System',
        'Vehicle Customization',
        'Property Ownership',
        'Banking System',
        'Gang Warfare',
        'PvP Arena',
        'Casino',
        'Nightclub',
        'Garages',
        'Premium Vehicles',
        'Custom Jobs'
      ],
      regions: ['Romania', 'Eastern Europe'],
      ping: '15-40ms',
      joinUrl: 'steam://connect/your-server-ip:30120'
    };

    res.json({ success: true, server: serverInfo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get server statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM vrp_users) as totalPlayers,
        (SELECT COUNT(*) FROM user_vehicles) as totalVehicles,
        (SELECT SUM(money) FROM vrp_user_data) as totalMoney,
        (SELECT SUM(bank) FROM vrp_user_data) as totalBank
    `);

    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
