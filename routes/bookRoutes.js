const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateSingleBook, getBookDescription } = require('../controllers/bookRecommendationController');

router.post("/generate", auth, generateSingleBook);
router.post("/description", auth, getBookDescription)

module.exports = router;