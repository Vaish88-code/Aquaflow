const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shopkeeper',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  gstNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  photoUrl: {
    type: String,
    trim: true
  },
  pricePerJar: {
    type: Number,
    required: true,
    min: 1
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  operatingHours: {
    open: {
      type: String,
      default: '06:00'
    },
    close: {
      type: String,
      default: '22:00'
    }
  },
  deliveryRadius: {
    type: Number,
    default: 5 // in kilometers
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  monthlyRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries, pincode-based searches, and shopkeeper linking
shopSchema.index({ coordinates: "2dsphere" });
shopSchema.index({ isActive: 1, isVerified: 1 });
shopSchema.index({ pincode: 1 });
shopSchema.index({ shopkeeperId: 1 });

// Calculate average rating
shopSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.rating = totalRating / this.totalReviews;
  return this.save();
};

// Check if shop is currently open
shopSchema.methods.isOpen = function() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  return currentTime >= this.operatingHours.open && currentTime <= this.operatingHours.close;
};

module.exports = mongoose.model('Shop', shopSchema);