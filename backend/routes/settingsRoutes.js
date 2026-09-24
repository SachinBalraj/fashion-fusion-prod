const express = require('express');
const { getPublicShowcase } = require('../controllers/showcaseController');

const router = express.Router();

router.get('/product-showcase', getPublicShowcase);

module.exports = router;