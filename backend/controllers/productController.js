const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');

const categorySlugCache = new Map();
const CATEGORY_CACHE_MAX = 500;

const resolveCategoryId = async (value) => {
  if (!value || typeof value !== 'string') return value;
  const str = value.trim();
  if (!str) return value;
  if (mongoose.Types.ObjectId.isValid(str)) return str;
  if (categorySlugCache.has(str)) return categorySlugCache.get(str);
  const category = await Category.findOne({ slug: str }).select('_id');
  if (category) {
    if (categorySlugCache.size >= CATEGORY_CACHE_MAX) {
      categorySlugCache.clear();
    }
    categorySlugCache.set(str, category._id);
    return category._id;
  }
  return str;
};

const parseStringArray = (value) => {
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (item === undefined || item === null) continue;
    const cleaned = String(item).trim();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }
  return result;
};

const parseImageArray = (value) => {
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [value];
  return list
    .map((img) => (img ? String(img).trim() : ''))
    .filter((img) => img.startsWith('/') || img.startsWith('http'));
};

const toNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) return undefined;
  return num;
};

const toBoolean = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return Boolean(value);
};

const generateUniqueSlug = async (baseSlug, excludeId) => {
  const filter = { slug: baseSlug };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  const existing = await Product.findOne(filter).select('slug');
  if (!existing) return baseSlug;

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;
  while (await Product.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select('slug')) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
};

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = await resolveCategoryId(req.query.category);
    }
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.isFeatured) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }
    const wantsBestSeller = req.query.isBestSeller === 'true';
    const wantsNewArrival = req.query.isNewArrival === 'true';

    if (req.query.isBestSeller) {
      filter.isBestSeller = wantsBestSeller;
    }
    if (req.query.isNewArrival) {
      filter.isNewArrival = wantsNewArrival;
    }

    const sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'displayOrder':
          sort.displayOrder = 1;
          sort.createdAt = -1;
          break;
        case 'price_asc':
        case 'price-asc':
          sort.price = 1;
          break;
        case 'price_desc':
        case 'price-desc':
          sort.price = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'rating':
          sort.ratings = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else if (wantsBestSeller) {
      sort.bestSellerOrder = 1;
      sort.createdAt = -1;
    } else if (wantsNewArrival) {
      sort.newArrivalOrder = 1;
      sort.createdAt = -1;
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

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildValidatedData = async (body, existingProduct = null) => {
  const data = { ...body };

  data.name = typeof data.name === 'string' ? data.name.trim() : data.name;

  if (data.description !== undefined && data.description !== null) {
    data.description = String(data.description).trim();
  }

  const price = toNonNegativeNumber(data.price);
  const comparePrice = toNonNegativeNumber(data.comparePrice);
  const salePrice = toNonNegativeNumber(data.salePrice);
  const stock = toNonNegativeNumber(data.stock);
  const displayOrder = toNonNegativeNumber(data.displayOrder);
  const bestSellerOrder = toNonNegativeNumber(data.bestSellerOrder);
  const newArrivalOrder = toNonNegativeNumber(data.newArrivalOrder);

  if (price !== undefined && price < 0) {
    const error = new Error('Price cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (comparePrice !== undefined && comparePrice < 0) {
    const error = new Error('Compare price cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (salePrice !== undefined && salePrice < 0) {
    const error = new Error('Sale price cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (stock !== undefined && stock < 0) {
    const error = new Error('Stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (bestSellerOrder !== undefined && bestSellerOrder < 0) {
    const error = new Error('Best Seller Order cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (newArrivalOrder !== undefined && newArrivalOrder < 0) {
    const error = new Error('New Arrival Order cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  data.price = price;
  data.comparePrice = comparePrice;
  data.salePrice = salePrice;
  data.stock = stock;
  data.displayOrder = displayOrder;
  data.bestSellerOrder = bestSellerOrder;
  data.newArrivalOrder = newArrivalOrder;

  ['isFeatured', 'isBestSeller', 'isNewArrival', 'isActive'].forEach((key) => {
    if (body[key] !== undefined) data[key] = toBoolean(body[key]);
  });

  ['subcategory', 'brand', 'material', 'gender', 'sku', 'shortDescription', 'fabric', 'thumbnail', 'unit', 'occasion', 'suitableFor', 'design', 'colour', 'neckline', 'sleeves', 'fit', 'kurtiStyle', 'bottom', 'setIncludes', 'width', 'size'].forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      data[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
    }
  });

  ['careInstructions', 'washCare', 'advantages', 'benefits', 'features', 'keyFeatures'].forEach((key) => {
    const parsed = parseStringArray(data[key]);
    if (parsed !== undefined) data[key] = parsed;
  });

  const sizes = parseStringArray(data.sizes);
  if (sizes !== undefined) data.sizes = sizes;
  const colors = parseStringArray(data.colors);
  if (colors !== undefined) data.colors = colors;
  const tags = parseStringArray(data.tags);
  if (tags !== undefined) data.tags = tags;

  const images = parseImageArray(data.images);
  if (images !== undefined) data.images = images;

  if (data.category !== undefined && data.category !== '') {
    data.category = await resolveCategoryId(data.category);
  } else if (data.category === '') {
    delete data.category;
  }

  return data;
};

const createProduct = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!req.body.description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!req.body.price && req.body.price !== 0) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (!req.body.category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const productData = await buildValidatedData(req.body);
    productData.slug = await generateUniqueSlug(slugify(productData.name));
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedData = await buildValidatedData(req.body, product);
    if (updatedData.name && updatedData.name !== product.name) {
      updatedData.slug = await generateUniqueSlug(slugify(updatedData.name), product._id);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCategorySlugCache = () => categorySlugCache.clear();

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearCategorySlugCache,
};