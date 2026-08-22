import express from 'express';
import RiskPrediction from '../models/RiskPrediction.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/risk-predictions - Get all risk predictions for current user
router.get('/', async (req, res) => {
  try {
    const predictions = await RiskPrediction.find({ userId: req.user._id })
      .sort({ created_at: -1 });
    return res.json(predictions);
  } catch (err) {
    console.error('Error fetching risk predictions:', err);
    return res.status(500).json({ error: 'Failed to fetch risk predictions.' });
  }
});

// POST /api/risk-predictions - Create a new risk prediction
router.post('/', async (req, res) => {
  try {
    const { risk_level, risk_score, factors, recommendations, summary } = req.body;
    if (!risk_level || risk_score === undefined || !summary) {
      return res.status(400).json({ error: 'Missing required risk prediction fields.' });
    }

    const prediction = new RiskPrediction({
      userId: req.user._id,
      risk_level,
      risk_score,
      factors: Array.isArray(factors) ? factors : [],
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      summary,
    });

    await prediction.save();
    return res.status(201).json(prediction);
  } catch (err) {
    console.error('Error saving risk prediction:', err);
    return res.status(500).json({ error: 'Failed to save risk prediction.' });
  }
});

export default router;
