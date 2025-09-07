import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, DEFAULT_EMAIL_PARAMS, EmailTemplateParams } from '../config/emailjs';

// Initialize EmailJS with your credentials
emailjs.init({
  publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
  privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
});

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
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

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  photoUrl: string;
  pricePerJar: number;
  rating: number;
  totalReviews: number;
  coordinates: { latitude: number; longitude: number };
  isOpen: boolean;
  distance: number;
  deliveryTime: string;
  operatingHours: { open: string; close: string };
}

// Mock user database
const mockUsers = new Map();
const mockVerificationCodes = new Map();

// Mock shops database with location-based data
const mockShopsDatabase = [
  // Delhi shops
  {
    _id: 'shop1',
    shopName: 'Pure Water Co.',
    address: '123 Main Street, Connaught Place, Delhi',
    photoUrl: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 45,
    rating: 4.8,
    totalReviews: 156,
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    operatingHours: { open: '06:00', close: '22:00' },
    pincode: '110001',
    state: 'Delhi'
  },
  {
    _id: 'shop2',
    shopName: 'Crystal Springs',
    address: '456 Oak Avenue, Karol Bagh, Delhi',
    photoUrl: 'https://images.pexels.com/photos/1146834/pexels-photo-1146834.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 42,
    rating: 4.6,
    totalReviews: 89,
    coordinates: { latitude: 28.6500, longitude: 77.1900 },
    operatingHours: { open: '07:00', close: '21:00' },
    pincode: '110005',
    state: 'Delhi'
  },
  {
    _id: 'shop3',
    shopName: 'Aqua Fresh Store',
    address: '789 Pine Road, Lajpat Nagar, Delhi',
    photoUrl: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 40,
    rating: 4.9,
    totalReviews: 234,
    coordinates: { latitude: 28.5700, longitude: 77.2400 },
    operatingHours: { open: '06:30', close: '23:00' },
    pincode: '110024',
    state: 'Delhi'
  },
  {
    _id: 'shop4',
    shopName: 'Blue Drop Water',
    address: '321 Cedar Lane, Rohini, Delhi',
    photoUrl: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 48,
    rating: 4.7,
    totalReviews: 112,
    coordinates: { latitude: 28.7041, longitude: 77.1025 },
    operatingHours: { open: '06:00', close: '22:30' },
    pincode: '110085',
    state: 'Delhi'
  },
  // Maharashtra shops
  {
    _id: 'shop5',
    shopName: 'Mountain Fresh',
    address: '654 Elm Street, Andheri, Mumbai',
    photoUrl: 'https://images.pexels.com/photos/1146834/pexels-photo-1146834.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 50,
    rating: 4.5,
    totalReviews: 67,
    coordinates: { latitude: 19.1136, longitude: 72.8697 },
    operatingHours: { open: '07:00', close: '21:30' },
    pincode: '400058',
    state: 'Maharashtra'
  },
  {
    _id: 'shop6',
    shopName: 'Aqua Life',
    address: '987 Birch Boulevard, Bandra, Mumbai',
    photoUrl: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 52,
    rating: 4.8,
    totalReviews: 198,
    coordinates: { latitude: 19.0596, longitude: 72.8295 },
    operatingHours: { open: '06:00', close: '22:00' },
    pincode: '400050',
    state: 'Maharashtra'
  },
  // Karnataka shops
  {
    _id: 'shop7',
    shopName: 'Fresh Flow Water',
    address: '111 MG Road, Koramangala, Bangalore',
    photoUrl: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 38,
    rating: 4.6,
    totalReviews: 145,
    coordinates: { latitude: 12.9352, longitude: 77.6245 },
    operatingHours: { open: '06:30', close: '22:30' },
    pincode: '560034',
    state: 'Karnataka'
  },
  {
    _id: 'shop8',
    shopName: 'Pure Springs',
    address: '222 Brigade Road, Indiranagar, Bangalore',
    photoUrl: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400',
    pricePerJar: 41,
    rating: 4.7,
    totalReviews: 178,
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    operatingHours: { open: '07:00', close: '21:00' },
    pincode: '560038',
    state: 'Karnataka'
  }
];

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Check if shop is currently open
const isShopOpen = (operatingHours: { open: string; close: string }): boolean => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  return currentTime >= operatingHours.open && currentTime <= operatingHours.close;
};

