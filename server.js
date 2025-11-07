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

// Connect to DB first
connectToDB()
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.use('/api/auth', authRoutes);
        app.use('/api/assignments', assignmentRoutes);

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
