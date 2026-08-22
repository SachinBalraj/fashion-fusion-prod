const express = require('express');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.get('/slug/:slug', getCategoryBySlug);
router
  .route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
