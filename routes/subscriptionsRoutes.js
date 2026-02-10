const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserSubscriptionStatus } = require('../controllers/subscriptionsController');

router.get("/status", auth, getUserSubscriptionStatus);

module.exports = router;