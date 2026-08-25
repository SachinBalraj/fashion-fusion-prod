const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const verifyRazorpaySignature = (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment verification parameters', verificationFailed: true });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const sigBuf = Buffer.from(expectedSignature, 'hex');
  const providedBuf = Buffer.from(razorpay_signature, 'hex');
  if (sigBuf.length !== providedBuf.length || !crypto.timingSafeEqual(sigBuf, providedBuf)) {
    return res.status(400).json({ message: 'Invalid payment signature - payment tampering detected', verificationFailed: true });
  }

  req.razorpayVerified = true;
  next();
};

const verifyWebhookSignature = (req, res, next) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ message: 'Webhook not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ message: 'Missing webhook signature' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  const sigBuf = Buffer.from(expectedSignature, 'hex');
  const providedBuf = Buffer.from(signature, 'hex');
  if (sigBuf.length !== providedBuf.length || !crypto.timingSafeEqual(sigBuf, providedBuf)) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  next();
};

const validateOrderAmount = async (req, res, next) => {
  const { razorpay_order_id } = req.body;

  const dbAvailable = mongoose.connection.readyState === 1;
  if (!dbAvailable) {
    console.warn('[PAYMENT] validateOrderAmount skipped - MongoDB unavailable');
    req.pendingPaymentOrder = null;
    return next();
  }

  try {
    const pendingOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      paymentMethod: 'razorpay',
    });

    if (!pendingOrder) {
      console.warn('[PAYMENT] validateOrderAmount - no order found for razorpayOrderId:', razorpay_order_id);
      req.pendingPaymentOrder = null;
      return next();
    }

    if (pendingOrder.user && (!req.user || pendingOrder.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to verify this order', verificationFailed: true });
    }

    const razorpayService = require('../services/razorpayService');
    const razorpayOrder = await razorpayService.fetchOrder(razorpay_order_id);
    const razorpayAmountInRupees = razorpayOrder.amount / 100;
    const expectedAmount = pendingOrder.totalPrice;

    if (Math.abs(razorpayAmountInRupees - expectedAmount) > 0.01) {
      return res.status(400).json({ message: 'Amount mismatch detected', verificationFailed: true });
    }

    req.pendingPaymentOrder = pendingOrder;
    next();
  } catch (error) {
    if (error.name === 'MongooseError' || error.name === 'MongoError' || error.message.includes('buffer') || error.message.includes('connection')) {
      console.warn('[PAYMENT] validateOrderAmount skipped - DB error:', error.message);
      req.pendingPaymentOrder = null;
      return next();
    }
    next(error);
  }
};

const preventDuplicatePayment = async (req, res, next) => {
  const { razorpay_payment_id } = req.body;

  if (!razorpay_payment_id) {
    return next();
  }

  const dbAvailable = mongoose.connection.readyState === 1;
  if (!dbAvailable) {
    return next();
  }

  try {
    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder && existingOrder.isPaid) {
      return res.json({
        success: true,
        orderId: existingOrder._id,
        orderNumber: existingOrder.orderNumber,
        razorpayOrderId: req.body.razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        isGuestCheckout: !existingOrder.user,
        claimToken: existingOrder.accountClaimToken || '',
        guestEmail: existingOrder.customerEmail || '',
        guestPhone: existingOrder.phone || '',
        guestName: existingOrder.customerName || '',
      });
    }
    next();
  } catch (error) {
    if (error.name === 'MongooseError' || error.name === 'MongoError' || error.message.includes('buffer') || error.message.includes('connection')) {
      console.warn('[PAYMENT] preventDuplicatePayment skipped - DB error:', error.message);
      return next();
    }
    next(error);
  }
};

module.exports = {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  validateOrderAmount,
  preventDuplicatePayment,
};
