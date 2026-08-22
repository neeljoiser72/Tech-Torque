import express from 'express';
import CheckIn from '../models/CheckIn.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/check-ins - Get all check-ins for current user
router.get('/', async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ userId: req.user._id })
      .sort({ created_at: -1 });
    return res.json(checkIns);
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    return res.status(500).json({ error: 'Failed to fetch check-ins.' });
  }
});

// POST /api/check-ins - Create a new check-in
router.post('/', async (req, res) => {
  try {
    const { mood, sleep_hours, anxiety_level, distress_level, notes } = req.body;
    if (
      mood === undefined ||
      sleep_hours === undefined ||
      anxiety_level === undefined ||
      distress_level === undefined
    ) {
      return res.status(400).json({ error: 'Missing required check-in fields.' });
    }

    const checkIn = new CheckIn({
      userId: req.user._id,
      mood,
      sleep_hours,
      anxiety_level,
      distress_level,
      notes: notes || null,
    });

    await checkIn.save();
    return res.status(201).json(checkIn);
  } catch (err) {
    console.error('Error saving check-in:', err);
    return res.status(500).json({ error: 'Failed to save check-in.' });
  }
});

export default router;
