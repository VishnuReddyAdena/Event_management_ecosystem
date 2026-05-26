const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Event Management API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
