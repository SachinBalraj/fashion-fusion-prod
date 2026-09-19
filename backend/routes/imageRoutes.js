const express = require('express');
const rateLimit = require('express-rate-limit');
const { getImage } = require('../controllers/imageController');

const router = express.Router();

const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1800,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many image requests, please try again later' },
});

router.get('/:id', imageLimiter, getImage);

module.exports = router;