const User = require('../models/User');
const { generateCookieToken } = require('../utils/generateToken');
const Order = require('../models/Order');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, phone: phone || '' });
    generateCookieToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
    }

    generateCookieToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    delete req.body.role;
    delete req.body.isActive;
    delete req.body._id;

    if (req.body.currentPassword && req.body.password) {
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = req.body.password;
    } else if (req.body.password) {
      return res.status(400).json({ message: 'Current password is required to change password' });
    }

    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone ?? user.phone;
    user.avatar = req.body.avatar || user.avatar;
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const claimGuestOrder = async (req, res) => {
  try {
    const { orderId, claimToken } = req.body;

    if (!orderId || !claimToken) {
      return res.status(400).json({ message: 'orderId and claimToken are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user) {
      if (order.user.toString() === req.user._id.toString()) {
        return res.json({ success: true, orderId: order._id, alreadyClaimed: true });
      }
      return res.status(409).json({ message: 'Order is already linked to another account' });
    }

    if (!order.accountClaimToken || order.accountClaimToken !== claimToken) {
      return res.status(400).json({ message: 'Invalid claim token' });
    }

    order.user = req.user._id;
    order.accountClaimToken = '';
    order.accountClaimedAt = new Date();
    if (!order.customerEmail) order.customerEmail = req.user.email || '';
    if (!order.customerName) order.customerName = req.user.name || '';
    if (!order.phone) order.phone = req.user.phone || '';
    await order.save();

    return res.json({ success: true, orderId: order._id, orderNumber: order.orderNumber });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to claim order' });
  }
};

module.exports = { register, login, logout, getMe, updateProfile, claimGuestOrder };
