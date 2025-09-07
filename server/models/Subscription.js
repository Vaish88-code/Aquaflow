const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
  plan: {
    type: String,
    enum: ['5-jars', '8-jars', '10-jars', '15-jars', '30-jars', '45-jars'],
    required: true
  },
  jarsPerMonth: {
    type: Number,
    required: true
  },
  pricePerJar: {
    type: Number,
    required: true
  },
  monthlyAmount: {
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
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  deliveryFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    default: 'weekly'
  },
  jarsDeliveredThisMonth: {
    type: Number,
    default: 0
  },
  jarsOrderedThisMonth: {
    type: Number,
    default: 0
  },
  currentMonthBill: {
    type: Number,
    default: 0
  },
  deliveryHistory: [
    {
      date: { type: Date, default: Date.now },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
      notes: { type: String }
    }
  ],
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  autoRenewal: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ shopId: 1, status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);