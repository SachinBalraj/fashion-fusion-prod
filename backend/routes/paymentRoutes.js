const express = require('express');
const { protect, optionalProtect, admin } = require('../middleware/auth');
const {
  verifyRazorpaySignature,
  validateOrderAmount,
  preventDuplicatePayment,
  verifyWebhookSignature,
} = require('../middleware/paymentVerification');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  refundPayment,
  getPaymentDetails,
  getAllPayments,
} = require('../controllers/paymentController');

const router = express.Router();

// Razorpay - Create order
router.post('/razorpay', optionalProtect, createRazorpayOrder);

// Razorpay - Verify payment (with signature + amount + duplicate checks)
router.post(
  '/razorpay/verify',
  optionalProtect,
  verifyRazorpaySignature,
  validateOrderAmount,
  preventDuplicatePayment,
  verifyRazorpayPayment
);

// Razorpay - Refund (admin only)
router.post('/:orderId/refund', protect, admin, refundPayment);

// Get payment details for an order
router.get('/:orderId/details', protect, getPaymentDetails);

// Get all payments (admin only)
router.get('/', protect, admin, getAllPayments);

// Razorpay Webhook (uses raw body, verified separately in server.js)
router.post('/webhook/razorpay', verifyWebhookSignature, handleWebhook);

module.exports = router;
