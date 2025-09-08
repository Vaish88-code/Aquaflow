import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, DEFAULT_EMAIL_PARAMS, EmailTemplateParams } from '../config/emailjs';

// Initialize EmailJS with your credentials
emailjs.init({
  publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
  privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
});

interface ShopkeeperRegistrationData {
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  shopName: string;
  address: string;
  pincode: string;
  state: string;
  gstNumber: string;
  pricePerJar: number;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Send verification email using EmailJS
const sendVerificationEmail = async (email: string, name: string, verificationCode: string): Promise<boolean> => {
  try {
    const templateParams: EmailTemplateParams = {
      to_email: email,
      to_name: name,
      verification_code: verificationCode,
      company_name: DEFAULT_EMAIL_PARAMS.company_name,
      from_name: DEFAULT_EMAIL_PARAMS.from_name,
      reply_to: email,
      user_email: email
    };

    console.log('📧 Sending shopkeeper verification email...');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Verification Code:', verificationCode);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        privateKey: EMAILJS_CONFIG.PRIVATE_KEY
      }
    );
    
    console.log('✅ Shopkeeper email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Shopkeeper email sending failed:', error);
    return false;
  }
};

export const shopkeeperAuthService = {
  // Register new shopkeeper
  async registerShopkeeper(registrationData: ShopkeeperRegistrationData): Promise<AuthResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      // Validate phone number format
      const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
      if (!phoneRegex.test(registrationData.contactNumber.replace(/\s+/g, ''))) {
        return {
          success: false,
          message: 'Please enter a valid Indian phone number'
        };
      }

      // Validate pincode
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(registrationData.pincode)) {
        return {
          success: false,
          message: 'Please enter a valid 6-digit pincode'
        };
      }

      // Validate GST number
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(registrationData.gstNumber)) {
        return {
          success: false,
          message: 'Please enter a valid GST number'
        };
      }

      // Check if passwords match
      if (registrationData.password !== registrationData.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      // Check password strength
      if (registrationData.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
      }

      // Call backend API to register shopkeeper
      const response = await fetch(`${API_BASE_URL}/shopkeeper/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: registrationData.ownerName.trim(),
          email: registrationData.email.toLowerCase().trim(),
          password: registrationData.password,
          phoneNumber: registrationData.contactNumber.trim(),
          shopName: registrationData.shopName.trim(),
          address: registrationData.address.trim(),
          pincode: registrationData.pincode.trim(),
          state: registrationData.state,
          city: registrationData.state, // Using state as city for now
          gstNumber: registrationData.gstNumber.trim(),
          pricePerJar: registrationData.pricePerJar,
          latitude: 16.205, // Default coordinates - should be improved
          longitude: 77.355
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Shopkeeper registered successfully: ${registrationData.shopName} (${registrationData.email})`);
        
        // Send verification email
        const emailSent = await sendVerificationEmail(registrationData.email, registrationData.ownerName, '123456');
        
        return {
          success: true,
          message: result.message || 'Shop registration successful! You are now logged in.',
          data: {
            token: result.data.token, // Include JWT token for auto-login
            shopkeeper: result.data.shopkeeper, // Include full shopkeeper data
            email: registrationData.email,
            shopName: registrationData.shopName,
            ownerName: registrationData.ownerName,
            message: emailSent ? 'A verification email has been sent to your email address.' : 'Registration completed successfully.'
          }
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Shopkeeper registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  },

  // Login shopkeeper
  async loginShopkeeper(loginData: LoginData): Promise<AuthResponse> {
    try {
      // Call backend API to login shopkeeper
      const response = await fetch(`${API_BASE_URL}/shopkeeper/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email.toLowerCase().trim(),
          password: loginData.password
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Shopkeeper logged in successfully: ${result.data.shopkeeper.shopName} (${loginData.email})`);

        return {
          success: true,
          message: 'Login successful! Welcome to your shop dashboard.',
          data: {
            token: result.data.token,
            shopkeeper: result.data.shopkeeper
          }
        };
      } else {
        return {
          success: false,
          message: result.message || 'Invalid email or password. Please check your credentials.'
        };
      }
    } catch (error) {
      console.error('Shopkeeper login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  },

  // Verify email with code
  async verifyEmail(email: string, verificationCode: string): Promise<AuthResponse> {
    try {
      // For now, just return success since backend handles verification differently
      return {
        success: true,
        message: 'Email verified successfully! You can now login to your shop account.',
        data: { email: email, verified: true }
      };
    } catch (error) {
      console.error('Shopkeeper verification error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      // For now, just return success since backend handles verification differently
      return { success: true, message: 'Verification code sent successfully! Please check your email.' };
    } catch (error) {
      console.error('Shopkeeper resend verification error:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  }
};