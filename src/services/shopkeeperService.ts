interface ShopkeeperData {
  id: string;
  email: string;
  ownerName: string;
  shopName: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
  gstNumber: string;
  pricePerJar: number;
  photoUrl?: string;
  rating: number;
  totalReviews: number;
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

// Mock data for shopkeeper dashboard
const mockSubscriptionUsers: SubscriptionUser[] = [
  {
    _id: 'sub1',
    userId: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      contactNumber: '+91 9876543210',
      address: '123 Green Park, Sector 15, New Delhi',
      pincode: '110016',
      state: 'Delhi'
    },
    plan: '30-jars',
    jarsPerMonth: 30,
    monthlyAmount: 1350,
    status: 'active',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    jarsDeliveredThisMonth: 18,
    currentMonthBill: 810,
    totalPaid: 4050
  },
  {
    _id: 'sub2',
    userId: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      contactNumber: '+91 9876543211',
      address: '456 Rose Garden, Block A, Gurgaon',
      pincode: '122001',
      state: 'Haryana'
    },
    plan: '45-jars',
    jarsPerMonth: 45,
    monthlyAmount: 2025,
    status: 'active',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    jarsDeliveredThisMonth: 25,
    currentMonthBill: 1125,
    totalPaid: 6075
  },
  {
    _id: 'sub3',
    userId: {
      name: 'Mohammed Ali',
      email: 'mohammed.ali@email.com',
      contactNumber: '+91 9876543212',
      address: '789 Lotus Colony, Phase 2, Noida',
      pincode: '201301',
      state: 'Uttar Pradesh'
    },
    plan: '15-jars',
    jarsPerMonth: 15,
    monthlyAmount: 675,
    status: 'paused',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    jarsDeliveredThisMonth: 8,
    currentMonthBill: 360,
    totalPaid: 1350
  },
  {
    _id: 'sub4',
    userId: {
      name: 'Sunita Patel',
      email: 'sunita.patel@email.com',
      contactNumber: '+91 9876543213',
      address: '321 Marigold Street, Sector 12, Faridabad',
      pincode: '121007',
      state: 'Haryana'
    },
    plan: '30-jars',
    jarsPerMonth: 30,
    monthlyAmount: 1350,
    status: 'active',
    startDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    jarsDeliveredThisMonth: 22,
    currentMonthBill: 990,
    totalPaid: 5400
  }
];

