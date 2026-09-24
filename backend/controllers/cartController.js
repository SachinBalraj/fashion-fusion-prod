const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { isObjectId, clampInt } = require('../utils/validate');

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

const effectivePrice = (product) =>
  product.salePrice > 0 && product.salePrice < product.price
    ? product.salePrice
    : product.price;

const resolveItem = async (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  if (!isObjectId(item.product)) return null;
  const productDoc = await Product.findById(item.product);
  if (!productDoc || !productDoc.isActive) return null;
  const quantity = clampInt(item.quantity, 1, 1, 99);
  if (!quantity) return null;
  const size = typeof item.size === 'string' ? item.size.trim() : '';
  const color = typeof item.color === 'string' ? item.color.trim() : '';
  if (productDoc.sizes?.length && size && !productDoc.sizes.includes(size)) return null;
  if (productDoc.colors?.length && color && !productDoc.colors.includes(color)) return null;
  const stock = Number(productDoc.stock) || 0;
  return {
    product: productDoc._id,
    name: productDoc.name,
    image: productDoc.images?.[0] || '',
    price: effectivePrice(productDoc),
    size,
    color,
    quantity: Math.min(quantity, stock),
  };
};

const syncCart = async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body.items) ? req.body.items : [];
    const resolved = (await Promise.all(incoming.map(resolveItem))).filter(Boolean);
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: resolved });
    } else {
      cart.items = resolved;
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { product: productRef, size, color } = req.body;
    const quantity = clampInt(req.body.quantity, 1, 1, 99);

    if (!isObjectId(productRef) || !quantity) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const productDoc = await Product.findById(productRef);
    if (!productDoc || !productDoc.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const stock = Number(productDoc.stock) || 0;
    if (stock < quantity) {
      return res.status(409).json({ message: `Only ${stock} left in stock` });
    }
    if (productDoc.sizes?.length && size && !productDoc.sizes.includes(size)) {
      return res.status(400).json({ message: `Size "${size}" is not available` });
    }
    if (productDoc.colors?.length && color && !productDoc.colors.includes(color)) {
      return res.status(400).json({ message: `Color "${color}" is not available` });
    }
    const price = effectivePrice(productDoc);

    const existing = cart.items.find(
      (item) =>
        item.product.toString() === productRef &&
        item.size === (size || '') &&
        item.color === (color || '')
    );

    if (existing) {
      existing.quantity += quantity;
      existing.price = price;
    } else {
      cart.items.push({
        product: productRef,
        name: productDoc.name,
        image: productDoc.images?.[0] || '',
        price,
        size: size || '',
        color: color || '',
        quantity,
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
    const { product, size, color } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (i) =>
        i.product.toString() === product &&
        i.size === (size || '') &&
        i.color === (color || '')
    );
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    const quantity = clampInt(req.body.quantity, undefined, 1, 99);
    if (!quantity) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    if (!isObjectId(product)) {
      return res.status(400).json({ message: 'Invalid product' });
    }
    const productDoc = await Product.findById(product);
    if (!productDoc || !productDoc.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (productDoc.sizes?.length && size && !productDoc.sizes.includes(size)) {
      return res.status(400).json({ message: `Size "${size}" is not available` });
    }
    if (productDoc.colors?.length && color && !productDoc.colors.includes(color)) {
      return res.status(400).json({ message: `Color "${color}" is not available` });
    }
    const stock = Number(productDoc.stock) || 0;
    if (quantity > stock) {
      return res.status(409).json({ message: `Only ${stock} left in stock` });
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