const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      return `WJ${Date.now()}${randomSuffix}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  orderType: {
    type: String,
    enum: ['one-time', 'subscription'],
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: function() {
      return this.orderType === 'subscription';
    }
  },
  subscriptionPlan: {
    type: String,
    enum: ['5-jars', '8-jars', '10-jars', '15-jars', '30-jars', '45-jars'],
    required: function() {
      return this.orderType === 'subscription';
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerJar: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    address: {
      type: String,
      required: true
    },
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'wallet', 'cash', 'subscription'],
    required: true
  },
  paymentId: String,
  deliveryBoy: {
    name: String,
    phone: String,
    currentLocation: {
      latitude: Number,
      longitude: Number
    }
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
}, {
  timestamps: true
});

// Note: orderNumber is generated via default above so validation passes

// Index for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ shopId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);