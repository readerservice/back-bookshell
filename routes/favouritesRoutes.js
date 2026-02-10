const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const controller = require('../controllers/favouritesController')

router.get('/', auth, controller.getFavourites);

router.post('/', auth, controller.createFavourites);

router.delete('/:id', auth, controller.deleteFavourites);

module.exports = router;