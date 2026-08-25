const Razorpay = require('razorpay');
const crypto = require('crypto');

const isPlaceholderValue = (value) => {
  if (!value) return true;
  return value.toLowerCase().includes('your_razorpay') || value.toLowerCase().includes('replace_with') || value === 'test';
};

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (isPlaceholderValue(keyId) || isPlaceholderValue(keySecret)) {
    return null;
  }

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
};

let razorpayInstance;
const credentials = getRazorpayCredentials();
if (credentials) {
  razorpayInstance = new Razorpay({
    key_id: credentials.keyId,
    key_secret: credentials.keySecret,
  });
}

const createRazorpayOrder = async (amount, currency = 'INR') => {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured in this environment. Set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET values before enabling checkout.');
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

module.exports = {
  createRazorpayOrder,
  fetchOrder,
  fetchPayment,
  createRefund,
};
