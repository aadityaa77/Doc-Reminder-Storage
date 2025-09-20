const express = require('express');
const router = express.Router();
const ctrl = require('./auth.controller');
const { authLimiter } = require('../../middleware/rateLimiter');
const { requireAuth, refreshToken } = require('../../middleware/auth');

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/refresh', refreshToken);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
