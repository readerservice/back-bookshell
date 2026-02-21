const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateSingleBook, getBookDescription } = require('../controllers/bookRecommendationController');
const { aiLimiterByUser } = require('../middleware/rateLimit')
const aiSoftGuard = require('../middleware/aiSoftGuard')

router.post("/generate", auth, aiLimiterByUser, aiSoftGuard, generateSingleBook);
router.post("/description", auth, aiLimiterByUser, aiSoftGuard, getBookDescription)

module.exports = router;