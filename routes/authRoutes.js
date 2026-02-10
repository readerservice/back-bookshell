const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController')
const auth = require('../middleware/auth')

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.put('/profile/name', auth, controller.updateName)
router.put('/profile/password', auth, controller.updatePassword)
router.delete('/profile', auth, controller.deleteProfile)
router.get('/verify-email', controller.verifyEmail)
router.post('/forgot-password', controller.forgotPassword)
router.get('/profile', auth, controller.getProfile)
router.get('/profile/userId', auth, controller.getUserId)
router.post('/send-verification-email', auth, controller.sendVerificationEmail)

module.exports = router;