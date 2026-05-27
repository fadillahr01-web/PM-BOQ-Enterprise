const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Traditional login (kept for backwards compatibility)
router.post('/login', authController.login);

// Google OAuth login with email whitelist verification
router.post('/google', authController.googleAuth);

module.exports = router;
