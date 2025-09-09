import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { shopkeeperService } from '../services/shopkeeperService';
import Footer from './Footer';
import { 
  Droplets, 
  User, 
  MapPin, 
  Package, 
  CreditCard, 
  Bell, 
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  Calendar,
  Receipt
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  shopId: {
    shopName: string;
    address: string;
  };
}

const UserDashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/user-login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const data = await authService.getOrderHistory();
      if (data.success) {
        setOrders(data.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'out-for-delivery': return 'text-blue-600 bg-blue-50';
      case 'confirmed': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'out-for-delivery': return <Truck className="h-4 w-4" />;
      case 'confirmed': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AquaFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hide-on-mobile">
                <p className="text-sm text-gray-600">Welcome back!</p>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8 flex-1 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Manage your water orders and subscriptions
          </p>
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{user?.address}</span>
          </div>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <span>{user?.state} - {user?.pincode}</span>
          </div>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <span>📞 {user?.contactNumber}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <Link
            to="/shops"
            className="bg-white rounded-xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-sky-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words">New Order</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">Place a new order</p>
              </div>
            </div>
          </Link>

          <Link
            to="/subscriptions"
            className="bg-white rounded-xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words">Subscriptions</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">Monthly plans & billing</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words">Addresses</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">Manage locations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight break-words">Billing</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">Payment history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights CTA */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Hydration Insights</h2>
            <Link to="/insights" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">View Details</Link>
          </div>
          <p className="text-gray-600 mt-2">Track your household’s monthly water intake and targets.</p>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/shops"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Place New Order
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start by placing your first water jar order</p>
              <Link
                to="/shops"
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Shops
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{order.shopId?.shopName}</p>
                      <p className="text-xs text-gray-500">{order.shopId?.address}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-sm text-gray-600">{order.quantity} jars</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit a Complaint */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Raise a Complaint</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                placeholder="e.g., Late delivery, Water quality"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={complaintPriority}
                onChange={(e) => setComplaintPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue you faced..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              disabled={submittingComplaint || !complaintSubject.trim() || !complaintDescription.trim() || !user}
              onClick={async () => {
                if (!user) return;
                setSubmittingComplaint(true);
                try {
                  const res = await shopkeeperService.submitComplaint({
                    user: { name: user.name, email: user.email, contactNumber: user.contactNumber },
                    subject: complaintSubject,
                    description: complaintDescription,
                    priority: complaintPriority
                  });
                  if (res.success) {
                    setComplaintSubject('');
                    setComplaintDescription('');
                    setComplaintPriority('medium');
                    alert('Complaint submitted successfully');
                  } else {
                    alert('Failed to submit complaint');
                  }
                } catch (e) {
                  alert('Error submitting complaint');
                } finally {
                  setSubmittingComplaint(false);
                }
              }}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/shops"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Place New Order
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start by placing your first water jar order</p>
              <Link
                to="/shops"
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Shops
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{order.shopId?.shopName}</p>
                      <p className="text-xs text-gray-500">{order.shopId?.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-sm text-gray-600">{order.quantity} jars</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 mobile-tabs">
        <nav className="grid grid-cols-4">
          {[ 
            { to: '/shops', label: 'Order', icon: Plus },
            { to: '/subscriptions', label: 'Subs', icon: Calendar },
            { to: '/dashboard', label: 'Home', icon: Droplets },
            { to: '/insights', label: 'Insights', icon: Bell },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="flex flex-col items-center justify-center py-2 text-xs text-gray-600">
              <item.icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default UserDashboard;