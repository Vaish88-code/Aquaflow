/*
 End-to-end local test for complaints API.
 - Creates/fetches a test User, Shop, and Order
 - Generates a JWT for the user
 - Submits a complaint to POST /api/users/complaints
*/

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

async function main() {
  const API_BASE = process.env.API_BASE || 'http://localhost:' + (process.env.PORT || 5000) + '/api';
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure test user
    let user = await User.findOne({ phoneNumber: '+910000000001' });
    if (!user) {
      user = await User.create({ phoneNumber: '+910000000001', name: 'Test User', pincode: '584101', isActive: true });
    }

    // Ensure test shop
    let shop = await Shop.findOne({ email: 'complaint-test@shop.com' });
    if (!shop) {
      shop = await Shop.create({
        email: 'complaint-test@shop.com',
        shopName: 'Complaint Test Shop',
        ownerName: 'Owner',
        address: 'Test Address',
        city: 'Test City',
        pincode: '584101',
        phoneNumber: '+910000000002',
        gstNumber: 'GSTTEST1234',
        pricePerJar: 30,
        isActive: true,
        isVerified: true,
        coordinates: { latitude: 15.0, longitude: 75.0 }
      });
    }

    // Create an order
    const order = await Order.create({
      userId: user._id,
      shopId: shop._id,
      orderType: 'one-time',
      quantity: 2,
      pricePerJar: shop.pricePerJar,
      totalAmount: 2 * shop.pricePerJar,
      deliveryAddress: { address: 'Test Address' },
      paymentMethod: 'cash'
    });

    // Generate user token
    const token = jwt.sign({ id: user._id.toString(), type: 'user' }, jwtSecret, { expiresIn: '1h' });

    // Submit complaint
    const resp = await fetch(`${API_BASE}/users/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ subject: 'Late delivery', description: 'Delivery was delayed by 2 hours', orderId: order._id.toString() })
    });
    const json = await resp.json();
    console.log('Complaint response status:', resp.status);
    console.log('Complaint response:', json);
  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await mongoose.disconnect();
  }
}

main();


