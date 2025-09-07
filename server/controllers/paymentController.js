const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const { generateInvoice } = require('../utils/invoiceService');
const { sendNotification } = require('../utils/notificationService');

// Initiate payment
const initiatePayment = async (req, res) => {
  try {
    const { orderId, subscriptionId, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validate order or subscription exists
    let order, subscription, shopId;
    
    if (orderId) {
      order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      shopId = order.shopId;
    }

    if (subscriptionId) {
      subscription = await Subscription.findOne({ _id: subscriptionId, userId });
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      shopId = subscription.shopId;
    }

    // Create payment record
    const payment = new Payment({
      orderId,
      subscriptionId,
      userId,
      shopId,
      amount,
      paymentMethod
    });

    // Mock payment gateway integration
    const mockGatewayResponse = {
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
      gatewayOrderId: `GW${Date.now()}`,
      signature: `SIG${Math.random().toString(36).substr(2, 10)}`
    };

    // Simulate payment processing (90% success rate)
    const isPaymentSuccessful = Math.random() > 0.1;

    if (isPaymentSuccessful) {
      payment.status = 'success';
      payment.gatewayResponse = mockGatewayResponse;

      // Update order/subscription payment status
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
      }

      if (subscription) {
        subscription.lastPaymentDate = new Date();
        subscription.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();
      }

      // Generate invoice
      const invoice = await generateInvoice(payment);
      payment.invoiceNumber = invoice.invoiceNumber;
      payment.invoiceUrl = invoice.invoiceUrl;

    } else {
      payment.status = 'failed';
    }

    await payment.save();

    // Send notification
    await sendNotification({
      type: payment.status === 'success' ? 'payment_success' : 'payment_failed',
      userId,
      shopId,
      paymentId: payment.paymentId,
      amount
    });

    res.json({
      success: payment.status === 'success',
      message: payment.status === 'success' ? 'Payment successful' : 'Payment failed',
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        transactionId: payment.gatewayResponse?.transactionId,
        invoiceUrl: payment.invoiceUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Generate monthly invoice and payment
const generateMonthlyPayment = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ 
      _id: subscriptionId, 
      userId, 
      status: 'active' 
    }).populate('shopId');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }

    // Check if payment is due
    if (subscription.nextPaymentDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Payment not due yet'
      });
    }

    // Create payment record
    const payment = new Payment({
      subscriptionId: subscription._id,
      userId,
      shopId: subscription.shopId._id,
      amount: subscription.monthlyAmount,
      paymentMethod: 'auto' // Auto-debit
    });

    // Mock auto-payment processing
    const isPaymentSuccessful = Math.random() > 0.05; // 95% success rate for auto-payments

    if (isPaymentSuccessful) {
      payment.status = 'success';
      payment.gatewayResponse = {
        transactionId: `AUTO${Date.now()}`,
        gatewayOrderId: `GW${Date.now()}`,
        signature: `SIG${Math.random().toString(36).substr(2, 10)}`
      };

      // Update subscription
      subscription.lastPaymentDate = new Date();
      subscription.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscription.jarsDeliveredThisMonth = 0; // Reset monthly counter
      await subscription.save();

      // Generate invoice
      const invoice = await generateInvoice(payment);
      payment.invoiceNumber = invoice.invoiceNumber;
      payment.invoiceUrl = invoice.invoiceUrl;

    } else {
      payment.status = 'failed';
    }

    await payment.save();

    // Send notification
    await sendNotification({
      type: payment.status === 'success' ? 'monthly_payment_success' : 'monthly_payment_failed',
      userId,
      subscriptionId: subscription._id,
      amount: subscription.monthlyAmount
    });

    res.json({
      success: payment.status === 'success',
      message: payment.status === 'success' ? 'Monthly payment processed successfully' : 'Monthly payment failed',
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
        nextPaymentDate: subscription.nextPaymentDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing monthly payment',
      error: error.message
    });
  }
};

module.exports = {
  initiatePayment,
  generateMonthlyPayment
};