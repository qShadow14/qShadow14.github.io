const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Setup Passport Strategies
passport.use(new SteamStrategy({
  returnURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/steam/return`,
  realm: process.env.BACKEND_URL || 'http://localhost:5000',
  apiKey: process.env.STEAM_API_KEY || 'your-steam-api-key'
}, async (identifier, profile, done) => {
  try {
    // Extract Steam ID from identifier
    const steamId = identifier.split('/').pop();
    const user = await findOrCreateUser('steam', steamId, profile.displayName);
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID || 'your-discord-id',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || 'your-discord-secret',
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/discord/return`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser('discord', profile.id, profile.username);
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-secret',
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/return`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser('google', profile.id, profile.displayName);
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM vrp_users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

// Helper function to find or create user
async function findOrCreateUser(provider, providerId, username) {
  const [rows] = await db.query(
    'SELECT * FROM vrp_users WHERE username = ?',
    [username]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  // Create new user if doesn't exist
  const [result] = await db.query(
    'INSERT INTO vrp_users (username) VALUES (?)',
    [username]
  );

  return { id: result.insertId, username, provider, providerId };
}

// Routes
router.get('/steam', passport.authenticate('steam', { state: 'openid.return_to' }));
router.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'secret');
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/callback?token=${token}`);
});

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/return', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'secret');
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/callback?token=${token}`);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/return', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'secret');
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/callback?token=${token}`);
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
});

module.exports = router;
