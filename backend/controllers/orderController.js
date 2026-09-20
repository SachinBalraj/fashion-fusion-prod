const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { sanitizeDbError } = require('../config/db');
const HttpError = require('../utils/httpError');
const { isObjectId, clampInt, scalarOrNull } = require('../utils/validate');

const AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveProductByIdentifier = async (identifier, fallbackName) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      console.error(`[ORDER] MongoDB unavailable during product resolution: ${sanitizeDbError(e)}`);
      throw new Error('Database is temporarily unavailable. Please try again.');
    }
  }

  if (!identifier) return null;
  const value = String(identifier).trim();

  if (mongoose.Types.ObjectId.isValid(value)) {
    const doc = await Product.findById(value);
    if (doc) return doc;
  }

  const bySlug = await Product.findOne({ slug: value.toLowerCase() });
  if (bySlug) return bySlug;

  if (fallbackName && typeof fallbackName === 'string') {
    const byName = await Product.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(fallbackName.trim())}$`, 'i') } });
    if (byName) return byName;
  }

  return null;
};

const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, phone } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || typeof shippingAddress !== 'object' || Array.isArray(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    for (const field of ['street', 'city', 'state', 'zip']) {
      const value = shippingAddress[field];
      if (typeof value !== 'string' || !value.trim()) {
        return res.status(400).json({ message: 'Complete shipping address is required' });
      }
    }

    const validPaymentMethods = ['razorpay', 'cod'];
    const method = validPaymentMethods.includes(paymentMethod) ? paymentMethod : null;
    if (!method) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const itemsFromDB = await Promise.all(
      orderItems.map(async (item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          throw new HttpError('Invalid order item', 400);
        }
        const product = await resolveProductByIdentifier(item.product, item.name);
        if (!product) {
          throw new HttpError(`Product "${item.product}" not found. Please refresh your cart.`, 404);
        }
        const stock = Number(product.stock) || 0;
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new HttpError('Invalid item quantity', 400);
        }
        if (stock < quantity) {
          throw new HttpError(`Insufficient stock for "${product.name}". Available: ${stock}, requested: ${quantity}.`, 409);
        }
        return {
          product: product._id,
          name: product.name,
          image: product.images?.[0] || item.image || '',
          price: product.price,
          quantity,
          size: item.size,
          color: item.color,
        };
      })
    );

    const itemsPrice = Math.round(itemsFromDB.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) * 100) / 100;
    const shippingPrice = 80;
    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
    const discountPrice = 0;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice - discountPrice) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      orderItems: itemsFromDB,
      shippingAddress,
      phone: phone || req.user.phone || '',
      customerEmail: req.user.email || '',
      customerName: req.user.name || '',
      paymentMethod: method,
      paymentStatus: 'pending',
      orderStatus: method === 'cod' ? 'confirmed' : 'pending',
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice,
      isPaid: false,
    });

    const decrementedItems = [];
    let stockOk = true;
    for (const item of itemsFromDB) {
      const decremented = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after' }
      );
      if (!decremented) {
        stockOk = false;
        break;
      }
      decrementedItems.push(item);
    }
    if (!stockOk) {
      for (const item of decrementedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
      await Order.deleteMany({ _id: order._id });
      throw new AppError('Insufficient stock for one or more items. Please refresh your cart.', 409);
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').limit(100);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      req.user.role !== 'admin' &&
      (!order.user || order.user._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderToPaid = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

const updateOrderToDelivered = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { orderStatus, isDelivered, trackingNumber, trackingUrl, shipmentId } = req.body || {};

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber || '';
    }

    if (trackingUrl !== undefined) {
      order.trackingUrl = trackingUrl || '';
    }

    if (shipmentId !== undefined) {
      order.shipmentId = shipmentId || '';
    }

    const newDeliveredState = isDelivered === true || orderStatus === 'delivered';
    order.isDelivered = newDeliveredState;

    if (newDeliveredState) {
      order.deliveredAt = order.deliveredAt || Date.now();
    } else if (orderStatus && orderStatus !== 'delivered') {
      order.deliveredAt = undefined;
    }

    if (orderStatus === 'shipped' || orderStatus === 'out_for_delivery') {
      if (!order.trackingNumber && !order.shipmentId) {
        return res.status(400).json({ message: 'Shipment ID is required before marking an order as shipped.' });
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
    const limit = clampInt(req.query.limit, 15, 1, 100);
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
};
