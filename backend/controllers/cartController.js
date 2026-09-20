const Cart = require('../models/Cart');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: items || [] });
    } else {
      cart.items = items || [];
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { product, name, image, price, size, color, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      (item) =>
        item.product.toString() === product &&
        item.size === (size || '') &&
        item.color === (color || '')
    );

    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({
        product,
        name,
        image: image || '',
        price,
        size: size || '',
        color: color || '',
        quantity: quantity || 1,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { product, size, color, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (i) =>
        i.product.toString() === product &&
        i.size === (size || '') &&
        i.color === (color || '')
    );
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { product, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === product &&
          i.size === (size || '') &&
          i.color === (color || '')
        )
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, syncCart, addItem, updateItem, removeItem, clearCart };