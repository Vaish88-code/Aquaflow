const express = require('express');
const app = express();
const PORT = 5001;

// Import data store
const { shopkeeperStore, shopStore, userStore } = require('./data-store');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Helper function to check if shop is open
const isShopOpen = (operatingHours) => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  return currentTime >= operatingHours.open && currentTime <= operatingHours.close;
};

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Real Data API Server Running with File Storage',
    timestamp: new Date().toISOString(),
    dataFiles: ['shops.json', 'shopkeepers.json', 'users.json']
  });
});

// Test shopkeeper registration
app.post('/api/shopkeeper/register', (req, res) => {
  console.log('📝 Shopkeeper registration request:', req.body);
  
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
  if (!ownerName || !email || !phoneNumber || !shopName || !pincode) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Check if shopkeeper already exists
  const existingShopkeeper = shopkeeperStore.findByEmail(email);
  if (existingShopkeeper) {
    return res.status(400).json({
      success: false,
      message: 'Shopkeeper already exists with this email'
    });
  }

  // Create shopkeeper
  const shopkeeperResult = shopkeeperStore.create({
    ownerName,
    email: email.toLowerCase(),
    password, // In production, hash this
    phoneNumber,
    isVerified: true,
    isActive: true
  });

  if (!shopkeeperResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create shopkeeper'
    });
  }

  // Create shop linked to shopkeeper
  const shopResult = shopStore.create({
    shopkeeperId: shopkeeperResult.data.id,
    shopName,
    address,
    city,
    pincode,
    state,
    gstNumber,
    pricePerJar: parseFloat(pricePerJar),
    phoneNumber,
    email: email.toLowerCase(),
    ownerName,
    coordinates: {
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0
    },
    operatingHours: { open: '06:00', close: '22:00' }
  });

  if (!shopResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create shop'
    });
  }

  console.log('✅ Shopkeeper and shop created successfully');
  console.log('   Shopkeeper ID:', shopkeeperResult.data.id);
  console.log('   Shop ID:', shopResult.data.id);

  res.status(201).json({
    success: true,
    message: 'Shopkeeper and shop registered successfully!',
    data: {
      shopkeeperId: shopkeeperResult.data.id,
      shopId: shopResult.data.id,
      email: shopkeeperResult.data.email,
      phoneNumber: shopkeeperResult.data.phoneNumber,
      shopName: shopResult.data.shopName,
      pincode: shopResult.data.pincode
    }
  });
});

// Test shopkeeper login
app.post('/api/shopkeeper/login', (req, res) => {
  console.log('🔐 Shopkeeper login request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const shopkeeper = shopkeeperStore.findByEmail(email.toLowerCase());
  if (!shopkeeper) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this email address'
    });
  }

  // Simple password check (in production, use bcrypt)
  if (password !== 'password123') {
    return res.status(400).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Get shop details
  const shop = shopStore.findByShopkeeperId(shopkeeper.id);
  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop details not found'
    });
  }

  const token = `real_token_${shopkeeper.id}_${Date.now()}`;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      shopkeeper: {
        id: shopkeeper.id,
        email: shopkeeper.email,
        ownerName: shopkeeper.ownerName,
        phoneNumber: shopkeeper.phoneNumber,
        isVerified: shopkeeper.isVerified
      },
      shop: {
        id: shop.id,
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
});

// Test update shop details
app.put('/api/shopkeeper/update-shop', (req, res) => {
  console.log('✏️ Update shop details request:', req.body);
  
  const { shopName, pricePerJar, photoUrl, contactNumber, address, city, pincode, state } = req.body;
  
  if (!shopName || !pricePerJar) {
    return res.status(400).json({
      success: false,
      message: 'Shop name and price per jar are required'
    });
  }
  
  if (pricePerJar < 1 || pricePerJar > 200) {
    return res.status(400).json({
      success: false,
      message: 'Price per jar must be between ₹1 and ₹200'
    });
  }

  // For demo purposes, update the first shop found
  // In production, you'd get the shopkeeper ID from the JWT token
  const shops = require('./data-store').shopStore.findByPincode('584101');
  if (shops.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No shop found to update'
    });
  }

  const shop = shops[0]; // Get first shop in pincode 584101
  
  const updateResult = shopStore.update(shop.id, {
    shopName,
    pricePerJar: parseFloat(pricePerJar),
    photoUrl,
    contactNumber,
    address,
    city,
    pincode,
    state
  });

  if (!updateResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update shop details'
    });
  }

  console.log('✅ Shop details updated successfully');
  console.log('   Shop ID:', shop.id);
  console.log('   New name:', shopName);
  console.log('   New price:', pricePerJar);

  res.json({
    success: true,
    message: 'Shop details updated successfully',
    data: {
      shop: updateResult.data
    }
  });
});

