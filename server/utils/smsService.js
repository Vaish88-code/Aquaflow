// Mock SMS service - In production, integrate with SMS gateway like Twilio, MSG91, etc.

const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS API call
    console.log(`📨 SMS to ${phoneNumber}:`);
    console.log(`Message: ${message}`);
    console.log('---');

    // In production, integrate with SMS gateway:
    // const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    //   method: 'POST',
    //   headers: {
    //     'authkey': process.env.SMS_API_KEY,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     flow_id: 'YOUR_FLOW_ID',
    //     sender: 'AQUAFL',
    //     mobiles: phoneNumber,
    //     message
    //   })
    // });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      success: true,
      messageId: `SMS${Date.now()}${Math.random().toString(36).substr(2, 6)}`
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS
};