const Shopkeeper = require('../models/Shopkeeper');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('../utils/otpService');

// Generate JWT token for shopkeeper
const generateToken = (shopkeeperId) => {
  return jwt.sign(
    { id: shopkeeperId, type: 'shopkeeper' },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: '30d' }
  );
};

// Shopkeeper registration
const registerShopkeeper = async (req, res) => {
  try {
    const { 
      ownerName, 
      email, 
      password, 
      phoneNumber, 
      shopName, 
      address, 
      city,
      pincode,
      state,
      gstNumber, 
      pricePerJar,
      latitude,
      longitude
    } = req.body;
    
    // Validate required fields
    if (!ownerName || !email || !password || !phoneNumber || !shopName || !address || !pincode || !state || !gstNumber || !pricePerJar) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    // Check if shopkeeper already exists
    const existingShopkeeper = await Shopkeeper.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phoneNumber }] 
    });
    
    if (existingShopkeeper) {
      return res.status(400).json({
        success: false,
        message: 'Shopkeeper already exists with this email or phone number'
      });
    }

    // Check if shop already exists with same GST or phone
    const existingShop = await Shop.findOne({ 
      $or: [{ gstNumber }, { phoneNumber }] 
    });
    
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'Shop already exists with this GST number or phone number'
      });
    }

    // Create new shopkeeper
    const shopkeeper = new Shopkeeper({
      ownerName,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      isVerified: true, // Auto-verify for immediate login
      isActive: true
    });

    // Generate verification code (for future use)
    const verificationCode = shopkeeper.generateVerificationCode();
    
    await shopkeeper.save();

    // Create shop linked to shopkeeper
    const shop = new Shop({
      shopkeeperId: shopkeeper._id,
      phoneNumber,
      email: email.toLowerCase(),
      shopName,
      ownerName,
      address,
      city,
      pincode,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      gstNumber,
      pricePerJar: parseFloat(pricePerJar),
      isActive: true,
      isVerified: true // Auto-verify shop as well
    });

    await shop.save();

    // Generate JWT token for immediate login
    const token = generateToken(shopkeeper._id);

    // Send OTP for phone verification (optional)
    const otpSent = await sendOTP(phoneNumber);
    
    if (!otpSent) {
      console.log('Warning: Failed to send OTP for phone verification');
    }

    res.status(201).json({
      success: true,
      message: 'Shopkeeper and shop registered successfully! You are now logged in.',
      data: {
        token,
        shopkeeper: {
          id: shopkeeper._id,
          email: shopkeeper.email,
          ownerName: shopkeeper.ownerName,
          shopName: shop.shopName,
          contactNumber: shopkeeper.phoneNumber,
          address: shop.address,
          pincode: shop.pincode,
          state: shop.state,
          city: shop.city,
          gstNumber: shop.gstNumber,
          pricePerJar: shop.pricePerJar,
          isVerified: shopkeeper.isVerified,
          lastLogin: new Date()
        },
        shopkeeperId: shopkeeper._id,
        shopId: shop._id,
        message: 'Registration completed successfully!'
      }
    });
  } catch (error) {
    console.error('Shopkeeper registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Shopkeeper login
const loginShopkeeper = async (req, res) => {
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    // Try to find existing shopkeeper by email
    let shopkeeper = await Shopkeeper.findOne({ email: rawEmail });
    let createdFromShop = false;

    // If not found, attempt to migrate existing Shop into a Shopkeeper account on-the-fly
    if (!shopkeeper) {
      const existingShop = await Shop.findOne({ email: rawEmail });
      if (existingShop) {
        // Create a shopkeeper from existing shop record
        shopkeeper = new Shopkeeper({
          email: rawEmail,
          password, // will be hashed by pre-save hook
          ownerName: existingShop.ownerName || existingShop.shopName || 'Owner',
          phoneNumber: existingShop.phoneNumber,
          isVerified: true,
          isActive: true
        });
        await shopkeeper.save();
        // Link shop to this new shopkeeper
        existingShop.shopkeeperId = shopkeeper._id;
        await existingShop.save();
        createdFromShop = true;
      }
    }

    if (!shopkeeper) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    if (!shopkeeper.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // If we just created from Shop, password is the one provided; otherwise compare
    const isPasswordValid = createdFromShop ? true : await shopkeeper.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Auto-verify legacy accounts to allow immediate login
    if (!shopkeeper.isVerified) {
      shopkeeper.isVerified = true;
    }

    // Update last login
    shopkeeper.lastLogin = new Date();
    await shopkeeper.save();

    // Get shop details (by linked shopkeeper or by email as fallback)
    let shop = await Shop.findOne({ shopkeeperId: shopkeeper._id });
    if (!shop) {
      shop = await Shop.findOne({ email: rawEmail });
      if (shop && !shop.shopkeeperId) {
        shop.shopkeeperId = shopkeeper._id;
        await shop.save();
      }
    }
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop details not found. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(shopkeeper._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        shopkeeper: {
          id: shopkeeper._id,
          email: shopkeeper.email,
          ownerName: shopkeeper.ownerName,
          phoneNumber: shopkeeper.phoneNumber,
          isVerified: shopkeeper.isVerified,
          lastLogin: shopkeeper.lastLogin
        },
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          address: shop.address,
          city: shop.city,
          pincode: shop.pincode,
          pricePerJar: shop.pricePerJar,
          isActive: shop.isActive,
          isVerified: shop.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Shopkeeper login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Verify email with code
const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const shopkeeper = await Shopkeeper.findOne({ email: email.toLowerCase() });
    
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: 'Shopkeeper not found'
      });
    }

    if (shopkeeper.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Verify code
    const isCodeValid = shopkeeper.verifyCode(verificationCode);
    
    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    await shopkeeper.save();

    // Update shop verification status
    await Shop.findOneAndUpdate(
      { shopkeeperId: shopkeeper._id },
      { isVerified: true }
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        email: shopkeeper.email,
        verified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message
    });
  }
};

