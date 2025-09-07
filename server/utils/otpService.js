// Mock OTP service - In production, integrate with SMS gateway like Twilio, MSG91, etc.

const otpStore = new Map(); // In production, use Redis for better performance

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (Mock implementation)
const sendOTP = async (phoneNumber) => {
  try {
    // For demo purposes, always use 123456 as OTP
    const otp = '123456';
    
    // Store OTP with 5-minute expiry
    otpStore.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });

    // Mock SMS sending
    console.log(`📱 Mock SMS: OTP ${otp} sent to ${phoneNumber}`);
    
    // In production, integrate with SMS gateway:
    // const smsResult = await smsGateway.send({
    //   to: phoneNumber,
    //   message: `Your AquaFlow OTP is: ${otp}. Valid for 5 minutes.`
    // });

    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Verify OTP
const verifyOTP = async (phoneNumber, inputOTP) => {
  try {
    const otpData = otpStore.get(phoneNumber);
    
    if (!otpData) {
      return false; // OTP not found
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phoneNumber);
      return false;
    }

    // Check attempts limit
    if (otpData.attempts >= 3) {
      otpStore.delete(phoneNumber);
      return false;
    }

    // Verify OTP
    if (otpData.otp === inputOTP) {
      otpStore.delete(phoneNumber); // Remove OTP after successful verification
      return true;
    } else {
      otpData.attempts += 1;
      return false;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// Resend OTP
const resendOTP = async (phoneNumber) => {
  try {
    // Check if previous OTP exists and is still valid
    const existingOTP = otpStore.get(phoneNumber);
    if (existingOTP && (Date.now() - (existingOTP.expiresAt - 5 * 60 * 1000)) < 60 * 1000) {
      return false; // Don't allow resend within 1 minute
    }

    return await sendOTP(phoneNumber);
  } catch (error) {
    console.error('Error resending OTP:', error);
    return false;
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};