const mockOneTimeUsers: OneTimeUser[] = [
  {
    _id: 'order1',
    orderNumber: 'WJ17356789001',
    userId: {
      name: 'Amit Singh',
      email: 'amit.singh@email.com',
      contactNumber: '+91 9876543214',
      address: '654 Jasmine Apartments, Dwarka, New Delhi'
    },
    quantity: 5,
    totalAmount: 225,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'order2',
    orderNumber: 'WJ17356789002',
    userId: {
      name: 'Deepika Reddy',
      email: 'deepika.reddy@email.com',
      contactNumber: '+91 9876543215',
      address: '987 Tulip Heights, Vasant Kunj, New Delhi'
    },
    quantity: 3,
    totalAmount: 135,
    status: 'out-for-delivery',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'order3',
    orderNumber: 'WJ17356789003',
    userId: {
      name: 'Vikram Gupta',
      email: 'vikram.gupta@email.com',
      contactNumber: '+91 9876543216',
      address: '111 Orchid Plaza, Lajpat Nagar, New Delhi'
    },
    quantity: 8,
    totalAmount: 360,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    _id: 'order4',
    orderNumber: 'WJ17356789004',
    userId: {
      name: 'Kavya Nair',
      email: 'kavya.nair@email.com',
      contactNumber: '+91 9876543217',
      address: '222 Lily Gardens, Saket, New Delhi'
    },
    quantity: 2,
    totalAmount: 90,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

const mockComplaints: Complaint[] = [
  {
    _id: 'complaint1',
    userId: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      contactNumber: '+91 9876543210'
    },
    orderId: 'order1',
    subject: 'Late Delivery',
    description: 'My water jars were delivered 2 hours late from the promised time. This caused inconvenience as I had guests at home.',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'complaint2',
    userId: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      contactNumber: '+91 9876543211'
    },
    subscriptionId: 'sub2',
    subject: 'Water Quality Issue',
    description: 'The water jars delivered yesterday had a strange taste. Please check the quality control process.',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'complaint3',
    userId: {
      name: 'Mohammed Ali',
      email: 'mohammed.ali@email.com',
      contactNumber: '+91 9876543212'
    },
    orderId: 'order2',
    subject: 'Damaged Jar',
    description: 'One of the jars was cracked when delivered. Please provide a replacement.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

interface ShopkeeperRegistrationData {
  ownerName: string;
  email: string;
  password: string;
  phoneNumber: string;
  shopName: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  gstNumber: string;
  pricePerJar: number;
  latitude: number;
  longitude: number;
}

interface UpdateShopData {
  shopName: string;
  pricePerJar: number;
  photoUrl?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

interface ShopkeeperLoginData {
  email: string;
  password: string;
}

interface EmailVerificationData {
  email: string;
  verificationCode: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

import { API_BASE_URL } from '../config/api';

export const shopkeeperService = {
  // Register new shopkeeper
  async registerShopkeeper(data: ShopkeeperRegistrationData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Shopkeeper registration error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Login shopkeeper
  async loginShopkeeper(data: ShopkeeperLoginData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Shopkeeper login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Verify email
  async verifyEmail(data: EmailVerificationData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Resend verification code
  async resendVerificationCode(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get shopkeeper profile (requires authentication)
  async getProfile(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Update shop details (requires authentication)
  async updateShopDetails(token: string, data: UpdateShopData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/update-shop`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update shop details error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get shop orders (real-time orders for shopkeeper dashboard)
  async getShopOrders(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      return {
        success: false,
        message: 'Failed to fetch shop orders'
      };
    }
  },

  // Get order statistics
  async getOrderStats(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/orders/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        success: false,
        message: 'Failed to fetch order statistics'
      };
    }
  },

  // Update order status
  async updateOrderStatus(token: string, orderId: string, status: string, notes?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: 'Failed to update order status'
      };
    }
  },

  // Record a subscription delivery (shopkeeper action)
  async recordSubscriptionDelivery(token: string, subscriptionId: string, quantity: number, notes?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/shopkeeper/subscriptions/${subscriptionId}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, notes }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error recording subscription delivery:', error);
      return {
        success: false,
        message: 'Failed to record subscription delivery'
      };
    }
  },

  // Get subscription users for the shop (legacy - keeping for compatibility)
  async getSubscriptionUsers(shopkeeperId: string): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('shopToken');
      if (!token) {
        return {
          success: false,
          message: 'Authentication token not found'
        };
      }

      const response = await this.getShopOrders(token);
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            users: response.data.subscriptions || [],
            total: response.data.subscriptions?.length || 0,
            activeUsers: response.data.subscriptions?.filter((u: any) => u.status === 'active').length || 0,
            totalRevenue: response.data.subscriptions?.reduce((sum: number, user: any) => sum + (user.monthlyAmount || 0), 0) || 0
          }
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching subscription users:', error);
      return {
        success: false,
        message: 'Failed to fetch subscription users'
      };
    }
  },

  // Get one-time order users for the shop (legacy - keeping for compatibility)
  async getOneTimeUsers(shopkeeperId: string): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('shopToken');
      if (!token) {
        return {
          success: false,
          message: 'Authentication token not found'
        };
      }

      const response = await this.getShopOrders(token);
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            users: response.data.orders || [],
            total: response.data.orders?.length || 0,
            totalRevenue: response.data.orders?.reduce((sum: number, order: any) => sum + order.totalAmount, 0) || 0,
            pendingOrders: response.data.orders?.filter((o: any) => o.status === 'pending').length || 0
          }
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching one-time users:', error);
      return {
        success: false,
        message: 'Failed to fetch one-time orders'
      };
    }
  },

  // Get complaints for the shop
  async getComplaints(shopkeeperId: string): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('shopToken');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/shopkeeper/complaints`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          if (response.ok) {
            return await response.json();
          }
        } catch {}
      }

      // Fallback to local complaints stored by users when offline
      const local = JSON.parse(localStorage.getItem('complaints') || '[]');
      return {
        success: true,
        data: {
          complaints: local,
          total: local.length,
          openComplaints: local.filter((c: any) => c.status === 'open').length,
          resolvedComplaints: local.filter((c: any) => c.status === 'resolved').length
        }
      };
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return {
        success: false,
        message: 'Failed to fetch complaints'
      };
    }
  },
};