// Resend verification code
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const shopkeeper = await Shopkeeper.findOne({ email: email.toLowerCase() });
    
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: 'Shopkeeper not found'
      });
    }

    if (shopkeeper.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = shopkeeper.generateVerificationCode();
    await shopkeeper.save();

    // In production, send this via email service
    console.log(`New verification code for ${email}: ${verificationCode}`);

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        email: shopkeeper.email,
        verificationCode: verificationCode // In production, remove this
      }
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending code',
      error: error.message
    });
  }
};

// Get shopkeeper profile
const getProfile = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;

    const shopkeeper = await Shopkeeper.findById(shopkeeperId);
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: 'Shopkeeper not found'
      });
    }

    const shop = await Shop.findOne({ shopkeeperId: shopkeeper._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop details not found'
      });
    }

    res.json({
      success: true,
      data: {
        shopkeeper: {
          id: shopkeeper._id,
          email: shopkeeper.email,
          ownerName: shopkeeper.ownerName,
          phoneNumber: shopkeeper.phoneNumber,
          isVerified: shopkeeper.isVerified,
          lastLogin: shopkeeper.lastLogin
        },
        shop: {
          id: shop._id,
          shopName: shop.shopName,
          address: shop.address,
          city: shop.city,
          pincode: shop.pincode,
          pricePerJar: shop.pricePerJar,
          isActive: shop.isActive,
          isVerified: shop.isVerified,
          rating: shop.rating,
          totalReviews: shop.totalReviews,
          totalOrders: shop.totalOrders,
          monthlyRevenue: shop.monthlyRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
};

// Update shop details
const updateShopDetails = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;
    const { 
      shopName, 
      pricePerJar, 
      photoUrl, 
      contactNumber,
      address,
      city,
      pincode,
      state
    } = req.body;

    // Validate required fields
    if (!shopName || !pricePerJar) {
      return res.status(400).json({
        success: false,
        message: 'Shop name and price per jar are required'
      });
    }

    // Validate price range
    if (pricePerJar < 1 || pricePerJar > 200) {
      return res.status(400).json({
        success: false,
        message: 'Price per jar must be between ₹1 and ₹200'
      });
    }

    // Find shopkeeper and verify ownership
    const shopkeeper = await Shopkeeper.findById(shopkeeperId);
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: 'Shopkeeper not found'
      });
    }

    // Update shop details
    const updatedShop = await Shop.findOneAndUpdate(
      { shopkeeperId: shopkeeper._id },
      {
        shopName,
        pricePerJar: parseFloat(pricePerJar),
        photoUrl,
        contactNumber,
        address,
        city,
        pincode,
        state
      },
      { new: true, runValidators: true }
    );

    if (!updatedShop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Update shopkeeper contact info if provided
    if (contactNumber) {
      shopkeeper.phoneNumber = contactNumber;
      await shopkeeper.save();
    }

    res.json({
      success: true,
      message: 'Shop details updated successfully',
      data: {
        shop: {
          id: updatedShop._id,
          shopName: updatedShop.shopName,
          pricePerJar: updatedShop.pricePerJar,
          photoUrl: updatedShop.photoUrl,
          contactNumber: updatedShop.contactNumber,
          address: updatedShop.address,
          city: updatedShop.city,
          pincode: updatedShop.pincode,
          state: updatedShop.state
        }
      }
    });
  } catch (error) {
    console.error('Update shop details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating shop details',
      error: error.message
    });
  }
};

