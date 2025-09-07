const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../utils/otpService');

// Generate JWT token for shop
const generateToken = (shopId) => {
  return jwt.sign(
    { id: shopId, type: 'shop' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Shop signup
const signup = async (req, res) => {
  try {
    const { 
      phoneNumber, 
      email,
      shopName, 
      ownerName, 
      address, 
      city,
      pincode,
      latitude, 
      longitude, 
      gstNumber, 
      photoUrl, 
      pricePerJar 
    } = req.validatedData;

    // Check if shop already exists
    const existingShop = await Shop.findOne({ 
      $or: [{ phoneNumber }, { gstNumber }, ...(email ? [{ email }] : [])] 
    });
    
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'Shop already exists with this phone number or GST number'
      });
    }

    // Create new shop
    const shop = new Shop({
      phoneNumber,
      email,
      shopName,
      ownerName,
      address,
      city,
      pincode,
      coordinates: {
        latitude,
        longitude
      },
      gstNumber,
      photoUrl,
      pricePerJar
    });

    await shop.save();

    // Send OTP for verification
    const otpSent = await sendOTP(phoneNumber);
    
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Shop registered but failed to send OTP. Please contact support.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully. OTP sent for verification.',
      data: {
        shopId: shop._id,
        shopName: shop.shopName,
        phoneNumber: shop.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during shop registration',
      error: error.message
    });
  }
};

// Shop login
const login = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Find shop
    const shop = await Shop.findOne({ phoneNumber });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found. Please register first.'
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(phoneNumber, otp);
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Generate token
    const token = generateToken(shop._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          phoneNumber: shop.phoneNumber,
          address: shop.address,
          isVerified: shop.isVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get shop orders
const getOrders = async (req, res) => {
  try {
    const shopId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    let query = { shopId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'phoneNumber name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Mark order as delivered
const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.user.id;

    const order = await Order.findOne({ _id: id, shopId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order already marked as delivered'
      });
    }

    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    await order.save();

    // Update shop statistics
    await Shop.findByIdAndUpdate(shopId, {
      $inc: { 
        totalOrders: 1,
        monthlyRevenue: order.totalAmount
      }
    });

    res.json({
      success: true,
      message: 'Order marked as delivered successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Get shop subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const shopId = req.user.id;
    const { status = 'active', page = 1, limit = 20 } = req.query;

    const subscriptions = await Subscription.find({ shopId, status })
      .populate('userId', 'phoneNumber name')
      .sort({ nextDeliveryDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments({ shopId, status });

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  getOrders,
  markDelivered,
  getSubscriptions
};