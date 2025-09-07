const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const shopkeeperSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[+]?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  verificationCode: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for authentication and verification
shopkeeperSchema.index({ email: 1 });
shopkeeperSchema.index({ phoneNumber: 1 });
shopkeeperSchema.index({ isVerified: 1, isActive: 1 });

// Hash password before saving
shopkeeperSchema.pre('save', async function(next) {
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
shopkeeperSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification code
shopkeeperSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return code;
};

// Verify code
shopkeeperSchema.methods.verifyCode = function(code) {
  if (!this.verificationCode || !this.verificationCode.code) {
    return false;
  }
  
  if (Date.now() > this.verificationCode.expiresAt) {
    this.verificationCode = undefined;
    return false;
  }
  
  if (this.verificationCode.attempts >= 3) {
    this.verificationCode = undefined;
    return false;
  }
  
  if (this.verificationCode.code !== code) {
    this.verificationCode.attempts += 1;
    return false;
  }
  
  // Code is valid, mark as verified
  this.isVerified = true;
  this.verificationCode = undefined;
  return true;
};

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);
