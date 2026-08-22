const express = require('express');
const {
  getCart,
  syncCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .put(syncCart);

router.post('/items', addItem);
router.put('/items', updateItem);
router.delete('/items', removeItem);
router.delete('/clear', clearCart);

module.exports = router;
