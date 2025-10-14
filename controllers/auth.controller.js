const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d'
    });
}

const setAuthCookie = (res, token) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    });
}

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = await User.signup(firstName, lastName, email, password);

        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.firstName, user.verificationCode);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with signup even if email fails
        }

        res.status(201).json({
            message: "Account created successfully. Please check your email for the 6-digit verification code.",
            user: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}

exports.signin = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.signin(email, password);

        const token = createToken(user._id);
        setAuthCookie(res, token);
        
        res.status(200).json({
            message: "Signed in successfully!",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}

exports.verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.verifyEmail(email, code);

        res.status(200).json({
            message: "Email verified successfully! You can now sign in.",
            user: {
                id: user._id,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}

exports.resendVerification = async (req, res) => {
    try {
        let user;
        if (req.user && !req.user.isVerified) {
            user = await User.generateNewVerificationCode(req.user.email);
        } else if (req.body.email) {
            user = await User.generateNewVerificationCode(req.body.email);
        } else {
            return res.status(400).json({
                errors: [{ field: "email", message: "User must be authenticated." }]
            });
        }

        // Send new verification email
        try {
            await sendVerificationEmail(user.email, user.firstName, user.verificationCode);
            res.status(200).json({
                message: "Verification code sent successfully. Please check your email."
            });
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            res.status(500).json({
                errors: [{ field: "email", message: "Failed to send verification email. Please try again." }]
            });
        }
    } catch (err) {
        const errors = JSON.parse(err.message);
        res.status(400).json({ errors });
    }
}

exports.signout = async (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(200).json({
            message: "Signed out successfully!"
        });
    } catch (err) {
        res.status(500).json({
            errors: [{ field: "auth", message: "Error signing out." }]
        });
    }
}

exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                errors: [{ field: "auth", message: "Not authenticated." }]
            });
        }

        res.status(200).json({
            user: {
                id: req.user._id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                isVerified: req.user.isVerified
            }
        });
    } catch (err) {
        res.status(500).json({
            errors: [{ field: "auth", message: "Error fetching user data." }]
        });
    }
}