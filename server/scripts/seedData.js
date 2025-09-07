const mongoose = require('mongoose');
const Shopkeeper = require('../models/Shopkeeper');
const Shop = require('../models/Shop');
const User = require('../models/User');
require('dotenv').config();

// Sample data
const sampleShopkeepers = [
  {
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@purewater.com',
    password: 'password123',
    phoneNumber: '+919876543210',
    isVerified: true
  },
  {
    ownerName: 'Priya Sharma',
    email: 'priya@crystalsprings.com',
    password: 'password123',
    phoneNumber: '+919876543211',
    isVerified: true
  },
  {
    ownerName: 'Amit Patel',
    email: 'amit@aquafresh.com',
    password: 'password123',
    phoneNumber: '+919876543212',
    isVerified: true
  }
];

const sampleShops = [
  {
    shopName: 'Pure Water Co.',
    address: '123 Main Street, Connaught Place',
    city: 'Delhi',
    pincode: '110001',
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    gstNumber: '07ABCDE1234F1Z5',
    pricePerJar: 45,
    isActive: true,
    isVerified: true
  },
  {
    shopName: 'Crystal Springs',
    address: '456 Oak Avenue, Karol Bagh',
    city: 'Delhi',
    pincode: '110005',
    coordinates: {
      latitude: 28.6500,
      longitude: 77.1900
    },
    gstNumber: '07ABCDE1234F2Z5',
    pricePerJar: 42,
    isActive: true,
    isVerified: true
  },
  {
    shopName: 'Aqua Fresh Store',
    address: '789 Pine Road, Lajpat Nagar',
    city: 'Delhi',
    pincode: '110024',
    coordinates: {
      latitude: 28.5700,
      longitude: 77.2400
    },
    gstNumber: '07ABCDE1234F3Z5',
    pricePerJar: 40,
    isActive: true,
    isVerified: true
  }
];

const sampleUsers = [
  {
    phoneNumber: '+919876543213',
    name: 'Test User 1',
    pincode: '110001'
  },
  {
    phoneNumber: '+919876543214',
    name: 'Test User 2',
    pincode: '110005'
  },
  {
    phoneNumber: '+919876543215',
    name: 'Test User 3',
    pincode: '110024'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aquaflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed shopkeepers
const seedShopkeepers = async () => {
  try {
    // Clear existing data
    await Shopkeeper.deleteMany({});
    console.log('🗑️ Cleared existing shopkeepers');

    // Create shopkeepers
    const createdShopkeepers = [];
    for (const shopkeeperData of sampleShopkeepers) {
      const shopkeeper = new Shopkeeper(shopkeeperData);
      await shopkeeper.save();
      createdShopkeepers.push(shopkeeper);
      console.log(`✅ Created shopkeeper: ${shopkeeper.ownerName}`);
    }

    return createdShopkeepers;
  } catch (error) {
    console.error('❌ Error seeding shopkeepers:', error);
    throw error;
  }
};

// Seed shops
const seedShops = async (shopkeepers) => {
  try {
    // Clear existing data
    await Shop.deleteMany({});
    console.log('🗑️ Cleared existing shops');

    // Create shops linked to shopkeepers
    for (let i = 0; i < sampleShops.length; i++) {
      const shopData = {
        ...sampleShops[i],
        shopkeeperId: shopkeepers[i]._id,
        phoneNumber: shopkeepers[i].phoneNumber,
        email: shopkeepers[i].email,
        ownerName: shopkeepers[i].ownerName
      };

      const shop = new Shop(shopData);
      await shop.save();
      console.log(`✅ Created shop: ${shop.shopName} in ${shop.pincode}`);
    }
  } catch (error) {
    console.error('❌ Error seeding shops:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.name} in ${user.pincode}`);
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    const shopkeepers = await seedShopkeepers();
    await seedShops(shopkeepers);
    await seedUsers();
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${shopkeepers.length} shopkeepers, ${sampleShops.length} shops, and ${sampleUsers.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };