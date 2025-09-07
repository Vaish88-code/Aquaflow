const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Shop = require('../models/Shop');
const Payment = require('../models/Payment');
const { initiatePayment } = require('../utils/paymentService');
const { sendNotification } = require('../utils/notificationService');

// Place one-time order
const placeOneTimeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopId, quantity, deliveryAddress, paymentMethod, notes } = req.validatedData;

    // Verify shop exists and is active
    const shop = await Shop.findOne({ _id: shopId, isActive: true, isVerified: true });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found or inactive'
      });
    }

    // Calculate total amount
    const totalAmount = quantity * shop.pricePerJar;

    // Create order
    const order = new Order({
      userId,
      shopId,
      orderType: 'one-time',
      quantity,
      pricePerJar: shop.pricePerJar,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    await order.save();

    // Initiate payment if not cash
    if (paymentMethod !== 'cash') {
      const paymentResult = await initiatePayment({
        orderId: order._id,
        amount: totalAmount,
        paymentMethod,
        userId,
        shopId
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Payment initiation failed',
          error: paymentResult.error
        });
      }

      order.paymentId = paymentResult.paymentId;
      await order.save();
    } else {
      order.paymentStatus = 'pending';
      await order.save();
    }

    // Send notifications
    await sendNotification({
      type: 'order_placed',
      userId,
      shopId,
      orderId: order._id,
      message: `New order #${order.orderNumber} placed for ${quantity} jars`
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
        paymentRequired: paymentMethod !== 'cash'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
};

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopId, plan, deliveryAddress, deliveryFrequency, paymentMethod } = req.validatedData;

    // Verify shop exists and is active
    const shop = await Shop.findOne({ _id: shopId, isActive: true, isVerified: true });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found or inactive'
      });
    }

    // Check if user already has active subscription with this shop
    const existingSubscription = await Subscription.findOne({
      userId,
      shopId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription with this shop'
      });
    }

    // Calculate subscription details
    const jarsPerMonth = parseInt(plan.split('-')[0]);
    const monthlyAmount = jarsPerMonth * shop.pricePerJar;

    // Calculate next delivery date based on frequency
    let nextDeliveryDate = new Date();
    switch (deliveryFrequency) {
      case 'weekly':
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 14);
        break;
      case 'monthly':
        nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);
        break;
    }

    // Create subscription
    const subscription = new Subscription({
      userId,
      shopId,
      plan,
      jarsPerMonth,
      pricePerJar: shop.pricePerJar,
      monthlyAmount,
      deliveryAddress,
      deliveryFrequency,
      startDate: new Date(),
      nextDeliveryDate,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await subscription.save();

    // Initiate first payment
    const paymentResult = await initiatePayment({
      subscriptionId: subscription._id,
      amount: monthlyAmount,
      paymentMethod,
      userId,
      shopId
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Subscription created but payment initiation failed',
        error: paymentResult.error
      });
    }

    // Send notifications
    await sendNotification({
      type: 'subscription_created',
      userId,
      shopId,
      subscriptionId: subscription._id,
      message: `New ${plan} subscription created`
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription,
        paymentId: paymentResult.paymentId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// Get order history
const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    let query = { userId };
    if (type) {
      query.orderType = type;
    }

    const orders = await Order.find(query)
      .populate('shopId', 'shopName address photoUrl')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    // Get subscriptions
    const subscriptions = await Subscription.find({ userId })
      .populate('shopId', 'shopName address photoUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        orders,
        subscriptions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order history',
      error: error.message
    });
  }
};

// Order jars through subscription
const orderJarsThroughSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId, quantity } = req.body;

    // Validate input
    if (!subscriptionId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID and valid quantity are required'
      });
    }

    // Find the subscription
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

    // Check if user has remaining jars for this month
    const remainingJars = subscription.jarsPerMonth - (subscription.jarsOrderedThisMonth || 0);
    
    if (quantity > remainingJars) {
      return res.status(400).json({
        success: false,
        message: `You can only order ${remainingJars} more jars this month`
      });
    }

    // Calculate total amount
    const totalAmount = quantity * subscription.pricePerJar;

    // Create order
    const order = new Order({
      userId,
      shopId: subscription.shopId._id,
      subscriptionId: subscription._id,
      orderType: 'subscription',
      subscriptionPlan: subscription.plan, // Add the required subscriptionPlan field
      quantity,
      pricePerJar: subscription.pricePerJar,
      totalAmount,
      deliveryAddress: subscription.deliveryAddress,
      paymentMethod: 'subscription', // Special payment method for subscription orders
      notes: `Subscription order - ${subscription.plan} plan`,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    await order.save();

    // Update subscription with new order
    subscription.jarsOrderedThisMonth = (subscription.jarsOrderedThisMonth || 0) + quantity;
    subscription.currentMonthBill = (subscription.currentMonthBill || 0) + totalAmount;
    await subscription.save();

    // Send notification to shopkeeper
    await sendNotification({
      type: 'new_order',
      shopId: subscription.shopId._id,
      orderId: order._id,
      message: `New subscription order #${order.orderNumber} for ${quantity} jars from ${subscription.plan} plan`
    });

    res.status(201).json({
      success: true,
      message: 'Jars ordered successfully',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          quantity,
          totalAmount,
          estimatedDeliveryTime: order.estimatedDeliveryTime
        },
        subscription: {
          jarsOrderedThisMonth: subscription.jarsOrderedThisMonth,
          currentMonthBill: subscription.currentMonthBill,
          remainingJars: subscription.jarsPerMonth - subscription.jarsOrderedThisMonth
        }
      }
    });

  } catch (error) {
    console.error('Order jars through subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ordering jars',
      error: error.message
    });
  }
};

module.exports = {
  placeOneTimeOrder,
  createSubscription,
  getOrderHistory,
  orderJarsThroughSubscription
};