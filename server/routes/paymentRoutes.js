const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyUser } = require('../middleware/auth');

// All payment routes require user authentication
router.use(verifyUser);

// Payment routes
router.post('/initiate', paymentController.initiatePayment);
router.post('/monthly', paymentController.generateMonthlyPayment);

module.exports = router;