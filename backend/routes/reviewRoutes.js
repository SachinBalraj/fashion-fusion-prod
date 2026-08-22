const express = require('express');
const {
  createReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
