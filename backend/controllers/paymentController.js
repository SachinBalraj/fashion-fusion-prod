const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpayService = require('../services/razorpayService');
const sendEmail = require('../utils/sendEmail');

const SHIPPING_FEE = 80;
const TAX_RATE = 0.18;
const MAX_PAYMENT_AMOUNT = 500000;

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const normalizeShippingAddress = (address = {}) => ({
  street: address.street?.trim() || '',
  city: address.city?.trim() || '',
  state: address.state?.trim() || '',
  zip: address.zip?.trim() || '',
  country: address.country?.trim() || 'India',
});

const resolveProductByIdentifier = async (identifier, fallbackName) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is temporarily unavailable. Please try again.');
  }

  if (!identifier) return null;
  const value = String(identifier).trim();

  if (mongoose.Types.ObjectId.isValid(value)) {
    const doc = await Product.findById(value).select('name price stock isActive images slug');
    if (doc) return doc;
  }

  if (fallbackName && typeof fallbackName === 'string') {
    const byName = await Product.findOne({ name: { $regex: new RegExp(`^${fallbackName.trim()}$`, 'i') } }).select('name price stock isActive images slug');
    if (byName) return byName;
  }

  return null;
};

const AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

const buildOrderItemsFromProducts = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('No order items', 400);
  }

  return Promise.all(
    items.map(async (item) => {
      const productId = item.product || item._id;
      const quantity = Number(item.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        throw new AppError('Invalid order item payload', 400);
      }

      const product = await resolveProductByIdentifier(productId, item.name);
      if (!product) {
        throw new AppError(`Product "${productId}" not found. Please refresh your cart.`, 404);
      }
      if (!product.isActive) {
        throw new AppError(`Product "${product.name}" is no longer available.`, 410);
      }

      const stock = Number(product.stock) || 0;
      if (stock < quantity) {
        throw new AppError(`Insufficient stock for "${product.name}". Available: ${stock}, requested: ${quantity}.`, 409);
      }

      return {
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: item.size || '',
        color: item.color || '',
        price: product.price,
        quantity,
      };
    })
  );
};

const buildValidatedOrderPayload = async ({ items, address, phone, customerName, customerEmail }) => {
  const shippingAddress = normalizeShippingAddress(address);

  if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
    throw new Error('Complete shipping address is required');
  }

  const orderItems = await buildOrderItemsFromProducts(items);
  const itemsPrice = roundCurrency(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shippingPrice = SHIPPING_FEE;
  const taxPrice = roundCurrency(itemsPrice * TAX_RATE);
  const discountPrice = 0;
  const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice - discountPrice);

  return {
    orderItems,
    shippingAddress,
    phone: (phone || '').trim(),
    customerName: (customerName || '').trim(),
    customerEmail: (customerEmail || '').trim().toLowerCase(),
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
  };
};

