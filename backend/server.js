import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import approvalRoutes from './routes/approvals.js';
import roomRoutes from './routes/rooms.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://eventverse.pages.dev',
  'https://eventverse.mlsctiet.com',
  'https://eventverse.jeevantverma.tech',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads', 'proposals');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', profileRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventVerse API is running!',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
