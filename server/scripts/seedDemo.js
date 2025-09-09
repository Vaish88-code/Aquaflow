/*
 Seed demo accounts for shopkeeper and user, plus a sample order.
 Safe to run multiple times (idempotent upsert-style).
 Usage: node scripts/seedDemo.js
 Requires: process.env.MONGODB_URI, process.env.JWT_SECRET (optional)
*/

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Shopkeeper = require('../models/Shopkeeper');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Order = require('../models/Order');

async function seedDemo() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Create server/.env with MONGODB_URI and try again.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  try {
    // Demo shopkeeper credentials
    const demoEmail = 'demo-shop@aquaflow.test';
    const demoPassword = 'Demo@1234';
    const demoPhone = '+910000000010';

    // Upsert shopkeeper
    let shopkeeper = await Shopkeeper.findOne({ email: demoEmail });
    if (!shopkeeper) {
      shopkeeper = new Shopkeeper({
        email: demoEmail,
        password: demoPassword,
        ownerName: 'Demo Owner',
        phoneNumber: demoPhone,
        isVerified: true,
        isActive: true
      });
      await shopkeeper.save();
      console.log('Created demo shopkeeper');
    } else {
      // Ensure flags
      let changed = false;
      if (!shopkeeper.isVerified) { shopkeeper.isVerified = true; changed = true; }
      if (!shopkeeper.isActive) { shopkeeper.isActive = true; changed = true; }
      if (changed) { await shopkeeper.save(); }
      console.log('Found demo shopkeeper');
    }

    // Upsert shop for demo shopkeeper
    let shop = await Shop.findOne({ $or: [{ shopkeeperId: shopkeeper._id }, { email: demoEmail }] });
    if (!shop) {
      shop = new Shop({
        shopkeeperId: shopkeeper._id,
        email: demoEmail,
        phoneNumber: demoPhone,
        shopName: 'Demo Water Shop',
        ownerName: 'Demo Owner',
        address: '123 Demo Street, Demo Nagar',
        city: 'Demo City',
        pincode: '584101',
        coordinates: { latitude: 15.353, longitude: 75.138 },
        gstNumber: 'GSTDEMO1234',
        pricePerJar: 30,
        isActive: true,
        isVerified: true
      });
      await shop.save();
      console.log('Created demo shop');
    } else {
      if (!shop.shopkeeperId) { shop.shopkeeperId = shopkeeper._id; await shop.save(); }
      console.log('Found demo shop');
    }

    // Upsert demo user
    const demoUserPhone = '+910000000011';
    let user = await User.findOne({ phoneNumber: demoUserPhone });
    if (!user) {
      user = new User({
        phoneNumber: demoUserPhone,
        name: 'Demo User',
        email: 'demo-user@aquaflow.test',
        pincode: '584101',
        addresses: [{ type: 'home', address: '456 Sample Road, Demo Nagar', isDefault: true }],
        isActive: true
      });
      await user.save();
      console.log('Created demo user');
    } else {
      console.log('Found demo user');
    }

    // Ensure there is at least one recent order linking user and shop
    const existingOrder = await Order.findOne({ userId: user._id, shopId: shop._id }).sort({ createdAt: -1 });
    if (!existingOrder) {
      await Order.create({
        userId: user._id,
        shopId: shop._id,
        orderType: 'one-time',
        quantity: 2,
        pricePerJar: shop.pricePerJar,
        totalAmount: 2 * shop.pricePerJar,
        deliveryAddress: { address: '456 Sample Road, Demo Nagar' },
        paymentMethod: 'cash',
        notes: 'Demo seed order'
      });
      console.log('Created demo order');
    } else {
      console.log('Found existing demo order');
    }

    console.log('✅ Demo data ready');
    console.log('\nShopkeeper login (demo):');
    console.log(`  Email: ${demoEmail}`);
    console.log(`  Password: ${demoPassword}`);
    console.log('\nUser login (demo via OTP):');
    console.log(`  Phone: ${demoUserPhone}`);
    console.log('  Use the app to send OTP and login.');
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await mongoose.disconnect();
  }
}

seedDemo();


