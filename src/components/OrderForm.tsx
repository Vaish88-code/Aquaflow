import { useState } from 'react';
import { Package, MapPin, IndianRupee, Clock, User, Phone } from 'lucide-react';

interface Shop {
  _id: string;
  shopName: string;
  address: string;
  pricePerJar: number;
  photoUrl?: string;
}

interface OrderFormProps {
  shop: Shop;
  onOrderPlaced: (order: any) => void;
  onClose: () => void;
}

const OrderForm = ({ shop, onOrderPlaced, onClose }: OrderFormProps) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = quantity * shop.pricePerJar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('Please login to place an order');
        return;
      }

      const orderData = {
        shopId: shop._id,
        quantity,
        deliveryAddress: {
          address: deliveryAddress,
          landmark: '',
          coordinates: {
            latitude: 0,
            longitude: 0
          }
        },
        paymentMethod: 'cash',
        notes
      };

      const response = await fetch('http://localhost:5000/api/users/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        alert('Order placed successfully! Shopkeeper will be notified.');
        onOrderPlaced(result.data.order);
        onClose();
      } else {
        alert(`Failed to place order: ${result.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Place Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Shop Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              {shop.photoUrl ? (
                <img
                  src={shop.photoUrl}
                  alt={shop.shopName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-sky-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                <p className="text-sm text-gray-600">{shop.address}</p>
                <p className="text-sm text-green-600 font-medium">₹{shop.pricePerJar} per jar</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (Jars)
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-sky-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{quantity} jars × ₹{shop.pricePerJar}</span>
                  <span className="font-medium">₹{quantity * shop.pricePerJar}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-sky-200 pt-2">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">Cash on Delivery</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">Pay when your order is delivered</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !deliveryAddress.trim()}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Placing Order...
                </div>
              ) : (
                <>
                  <Package className="h-4 w-4 inline mr-2" />
                  Place Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
