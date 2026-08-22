const express = require('express');
const {
  getWishlist,
  syncWishlist,
  addItem,
  removeItem,
  clearWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .put(syncWishlist);

router.post('/items', addItem);
router.delete('/items', removeItem);
router.delete('/clear', clearWishlist);

module.exports = router;
