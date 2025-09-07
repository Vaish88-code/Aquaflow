const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { verifyUser, verifyShop } = require('../middleware/auth');

// User routes
router.get('/order/:orderId', verifyUser, trackingController.getDeliveryStatus);

// Shop routes
router.post('/location', verifyShop, trackingController.updateDeliveryLocation);
router.post('/assign', verifyShop, trackingController.assignDeliveryBoy);

module.exports = router;