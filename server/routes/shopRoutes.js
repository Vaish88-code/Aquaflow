const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { validate } = require('../middleware/validation');
const { verifyShop } = require('../middleware/auth');

// Public routes
router.post('/signup', validate('shopSignup'), shopController.signup);
router.post('/login', shopController.login);

// Protected routes
router.get('/orders', verifyShop, shopController.getOrders);
router.put('/order/:id/deliver', verifyShop, shopController.markDelivered);
router.get('/subscriptions', verifyShop, shopController.getSubscriptions);

module.exports = router;