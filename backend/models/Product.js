const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      default: '',
    },
    images: [String],
    sizes: [String],
    colors: [String],
    tags: [String],
    brand: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'],
      default: 'unisex',
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    fabric: {
      type: String,
      default: '',
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    bestSellerOrder: {
      type: Number,
      default: 0,
    },
    newArrivalOrder: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    occasion: {
      type: String,
      default: '',
    },
    suitableFor: {
      type: String,
      default: '',
    },
    careInstructions: [String],
    design: {
      type: String,
      default: '',
    },
    colour: {
      type: String,
      default: '',
    },
    neckline: {
      type: String,
      default: '',
    },
    sleeves: {
      type: String,
      default: '',
    },
    fit: {
      type: String,
      default: '',
    },
    kurtiStyle: {
      type: String,
      default: '',
    },
    bottom: {
      type: String,
      default: '',
    },
    setIncludes: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    washCare: [String],
    advantages: [String],
    benefits: [String],
    features: [String],
    keyFeatures: [String],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, isActive: 1, displayOrder: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isBestSeller: 1, bestSellerOrder: 1, createdAt: -1 });
productSchema.index({ isNewArrival: 1, newArrivalOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