// Test get shops by pincode
app.get('/api/users/shops/by-pincode', (req, res) => {
  const { pincode } = req.query;
  console.log('🔍 Get shops by pincode request:', pincode);
  
  if (!pincode) {
    return res.status(400).json({
      success: false,
      message: 'Pincode is required'
    });
  }
  
  const shopsInPincode = shopStore.findByPincode(pincode);
  
  const shopsWithInfo = shopsInPincode.map(shop => ({
    ...shop,
    isOpen: isShopOpen(shop.operatingHours || { open: '06:00', close: '22:00' }),
    distance: 0,
    deliveryTime: '25-35 min'
  }));
  
  console.log(`✅ Found ${shopsWithInfo.length} shops in pincode ${pincode}`);
  shopsWithInfo.forEach(shop => {
    console.log(`   - ${shop.shopName} (${shop.pricePerJar}₹/jar)`);
  });

  res.json({
    success: true,
    data: {
      shops: shopsWithInfo,
      total: shopsWithInfo.length,
      pincode: pincode
    }
  });
});

// Test send OTP
app.post('/api/users/send-otp', (req, res) => {
  console.log('📱 Send OTP request:', req.body);
  
  const { phoneNumber, pincode } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  // Mock OTP sending
  const mockOTP = '123456';
  console.log(`📱 Mock OTP sent to ${phoneNumber}: ${mockOTP}`);
  
  res.json({
    success: true,
    message: 'OTP sent to your phone number successfully.',
    data: {
      phoneNumber,
      pincode,
      message: `Your OTP is: ${mockOTP} (Mock - valid for 5 minutes)`
    }
  });
});

// Test verify OTP
app.post('/api/users/verify-otp', (req, res) => {
  console.log('✅ Verify OTP request:', req.body);
  
  const { phoneNumber, otp } = req.body;
  
  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and OTP are required'
    });
  }
  
  if (otp !== '123456') {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please check and try again.'
    });
  }
  
  // Create or update user
  const userResult = userStore.createOrUpdate({
    phoneNumber,
    name: 'Test User',
    pincode: '584101', // Default pincode for testing
    address: 'Test Address',
    state: 'Maharashtra'
  });

  if (!userResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create/update user'
    });
  }

  const token = `real_user_token_${userResult.data.id}_${Date.now()}`;
  
  console.log('✅ User login successful');
  console.log('   User ID:', userResult.data.id);
  console.log('   Phone:', phoneNumber);
  console.log('   Pincode:', userResult.data.pincode);
  
  res.json({
    success: true,
    message: 'Login successful! Welcome back.',
    data: {
      token,
      user: userResult.data
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Data API Server running on port ${PORT}`);
  console.log(`💾 Data persistence: File-based storage (shops.json, shopkeepers.json, users.json)`);
  console.log(`📝 Test endpoints available:`);
  console.log(`   POST /api/shopkeeper/register - Register shopkeeper and shop`);
  console.log(`   POST /api/shopkeeper/login - Shopkeeper login (use password123)`);
  console.log(`   PUT /api/shopkeeper/update-shop - Update shop details`);
  console.log(`   GET /api/users/shops/by-pincode?pincode=584101 - Get shops by pincode`);
  console.log(`   POST /api/users/send-otp - Send OTP`);
  console.log(`   POST /api/users/verify-otp - Verify OTP (use 123456)`);
  console.log(`\n🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Data files created in: ${require('path').join(__dirname, 'data')}`);
});
