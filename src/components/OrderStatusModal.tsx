import React, { useState } from 'react';
import { X, Package, User, Phone, MapPin, Calendar, Truck, CheckCircle } from 'lucide-react';
import { shopkeeperService } from '../services/shopkeeperService';

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

interface OrderStatusModalProps {
  order: OneTimeUser;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      onClose();
      return;
    }

    setUpdating(true);
    
    try {
      const response = await shopkeeperService.updateOrderStatus(order._id, newStatus);
      
      if (response.success) {
        onStatusUpdate(order._id, newStatus);
        onClose();
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      alert('Error updating order status. Please try again.');
    } finally {
      setUpdating(false);
    }
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

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Package },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { value: 'preparing', label: 'Preparing', icon: Package },
    { value: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Information */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{order.quantity} jars</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-green-600">₹{order.totalAmount}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Current Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">Customer Details</h5>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">{order.userId.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{order.userId.contactNumber}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{order.userId.address}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="mb-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">Update Order Status</h5>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    newStatus === option.value
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={newStatus === option.value}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <option.icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === order.status}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {updating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusModal;