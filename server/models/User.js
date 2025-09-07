const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[+]?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home'
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpBlockedUntil: Date
}, {
  timestamps: true
});

// Index for geospatial queries and pincode-based searches
userSchema.index({ "addresses.coordinates": "2dsphere" });
userSchema.index({ pincode: 1 });

// Hash password before saving (if password field is added later)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

module.exports = mongoose.model('User', userSchema);