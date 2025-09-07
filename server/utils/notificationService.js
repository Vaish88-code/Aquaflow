// Mock notification service - In production, integrate with WhatsApp Business API, SMS gateway, etc.

const { sendWhatsAppMessage } = require('./whatsappService');
const { sendSMS } = require('./smsService');

// Send notification based on type
const sendNotification = async ({ type, userId, shopId, orderId, subscriptionId, paymentId, amount, message }) => {
  try {
    const User = require('../models/User');
    const Shop = require('../models/Shop');

    let user, shop;
    
    if (userId) {
      user = await User.findById(userId);
    }
    
    if (shopId) {
      shop = await Shop.findById(shopId);
    }

    // Generate notification content based on type
    let notificationContent = generateNotificationContent(type, {
      user,
      shop,
      orderId,
      subscriptionId,
      paymentId,
      amount,
      customMessage: message
    });

    // Send WhatsApp message (if user has WhatsApp)
    if (user?.phoneNumber) {
      await sendWhatsAppMessage(user.phoneNumber, notificationContent.whatsapp);
    }

    // Send SMS as fallback
    if (user?.phoneNumber) {
      await sendSMS(user.phoneNumber, notificationContent.sms);
    }

    // Send notification to shop if applicable
    if (shop?.phoneNumber && ['order_placed', 'payment_success'].includes(type)) {
      await sendWhatsAppMessage(shop.phoneNumber, notificationContent.shopNotification);
    }

    console.log(`📢 Notification sent: ${type} to ${user?.phoneNumber || shop?.phoneNumber}`);
    
    return true;
  } catch (error) {
    console.error('Notification sending error:', error);
    return false;
  }
};

// Generate notification content
const generateNotificationContent = (type, data) => {
  const { user, shop, orderId, amount, customMessage } = data;

  const templates = {
    order_placed: {
      whatsapp: `🚰 *Order Confirmed!*\n\nHi ${user?.name || 'Customer'},\n\nYour water jar order has been placed successfully!\n\n📋 Order Details:\n• Shop: ${shop?.shopName}\n• Amount: ₹${amount}\n\nWe'll notify you once your order is ready for delivery.\n\nThank you for choosing AquaFlow! 💧`,
      sms: `AquaFlow: Your order of ₹${amount} from ${shop?.shopName} has been confirmed. Track your order in the app.`,
      shopNotification: `🔔 *New Order Alert!*\n\nYou have received a new order:\n• Amount: ₹${amount}\n• Customer: ${user?.phoneNumber}\n\nPlease prepare the order and update the status in your dashboard.`
    },
    
    payment_success: {
      whatsapp: `✅ *Payment Successful!*\n\nHi ${user?.name || 'Customer'},\n\nYour payment of ₹${amount} has been processed successfully.\n\n💳 Payment confirmed for your water jar order.\n\nYour order will be prepared and delivered soon!`,
      sms: `AquaFlow: Payment of ₹${amount} successful. Your order is being prepared.`
    },
    
    out_for_delivery: {
      whatsapp: `🚚 *Out for Delivery!*\n\nHi ${user?.name || 'Customer'},\n\nGreat news! Your water jars are on the way!\n\n📍 You can track your delivery in real-time through the app.\n\nExpected delivery: Within 30 minutes`,
      sms: `AquaFlow: Your order is out for delivery. Track live location in the app.`
    },
    
    delivered: {
      whatsapp: `🎉 *Order Delivered!*\n\nHi ${user?.name || 'Customer'},\n\nYour water jars have been delivered successfully!\n\n⭐ Please rate your experience in the app.\n\nThank you for choosing AquaFlow! 💧`,
      sms: `AquaFlow: Your order has been delivered. Please rate your experience in the app.`
    },
    
    subscription_created: {
      whatsapp: `🔄 *Subscription Activated!*\n\nHi ${user?.name || 'Customer'},\n\nYour water jar subscription is now active!\n\n📅 Next delivery: As per your schedule\n💰 Monthly amount: ₹${amount}\n\nEnjoy hassle-free water delivery! 💧`,
      sms: `AquaFlow: Your subscription is active. Monthly amount: ₹${amount}. Next delivery as scheduled.`
    },
    
    monthly_payment_success: {
      whatsapp: `💳 *Monthly Payment Processed*\n\nHi ${user?.name || 'Customer'},\n\nYour monthly subscription payment of ₹${amount} has been processed successfully.\n\n📋 Invoice will be sent to your registered email.\n\nThank you for your continued trust! 💧`,
      sms: `AquaFlow: Monthly payment of ₹${amount} processed successfully. Invoice sent to email.`
    },
    
    monthly_payment_failed: {
      whatsapp: `⚠️ *Payment Failed*\n\nHi ${user?.name || 'Customer'},\n\nYour monthly subscription payment of ₹${amount} could not be processed.\n\n🔄 Please update your payment method in the app to continue your subscription.\n\nNeed help? Contact our support team.`,
      sms: `AquaFlow: Monthly payment of ₹${amount} failed. Please update payment method in app.`
    }
  };

  return templates[type] || {
    whatsapp: customMessage || 'You have a new notification from AquaFlow',
    sms: customMessage || 'AquaFlow notification'
  };
};

module.exports = {
  sendNotification
};