const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_key');
const db = require('../config/database');
const axios = require('axios');

const router = express.Router();

// Create payment intent (Stripe/Paysafe)
router.post('/create-payment', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { items, total, paymentMethod } = req.body;

    if (paymentMethod === 'stripe' || paymentMethod === 'paysafe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'ron',
        metadata: {
          userId: req.user.id,
          items: JSON.stringify(items),
          paymentMethod
        }
      });

      return res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    }

    if (paymentMethod === 'paypal') {
      // PayPal implementation
      res.json({
        success: true,
        orderId: Math.random().toString(36).substr(2, 9),
        message: 'Redirect to PayPal'
      });
    }

    res.status(400).json({ success: false, message: 'Invalid payment method' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Confirm payment and deliver items
router.post('/confirm-payment', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { paymentIntentId, items } = req.body;

    // Get payment details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not confirmed' });
    }

    // Add items to user in FiveM server
    await deliverItems(req.user.id, items);

    // Save purchase to database
    await db.query(
      'INSERT INTO purchases (user_id, items, total, payment_method, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.user.id, JSON.stringify(items), paymentIntent.amount / 100, paymentIntent.metadata.paymentMethod]
    );

    res.json({ success: true, message: 'Purchase completed! Items delivered to your account.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Deliver items to FiveM server
async function deliverItems(userId, items) {
  try {
    for (const item of items) {
      if (item.type === 'car') {
        // Add car to user garage in FiveM
        await db.query(
          'INSERT INTO user_vehicles (user_id, vehicle, plate) VALUES (?, ?, ?)',
          [userId, item.vehicle, generatePlate()]
        );
      } else if (item.type === 'money') {
        // Add money to user account
        const [rows] = await db.query(
          'SELECT money, bank FROM vrp_user_data WHERE user_id = ?',
          [userId]
        );

        const currentMoney = rows[0]?.money || 0;
        const currentBank = rows[0]?.bank || 0;

        await db.query(
          'UPDATE vrp_user_data SET money = ? WHERE user_id = ?',
          [currentMoney + item.amount, userId]
        );
      } else if (item.type === 'faction') {
        // Set faction for user
        await db.query(
          'UPDATE vrp_users SET faction = ? WHERE id = ?',
          [item.faction, userId]
        );
      }
    }

    // Trigger FiveM server event via SQL notification or webhook
    // Option 1: Write to a cache table that FiveM server checks
    await db.query(
      'INSERT INTO delivery_queue (user_id, data, status, created_at) VALUES (?, ?, "pending", NOW())',
      [userId, JSON.stringify(items)]
    );

    console.log(`✅ Items queued for delivery to user ${userId}`);
  } catch (err) {
    console.error('Delivery error:', err);
    throw err;
  }
}

// Generate random license plate
function generatePlate() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let plate = '';
  for (let i = 0; i < 8; i++) {
    plate += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return plate;
}

module.exports = router;
