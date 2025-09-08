import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Building, 
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  Store,
  FileText,
  IndianRupee
} from 'lucide-react';
import { shopkeeperAuthService } from '../services/shopkeeperAuthService';

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

const ShopkeeperLogin = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [registrationData, setRegistrationData] = useState<ShopkeeperRegistrationData>({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    shopName: '',
    address: '',
    pincode: '',
    state: '',
    gstNumber: '',
    pricePerJar: 45
  });

  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await shopkeeperAuthService.loginShopkeeper(loginData);

      if (response.success) {
        localStorage.setItem('shopToken', response.data.token);
        localStorage.setItem('shopkeeper', JSON.stringify(response.data.shopkeeper));
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/shopkeeper-dashboard');
        }, 1000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await shopkeeperAuthService.registerShopkeeper(registrationData);

      if (response.success) {
        // Always require explicit login after registration
        setMode('login');
        setLoginData({ email: registrationData.email, password: '' });
        setSuccessMessage('Registration successful! Please login with your email and password.');
        setError('');
        setRegistrationData({
          ownerName: '',
          email: '',
          password: '',
          confirmPassword: '',
          contactNumber: '',
          shopName: '',
          address: '',
          pincode: '',
          state: '',
          gstNumber: '',
          pricePerJar: 45
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await shopkeeperAuthService.verifyEmail(currentEmail, verificationCode);

      if (response.success) {
        setSuccessMessage(response.message);
        setError('');
        setTimeout(() => {
          setMode('login');
          setLoginData({ email: currentEmail, password: '' });
          setSuccessMessage('Email verified successfully! Please login with your email and password.');
          setVerificationCode('');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await shopkeeperAuthService.resendVerificationEmail(currentEmail);
      if (response.success) {
        setSuccessMessage(response.message);
        setError('');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode('login');
    setError('');
    setSuccessMessage('');
    setVerificationCode('');
    setCurrentEmail('');
    setLoginData({ email: '', password: '' });
    setRegistrationData({
      ownerName: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactNumber: '',
      shopName: '',
      address: '',
      pincode: '',
      state: '',
      gstNumber: '',
      pricePerJar: 45
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-sky-600 hover:text-sky-700 transition-colors mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="h-10 w-10 text-sky-500" />
            <span className="text-3xl font-bold text-gray-900">Shopkeeper</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 
             mode === 'register' ? 'Register Your Shop' : 'Verify Email'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Sign in to your shop account' :
             mode === 'register' ? 'Join AquaFlow as a partner' : 'Check your email for verification code'}
          </p>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}
          
          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !loginData.email || !loginData.password}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  New partner? Register your shop here
                </button>
              </div>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-owner-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="reg-owner-name"
                    value={registrationData.ownerName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Enter owner's full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-shop-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="reg-shop-name"
                    value={registrationData.shopName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, shopName: e.target.value }))}
                    placeholder="Enter your shop name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="reg-email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-contact" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="reg-contact"
                    value={registrationData.contactNumber}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="reg-address"
                    value={registrationData.address}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Shop No., Street, Area, Landmark"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="reg-pincode"
                    value={registrationData.pincode}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="110001"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-state" className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    id="reg-state"
                    value={registrationData.state}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="reg-gst" className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="reg-gst"
                    value={registrationData.gstNumber}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                    placeholder="07AAACH7409R1ZZ"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all uppercase"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">15-character GST identification number</p>
              </div>

              <div>
                <label htmlFor="reg-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Jar (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="reg-price"
                    value={registrationData.pricePerJar}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, pricePerJar: parseInt(e.target.value) || 0 }))}
                    placeholder="45"
                    min="1"
                    max="200"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reg-confirm-password"
                    value={registrationData.confirmPassword}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !registrationData.ownerName || !registrationData.email || !registrationData.password || !registrationData.confirmPassword || !registrationData.contactNumber || !registrationData.shopName || !registrationData.address || !registrationData.pincode || !registrationData.state || !registrationData.gstNumber}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Registering Shop...
                  </div>
                ) : (
                  'Register Shop'
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  Already have an account? Sign in here
                </button>
              </div>
            </form>
          )}

          {/* Email Verification Form */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyEmail}>
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-sky-100 p-3 rounded-full">
                    <Mail className="h-8 w-8 text-sky-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="text-sm font-medium text-gray-900 text-center mb-4">
                  {currentEmail}
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm text-center">
                    <strong>✅ Verification email sent!</strong><br />
                    Please check your email inbox (and spam folder) for the 6-digit code.
                  </p>
                </div>

                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                    required
                    autoComplete="one-time-code"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="flex flex-col space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="text-sky-600 hover:text-sky-700 disabled:text-gray-400 font-medium transition-colors text-sm"
                >
                  {loading ? 'Sending...' : 'Resend Verification Code'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="text-gray-600 hover:text-gray-700 font-medium transition-colors text-sm"
                >
                  Use Different Email
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By continuing, you agree to our 
              <a href="#" className="text-sky-600 hover:text-sky-700 font-medium ml-1">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperLogin;