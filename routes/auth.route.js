const express = require('express');
const router = express.Router()
const { signup, signin, signout, verifyEmail, resendVerification, getMe } = require('../controllers/auth.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/signout', signout)
router.post('/verify-email', authenticateToken, verifyEmail)
router.post('/resend-verification', optionalAuth, resendVerification)
router.get('/me', authenticateToken, getMe)

module.exports = router