const Razorpay = require('razorpay');
const crypto = require('crypto');

// Replace with your LIVE key before production deployment
// Currently configured for TEST mode
let razorpayInstance;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const createRazorpayOrder = async (amount, currency = 'INR') => {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  const amountInPaise = Math.round(amount * 100);

  const options = {
    amount: amountInPaise,
    currency,
    receipt: `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };

  const order = await razorpayInstance.orders.create(options);
  return order;
};

const fetchOrder = async (orderId) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }
  const order = await razorpayInstance.orders.fetch(orderId);
  return order;
};

const fetchPayment = async (paymentId) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }
  const payment = await razorpayInstance.payments.fetch(paymentId);
  return payment;
};

const createRefund = async (paymentId, amount, notes = {}) => {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured');
  }

  const refundOptions = {
    amount: Math.round(amount * 100),
    notes,
  };

  const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);
  return refund;
};

const verifyRazorpayPayment = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  fetchOrder,
  fetchPayment,
  createRefund,
  verifyRazorpayPayment,
};
