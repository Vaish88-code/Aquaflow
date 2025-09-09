import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, ArrowLeft, MapPin, Phone, Save } from 'lucide-react';

interface UserData {
  id: string;
  email?: string;
  name?: string;
  contactNumber: string;
  address: string;
  pincode: string;
  state: string;
}

const Addresses: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [address, setAddress] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/user-login');
      return;
    }
    const u = JSON.parse(userData);
    setUser(u);
    setAddress(u.address || '');
    setStateVal(u.state || '');
    setPincode(u.pincode || '');
    setPhone(u.contactNumber || '');
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    // simple validations
    if (!address.trim()) return alert('Please enter address');
    if (!/^\d{6}$/.test(pincode)) return alert('Enter valid 6-digit pincode');
    if (!stateVal.trim()) return alert('Please select state');
    if (!/(^\+91|^91)?[6789]\d{9}$/.test(phone.replace(/\s+/g, ''))) return alert('Enter valid phone number');

    setSaving(true);
    try {
      const updated = { ...user, address: address.trim(), state: stateVal, pincode: pincode.trim(), contactNumber: phone.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      alert('Address updated');
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-700 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Link>
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AquaFlow</span>
            </div>
            <div />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Address</h1>
        <p className="text-gray-600 mb-6">Update your delivery address and contact details.</p>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="House/Flat No., Street, Area, Landmark"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                placeholder="110001"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {saving ? (
                <span className="inline-flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>Saving...</span>
              ) : (
                <span className="inline-flex items-center"><Save className="h-4 w-4 mr-2" />Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addresses;


