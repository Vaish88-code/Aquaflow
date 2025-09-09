import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Users, 
  
  
  Settings, 
  MessageSquare,
  LogOut,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Edit3,
  Save,
  X,
  Camera,
  Star,
  Package,
  TrendingUp,
  Clock,
  Plus,
  
  
} from 'lucide-react';
import { shopkeeperService } from '../services/shopkeeperService';
import ComplaintModal from './ComplaintModal';
import OrderStatusModal from './OrderStatusModal';
import Footer from './Footer';

interface ShopkeeperData {
  id: string;
  email: string;
  ownerName: string;
  shopName: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
  city: string;
  gstNumber: string;
  pricePerJar: number;
  photoUrl?: string;
  rating: number;
  totalReviews: number;
  // Live stats (optional)
  totalOrders?: number;
  todayOrders?: number;
  pendingOrders?: number;
  confirmedOrders?: number;
  deliveredOrders?: number;
  monthlyRevenue?: number;
}

interface SubscriptionUser {
  _id: string;
  userId: {
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    pincode: string;
    state: string;
  };
  plan: string;
  jarsPerMonth: number;
  monthlyAmount: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  jarsDeliveredThisMonth: number;
  jarsOrderedThisMonth?: number;
  currentMonthBill: number;
  totalPaid: number;
}

interface OneTimeUser {
  _id: string;
  orderNumber: string;
  userId: {
    name: string;
    email: string;
    contactNumber: string;
    address: string;
  };
  quantity: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Complaint {
  _id: string;
  userId: {
    name: string;
    email: string;
    contactNumber: string;
  };
  orderId?: string;
  subscriptionId?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
}

const ShopkeeperDashboard = () => {
  const [shopkeeper, setShopkeeper] = useState<ShopkeeperData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionUsers, setSubscriptionUsers] = useState<SubscriptionUser[]>([]);
  const [oneTimeUsers, setOneTimeUsers] = useState<OneTimeUser[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [qtyBySub, setQtyBySub] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingShop, setEditingShop] = useState(false);
  const [editedShopData, setEditedShopData] = useState<Partial<ShopkeeperData>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OneTimeUser | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('shopToken');
    const shopkeeperData = localStorage.getItem('shopkeeper');

    if (!token || !shopkeeperData) {
      navigate('/shopkeeper-login');
      return;
    }

    const parsedShopkeeper = JSON.parse(shopkeeperData);
    setShopkeeper(parsedShopkeeper);
    setEditedShopData(parsedShopkeeper);

    // Always refresh latest profile from server on load
    (async () => {
      try {
        const profile = await shopkeeperService.getProfile(token);
        if (profile?.success && profile.data) {
          const latest = {
            id: profile.data.shopkeeper.id,
            email: profile.data.shopkeeper.email,
            ownerName: profile.data.shopkeeper.ownerName,
            shopName: profile.data.shop?.shopName || parsedShopkeeper.shopName,
            contactNumber: profile.data.shopkeeper.phoneNumber,
            address: profile.data.shop?.address || parsedShopkeeper.address,
            pincode: profile.data.shop?.pincode || parsedShopkeeper.pincode,
            state: profile.data.shop?.state || parsedShopkeeper.state,
            city: profile.data.shop?.city || parsedShopkeeper.city,
            gstNumber: profile.data.shop?.gstNumber || parsedShopkeeper.gstNumber,
            pricePerJar: profile.data.shop?.pricePerJar ?? parsedShopkeeper.pricePerJar,
            photoUrl: profile.data.shop?.photoUrl || parsedShopkeeper.photoUrl,
            rating: profile.data.shop?.rating ?? parsedShopkeeper.rating,
            totalReviews: profile.data.shop?.totalReviews ?? parsedShopkeeper.totalReviews
          } as any;
          setShopkeeper(latest);
          setEditedShopData(latest);
          localStorage.setItem('shopkeeper', JSON.stringify(latest));
        }
      } catch {}
      fetchDashboardData(parsedShopkeeper.id);
    })();

