const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

module.exports = router;
