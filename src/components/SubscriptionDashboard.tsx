import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  Calendar, 
  Package, 
  CreditCard, 
  Plus,
  Minus,
  Clock,
  CheckCircle,
  AlertCircle,
  Receipt,
  Download,
  User,
  LogOut
} from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';

interface UserData {
  id: string;
  email: string;
  name: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
}

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  photoUrl: string;
  pricePerJar: number;
  rating: number;
  totalReviews: number;
}

interface Subscription {
  _id: string;
  shopId: Shop;
  plan: string;
  jarsPerMonth: number;
  pricePerJar: number;
  monthlyAmount: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextDeliveryDate: string;
  jarsDeliveredThisMonth: number;
  jarsOrderedThisMonth: number;
  currentMonthBill: number;
  lastPaymentDate?: string;
  nextPaymentDate: string;
  deliveryHistory: Array<{
    date: string;
    quantity: number;
    amount: number;
    status: string;
  }>;
}

interface MonthlyBill {
  month: string;
  year: number;
  totalJars: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  invoiceUrl?: string;
}

const SubscriptionDashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MonthlyBill | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
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
    fetchSubscriptionData(parsedUser.id);
  }, [navigate]);

  const fetchSubscriptionData = async (userId: string) => {
    try {
      const [subscriptionsData, billsData] = await Promise.all([
        subscriptionService.getUserSubscriptions(userId),
        subscriptionService.getMonthlyBills(userId)
      ]);

      if (subscriptionsData.success) {
        setSubscriptions(subscriptionsData.data.subscriptions);
      }

      if (billsData.success) {
        setMonthlyBills(billsData.data.bills);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderJars = async () => {
    if (!selectedSubscription || !user) return;
    
    setOrderLoading(true);
    
    try {
      const response = await subscriptionService.orderJars(
        selectedSubscription._id,
        orderQuantity
      );
      
      if (response.success) {
        setShowOrderModal(false);
        setOrderQuantity(1);
        // Refresh subscription data
        fetchSubscriptionData(user.id);
        alert(`Successfully ordered ${orderQuantity} jars! They will be delivered soon.`);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      alert('Error placing order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePayBill = async (bill: MonthlyBill) => {
    setPaymentLoading(true);
    
    try {
      const response = await subscriptionService.payMonthlyBill(bill.month, bill.year);
      
      if (response.success) {
        setShowBillModal(false);
        // Refresh data
        if (user) fetchSubscriptionData(user.id);
        alert('Payment successful! Invoice has been generated.');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      alert('Error processing payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscriptions...</p>
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
            <Link to="/dashboard" className="flex items-center space-x-2">
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
            My Subscriptions
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your water jar subscriptions and monthly billing
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Subscriptions</h2>
            <Link
              to="/shops?mode=subscription"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              New Subscription
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
              <p className="text-gray-600 mb-6">
                Start a subscription to get regular water jar deliveries at discounted rates
              </p>
              <Link
                to="/shops?mode=subscription"
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Subscription Plans
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {subscriptions.map((subscription) => (
                <div key={subscription._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{subscription.shopId.shopName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{subscription.jarsPerMonth} jars/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per jar:</span>
                      <span className="font-medium">₹{subscription.pricePerJar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This month ordered:</span>
                      <span className="font-medium text-sky-600">{subscription.jarsOrderedThisMonth} jars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This month delivered:</span>
                      <span className="font-medium text-green-600">{subscription.jarsDeliveredThisMonth} jars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current bill:</span>
                      <span className="font-bold text-lg text-sky-600">₹{subscription.currentMonthBill}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setShowOrderModal(true);
                        }}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Order Jars
                      </button>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Bills */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Bills</h2>
          
          {monthlyBills.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bills Yet</h3>
              <p className="text-gray-600">
                Your monthly bills will appear here once you start ordering through subscriptions
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Month</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Jars</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyBills.map((bill, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{bill.month} {bill.year}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{bill.totalJars} jars</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">₹{bill.totalAmount}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                            {bill.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {bill.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {bill.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </div>
                          {bill.paidDate && (
                            <div className="text-xs text-green-600">
                              Paid: {new Date(bill.paidDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {bill.status === 'pending' || bill.status === 'overdue' ? (
                              <button
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowBillModal(true);
                                }}
                                className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <button
                                onClick={() => window.open(bill.invoiceUrl, '_blank')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                <Download className="h-3 w-3 inline mr-1" />
                                Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Jars Modal */}
      {showOrderModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Order Water Jars</h3>
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
                  src={selectedSubscription.shopId.photoUrl}
                  alt={selectedSubscription.shopId.shopName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedSubscription.shopId.shopName}</h4>
                  <p className="text-sm text-gray-600">₹{selectedSubscription.pricePerJar} per jar</p>
                  <p className="text-xs text-gray-500">Subscription Plan: {selectedSubscription.jarsPerMonth} jars/month</p>
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
                <span className="font-medium">₹{selectedSubscription.pricePerJar}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{orderQuantity} jars</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Order Amount:</span>
                <span className="text-sky-600">₹{orderQuantity * selectedSubscription.pricePerJar}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">New month bill:</span>
                  <span className="font-medium text-green-600">
                    ₹{selectedSubscription.currentMonthBill + (orderQuantity * selectedSubscription.pricePerJar)}
                  </span>
                </div>
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
                onClick={handleOrderJars}
                disabled={orderLoading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Ordering...
                  </div>
                ) : (
                  'Order Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pay Monthly Bill</h3>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-8 w-8 text-sky-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedBill.month} {selectedBill.year} Bill
                </h4>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Jars Ordered:</span>
                  <span className="font-medium">{selectedBill.totalJars} jars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(selectedBill.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total Amount:</span>
                  <span className="text-sky-600">₹{selectedBill.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all">
                <option value="upi">UPI Payment</option>
                <option value="card">Credit/Debit Card</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBillModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayBill(selectedBill)}
                disabled={paymentLoading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${selectedBill.totalAmount}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;