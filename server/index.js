import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './config/seeder.js';
import apiRouter from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development ease
  credentials: true
}));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.send('Event Management Ecosystem API Server Running.');
});

// Register API router
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred.' });
});

// Start Server
const startServer = async () => {
  // Connect to DB
  await connectDB();
  
  // Seed Database with initial mock data
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  });
};

startServer();