    // Lightweight polling for near real-time updates
    const intervalId = setInterval(() => {
      fetchDashboardData(parsedShopkeeper.id);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchDashboardData = async (shopkeeperId: string) => {
    try {
      const token = localStorage.getItem('shopToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const [ordersData, statsData] = await Promise.all([
        shopkeeperService.getShopOrders(token),
        shopkeeperService.getOrderStats(token)
      ]);

      if (ordersData.success) {
        const allOrders = ordersData.data.orders || [];
        const oneTimeOnly = allOrders.filter((o: any) => (
          o?.paymentMethod !== 'subscription' && o?.orderType !== 'subscription'
        ));
        setOneTimeUsers(oneTimeOnly);
        setSubscriptionUsers(ordersData.data.subscriptions || []);
      }

      // Update shopkeeper data with stats if available
      if (statsData.success && shopkeeper) {
        const updatedShopkeeper = {
          ...shopkeeper,
          totalOrders: statsData.data.totalOrders || 0,
          todayOrders: statsData.data.todayOrders || 0,
          pendingOrders: statsData.data.pendingOrders || 0,
          confirmedOrders: statsData.data.confirmedOrders || 0,
          deliveredOrders: statsData.data.deliveredOrders || 0,
          monthlyRevenue: statsData.data.totalRevenue || 0
        };
        setShopkeeper(updatedShopkeeper);
        localStorage.setItem('shopkeeper', JSON.stringify(updatedShopkeeper));
      }

      // Keep mock complaints for now
      setComplaints([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShopDetails = async () => {
    if (!shopkeeper) return;
    
    // Validate required fields
    if (!editedShopData.shopName || !editedShopData.pricePerJar) {
      alert('Shop name and price per jar are required');
      return;
    }
    
    setSaveLoading(true);
    
    try {
      const token = localStorage.getItem('shopToken');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const updateData = {
        shopName: editedShopData.shopName!,
        pricePerJar: editedShopData.pricePerJar!,
        photoUrl: editedShopData.photoUrl,
        contactNumber: editedShopData.contactNumber,
        address: editedShopData.address,
        city: editedShopData.city,
        pincode: editedShopData.pincode,
        state: editedShopData.state
      };

      const response = await shopkeeperService.updateShopDetails(token, updateData);
      
      if (response.success) {
        const updatedShopkeeper = { ...shopkeeper, ...editedShopData };
        setShopkeeper(updatedShopkeeper);
        localStorage.setItem('shopkeeper', JSON.stringify(updatedShopkeeper));
        setEditingShop(false);
        alert('Shop details updated successfully!');
      } else {
        alert(`Failed to update shop details: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating shop details:', error);
      alert('Error updating shop details. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const handleComplaintResolve = (complaintId: string) => {
    setComplaints(prev => prev.map(c => 
      c._id === complaintId 
        ? { ...c, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
        : c
    ));
  };

  const handleOrderClick = (order: OneTimeUser) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    setOneTimeUsers(prev => prev.map(order => 
      order._id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('shopToken');
    localStorage.removeItem('shopkeeper');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'open': return 'text-red-600 bg-red-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
              <Store className="h-8 w-8 text-sky-500" />
              <div>
                <span className="text-2xl font-bold text-gray-900">AquaFlow</span>
                <p className="text-sm text-gray-600">Shopkeeper Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome back!</p>
                <p className="text-sm font-medium text-gray-900">{shopkeeper?.ownerName}</p>
                <p className="text-xs text-gray-500">{shopkeeper?.shopName}</p>
              </div>
              <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                <Store className="h-5 w-5 text-sky-600" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 flex-1 w-full">
        {/* Shop Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Shop Information</h2>
            <button
              onClick={() => setEditingShop(!editingShop)}
              className="flex items-center space-x-2 text-sky-600 hover:text-sky-700 transition-colors"
            >
              {editingShop ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span>{editingShop ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {editingShop ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={editedShopData.shopName || ''}
                      onChange={(e) => setEditedShopData(prev => ({ ...prev, shopName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Jar (₹)</label>
                    <input
                      type="number"
                      value={editedShopData.pricePerJar || 0}
                      onChange={(e) => setEditedShopData(prev => ({ ...prev, pricePerJar: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      min="1"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Photo URL</label>
                    <input
                      type="url"
                      value={editedShopData.photoUrl || ''}
                      onChange={(e) => setEditedShopData(prev => ({ ...prev, photoUrl: e.target.value }))}
                      placeholder="https://example.com/shop-photo.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSaveShopDetails}
                    disabled={saveLoading}
                    className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saveLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 inline mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <Store className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Shop Name</p>
                      <p className="font-semibold text-gray-900">{shopkeeper?.shopName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Price per Jar</p>
                      <p className="font-semibold text-green-600">₹{shopkeeper?.pricePerJar}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-semibold text-yellow-600">{shopkeeper?.rating} ({shopkeeper?.totalReviews} reviews)</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Owner Name</p>
                  <p className="font-semibold text-gray-900">{shopkeeper?.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="font-semibold text-gray-900">{shopkeeper?.contactNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">{shopkeeper?.address}</p>
                  <p className="text-sm text-gray-500">{shopkeeper?.state} - {shopkeeper?.pincode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 hidden sm:block desktop-tabs">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-2 sm:px-6 overflow-x-auto whitespace-nowrap -mx-2 sm:mx-0 snap-x snap-mandatory scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'subscriptions', label: 'Subscription Users', icon: Users },
                { id: 'orders', label: 'One-time Orders', icon: Package },
                { id: 'complaints', label: 'Complaints', icon: MessageSquare },
                { id: 'settings', label: 'Shop Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 sm:py-4 px-3 sm:px-0 border-b-2 font-medium text-sm transition-colors flex-shrink-0 snap-start ${
                    activeTab === tab.id
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subscription Users</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriptionUsers.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{shopkeeper?.todayOrders ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{shopkeeper?.monthlyRevenue ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivered Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{shopkeeper?.deliveredOrders ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Users Tab */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Users</h3>
                <p className="text-sm text-gray-600">Manage your subscription customers and their billing</p>
              </div>
              
              {subscriptionUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscription Users</h3>
                  <p className="text-gray-600">Subscription users will appear here once they sign up</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscriptionUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.userId.name}</div>
                              <div className="text-sm text-gray-500">{user.userId.email}</div>
                              <div className="text-sm text-gray-500">{user.userId.contactNumber}</div>
                              <div className="text-xs text-gray-400 mt-1">{user.userId.address}</div>
                              <div className="text-xs text-gray-400">{user.userId.state} - {user.userId.pincode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.jarsPerMonth} jars/month</div>
                            <div className="text-sm text-gray-500">₹{user.monthlyAmount}/month</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.jarsDeliveredThisMonth} delivered
                              <span className="text-xs text-gray-500"> / {user.jarsPerMonth}</span>
                            </div>
                            <div className="text-sm text-sky-600">₹{user.currentMonthBill} bill</div>
                            <div className="mt-2 flex items-center space-x-2">
                              <input
                                type="number"
                                min={1}
                                max={Math.max(0, user.jarsPerMonth - user.jarsDeliveredThisMonth)}
                                placeholder="Qty"
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                                value={qtyBySub[user._id] ?? ''}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value);
                                  setQtyBySub(prev => ({ ...prev, [user._id]: isNaN(qty) ? 0 : qty }));
                                }}
                              />
                              <button
                                className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded flex items-center text-sm"
                                onClick={async () => {
                                  try {
                                    const qty = qtyBySub[user._id] || 0;
                                    if (!qty || qty <= 0) { alert('Enter valid quantity'); return; }
                                    const token = localStorage.getItem('shopToken') || '';
                                    const res = await shopkeeperService.recordSubscriptionDelivery(token, user._id, qty);
                                    if (res.success) {
                                      // update current row state without full refresh
                                      setSubscriptionUsers(prev => prev.map(s => s._id === user._id ? {
                                        ...s,
                                        jarsDeliveredThisMonth: res.data.subscription.jarsDeliveredThisMonth,
                                        currentMonthBill: res.data.subscription.currentMonthBill
                                      } : s));
                                      setQtyBySub(prev => ({ ...prev, [user._id]: 0 }));
                                    } else {
                                      alert(res.message || 'Failed to record delivery');
                                    }
                                  } catch (err) {
                                    alert('Error recording delivery');
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Update
                              </button>
                            </div>
                            {(user.jarsDeliveredThisMonth >= user.jarsPerMonth) && (
                              <div className="mt-2 text-xs font-semibold text-red-600">Monthly limit reached – collect payment</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">₹{user.totalPaid}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(user.nextPaymentDate).toLocaleDateString()}
                            </div>
                            {user.lastPaymentDate && (
                              <div className="text-xs text-gray-500">
                                Last: {new Date(user.lastPaymentDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* One-time Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">One-time Orders</h3>
                <p className="text-sm text-gray-600">View and manage one-time order customers</p>
              </div>
              
              {oneTimeUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No One-time Orders</h3>
                  <p className="text-gray-600">One-time orders will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {oneTimeUsers.map((order) => (
                        <tr 
                          key={order._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOrderClick(order)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-flex ${getStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.userId.name}</div>
                              <div className="text-sm text-gray-500">{order.userId.email}</div>
                              <div className="text-sm text-gray-500">{order.userId.contactNumber}</div>
                              <div className="text-xs text-gray-400 mt-1">{order.userId.address}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.quantity} jars</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">₹{order.totalAmount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Complaints</h3>
                <p className="text-sm text-gray-600">View and resolve customer complaints</p>
              </div>
              
              {complaints.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Complaints</h3>
                  <p className="text-gray-600">Customer complaints will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <div 
                      key={complaint._id} 
                      className="p-6 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleComplaintClick(complaint)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{complaint.subject}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority.toUpperCase()}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{complaint.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{complaint.userId.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{complaint.userId.contactNumber}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {complaint.status !== 'resolved' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplaintClick(complaint);
                            }}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Shop Photo</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {shopkeeper?.photoUrl ? (
                        <img
                          src={shopkeeper.photoUrl}
                          alt="Shop"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Upload a new photo for your shop</p>
                      <input
                        type="url"
                        placeholder="Enter photo URL"
                        value={editedShopData.photoUrl || ''}
                        onChange={(e) => setEditedShopData(prev => ({ ...prev, photoUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Pricing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Jar (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={editedShopData.pricePerJar || 0}
                          onChange={(e) => setEditedShopData(prev => ({ ...prev, pricePerJar: parseInt(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          min="1"
                          max="200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Shop Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        value={editedShopData.shopName || ''}
                        onChange={(e) => setEditedShopData(prev => ({ ...prev, shopName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={editedShopData.contactNumber || ''}
                        onChange={(e) => setEditedShopData(prev => ({ ...prev, contactNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveShopDetails}
                    disabled={saveLoading}
                    className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {saveLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving Changes...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 inline mr-2" />
                        Save All Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 mobile-tabs">
        <nav className="grid grid-cols-5">
          {[ 
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'subscriptions', icon: Users, label: 'Subs' },
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'complaints', icon: MessageSquare, label: 'Compl.' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                activeTab === item.id ? 'text-sky-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Complaint Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          isOpen={showComplaintModal}
          onClose={() => {
            setShowComplaintModal(false);
            setSelectedComplaint(null);
          }}
          onResolve={handleComplaintResolve}
        />
      )}

      {/* Order Status Modal */}
      {selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      <Footer />
    </div>
  );
};

export default ShopkeeperDashboard;