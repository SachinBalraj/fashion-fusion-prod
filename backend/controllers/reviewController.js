const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

const createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

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
      rating,
      title,
      comment,
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
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProductReviews, deleteReview };
