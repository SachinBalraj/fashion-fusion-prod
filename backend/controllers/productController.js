const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const HttpError = require('../utils/httpError');
const { isObjectId, clampInt, truncate, scalarOrNull } = require('../utils/validate');
const {
  gridfsIdsFromUrls,
  collectReferencedGridFSIds,
  deleteFilesIfUnreferenced,
  markActive,
} = require('../services/gridfsService');

const categorySlugCache = new Map();
const CATEGORY_CACHE_MAX = 500;

const PERMITTED_PRODUCT_FIELDS = [
  'name', 'description', 'price', 'comparePrice', 'salePrice', 'stock',
  'displayOrder', 'bestSellerOrder', 'newArrivalOrder',
  'isFeatured', 'isBestSeller', 'isNewArrival', 'isActive',
  'category', 'subcategory', 'brand', 'material', 'gender', 'sku',
  'shortDescription', 'fabric', 'thumbnail', 'unit', 'occasion',
  'suitableFor', 'design', 'colour', 'neckline', 'sleeves', 'fit',
  'kurtiStyle', 'bottom', 'setIncludes', 'width', 'size',
  'careInstructions', 'washCare', 'advantages', 'benefits',
  'features', 'keyFeatures', 'sizes', 'colors', 'tags', 'images',
];

const stripUnsafeHtml = (value) => {
  if (value === undefined || value === null) return value;
  return String(value)
    .replace(/<\s*\/?\s*script[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:\s*/gi, '');
};

const PUBLIC_CACHE_CONTROL = 'public, no-cache';

const PUBLIC_LISTING_SELECT =
  '_id name slug price salePrice comparePrice images thumbnail category ratings numReviews stock isFeatured isBestSeller isNewArrival sizes colors brand fabric gender subcategory tags displayOrder bestSellerOrder newArrivalOrder createdAt';

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

const getProducts = async (req, res, next) => {
  try {
    const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
    const limit = clampInt(req.query.limit, 12, 1, 100);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category) {
      const value = scalarOrNull(req.query.category);
      if (value === undefined) {
        throw new HttpError('Invalid category filter', 400);
      }
      filter.category = await resolveCategoryId(String(value));
    }
    if (req.query.gender) {
      const value = scalarOrNull(req.query.gender);
      if (value === undefined) throw new HttpError('Invalid gender filter', 400);
      filter.gender = String(value);
    }
    if (req.query.brand) {
      const value = scalarOrNull(req.query.brand);
      if (value === undefined) throw new HttpError('Invalid brand filter', 400);
      filter.brand = String(value);
    }
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      filter.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
        const min = Number(scalarOrNull(req.query.minPrice));
        if (!Number.isFinite(min) || min < 0) {
          throw new HttpError('Invalid minimum price filter', 400);
        }
        filter.price.$gte = min;
      }
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
        const max = Number(scalarOrNull(req.query.maxPrice));
        if (!Number.isFinite(max) || max < 0) {
          throw new HttpError('Invalid maximum price filter', 400);
        }
        filter.price.$lte = max;
      }
    }
    if (req.query.search) {
      const value = scalarOrNull(req.query.search);
      if (value === undefined) throw new HttpError('Invalid search query', 400);
      filter.$text = { $search: truncate(String(value), 200) };
    }
    if (req.query.isFeatured) {
      const value = scalarOrNull(req.query.isFeatured);
      if (value === undefined) throw new HttpError('Invalid isFeatured filter', 400);
      filter.isFeatured = value === 'true';
    }
    const wantsBestSeller = req.query.isBestSeller === 'true';
    const wantsNewArrival = req.query.isNewArrival === 'true';

    if (req.query.isBestSeller) {
      const value = scalarOrNull(req.query.isBestSeller);
      if (value === undefined) throw new HttpError('Invalid isBestSeller filter', 400);
      filter.isBestSeller = value === 'true';
    }
    if (req.query.isNewArrival) {
      const value = scalarOrNull(req.query.isNewArrival);
      if (value === undefined) throw new HttpError('Invalid isNewArrival filter', 400);
      filter.isNewArrival = value === 'true';
    }

    const sort = {};
    if (req.query.sort) {
      const value = scalarOrNull(req.query.sort);
      if (value === undefined) throw new HttpError('Invalid sort', 400);
      switch (value) {
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
      .select(PUBLIC_LISTING_SELECT)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    if (!req.params.slug || String(req.params.slug).length > 200) {
      throw new HttpError('Product not found', 404);
    }
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const buildValidatedData = async (body, existingProduct = null) => {
  const data = {};
  for (const key of PERMITTED_PRODUCT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      data[key] = body[key];
    }
  }

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
  const referencePrice =
    price !== undefined ? price : existingProduct ? Number(existingProduct.price) : undefined;
  if (
    salePrice !== undefined &&
    salePrice > 0 &&
    referencePrice !== undefined &&
    referencePrice > 0 &&
    salePrice > referencePrice
  ) {
    const error = new Error('Sale price cannot be higher than price');
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

  ['name', 'description', 'shortDescription'].forEach((key) => {
    if (typeof data[key] === 'string') {
      data[key] = stripUnsafeHtml(data[key]).trim();
    }
  });

  return data;
};

const createProduct = async (req, res, next) => {
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
    await performImageCleanup([], product.images);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new HttpError('Product not found', 404);
    }
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
      { returnDocument: 'after', runValidators: true }
    );

    await performImageCleanup(product.images || [], updatedProduct?.images || []);
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new HttpError('Product not found', 404);
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const gridfsIds = gridfsIdsFromUrls(product.images || []);
    await product.deleteOne();
    if (gridfsIds.length > 0) {
      try {
        const referenced = await collectReferencedGridFSIds();
        await deleteFilesIfUnreferenced(gridfsIds, referenced);
      } catch (error) {
        console.error('[PRODUCT] Image cleanup skipped:', error.message);
      }
    }
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

const clearCategorySlugCache = () => categorySlugCache.clear();

const performImageCleanup = async (oldImages, newImages) => {
  try {
    const oldIds = gridfsIdsFromUrls(oldImages);
    const newIds = gridfsIdsFromUrls(newImages);
    const newHex = new Set(newIds.map((id) => id.toHexString()));
    const removed = oldIds.filter((id) => !newHex.has(id.toHexString()));

    if (removed.length > 0) {
      const referenced = await collectReferencedGridFSIds();
      await deleteFilesIfUnreferenced(removed, referenced);
    }
    if (newIds.length > 0) {
      await markActive(newIds);
    }
  } catch (error) {
    console.error('[PRODUCT] Image cleanup skipped:', error.message);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearCategorySlugCache,
};