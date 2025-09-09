const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../utils/otpService');
const { sendSMS } = require('../utils/smsService');

// Generate JWT token
const generateToken = (userId, type = 'user') => {
  return jwt.sign(
    { id: userId, type },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Send OTP to phone number
const sendOTPToUser = async (req, res) => {
  try {
    const { phoneNumber, pincode } = req.validatedData;

    // Check if user exists, if not create one
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // Create new user with pincode
      user = new User({
        phoneNumber,
        pincode: pincode || '000000' // Default pincode if not provided
      });
      await user.save();
    } else if (pincode && user.pincode !== pincode) {
      // Update user's pincode if provided and different
      user.pincode = pincode;
      await user.save();
    }

    // Check if user is blocked due to too many OTP attempts
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    }

    // Send OTP
    const otpSent = await sendOTP(phoneNumber);
    
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    // Send SMS with OTP (in production, this would be handled by sendOTP function)
    await sendSMS(phoneNumber, `Your AquaFlow OTP is: 123456. Valid for 5 minutes. Do not share with anyone.`);

    res.json({
      success: true,
      message: 'OTP sent to your phone number successfully.',
      data: {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        pincode: user.pincode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
      error: error.message
    });
  }
};

// Verify OTP and login
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.validatedData;

    // Find user
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Check if user is blocked due to too many OTP attempts
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(phoneNumber, otp);
    
    if (!isValidOTP) {
      user.otpAttempts += 1;
      
      // Block user after 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.otpBlockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Reset OTP attempts on successful login
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email
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

// Get nearby shops
const getNearbyShops = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, pincode, city } = req.query;

    let query = { isActive: true, isVerified: true };

    // Priority: pincode > city > coordinates
    if (pincode) {
      query.pincode = pincode;
    } else if (city) {
      query.city = new RegExp(`^${city}$`, 'i');
    } else if (latitude && longitude) {
      // If coordinates provided and not filtered by pincode/city, find nearby shops
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    const shops = await Shop.find(query)
      .select('shopName address city pincode photoUrl pricePerJar rating totalReviews coordinates operatingHours')
      .limit(50);

    // Add distance and availability info
    const shopsWithInfo = shops.map(shop => ({
      ...shop.toObject(),
      isOpen: shop.isOpen(),
      distance: (latitude && longitude && !pincode && !city) ? 
        calculateDistance(latitude, longitude, shop.coordinates.latitude, shop.coordinates.longitude) : 
        null
    }));

    res.json({
      success: true,
      data: {
        shops: shopsWithInfo,
        total: shops.length,
        searchType: pincode ? 'pincode' : city ? 'city' : 'coordinates'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
};

// Get shops by pincode (for user dashboard)
const getShopsByPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required'
      });
    }

    // Find shops in the specified pincode
    const shops = await Shop.find({ 
      pincode: pincode,
      isActive: true
    }).select('shopName address city pincode photoUrl pricePerJar rating totalReviews coordinates operatingHours isVerified');

    // Add additional information to each shop
    const shopsWithInfo = shops.map(shop => ({
      ...shop.toObject(),
      isOpen: shop.isOpen(),
      distance: 0, // Will be calculated on frontend if coordinates are available
      deliveryTime: '25-35 min' // Default delivery time
    }));

    res.json({
      success: true,
      data: {
        shops: shops.map(shop => ({
          ...shop.toObject(),
          isOpen: shop.isOpen(),
          distance: 0,
          deliveryTime: '25-35 min'
        })),
        total: shops.length,
        pincode: pincode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shops by pincode',
      error: error.message
    });
  }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Place order (simple version for real-time testing)
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopId, quantity, deliveryAddress, paymentMethod = 'cash', notes, customerName, contactNumber } = req.body;

    // Validate required fields
    if (!shopId || !quantity || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID, quantity, and delivery address are required'
      });
    }

    // Verify shop exists and is active
    const shop = await Shop.findOne({ _id: shopId, isActive: true, isVerified: true });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found or inactive'
      });
    }

    // Calculate total amount
    const totalAmount = quantity * shop.pricePerJar;

    // Optionally enrich user profile with provided name/contact
    try {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        let changed = false;
        if (customerName) { userDoc.name = customerName; changed = true; }
        if (contactNumber) { userDoc.phoneNumber = contactNumber; changed = true; }
        if (deliveryAddress?.address) {
          const existing = (userDoc.addresses || []);
          if (!existing.find(a => a.address === deliveryAddress.address)) {
            existing.unshift({ address: deliveryAddress.address, type: 'home', isDefault: true });
            userDoc.addresses = existing;
            changed = true;
          }
        }
        if (changed) { await userDoc.save(); }
      }
    } catch {}

    // Create order
    const order = new Order({
      userId,
      shopId,
      orderType: 'one-time',
      quantity,
      pricePerJar: shop.pricePerJar,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    await order.save();

    // Populate order with shop and user details for response
    await order.populate('shopId', 'shopName address phoneNumber');
    await order.populate('userId', 'name phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Shopkeeper will be notified.',
      data: {
        order: {
          orderNumber: order.orderNumber,
          shopName: shop.shopName,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          status: order.status,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
};

module.exports = {
  sendOTP: sendOTPToUser,
  verifyOTP: verifyOTPAndLogin,
  getNearbyShops,
  getShopsByPincode,
  placeOrder,
  // Public: fetch shops by state/pincode without auth, for frontend compatibility
  getShopsByLocation: async (req, res) => {
    try {
      const { state, pincode } = req.query;

      if (!state && !pincode) {
        return res.status(400).json({ success: false, message: 'state or pincode is required' });
      }

      const query = { isActive: true, isVerified: true };
      if (state) {
        query['address'] = { $regex: new RegExp(state, 'i') };
      }
      // If shops store pincode in address, include it in search to narrow results
      if (pincode) {
        query['address'] = query['address']
          ? { $regex: new RegExp(`${state}.*${pincode}|${pincode}`, 'i') }
          : { $regex: new RegExp(pincode, 'i') };
      }

      const shops = await Shop.find(query)
        .select('shopName address photoUrl pricePerJar rating totalReviews coordinates operatingHours');

      const shopsWithInfo = shops.map(shop => ({
        ...shop.toObject(),
        isOpen: shop.isOpen(),
        distance: null
      }));

      res.json({
        success: true,
        data: { shops: shopsWithInfo, total: shopsWithInfo.length }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching shops', error: error.message });
    }
  }
};

// Additional handlers appended to module.exports
module.exports.submitComplaint = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { subject, description, priority, orderId, shopId } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId && orderId) {
      const order = await Order.findById(orderId).select('shopId');
      resolvedShopId = order?.shopId;
    }
    if (!resolvedShopId) {
      const latest = await Order.findOne({ userId }).sort({ createdAt: -1 }).select('shopId');
      resolvedShopId = latest?.shopId;
    }
    if (!resolvedShopId) {
      return res.status(400).json({ success: false, message: 'Could not determine shop for this complaint.' });
    }

    const complaint = await Complaint.create({
      userId,
      orderId: orderId || undefined,
      shopId: resolvedShopId,
      subject,
      description,
      priority: priority || 'medium',
    });

    return res.json({ success: true, message: 'Complaint submitted', data: { complaint } });
  } catch (e) {
    console.error('submitComplaint error', e);
    return res.status(500).json({ success: false, message: 'Failed to submit complaint' });
  }
};