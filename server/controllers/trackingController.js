const Order = require('../models/Order');
const { sendNotification } = require('../utils/notificationService');

// Update delivery boy location
const updateDeliveryLocation = async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;
    const shopId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      shopId,
      status: { $in: ['confirmed', 'preparing', 'out-for-delivery'] }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for tracking'
      });
    }

    // Update delivery boy location
    order.deliveryBoy.currentLocation = {
      latitude,
      longitude
    };

    // Update status to out-for-delivery if not already
    if (order.status !== 'out-for-delivery') {
      order.status = 'out-for-delivery';
      
      // Send notification to user
      await sendNotification({
        type: 'out_for_delivery',
        userId: order.userId,
        orderId: order._id,
        message: `Your order #${order.orderNumber} is out for delivery`
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        orderId: order._id,
        currentLocation: order.deliveryBoy.currentLocation,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating delivery location',
      error: error.message
    });
  }
};

// Get delivery status for customer
const getDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('shopId', 'shopName address phoneNumber')
      .select('orderNumber status deliveryBoy estimatedDeliveryTime actualDeliveryTime createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate estimated time remaining
    let timeRemaining = null;
    if (order.estimatedDeliveryTime && order.status !== 'delivered') {
      const now = new Date();
      const timeDiff = order.estimatedDeliveryTime.getTime() - now.getTime();
      timeRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60))); // minutes
    }

    // Mock delivery boy location (in real app, this would be live GPS)
    let deliveryBoyLocation = null;
    if (order.status === 'out-for-delivery' && order.deliveryBoy.currentLocation) {
      deliveryBoyLocation = order.deliveryBoy.currentLocation;
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        shop: order.shopId,
        deliveryBoy: order.deliveryBoy,
        deliveryBoyLocation,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        timeRemaining,
        orderPlacedAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery status',
      error: error.message
    });
  }
};

// Assign delivery boy to order
const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyName, deliveryBoyPhone } = req.body;
    const shopId = req.user.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      shopId,
      status: { $in: ['confirmed', 'preparing'] }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for assignment'
      });
    }

    // Assign delivery boy
    order.deliveryBoy = {
      name: deliveryBoyName,
      phone: deliveryBoyPhone,
      currentLocation: null
    };

    order.status = 'preparing';
    await order.save();

    // Send notification to user
    await sendNotification({
      type: 'delivery_assigned',
      userId: order.userId,
      orderId: order._id,
      message: `Delivery boy ${deliveryBoyName} assigned to your order #${order.orderNumber}`
    });

    res.json({
      success: true,
      message: 'Delivery boy assigned successfully',
      data: {
        orderId: order._id,
        deliveryBoy: order.deliveryBoy,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning delivery boy',
      error: error.message
    });
  }
};

module.exports = {
  updateDeliveryLocation,
  getDeliveryStatus,
  assignDeliveryBoy
};