const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { clearCategorySlugCache } = require('./productController');
const HttpError = require('../utils/httpError');
const { isObjectId, truncate, scalarOrNull } = require('../utils/validate');

const PUBLIC_CACHE_CONTROL = 'public, max-age=60, s-maxage=60, stale-while-revalidate=86400';

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoriesWithCounts = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          let: { catId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$category', '$$catId'] },
                isActive: true,
              },
            },
            { $count: 'count' },
          ],
          as: 'productCounts',
        },
      },
      {
        $addFields: {
          count: { $ifNull: [{ $arrayElemAt: ['$productCounts.count', 0] }, 0] },
        },
      },
      { $project: { productCounts: 0 } },
      { $sort: { order: 1 } },
    ]);
    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    if (!req.params.slug || String(req.params.slug).length > 200) {
      throw new HttpError('Category not found', 404);
    }
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const categoryData = { ...req.body };
    categoryData.slug = slugify(categoryData.name);
    const category = await Category.create(categoryData);
    clearCategorySlugCache();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new HttpError('Category not found', 404);
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    clearCategorySlugCache();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new HttpError('Category not found', 404);
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    clearCategorySlugCache();
    res.json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoriesWithCounts,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
