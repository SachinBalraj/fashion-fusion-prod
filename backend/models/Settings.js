const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
