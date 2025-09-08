// Run with: node scripts/clearShops.js
require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('../models/Shop');
const Shopkeeper = require('../models/Shopkeeper');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/water-jar-delivery';
  await mongoose.connect(uri, { autoIndex: false });

  try {
    const [ordersDeleted, subsDeleted] = await Promise.all([
      Order.deleteMany({}),
      Subscription.deleteMany({})
    ]);
    const [shopsDeleted, shopkeepersDeleted] = await Promise.all([
      Shop.deleteMany({}),
      Shopkeeper.deleteMany({})
    ]);

    console.log('Deleted counts:', {
      orders: ordersDeleted.deletedCount,
      subscriptions: subsDeleted.deletedCount,
      shops: shopsDeleted.deletedCount,
      shopkeepers: shopkeepersDeleted.deletedCount
    });
    console.log('✅ All old shops and shopkeepers removed. You can register the new one now.');
  } catch (err) {
    console.error('❌ Error clearing collections:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();