const createRazorpayOrder = async (req, res) => {
  const t0 = Date.now();
  try {
    const tProducts = Date.now();
    const orderPayload = await buildValidatedOrderPayload(req.body);
    console.log(`[PAYMENT] product validation: ${Date.now() - tProducts}ms`);
    const isGuestCheckout = !req.user;

    if (!isGuestCheckout) {
      orderPayload.customerName = req.user.name || orderPayload.customerName;
      orderPayload.customerEmail = req.user.email || orderPayload.customerEmail;
      orderPayload.phone = req.user.phone || orderPayload.phone;
    }

    if (!orderPayload.customerName || !orderPayload.customerEmail) {
      return res.status(400).json({ message: 'Name and email are required for checkout' });
    }

    if (orderPayload.totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (orderPayload.totalPrice > MAX_PAYMENT_AMOUNT) {
      return res.status(400).json({ message: 'Amount exceeds maximum limit' });
    }

    const tRazorpay = Date.now();
    const razorpayOrder = await razorpayService.createRazorpayOrder(orderPayload.totalPrice);
    console.log(`[PAYMENT] Razorpay API: ${Date.now() - tRazorpay}ms`);

    const tDbWrite = Date.now();
    const order = await Order.create({
      user: req.user?._id,
      ...orderPayload,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      accountClaimToken: isGuestCheckout ? crypto.randomBytes(24).toString('hex') : '',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      paymentResult: {
        status: 'created',
        update_time: new Date().toISOString(),
      },
    });
    console.log(`[PAYMENT] order create: ${Date.now() - tDbWrite}ms, total: ${Date.now() - t0}ms`);

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
      totals: {
        subtotal: order.itemsPrice,
        shipping: order.shippingPrice,
        tax: order.taxPrice,
        discount: order.discountPrice,
        total: order.totalPrice,
      },
      isGuestCheckout,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error(`[PAYMENT] Order creation failed (${Date.now() - t0}ms):`, error.message);
    res.status(statusCode).json({ message: error.message || 'Failed to create payment order' });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment parameters', verificationFailed: true });
    }

    const dbAvailable = mongoose.connection.readyState === 1;

    if (dbAvailable) {
      const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
      if (existingOrder && existingOrder.isPaid) {
        return res.json({
          success: true,
          orderId: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          isGuestCheckout: !existingOrder.user,
          claimToken: existingOrder.accountClaimToken || '',
          guestEmail: existingOrder.customerEmail || '',
          guestPhone: existingOrder.phone || '',
          guestName: existingOrder.customerName || '',
        });
      }
    }

    let payment;
    try {
      payment = await razorpayService.fetchPayment(razorpay_payment_id);
    } catch (rpError) {
      console.error('[PAYMENT] Razorpay API failure:', rpError.message);
      return res.status(502).json({ message: 'Unable to verify payment with Razorpay. Please try again.', verificationFailed: true });
    }

    if (!payment || payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ message: 'Payment does not belong to this order', verificationFailed: true });
    }

    if (!['authorized', 'captured'].includes(payment.status)) {
      return res.status(400).json({ message: 'Payment has not been authorized by Razorpay', verificationFailed: true });
    }

    if (!dbAvailable) {
      console.error('[PAYMENT] DB unavailable after Razorpay verification succeeded', {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: payment.status,
      });
      return res.json({
        success: true,
        pending: true,
        message: 'Payment received successfully. Your order confirmation is being processed.',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    let order = req.pendingPaymentOrder;
    if (!order) {
      order = await Order.findOne({
        razorpayOrderId: razorpay_order_id,
        paymentMethod: 'razorpay',
      });
    }

    if (!order) {
      console.error('[PAYMENT] Order not found in DB for razorpayOrderId:', razorpay_order_id);
      return res.json({
        success: true,
        pending: true,
        message: 'Payment received. Order details are being reconciled.',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    const expectedAmount = Math.round(order.totalPrice * 100);
    if (payment.amount !== expectedAmount || payment.currency !== 'INR') {
      return res.status(400).json({ message: 'Payment amount validation failed', verificationFailed: true });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentResult = {
      id: razorpay_payment_id,
      status: payment.status,
      update_time: payment.created_at
        ? new Date(payment.created_at * 1000).toISOString()
        : new Date().toISOString(),
      email_address: payment.email || '',
    };
    order.paymentStatus = 'paid';
    order.isPaid = true;
    order.paidAt = payment.created_at ? new Date(payment.created_at * 1000) : new Date();
    order.orderStatus = 'confirmed';

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await order.save({ session });
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } },
              { session }
            );
          }
        });
      } finally {
        session.endSession();
      }
    } catch (dbError) {
      console.error('[PAYMENT] DB save failed after successful Razorpay verification:', {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        error: dbError.message,
      });
      return res.json({
        success: true,
        pending: true,
        message: 'Payment received. Order confirmation is being processed.',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    if (order.customerEmail) {
      sendOrderConfirmationEmail(order).catch((err) => {
        console.error('[EMAIL] Order confirmation failed:', err.message);
      });
    }

    const isGuestCheckout = !order.user;

    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      isGuestCheckout,
      claimToken: isGuestCheckout ? order.accountClaimToken : '',
      guestEmail: isGuestCheckout ? order.customerEmail : '',
      guestPhone: isGuestCheckout ? order.phone : '',
      guestName: isGuestCheckout ? order.customerName : '',
    });
  } catch (error) {
    console.error('[PAYMENT] Verification error:', error.message);
    res.status(500).json({ message: error.message || 'Payment verification failed', verificationFailed: true });
  }
};

