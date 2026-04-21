const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all shop categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 1, name: 'Cars', icon: 'car', description: 'Premium vehicles' },
      { id: 2, name: 'Items', icon: 'box', description: 'In-game items' },
      { id: 3, name: 'Factions', icon: 'shield', description: 'Join factions' },
      { id: 4, name: 'Upgrades', icon: 'star', description: 'Character upgrades' }
    ];
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get shop items (CARS)
router.get('/items/:category', async (req, res) => {
  try {
    const { category } = req.params;

    if (category === 'cars') {
      // Get top tier vehicles from garages.lua
      const cars = [
        { id: 1, name: 'Terzo', price: 29, lei: 29, image: 'terzo.jpg', vtype: 'car', vehicle: 'terzo' },
        { id: 2, name: 'RModJesko', price: 25, lei: 25, image: 'rmodjesko.jpg', vtype: 'car', vehicle: 'rmodjesko' },
        { id: 3, name: 'Gemera', price: 22, lei: 22, image: 'gemera.jpg', vtype: 'car', vehicle: 'gemera' },
        { id: 4, name: 'GT63 AMG', price: 20, lei: 20, image: 'gt63mt.jpg', vtype: 'car', vehicle: 'gt63mt' },
        { id: 5, name: 'AMG One', price: 18, lei: 18, image: 'amgone.jpg', vtype: 'car', vehicle: 'amgone' },
        { id: 6, name: 'Centuria', price: 15, lei: 15, image: 'centuria.jpg', vtype: 'car', vehicle: 'centuria' },
        { id: 7, name: 'Ferrari 488', price: 12, lei: 12, image: 'f488.jpg', vtype: 'car', vehicle: 'f488' },
        { id: 8, name: 'Lamborghini Aventador', price: 10, lei: 10, image: 'aventador.jpg', vtype: 'car', vehicle: 'aventador' }
      ];
      return res.json({ success: true, items: cars, currency: 'Lei' });
    }

    if (category === 'items') {
      const items = [
        { id: 101, name: 'Weapon Ammo Pack', price: 5, lei: 5, image: 'ammo.jpg', description: 'Full ammo supply' },
        { id: 102, name: 'Healing Kit', price: 3, lei: 3, image: 'medkit.jpg', description: 'Full health restoration' },
        { id: 103, name: 'Phone Upgrade', price: 8, lei: 8, image: 'phone.jpg', description: 'Advanced phone features' },
        { id: 104, name: 'Job Tools', price: 6, lei: 6, image: 'tools.jpg', description: 'Professional tools' }
      ];
      return res.json({ success: true, items, currency: 'Lei' });
    }

    if (category === 'factions') {
      const factions = [
        { id: 201, name: 'Police', price: 15, lei: 15, image: 'police.jpg', description: 'Join as Police Officer' },
        { id: 202, name: 'Firefighter', price: 12, lei: 12, image: 'fire.jpg', description: 'Join as Firefighter' },
        { id: 203, name: 'Medic', price: 10, lei: 10, image: 'medic.jpg', description: 'Join as Medic' },
        { id: 204, name: 'Mechanic', price: 8, lei: 8, image: 'mechanic.jpg', description: 'Join as Mechanic' }
      ];
      return res.json({ success: true, items: factions, currency: 'Lei' });
    }

    res.json({ success: true, items: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single item details
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Return item with full details
    res.json({
      success: true,
      item: {
        id,
        name: 'Item Name',
        price: 10,
        lei: 10,
        description: 'Item description',
        image: 'item.jpg'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
