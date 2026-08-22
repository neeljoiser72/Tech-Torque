import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix for Windows DNS resolution for MongoDB Atlas SRV records (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server configuration warning:', err.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessments.js';
import checkInRoutes from './routes/checkIns.js';
import riskPredictionRoutes from './routes/riskPredictions.js';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindguard';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/risk-predictions', riskPredictionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server and Connect DB
async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 MindGuard API Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the process using it or change PORT in .env.`);
    } else {
      console.error('Server error:', err);
    }
  });

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Successfully connected to MongoDB Atlas database');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Please verify your connection string in .env and make sure your IP is whitelisted in MongoDB Atlas.');
  }
}

startServer();
