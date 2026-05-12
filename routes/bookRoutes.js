const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateSingleBook, getBookDescription } = require('../controllers/bookRecommendationController');
const { aiLimiterByUser } = require('../middleware/rateLimit')
const aiSoftGuard = require('../middleware/aiSoftGuard')
const aiInFlightGuard = require('../middleware/aiInFlightGuard')

router.post("/generate", auth, aiInFlightGuard, aiLimiterByUser, aiSoftGuard, generateSingleBook);
router.post("/description", auth, aiInFlightGuard, aiLimiterByUser, aiSoftGuard, getBookDescription)

module.exports = router;