const processedWebhookEvents = new Map();
const WEBHOOK_EVENT_TTL = 24 * 60 * 60 * 1000;

const cleanupOldEvents = () => {
  const now = Date.now();
  for (const [eventId, timestamp] of processedWebhookEvents) {
    if (now - timestamp > WEBHOOK_EVENT_TTL) {
      processedWebhookEvents.delete(eventId);
    }
  }
};

const findOrderForWebhook = async (paymentId, orderId) => {
  if (paymentId) {
    const byPayment = await Order.findOne({ razorpayPaymentId: paymentId });
    if (byPayment) return byPayment;
  }
  if (orderId) {
    const byOrder = await Order.findOne({ razorpayOrderId: orderId });
    if (byOrder) return byOrder;
  }
  return null;
};

const handleWebhook = async (req, res) => {
  try {
    const event = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString('utf8'))
      : req.body;

    const eventId = event.id;
    if (eventId) {
      if (processedWebhookEvents.has(eventId)) {
        return res.json({ status: 'ok', message: 'Duplicate event ignored' });
      }
      processedWebhookEvents.set(eventId, Date.now());
      cleanupOldEvents();
    }

    const eventPayload = event.payload?.payment?.entity || {};
    const paymentId = eventPayload.id;
    const razorpayOrderId = eventPayload.order_id;

    switch (event.event) {
      case 'payment.captured': {
        const order = await findOrderForWebhook(paymentId, razorpayOrderId);
        if (order && order.paymentStatus !== 'paid') {
          order.razorpayPaymentId = paymentId;
          order.paymentStatus = 'paid';
          order.isPaid = true;
          order.paidAt = eventPayload.created_at ? new Date(eventPayload.created_at * 1000) : new Date();
          order.orderStatus = 'confirmed';
          await order.save();
          console.log('[WEBHOOK] payment.captured - order updated:', order._id);
        } else if (!order) {
          console.warn('[WEBHOOK] payment.captured - no order found:', { paymentId, razorpayOrderId });
        }
        break;
      }

      case 'payment.failed': {
        const order = await findOrderForWebhook(paymentId, razorpayOrderId);
        if (order && order.paymentStatus !== 'failed') {
          order.razorpayPaymentId = paymentId;
          order.paymentStatus = 'failed';
          order.orderStatus = 'cancelled';
          await order.save();
          console.log('[WEBHOOK] payment.failed - order updated:', order._id);
        } else if (!order) {
          console.warn('[WEBHOOK] payment.failed - no order found:', { paymentId, razorpayOrderId });
        }
        break;
      }

      case 'refund.processed': {
        const paymentIdForRefund = eventPayload.payment_id;
        const order = await Order.findOne({ razorpayPaymentId: paymentIdForRefund });
        if (order && order.paymentStatus !== 'refunded') {
          order.paymentStatus = 'refunded';
          order.refundId = eventPayload.id;
          order.refundAmount = (eventPayload.amount || 0) / 100;
          order.refundedAt = new Date();
          order.orderStatus = 'cancelled';
          await order.save();
          console.log('[WEBHOOK] refund.processed - order updated:', order._id);
        }
        break;
      }

      default:
        break;
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[WEBHOOK] Processing error:', error.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Cannot refund unpaid order' });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Order already refunded' });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({ message: 'No Razorpay payment found for this order' });
    }

    const refundAmount = amount || order.totalPrice;

    if (refundAmount > order.totalPrice - order.refundAmount) {
      return res.status(400).json({ message: 'Refund amount exceeds refundable amount' });
    }

    const refund = await razorpayService.createRefund(order.razorpayPaymentId, refundAmount, {
      order_id: order.orderNumber,
      reason: reason || 'Admin initiated refund',
    });

    order.paymentStatus = 'refunded';
    order.refundId = refund.id;
    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    order.refundedAt = new Date();
    await order.save();

    for (const item of order.orderItems) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      } catch (stockErr) {
        console.error('[REFUND] Stock restore failed:', stockErr.message);
      }
    }

    const user = await User.findById(order.user);
    if (user) {
      sendRefundEmail(user, order, refundAmount).catch((err) => {
        console.error('[EMAIL] Refund email failed:', err.message);
      });
    }

    res.json({
      success: true,
      refundId: refund.id,
      refundAmount,
      message: 'Refund initiated successfully',
    });
  } catch (error) {
    console.error('[REFUND] Error:', error.message);
    res.status(500).json({ message: error.message || 'Refund failed' });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let razorpayDetails = null;
    if (order.razorpayPaymentId) {
      try {
        razorpayDetails = await razorpayService.fetchPayment(order.razorpayPaymentId);
      } catch (err) {
        console.error('[PAYMENT] Failed to fetch Razorpay details:', err.message);
      }
    }

    res.json({
      order,
      razorpayDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { paymentMethod: 'razorpay' };

    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { razorpayPaymentId: { $regex: escapedSearch, $options: 'i' } },
        { razorpayOrderId: { $regex: escapedSearch, $options: 'i' } },
        { orderNumber: { $regex: escapedSearch, $options: 'i' } },
        { customerEmail: { $regex: escapedSearch, $options: 'i' } },
        { customerName: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    const stats = await Order.aggregate([
      { $match: { paymentMethod: 'razorpay' } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
        },
      },
    ]);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function sendOrderConfirmationEmail(order) {
  const itemsHtml = order.orderItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}${item.size ? ` (Size: ${item.size})` : ''}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#C9A227;padding:20px;text-align:center">
        <h1 style="color:white;margin:0">Fashion's Fusion</h1>
      </div>
      <div style="padding:20px;background:#fff">
        <h2>Order Confirmation</h2>
        <p>Hi ${escapeHtml(order.customerName) || 'Customer'},</p>
        <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0">
          <p>Subtotal: ₹${order.itemsPrice.toLocaleString('en-IN')}</p>
          <p>Shipping: ${order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</p>
          <p>Tax: ₹${order.taxPrice.toLocaleString('en-IN')}</p>
          <p><strong>Total: ₹${order.totalPrice.toLocaleString('en-IN')}</strong></p>
        </div>
        <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  `;

  await sendEmail({
    email: order.customerEmail,
    subject: `Order Confirmation #${order.orderNumber} - Fashion's Fusion`,
    html,
  });
}

async function sendRefundEmail(user, order, refundAmount) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#C9A227;padding:20px;text-align:center">
        <h1 style="color:white;margin:0">Fashion's Fusion</h1>
      </div>
      <div style="padding:20px;background:#fff">
        <h2>Refund Processed</h2>
        <p>Hi ${escapeHtml(user.name)},</p>
        <p>Your refund of <strong>₹${refundAmount.toLocaleString('en-IN')}</strong> for order <strong>#${order.orderNumber}</strong> has been processed.</p>
        <p>The refund will be credited to your original payment method within 5-10 business days.</p>
        <p>Refund ID: ${order.refundId}</p>
        <p>Thank you for your patience.</p>
      </div>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Refund Processed for Order #${order.orderNumber} - Fashion's Fusion`,
    html,
  });
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  refundPayment,
  getPaymentDetails,
  getAllPayments,
};
