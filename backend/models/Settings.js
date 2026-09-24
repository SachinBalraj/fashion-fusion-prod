const mongoose = require('mongoose');

const SHOWCASE_SLOT_MIN = 1;
const SHOWCASE_SLOT_MAX = 5;
const SHOWCASE_DESCRIPTION_MAX = 100;
const SHOWCASE_SLUG_MAX = 120;
const SHOWCASE_PRODUCT_MAX = 3;

const showcaseSlotSchema = new mongoose.Schema(
  {
    slot: { type: Number, required: true, min: SHOWCASE_SLOT_MIN, max: SHOWCASE_SLOT_MAX },
    image: { type: String, default: '', trim: true },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: SHOWCASE_DESCRIPTION_MAX,
    },
    slug: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
      maxlength: SHOWCASE_SLUG_MAX,
    },
    productIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length <= SHOWCASE_PRODUCT_MAX;
        },
        message: `A showcase collection supports at most ${SHOWCASE_PRODUCT_MAX} products`,
      },
    },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Fashion's Fusion" },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: 'Ellampillai, Salem - 637502, Tamil Nadu, India' },
    logo: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    productShowcase: {
      type: [showcaseSlotSchema],
      default: [],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length <= SHOWCASE_SLOT_MAX;
        },
        message: `Products page showcase supports at most ${SHOWCASE_SLOT_MAX} slots`,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
module.exports.SHOWCASE_SLOT_MAX = SHOWCASE_SLOT_MAX;
module.exports.SHOWCASE_DESCRIPTION_MAX = SHOWCASE_DESCRIPTION_MAX;
module.exports.SHOWCASE_SLUG_MAX = SHOWCASE_SLUG_MAX;
module.exports.SHOWCASE_PRODUCT_MAX = SHOWCASE_PRODUCT_MAX;
