const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { clearCategorySlugCache } = require('./productController');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoriesWithCounts = async (req, res) => {
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
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
