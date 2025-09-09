const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate } = require('../middleware/validation');
const { verifyUser } = require('../middleware/auth');

// Public routes
router.post('/send-otp', validate('sendOTP'), userController.sendOTP);
router.post('/verify-otp', validate('verifyOTP'), userController.verifyOTP);
router.post('/register', validate('userRegister'), userController.registerWithPassword);
router.post('/login', validate('userLogin'), userController.loginWithPassword);

// Protected routes
router.get('/shops', verifyUser, userController.getNearbyShops);
router.get('/shops/by-pincode', userController.getShopsByPincode);
router.post('/orders', verifyUser, userController.placeOrder);
router.post('/complaints', verifyUser, userController.submitComplaint);

// Public fallback: by state/pincode
router.get('/shops/by-location', userController.getShopsByLocation);

module.exports = router;