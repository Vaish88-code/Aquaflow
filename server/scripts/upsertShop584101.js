require('dotenv').config();
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const Shop = require('../models/Shop');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aquaflow';
    await mongoose.connect(uri);

    const res = await Shop.updateMany(
      { pincode: '584101' },
      { $set: { isActive: true, isVerified: true } }
    );
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    if (res.matchedCount === 0) {
      const s = new Shop({
        shopkeeperId: new Types.ObjectId(),
        phoneNumber: '+919876543210',
        email: 'shop584101@example.com',
        shopName: 'Hydra Water 584101',
        ownerName: 'Owner Name',
        address: 'Main Road',
        city: 'Raichur',
        pincode: '584101',
        coordinates: { latitude: 16.205, longitude: 77.355 },
        gstNumber: '22ABCDE1234F1Z5',
        pricePerJar: 50,
        isActive: true,
        isVerified: true
      });
      await s.save();
      console.log('Inserted:', String(s._id));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


