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

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Sefask API",
        status: "ready",
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Register routes (DB connection will happen on first request)
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

// Initialize DB connection on startup (for development)
if (process.env.NODE_ENV !== 'production') {
    connectToDB()
        .then(() => console.log("✅ Connected to MongoDB"))
        .catch(err => console.error("❌ MongoDB connection error:", err));

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
    // On Vercel, initialize connection on first request to an API route
    app.use(async (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            try {
                await connectToDB();
                console.log("✅ Connected to MongoDB");
            } catch (err) {
                console.error("❌ MongoDB connection error:", err);
                return res.status(503).json({
                    error: "Service Unavailable",
                    message: "Database connection failed"
                });
            }
        }
        next();
    });
}

// Export for Vercel serverless
module.exports = app;
