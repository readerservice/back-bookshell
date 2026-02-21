const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController')
const auth = require('../middleware/auth')
const { authLimiter, loginLimiter, passwordResetLimiter } = require('../middleware/rateLimit')

router.post('/register', authLimiter, controller.register);
router.post('/login', loginLimiter, controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', authLimiter, controller.refresh);
router.put('/profile/name', auth, controller.updateName)
router.put('/profile/password', auth, controller.updatePassword)
router.delete('/profile', auth, controller.deleteProfile)
router.get('/verify-email', controller.verifyEmail)
router.post('/forgot-password', passwordResetLimiter, auth, controller.forgotPassword)
router.get('/profile', auth, controller.getProfile)
router.get('/profile/userId', auth, controller.getUserId)
router.post('/send-verification-email', authLimiter, auth, controller.sendVerificationEmail)

module.exports = router;