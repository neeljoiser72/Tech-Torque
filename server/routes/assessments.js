import express from 'express';
import Assessment from '../models/Assessment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/assessments - Get all assessments for current user
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ created_at: -1 });
    return res.json(assessments);
  } catch (err) {
    console.error('Error fetching assessments:', err);
    return res.status(500).json({ error: 'Failed to fetch assessments.' });
  }
});

// POST /api/assessments - Create a new assessment
router.post('/', async (req, res) => {
  try {
    const { type, score, severity, answers } = req.body;
    if (!type || score === undefined || !severity) {
      return res.status(400).json({ error: 'Missing required assessment fields.' });
    }

    const assessment = new Assessment({
      userId: req.user._id,
      type,
      score,
      severity,
      answers: Array.isArray(answers) ? answers : [],
    });

    await assessment.save();
    return res.status(201).json(assessment);
  } catch (err) {
    console.error('Error saving assessment:', err);
    return res.status(500).json({ error: 'Failed to save assessment.' });
  }
});

export default router;