// Get delivery time estimate based on distance
const getDeliveryTime = (distance: number): string => {
  if (distance <= 2) return '15-25 min';
  if (distance <= 5) return '25-35 min';
  if (distance <= 10) return '35-45 min';
  return '45-60 min';
};

// Get user coordinates based on pincode (mock geocoding)
const getCoordinatesFromPincode = (pincode: string, state: string): { latitude: number; longitude: number } => {
  // Mock coordinates for different states/pincodes
  const locationMap: { [key: string]: { latitude: number; longitude: number } } = {
    'Delhi': { latitude: 28.6139, longitude: 77.2090 },
    'Maharashtra': { latitude: 19.0760, longitude: 72.8777 },
    'Karnataka': { latitude: 12.9716, longitude: 77.5946 },
    'Tamil Nadu': { latitude: 13.0827, longitude: 80.2707 },
    'Gujarat': { latitude: 23.0225, longitude: 72.5714 },
    'Rajasthan': { latitude: 26.9124, longitude: 75.7873 },
    'West Bengal': { latitude: 22.5726, longitude: 88.3639 },
    'Uttar Pradesh': { latitude: 26.8467, longitude: 80.9462 },
    'Haryana': { latitude: 29.0588, longitude: 76.0856 },
    'Punjab': { latitude: 31.1471, longitude: 75.3412 }
  };

  const baseCoords = locationMap[state] || locationMap['Delhi'];
  
  // Add some randomness based on pincode for more realistic locations
  const pincodeOffset = parseInt(pincode.slice(-2)) / 1000;
  
  return {
    latitude: baseCoords.latitude + (Math.random() - 0.5) * 0.1 + pincodeOffset,
    longitude: baseCoords.longitude + (Math.random() - 0.5) * 0.1 + pincodeOffset
  };
};

// Simple password hashing (in production, use bcrypt on backend)
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash for demo - in production, use proper bcrypt on backend
  return btoa(password + 'aquaflow_salt_2025');
};

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return btoa(password + 'aquaflow_salt_2025') === hashedPassword;
};

// Generate verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    console.log('📧 Sending verification email...');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Verification Code:', verificationCode);
    console.log('Template Params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        privateKey: EMAILJS_CONFIG.PRIVATE_KEY
      }
    );
    
    console.log('✅ Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error details:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    return false;
  }
};

