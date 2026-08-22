import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({ email: normalizedEmail, password });
    await user.save();

    const token = generateToken(user._id);
    return res.status(201).json({
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    console.error('Sign up error:', err);
    return res.status(500).json({ error: err.message || 'Server error during sign up.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    return res.json({
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Guest Login
router.post('/guest', async (req, res) => {
  try {
    const guestEmail = 'guest@mindguard.ai';
    const guestPassword = 'guest12345';

    let user = await User.findOne({ email: guestEmail });
    if (!user) {
      user = new User({
        email: guestEmail,
        password: guestPassword,
        isGuest: true,
      });
      await user.save();
    }

    const token = generateToken(user._id);
    return res.json({
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    console.error('Guest login error:', err);
    return res.status(500).json({ error: err.message || 'Server error during guest login.' });
  }
});

// Get Current User Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    return res.json({ user: req.user.toJSON() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

export default router;
