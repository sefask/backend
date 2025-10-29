const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.route')

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Express middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
connectDB().catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    // Continue anyway for Vercel
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`App is running on Port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;