export const authService = {
  // Check if user exists
  async checkUserExists(email: string): Promise<{ exists: boolean; user?: any; verified?: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.get(email);
    return {
      exists: !!user,
      user: user || null,
      verified: user?.isVerified || false
    };
  },

  // Register new user
  async registerUser(registrationData: UserRegistrationData): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

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

      // Check if user already exists
      const existingUser = mockUsers.get(registrationData.email);
      if (existingUser) {
        if (existingUser.isVerified) {
          return {
            success: false,
            message: 'User already exists with this email address. Please login instead.'
          };
        } else {
          // User exists but not verified, allow re-registration
          mockUsers.delete(registrationData.email);
          mockVerificationCodes.delete(registrationData.email);
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(registrationData.password);

      // Generate verification code
      const verificationCode = generateVerificationCode();

      // Create user (unverified)
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        email: registrationData.email.toLowerCase().trim(),
        name: registrationData.name.trim(),
        contactNumber: registrationData.contactNumber.trim(),
        address: registrationData.address.trim(),
        pincode: registrationData.pincode.trim(),
        state: registrationData.state,
        password: hashedPassword,
        isVerified: false,
        createdAt: new Date(),
        lastLogin: null
      };

      // Store user and verification code
      mockUsers.set(user.email, user);
      mockVerificationCodes.set(user.email, {
        code: verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
        createdAt: Date.now()
      });

      console.log(`👤 Creating user: ${user.name} (${user.email})`);
      console.log(`🔐 Generated verification code: ${verificationCode}`);

      // Send verification email
      const emailSent = await sendVerificationEmail(user.email, user.name, verificationCode);
      
      // Don't fail registration if email sending fails - just log it
      if (!emailSent) {
        console.log(`⚠️ Warning: Failed to send verification email to ${user.email}`);
      }

      console.log(`✅ User registered successfully: ${user.name} (${user.email})`);

      return {
        success: true,
        message: 'Registration successful! You can now login with your email and password.',
        data: {
          email: user.email,
          name: user.name,
          message: emailSent ? 'A verification email has been sent to your email address.' : 'Registration completed successfully.'
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  },

  // Verify email with code
  async verifyEmail(email: string, verificationCode: string): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = mockUsers.get(email.toLowerCase().trim());
      const codeData = mockVerificationCodes.get(email.toLowerCase().trim());

      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.'
        };
      }

      if (!codeData) {
        return {
          success: false,
          message: 'Verification code not found. Please request a new one.'
        };
      }

      // Check if code expired
      if (Date.now() > codeData.expiresAt) {
        mockVerificationCodes.delete(email);
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check attempts limit
      if (codeData.attempts >= 3) {
        mockVerificationCodes.delete(email);
        return {
          success: false,
          message: 'Too many failed attempts. Please register again.'
        };
      }

      // Verify code
      if (codeData.code !== verificationCode.trim()) {
        codeData.attempts += 1;
        return {
          success: false,
          message: `Invalid verification code. ${3 - codeData.attempts} attempts remaining.`
        };
      }

      // Mark user as verified
      user.isVerified = true;
      user.verifiedAt = new Date();
      mockUsers.set(email, user);
      mockVerificationCodes.delete(email);

      console.log(`✅ Email verified successfully for: ${user.name} (${email})`);

      return {
        success: true,
        message: 'Email verified successfully! You can now login to your account.',
        data: {
          email: user.email,
          name: user.name,
          verified: true
        }
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const user = mockUsers.get(email.toLowerCase().trim());
      if (!user) {
        return {
          success: false,
          message: 'User not found. Please register first.'
        };
      }

      if (user.isVerified) {
        return {
          success: false,
          message: 'Email is already verified. You can login now.'
        };
      }

      // Check if previous code was sent recently (prevent spam)
      const existingCode = mockVerificationCodes.get(email);
      if (existingCode && (Date.now() - existingCode.createdAt) < 60 * 1000) {
        return {
          success: false,
          message: 'Please wait 1 minute before requesting a new verification code.'
        };
      }

      // Generate new verification code
      const verificationCode = generateVerificationCode();
      
      mockVerificationCodes.set(email, {
        code: verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
        createdAt: Date.now()
      });

      // Send verification email
      const emailSent = await sendVerificationEmail(email, user.name, verificationCode);
      
      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.'
        };
      }

      console.log(`📧 Verification email resent to ${email} with code: ${verificationCode}`);

      return {
        success: true,
        message: 'Verification code sent successfully! Please check your email.'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email'
      };
    }
  },

  // Login user
  async loginUser(loginData: LoginData): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const email = loginData.email.toLowerCase().trim();
      const user = mockUsers.get(email);
      
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address. Please register first.'
        };
      }


      // Verify password
      const isPasswordValid = await verifyPassword(loginData.password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password. Please check your credentials.'
        };
      }

      // Update last login
      user.lastLogin = new Date();
      mockUsers.set(email, user);

      // Generate mock JWT token
      const token = `aquaflow_token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      console.log(`✅ User logged in successfully: ${user.name} (${email})`);

      return {
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            contactNumber: user.contactNumber,
            address: user.address,
            pincode: user.pincode,
            state: user.state,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin
          }
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  // Send OTP to user phone number
  async sendOTP(phoneNumber: string, pincode?: string): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Validate phone number format
      const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        return {
          success: false,
          message: 'Please enter a valid Indian phone number'
        };
      }

      // Validate pincode if provided
      if (pincode) {
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode)) {
          return {
            success: false,
            message: 'Please enter a valid 6-digit pincode'
          };
        }
      }

      // Try to send OTP via backend API first
      try {
        const response = await fetch('http://localhost:5001/api/users/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, pincode }),
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      } catch (error) {
        console.log('Backend OTP service unavailable, using mock');
      }

      // Mock OTP sending (fallback)
      const mockOTP = '123456';
      console.log(`📱 Mock OTP sent to ${phoneNumber}: ${mockOTP}`);
      
      // Store OTP temporarily (in production, this would be handled by backend)
      localStorage.setItem(`otp_${phoneNumber}`, mockOTP);
      setTimeout(() => {
        localStorage.removeItem(`otp_${phoneNumber}`);
      }, 5 * 60 * 1000); // 5 minutes

      return {
        success: true,
        message: 'OTP sent to your phone number successfully.',
        data: {
          phoneNumber,
          pincode,
          message: `Your OTP is: ${mockOTP} (Mock - valid for 5 minutes)`
        }
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  },

  // Verify OTP and login user
  async verifyOTPAndLogin(phoneNumber: string, otp: string): Promise<AuthResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Try backend verification first
      try {
        const response = await fetch('http://localhost:5001/api/users/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, otp }),
        });

        if (response.ok) {
          const result = await response.json();
          return result;
        }
      } catch (error) {
        console.log('Backend OTP verification unavailable, using mock');
      }

      // Mock OTP verification (fallback)
      const storedOTP = localStorage.getItem(`otp_${phoneNumber}`);
      
      if (!storedOTP) {
        return {
          success: false,
          message: 'OTP expired or not found. Please request a new one.'
        };
      }

      if (storedOTP !== otp) {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again.'
        };
      }

      // Clear OTP after successful verification
      localStorage.removeItem(`otp_${phoneNumber}`);

      // Generate mock user data
      const user = {
        id: `user_${Date.now()}`,
        phoneNumber,
        name: 'User',
        pincode: '000000',
        isVerified: true,
        lastLogin: new Date()
      };

      // Generate mock token
      const token = `aquaflow_token_${user.id}_${Date.now()}`;

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      return {
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          token,
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            name: user.name,
            pincode: user.pincode,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin
          }
        }
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  // Get nearby shops based on user location
  async getNearbyShops(userPincode?: string, userState?: string): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Get user data from localStorage if not provided
      if (!userPincode || !userState) {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          userPincode = user.pincode;
          userState = user.state;
        }
      }

      if (!userPincode) {
        return {
          success: false,
          message: 'User pincode not found. Please update your profile.'
        };
      }

      // Try to fetch real shops from backend API first
      try {
        const response = await fetch(`http://localhost:5001/api/users/shops/by-pincode?pincode=${userPincode}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && Array.isArray(result.data?.shops)) {
            console.log(`✅ Found ${result.data.shops.length} real shops in pincode ${userPincode}`);
            
            // Transform backend data to match frontend format
            const transformedShops = result.data.shops.map((shop: any) => ({
              _id: shop._id,
              shopName: shop.shopName,
              address: shop.address,
              photoUrl: shop.photoUrl || 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
              pricePerJar: shop.pricePerJar,
              rating: shop.rating || 4.5,
              totalReviews: shop.totalReviews || 50,
              coordinates: shop.coordinates || { latitude: 0, longitude: 0 },
              isOpen: shop.isOpen || true,
              distance: shop.distance || 0,
              deliveryTime: shop.deliveryTime || '25-35 min',
              pincode: shop.pincode,
              city: shop.city
            }));

            return {
              success: true,
              data: {
                shops: transformedShops,
                total: transformedShops.length,
                userLocation: {
                  pincode: userPincode,
                  state: userState,
                  coordinates: { latitude: 0, longitude: 0 }
                },
                source: 'backend'
              }
            };
          }
        }
      } catch (error) {
        console.log('Backend API unavailable, falling back to mock data');
      }

      // Fallback to mock data if backend is not available
      console.log(`🏪 Using mock data for pincode ${userPincode}`);
      
      // Get user coordinates
      const userCoords = getCoordinatesFromPincode(userPincode, userState || 'Delhi');

      // Filter shops by state and calculate distances
      let nearbyShops = mockShopsDatabase
        .filter(shop => shop.state === userState)
        .map(shop => {
          const distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            shop.coordinates.latitude,
            shop.coordinates.longitude
          );

          return {
            ...shop,
            distance,
            isOpen: isShopOpen(shop.operatingHours),
            deliveryTime: getDeliveryTime(distance)
          };
        })
        .filter(shop => shop.distance <= 15) // Only show shops within 15km
        .sort((a, b) => a.distance - b.distance); // Sort by distance

      // If no shops in same state, show some nearby shops from other states
      if (nearbyShops.length === 0) {
        nearbyShops = mockShopsDatabase
          .map(shop => {
            const distance = calculateDistance(
              userCoords.latitude,
              userCoords.longitude,
              shop.coordinates.latitude,
              shop.coordinates.longitude
            );

            return {
              ...shop,
              distance,
              isOpen: isShopOpen(shop.operatingHours),
              deliveryTime: getDeliveryTime(distance)
            };
          })
          .filter(shop => shop.distance <= 25) // Wider radius for cross-state
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3); // Show only top 3
      }

      console.log(`🏪 Found ${nearbyShops.length} mock shops near ${userState} (${userPincode})`);

      return {
        success: true,
        data: {
          shops: nearbyShops,
          total: nearbyShops.length,
          userLocation: {
            pincode: userPincode,
            state: userState,
            coordinates: userCoords
          },
          source: 'mock'
        }
      };
    } catch (error) {
      console.error('Fetch shops error:', error);
      return {
        success: false,
        message: 'Failed to fetch shops. Please try again.'
      };
    }
  },

  // Get order history (mock data)
  async getOrderHistory(): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockOrders = [
        {
          _id: 'order1',
          orderNumber: 'WJ17356789001',
          quantity: 5,
          totalAmount: 225,
          status: 'delivered',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          shopId: {
            shopName: 'Pure Water Co.',
            address: '123 Main Street, Connaught Place, Delhi'
          }
        },
        {
          _id: 'order2',
          orderNumber: 'WJ17356789002',
          quantity: 3,
          totalAmount: 126,
          status: 'out-for-delivery',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          shopId: {
            shopName: 'Crystal Springs',
            address: '456 Oak Avenue, Karol Bagh, Delhi'
          }
        }
      ];

      return {
        success: true,
        data: {
          orders: mockOrders,
          subscriptions: []
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch order history'
      };
    }
  },

  // Place order (mock)
  async placeOrder(orderData: any): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const orderNumber = `WJ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const order = {
        _id: `order_${Date.now()}`,
        orderNumber,
        ...orderData,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      console.log(`📦 Order placed successfully: ${orderNumber} for ${orderData.quantity} jars`);

      return {
        success: true,
        message: 'Order placed successfully! You will receive updates via email and SMS.',
        data: { order }
      };
    } catch (error) {
      console.error('Place order error:', error);
      return {
        success: false,
        message: 'Failed to place order. Please try again.'
      };
    }
  }
};