// Get shop orders (real-time orders for shopkeeper dashboard)
const getShopOrders = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    // Find shopkeeper's shop
    const shop = await Shop.findOne({ shopkeeperId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Build query for orders
    let query = { shopId: shop._id };
    if (status) {
      query.status = status;
    }

    // Get orders with customer details
    const rawOrders = await Order.find(query)
      .populate('userId', 'name email phoneNumber addresses')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Normalize shape for frontend: ensure userId has name, email, contactNumber, address
    const orders = rawOrders.map((o) => {
      const user = (o.userId && typeof o.userId === 'object') ? o.userId : {};
      // Prefer order's delivery address; fallback to user's default address
      const fallbackUserAddress = Array.isArray(user.addresses) && user.addresses.length > 0
        ? (user.addresses.find(a => a.isDefault) || user.addresses[0])?.address
        : undefined;
      const normalizedUser = {
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.phoneNumber || '',
        address: (o.deliveryAddress && o.deliveryAddress.address) || fallbackUserAddress || ''
      };

      return {
        _id: o._id,
        orderNumber: o.orderNumber,
        userId: normalizedUser,
        orderType: o.orderType,
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        notes: o.notes
      };
    });

    const total = await Order.countDocuments(query);

    // Get subscriptions for this shop
    const rawSubs = await Subscription.find({ shopId: shop._id })
      .populate('userId', 'name email phoneNumber pincode addresses')
      .sort({ createdAt: -1 });

    const subscriptions = rawSubs.map((s) => {
      const user = (s.userId && typeof s.userId === 'object') ? s.userId : {};
      const fallbackUserAddress = Array.isArray(user.addresses) && user.addresses.length > 0
        ? (user.addresses.find(a => a.isDefault) || user.addresses[0])?.address
        : undefined;
      const normalizedUser = {
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.phoneNumber || '',
        address: fallbackUserAddress || '',
        pincode: user.pincode || '',
        state: ''
      };

      return {
        _id: s._id,
        userId: normalizedUser,
        plan: s.plan,
        jarsPerMonth: s.jarsPerMonth,
        monthlyAmount: s.monthlyAmount,
        status: s.status || 'active',
        startDate: s.startDate,
        nextPaymentDate: s.nextPaymentDate,
        lastPaymentDate: s.lastPaymentDate,
        jarsDeliveredThisMonth: s.jarsDeliveredThisMonth || 0,
        jarsOrderedThisMonth: s.jarsOrderedThisMonth || 0,
        currentMonthBill: (typeof s.currentMonthBill === 'number' ? s.currentMonthBill : Math.round((s.jarsDeliveredThisMonth || 0) * (s.pricePerJar || 0))),
        totalPaid: 0
      };
    });

    res.json({
      success: true,
      data: {
        orders,
        subscriptions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    console.error('Get shop orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop orders',
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;
    const { orderId } = req.params;
    const { status, notes } = req.body;

    // Find shopkeeper's shop
    const shop = await Shop.findOne({ shopkeeperId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Find and update order
    const order = await Order.findOneAndUpdate(
      { _id: orderId, shopId: shop._id },
      { 
        status,
        ...(notes && { notes })
      },
      { new: true }
    ).populate('userId', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Get order statistics for dashboard
const getOrderStats = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;

    // Find shopkeeper's shop
    const shop = await Shop.findOne({ shopkeeperId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get order statistics
    const totalOrders = await Order.countDocuments({ shopId: shop._id });
    const pendingOrders = await Order.countDocuments({ shopId: shop._id, status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ shopId: shop._id, status: 'confirmed' });
    const deliveredOrders = await Order.countDocuments({ shopId: shop._id, status: 'delivered' });

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      shopId: shop._id,
      createdAt: { $gte: today }
    });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { shopId: shop._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        todayOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

// Record a delivery against a subscription (shopkeeper action)
const recordSubscriptionDelivery = async (req, res) => {
  try {
    const shopkeeperId = req.user.id;
    const { subscriptionId } = req.params;
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }

    // Find shopkeeper's shop
    const shop = await Shop.findOne({ shopkeeperId });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Find subscription for this shop
    const subscription = await Subscription.findOne({ _id: subscriptionId, shopId: shop._id, status: 'active' });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Active subscription not found for this shop' });
    }

    // Enforce monthly cap
    const remaining = subscription.jarsPerMonth - (subscription.jarsDeliveredThisMonth || 0);
    if (quantity > remaining) {
      return res.status(400).json({ success: false, message: `Only ${remaining} jars remaining for this month` });
    }

    const amount = quantity * (subscription.pricePerJar || 0);

    // Update counters and history
    subscription.jarsDeliveredThisMonth = (subscription.jarsDeliveredThisMonth || 0) + quantity;
    subscription.currentMonthBill = (subscription.currentMonthBill || 0) + amount;
    subscription.deliveryHistory = subscription.deliveryHistory || [];
    subscription.deliveryHistory.unshift({ date: new Date(), quantity, amount, notes });
    await subscription.save();

    return res.json({
      success: true,
      message: 'Delivery recorded successfully',
      data: {
        subscription: {
          _id: subscription._id,
          plan: subscription.plan,
          jarsPerMonth: subscription.jarsPerMonth,
          jarsDeliveredThisMonth: subscription.jarsDeliveredThisMonth,
          jarsOrderedThisMonth: subscription.jarsOrderedThisMonth || 0,
          currentMonthBill: subscription.currentMonthBill,
          lastDelivery: subscription.deliveryHistory[0] || null,
          remainingJars: subscription.jarsPerMonth - subscription.jarsDeliveredThisMonth
        }
      }
    });
  } catch (error) {
    console.error('Record subscription delivery error:', error);
    return res.status(500).json({ success: false, message: 'Error recording delivery', error: error.message });
  }
};

module.exports = {
  registerShopkeeper,
  loginShopkeeper,
  verifyEmail,
  resendVerificationCode,
  getProfile,
  updateShopDetails,
  getShopOrders,
  updateOrderStatus,
  getOrderStats,
  recordSubscriptionDelivery
};
