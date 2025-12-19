const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { connectToDB } = require('./utils/db');
const authRoutes = require('./routes/auth.route');
const assignmentRoutes = require('./routes/assignment.route');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Initialize DB connection middleware on FIRST REQUEST (before routes)
app.use(async (req, res, next) => {
    try {
        await connectToDB();
        next();
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        return res.status(503).json({
            error: "Service Unavailable",
            message: "Database connection failed"
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Sefask API",
        status: "ready",
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Register routes (DB connection already established)
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless
module.exports = app;
