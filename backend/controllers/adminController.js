const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const slugify = require('../utils/slugify');

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    ordersByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    res.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      revenue,
      recentOrders,
      lowStockProducts,
      ordersByStatus: statusMap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'user' };

    const customers = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      customers,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const ordersCount = await Order.countDocuments({ user: customer._id });

    res.json({ ...customer.toObject(), ordersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminGetProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.isFeatured) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }
    if (req.query.isBestSeller) {
      filter.isBestSeller = req.query.isBestSeller === 'true';
    }
    if (req.query.isNewArrival) {
      filter.isNewArrival = req.query.isNewArrival === 'true';
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc': sort.price = 1; break;
        case 'price_desc': sort.price = -1; break;
        case 'newest': sort.createdAt = -1; break;
        case 'rating': sort.ratings = -1; break;
        case 'name': sort.name = 1; break;
        default: sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const duplicateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();
    delete productObj._id;
    delete productObj.createdAt;
    delete productObj.updatedAt;

    const newName = `${product.name} (Copy)`;
    const newSlug = slugify(newName) + '-' + Date.now();

    const duplicated = await Product.create({
      ...productObj,
      name: newName,
      slug: newSlug,
      images: [...product.images],
    });

    res.status(201).json(duplicated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  getSettings,
  updateSettings,
  adminGetProducts,
  duplicateProduct,
};
