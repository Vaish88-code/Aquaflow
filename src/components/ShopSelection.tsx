import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  MapPin, 
  Star, 
  IndianRupee, 
  Clock, 
  Filter,
  User,
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  Calendar
} from 'lucide-react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import { API_BASE_URL } from '../config/api';

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
}

interface UserData {
  id: string;
  email: string;
  name: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
}

const ShopSelection = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [sortBy, setSortBy] = useState('nearest');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'5-jars' | '8-jars' | '10-jars' | '15-jars' | '30-jars' | '45-jars'>('30-jars');
  const [orderLoading, setOrderLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'order'; // 'order' or 'subscription'
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/user-login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchShops(parsedUser.pincode, parsedUser.state);
  }, [navigate]);

  const fetchShops = async (pincode: string, state: string) => {
    try {
      const data = await authService.getNearbyShops(pincode, state);
      if (data.success) {
        let sortedShops = [...data.data.shops];
        
        // Apply sorting
        switch (sortBy) {
          case 'rating':
            sortedShops.sort((a, b) => b.rating - a.rating);
            break;
          case 'price-low':
            sortedShops.sort((a, b) => a.pricePerJar - b.pricePerJar);
            break;
          case 'price-high':
            sortedShops.sort((a, b) => b.pricePerJar - a.pricePerJar);
            break;
          default: // nearest
            sortedShops.sort((a, b) => a.distance - b.distance);
        }
        
        setShops(sortedShops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    if (mode === 'subscription') {
      setShowSubscriptionModal(true);
    } else {
      setShowOrderModal(true);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedShop || !user) return;
    
    setOrderLoading(true);
    
    try {
      const attemptPlaceOrder = async (bearerToken: string) => {
        const response = await fetch(`${API_BASE_URL}/users/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopId: selectedShop._id,
            quantity: orderQuantity,
            deliveryAddress: {
              address: user.address,
              landmark: '',
              coordinates: {
                latitude: 0,
                longitude: 0
              }
            },
            customerName: user.name,
            contactNumber: user.contactNumber,
            paymentMethod: 'cash',
            notes: ''
          }),
        });
        const result = await response.json();
        return { ok: response.ok, result };
      };

      // Try with existing token
      let token = localStorage.getItem('token') || '';
      let { ok, result } = await attemptPlaceOrder(token);

      // If invalid token, auto-login via OTP (backend issues real JWT)
      if (!ok && (result?.message === 'Invalid token.' || result?.message === 'Access denied. No token provided.')) {
        try {
          // 1) Send OTP
          await fetch(`${API_BASE_URL}/users/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: user.contactNumber, pincode: user.pincode })
          });

          // 2) Verify OTP (backend uses 123456 in dev)
          const verifyRes = await fetch(`${API_BASE_URL}/users/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: user.contactNumber, otp: '123456' })
          });
          const verifyJson = await verifyRes.json();

          if (verifyRes.ok && verifyJson.success && verifyJson.data?.token) {
            token = verifyJson.data.token;
            localStorage.setItem('token', token);
            if (verifyJson.data.user) {
              localStorage.setItem('user', JSON.stringify({ ...user, ...verifyJson.data.user }));
            }

            // Retry order with fresh token
            const retry = await attemptPlaceOrder(token);
            ok = retry.ok; result = retry.result;
          }
        } catch (e) {
          // fallthrough to result handling
        }
      }

      if (ok && result?.success) {
        setShowOrderModal(false);
        alert(`Order placed successfully! Order number: ${result.data.order.orderNumber}`);
        navigate('/dashboard');
      } else {
        const msg = result?.message || 'Failed to place order. Please try again.';
        alert(`Failed to place order: ${msg}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!selectedShop || !user) return;
    
    setSubscriptionLoading(true);
    
    try {
      // Ensure valid user token; if missing/invalid, auto-login via OTP
      let token = localStorage.getItem('token');
      if (!token) {
        await fetch(`${API_BASE_URL}/users/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: user.contactNumber, pincode: user.pincode })
        });
        const verifyRes = await fetch(`${API_BASE_URL}/users/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: user.contactNumber, otp: '123456' })
        });
        const verifyJson = await verifyRes.json();
        if (verifyRes.ok && verifyJson.success && verifyJson.data?.token) {
          token = verifyJson.data.token;
          localStorage.setItem('token', token);
        }
      }

      const subscriptionData = {
        shopId: selectedShop._id,
        plan: selectedPlan,
        deliveryAddress: user.address,
        paymentMethod: 'upi' as const
      };

      let response = await subscriptionService.createSubscription(subscriptionData);

      // If token invalid/missing, auto-login via OTP and retry once
      if (!response?.success) {
        const msg = (response && response.message) || '';
        if (msg === 'Invalid token.' || msg === 'Access denied. No token provided.') {
          try {
            await fetch(`${API_BASE_URL}/users/send-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: user.contactNumber, pincode: user.pincode })
            });
            const verifyRes = await fetch(`${API_BASE_URL}/users/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: user.contactNumber, otp: '123456' })
            });
            const verifyJson = await verifyRes.json();
            if (verifyRes.ok && verifyJson.success && verifyJson.data?.token) {
              localStorage.setItem('token', verifyJson.data.token);
              response = await subscriptionService.createSubscription(subscriptionData);
            }
          } catch {}
        }
      }

      if (response.success) {
        setShowSubscriptionModal(false);
        alert('Subscription created successfully! You can now order jars monthly.');
        navigate('/subscriptions');
      } else {
        const msg = response?.message || 'Failed to create subscription. Please try again.';
        alert(msg);
      }
    } catch (error) {
      alert('Error creating subscription. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Finding water shops near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AquaFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome, {user?.name}!</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-sky-600" />
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-700 transition-colors mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {mode === 'subscription' ? 'Choose Shop for Subscription' : 'Water Shops Near You'}
          </h1>
          <p className="text-gray-600 text-lg">
            {mode === 'subscription' 
              ? `Create a monthly subscription plan with shops in ${user?.state}` 
              : `Found ${shops.length} shops in ${user?.state} delivering to ${user?.pincode}`
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Delivering to: {user?.address}
          </p>
          
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                if (user) fetchShops(user.pincode, user.state);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            >
              <option value="nearest">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Shops Grid */}
        {shops.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <div
                key={shop._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={shop.photoUrl}
                    alt={shop.shopName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{shop.rating}</span>
                    </div>
                  </div>
                  {shop.isOpen ? (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      Open
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      Closed
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.shopName}</h3>
                  
                  <div className="flex items-start space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{shop.address}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600">{shop.pricePerJar}</span>
                      <span className="text-sm text-gray-600">per jar</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{shop.deliveryTime}</span>
                      </div>
                      <p className="text-xs text-gray-500">{shop.distance.toFixed(1)} km away</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{shop.rating}</span>
                      <span className="text-sm text-gray-600">({shop.totalReviews} reviews)</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleShopSelect(shop)}
                    disabled={!shop.isOpen}
                    className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {!shop.isOpen ? 'Currently Closed' : 
                     mode === 'subscription' ? 'Create Subscription' : 'Order Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops found in your area</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any water shops in {user?.state} near pincode {user?.pincode}
            </p>
            <Link
              to="/dashboard"
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Place Order</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={selectedShop.photoUrl}
                  alt={selectedShop.shopName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedShop.shopName}</h4>
                  <p className="text-sm text-gray-600">₹{selectedShop.pricePerJar} per jar</p>
                  <p className="text-xs text-gray-500">{selectedShop.deliveryTime}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {orderQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderQuantity(orderQuantity + 1)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Price per jar:</span>
                <span className="font-medium">₹{selectedShop.pricePerJar}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{orderQuantity} jars</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-sky-600">₹{orderQuantity * selectedShop.pricePerJar}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">{user?.address}</p>
                <p className="text-xs text-gray-600">{user?.state} - {user?.pincode}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Placing...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create Subscription</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={selectedShop.photoUrl}
                  alt={selectedShop.shopName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedShop.shopName}</h4>
                  <p className="text-sm text-gray-600">₹{selectedShop.pricePerJar} per jar</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">{selectedShop.rating} ({selectedShop.totalReviews})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Subscription Plan
              </label>
              <div className="space-y-3">
                {[
                  { plan: '5-jars' as const, jars: 5, savings: '0%' },
                  { plan: '8-jars' as const, jars: 8, savings: '0%' },
                  { plan: '10-jars' as const, jars: 10, savings: '0%' },
                  { plan: '15-jars' as const, jars: 15, savings: '5%' },
                  { plan: '30-jars' as const, jars: 30, savings: '10%' },
                  { plan: '45-jars' as const, jars: 45, savings: '15%' }
                ].map(({ plan, jars, savings }) => (
                  <div
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan 
                        ? 'border-sky-500 bg-sky-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{jars} Jars/Month</h4>
                        <p className="text-sm text-gray-600">Save {savings} on regular price</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sky-600">₹{jars * selectedShop.pricePerJar}</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">How it works:</span>
              </div>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Order jars anytime during the month</li>
                <li>• Pay only for what you order</li>
                <li>• Monthly bill generated at month end</li>
                <li>• Convenient monthly payment</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">{user?.address}</p>
                <p className="text-xs text-gray-600">{user?.state} - {user?.pincode}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubscription}
                disabled={subscriptionLoading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSelection;