const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  image: String,
  size: String,
  color: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    phone: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    customerName: {
      type: String,
      default: '',
    },
    accountClaimToken: {
      type: String,
      default: '',
      index: true,
    },
    accountClaimedAt: Date,
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    refundId: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: Date,
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    trackingUrl: {
      type: String,
      default: '',
    },
    shipmentId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(count + 1).padStart(4, '0');
    this.orderNumber = `FF${year}${month}${seq}`;
  }
});

orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ accountClaimToken: 1 });

module.exports = mongoose.model('Order', orderSchema);
