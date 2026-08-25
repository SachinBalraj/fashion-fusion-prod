const crypto = require('crypto');
const Order = require('../models/Order');

const verifyRazorpaySignature = (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment verification parameters' });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const sigBuf = Buffer.from(expectedSignature, 'hex');
  const providedBuf = Buffer.from(razorpay_signature, 'hex');
  if (sigBuf.length !== providedBuf.length || !crypto.timingSafeEqual(sigBuf, providedBuf)) {
    return res.status(400).json({ message: 'Invalid payment signature - payment tampering detected' });
  }

  req.razorpayVerified = true;
  next();
};

const verifyWebhookSignature = (req, res, next) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET not configured');
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

  try {
    const razorpayService = require('../services/razorpayService');
    const pendingOrder = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      paymentMethod: 'razorpay',
    });

    if (!pendingOrder) {
      return res.status(404).json({ message: 'Pending order not found for this payment' });
    }

    if (pendingOrder.user && (!req.user || pendingOrder.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to verify this order' });
    }

    const razorpayOrder = await razorpayService.fetchOrder(razorpay_order_id);
    const razorpayAmountInRupees = razorpayOrder.amount / 100;
    const expectedAmount = pendingOrder.totalPrice;

    if (Math.abs(razorpayAmountInRupees - expectedAmount) > 0.01) {
      return res.status(400).json({ message: 'Amount mismatch detected' });
    }

    req.pendingPaymentOrder = pendingOrder;
    next();
  } catch (error) {
    next(error);
  }
};

const preventDuplicatePayment = async (req, res, next) => {
  const { razorpay_payment_id } = req.body;

  if (!razorpay_payment_id) {
    return next();
  }

  const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
  if (existingOrder) {
    return res.status(400).json({ message: 'Duplicate payment detected' });
  }

  next();
};

module.exports = {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  validateOrderAmount,
  preventDuplicatePayment,
};
