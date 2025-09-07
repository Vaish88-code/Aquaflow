// Mock payment service - In production, integrate with payment gateways like Razorpay, Stripe, etc.

const Payment = require('../models/Payment');

// Initiate payment with mock gateway
const initiatePayment = async ({ orderId, subscriptionId, amount, paymentMethod, userId, shopId }) => {
  try {
    // Create payment record
    const payment = new Payment({
      orderId,
      subscriptionId,
      userId,
      shopId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    await payment.save();

    // Mock payment gateway integration
    const mockPaymentUrl = `https://mock-gateway.com/pay/${payment.paymentId}`;
    
    console.log(`💳 Mock Payment: ₹${amount} via ${paymentMethod} for ${payment.paymentId}`);

    // In production, integrate with actual payment gateway:
    // const gatewayResponse = await paymentGateway.createOrder({
    //   amount: amount * 100, // Convert to paise for Razorpay
    //   currency: 'INR',
    //   receipt: payment.paymentId,
    //   notes: {
    //     orderId: orderId || subscriptionId,
    //     userId,
    //     shopId
    //   }
    // });

    return {
      success: true,
      paymentId: payment.paymentId,
      paymentUrl: mockPaymentUrl,
      gatewayOrderId: `GW${Date.now()}`
    };
  } catch (error) {
    console.error('Payment initiation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Process payment callback (webhook)
const processPaymentCallback = async (paymentData) => {
  try {
    const { paymentId, status, transactionId, signature } = paymentData;

    const payment = await Payment.findOne({ paymentId });
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    payment.status = status;
    payment.gatewayResponse = {
      transactionId,
      signature
    };

    await payment.save();

    // Update related order or subscription
    if (payment.orderId) {
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: status === 'success' ? 'paid' : 'failed',
        status: status === 'success' ? 'confirmed' : 'pending'
      });
    }

    if (payment.subscriptionId) {
      const Subscription = require('../models/Subscription');
      if (status === 'success') {
        await Subscription.findByIdAndUpdate(payment.subscriptionId, {
          lastPaymentDate: new Date(),
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Payment callback processing error:', error);
    return { success: false, error: error.message };
  }
};

// Refund payment
const refundPayment = async (paymentId, refundAmount, reason) => {
  try {
    const payment = await Payment.findOne({ paymentId });
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'success') {
      throw new Error('Cannot refund unsuccessful payment');
    }

    // Mock refund processing
    console.log(`💰 Mock Refund: ₹${refundAmount} for payment ${paymentId}`);

    // Update payment record
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    if (refundAmount >= payment.amount) {
      payment.status = 'refunded';
    }

    await payment.save();

    return {
      success: true,
      refundId: `REF${Date.now()}`,
      refundAmount
    };
  } catch (error) {
    console.error('Refund processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  initiatePayment,
  processPaymentCallback,
  refundPayment
};