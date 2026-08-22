const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const resolveProductByIdentifier = async (identifier) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is temporarily unavailable. Please try again.');
  }

  if (!identifier) return null;
  const value = String(identifier).trim();

  if (mongoose.Types.ObjectId.isValid(value)) {
    return Product.findById(value);
  }

  return Product.findOne({ slug: value.toLowerCase() });
};

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, phone } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const validPaymentMethods = ['razorpay', 'cod'];
    const method = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cod';

    const itemsFromDB = await Promise.all(
      orderItems.map(async (item) => {
        const product = await resolveProductByIdentifier(item.product);
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`);
        }
        return {
          product: product._id,
          name: product.name,
          image: product.images?.[0] || item.image || '',
          price: product.price,
          quantity: item.quantity,
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

    for (const item of itemsFromDB) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

const updateOrderToPaid = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

const updateOrderToDelivered = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
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
    res.status(500).json({ message: error.message });
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
