const express = require('express');
const AuthController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Giriş ve Kayıt için rate limiter ekleyelim
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);

// Oturum ve Profil İşlemleri (Token Korumalı)
router.get('/me', auth, AuthController.getMe);
router.put('/profile', auth, AuthController.updateProfile);

module.exports = router;
