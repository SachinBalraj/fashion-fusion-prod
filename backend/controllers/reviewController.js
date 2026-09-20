const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const HttpError = require('../utils/httpError');
const { isObjectId, clampInt, scalarOrNull, truncate } = require('../utils/validate');

const createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    if (!isObjectId(productId)) {
      throw new HttpError('Product not found', 404);
    }

    const ratingValue = Number(scalarOrNull(rating));
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      throw new HttpError('Rating must be a whole number between 1 and 5', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new HttpError('Product not found', 404);
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: 'You have already reviewed this product' });
    }

    const orders = await Order.find({
      user: req.user._id,
      'orderItems.product': productId,
      isDelivered: true,
    });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: ratingValue,
      title: truncate(String(scalarOrNull(title) ?? ''), 120),
      comment: truncate(String(scalarOrNull(comment) ?? ''), 1000),
      isVerifiedPurchase: orders.length > 0,
    });

    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratings: avgRating.toFixed(1),
      numReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.productId)) {
      throw new HttpError('Product not found', 404);
    }
    const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER);
    const limit = clampInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      reviews,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      throw new HttpError('Review not found', 404);
    }
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.deleteOne();

    const reviews = await Review.find({ product: review.product });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.product, {
        ratings: avgRating.toFixed(1),
        numReviews: reviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(review.product, {
        ratings: 0,
        numReviews: 0,
      });
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getProductReviews, deleteReview };