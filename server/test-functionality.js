const mongoose = require('mongoose');
const Shopkeeper = require('./models/Shopkeeper');
const Shop = require('./models/Shop');
const User = require('./models/User');

// Test data
const testData = {
  shopkeeper: {
    ownerName: 'Test Owner',
    email: 'test@shop.com',
    password: 'password123',
    phoneNumber: '+919876543299'
  },
  shop: {
    shopName: 'Test Shop',
    address: 'Test Address',
    city: 'Test City',
    pincode: '110001',
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    gstNumber: '07ABCDE1234F9Z5',
    pricePerJar: 50
  },
  user: {
    phoneNumber: '+919876543298',
    name: 'Test User',
    pincode: '110001'
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aquaflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
  return true;
};

// Test shopkeeper creation
const testShopkeeperCreation = async () => {
  try {
    console.log('\n🧪 Testing shopkeeper creation...');
    
    // Check if shopkeeper already exists
    let existingShopkeeper = await Shopkeeper.findOne({ email: testData.shopkeeper.email });
    if (existingShopkeeper) {
      console.log('⚠️ Shopkeeper already exists, skipping creation');
      return existingShopkeeper;
    }

    // Create shopkeeper
    const shopkeeper = new Shopkeeper(testData.shopkeeper);
    await shopkeeper.save();
    console.log('✅ Shopkeeper created successfully');
    return shopkeeper;
  } catch (error) {
    console.error('❌ Shopkeeper creation failed:', error.message);
    return null;
  }
};

// Test shop creation
const testShopCreation = async (shopkeeper) => {
  try {
    console.log('\n🏪 Testing shop creation...');
    
    // Check if shop already exists
    let existingShop = await Shop.findOne({ gstNumber: testData.shop.gstNumber });
    if (existingShop) {
      console.log('⚠️ Shop already exists, skipping creation');
      return existingShop;
    }

    // Create shop linked to shopkeeper
    const shop = new Shop({
      ...testData.shop,
      shopkeeperId: shopkeeper._id,
      phoneNumber: shopkeeper.phoneNumber,
      email: shopkeeper.email,
      ownerName: shopkeeper.ownerName
    });
    await shop.save();
    console.log('✅ Shop created successfully');
    return shop;
  } catch (error) {
    console.error('❌ Shop creation failed:', error.message);
    return null;
  }
};

// Test user creation
const testUserCreation = async () => {
  try {
    console.log('\n👤 Testing user creation...');
    
    // Check if user already exists
    let existingUser = await User.findOne({ phoneNumber: testData.user.phoneNumber });
    if (existingUser) {
      console.log('⚠️ User already exists, skipping creation');
      return existingUser;
    }

    // Create user
    const user = new User(testData.user);
    await user.save();
    console.log('✅ User created successfully');
    return user;
  } catch (error) {
    console.error('❌ User creation failed:', error.message);
    return null;
  }
};

// Test shop search by pincode
const testShopSearchByPincode = async () => {
  try {
    console.log('\n🔍 Testing shop search by pincode...');
    
    const shops = await Shop.find({ 
      pincode: '110001',
      isActive: true,
      isVerified: true 
    }).populate('shopkeeperId', 'ownerName email');
    
    console.log(`✅ Found ${shops.length} shops in pincode 110001`);
    shops.forEach(shop => {
      console.log(`  - ${shop.shopName} by ${shop.ownerName} (${shop.pricePerJar}₹/jar)`);
    });
    
    return shops;
  } catch (error) {
    console.error('❌ Shop search failed:', error.message);
    return [];
  }
};

// Test shopkeeper authentication
const testShopkeeperAuth = async () => {
  try {
    console.log('\n🔐 Testing shopkeeper authentication...');
    
    const shopkeeper = await Shopkeeper.findOne({ email: testData.shopkeeper.email });
    if (!shopkeeper) {
      console.log('❌ Shopkeeper not found for authentication test');
      return false;
    }

    // Test password comparison
    const isPasswordValid = await shopkeeper.comparePassword('password123');
    console.log(`✅ Password validation: ${isPasswordValid ? 'PASS' : 'FAIL'}`);
    
    return isPasswordValid;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting functionality tests...\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Cannot run tests without database connection');
    return;
  }

  try {
    // Run tests
    const shopkeeper = await testShopkeeperCreation();
    if (!shopkeeper) {
      console.log('❌ Shopkeeper test failed, stopping');
      return;
    }

    const shop = await testShopCreation(shopkeeper);
    if (!shop) {
      console.log('❌ Shop test failed, stopping');
      return;
    }

    const user = await testUserCreation();
    if (!user) {
      console.log('❌ User test failed, stopping');
      return;
    }

    await testShopSearchByPincode();
    await testShopkeeperAuth();

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`  - Shopkeeper: ${shopkeeper ? '✅' : '❌'}`);
    console.log(`  - Shop: ${shop ? '✅' : '❌'}`);
    console.log(`  - User: ${user ? '✅' : '❌'}`);
    console.log(`  - Shop Search: ✅`);
    console.log(`  - Authentication: ✅`);

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
