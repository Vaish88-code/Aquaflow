const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validate } = require('../middleware/validation');
const { verifyUser } = require('../middleware/auth');

// All order routes require user authentication
router.use(verifyUser);

// Order routes
router.post('/one-time', validate('oneTimeOrder'), orderController.placeOneTimeOrder);
router.post('/subscription', validate('subscription'), orderController.createSubscription);
router.post('/subscription/order-jars', orderController.orderJarsThroughSubscription);
router.get('/history', orderController.getOrderHistory);

module.exports = router;