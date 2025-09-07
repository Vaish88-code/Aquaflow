const express = require('express');
const router = express.Router();
const shopkeeperController = require('../controllers/shopkeeperController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/register', validate('shopkeeperRegistration'), shopkeeperController.registerShopkeeper);
router.post('/login', validate('shopkeeperLogin'), shopkeeperController.loginShopkeeper);
router.post('/verify-email', validate('emailVerification'), shopkeeperController.verifyEmail);
router.post('/resend-verification', shopkeeperController.resendVerificationCode);

// Protected routes (authentication required)
router.get('/profile', verifyToken, shopkeeperController.getProfile);
router.put('/update-shop', verifyToken, validate('updateShopDetails'), shopkeeperController.updateShopDetails);

// Order management routes
router.get('/orders', verifyToken, shopkeeperController.getShopOrders);
router.get('/orders/stats', verifyToken, shopkeeperController.getOrderStats);
router.put('/orders/:orderId/status', verifyToken, shopkeeperController.updateOrderStatus);
// Record subscription deliveries
router.post('/subscriptions/:subscriptionId/deliver', verifyToken, shopkeeperController.recordSubscriptionDelivery);

module.exports = router;
