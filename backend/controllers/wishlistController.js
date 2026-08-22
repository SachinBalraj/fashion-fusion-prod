const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const syncWishlist = async (req, res) => {
  try {
    const { items } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: items || [] });
    } else {
      wishlist.items = items || [];
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { product, name, image, price, category, brand, slug } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    const exists = wishlist.items.some(
      (item) => item.product.toString() === product
    );
    if (exists) {
      return res.json(wishlist);
    }

    wishlist.items.push({
      product,
      name,
      image: image || '',
      price,
      category: category || '',
      brand: brand || '',
      slug: slug || '',
    });
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const { product } = req.body;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.items = wishlist.items.filter(
      (i) => i.product.toString() !== product
    );
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, syncWishlist, addItem, removeItem, clearWishlist };
