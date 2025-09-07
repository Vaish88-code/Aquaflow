import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Footer from './Footer';
import { Droplets, ArrowLeft } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const circumference = 2 * Math.PI * 64; // r = 64

const HydrationInsights: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Require auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/user-login');
      return;
    }
    (async () => {
      try {
        const data = await authService.getOrderHistory();
        if (data.success) setOrders(data.data.orders || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const metrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const jarsThisMonth = orders
      .filter(o => new Date(o.createdAt).getMonth() === currentMonth)
      .reduce((sum, o) => sum + (o.quantity || 0), 0);
    const litersPerJar = 20;
    const totalLiters = jarsThisMonth * litersPerJar;
    const householdSize = 3;
    const recommendedPerPersonPerDay = 2.5;
    const daysThisMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const recommendedTotal = householdSize * recommendedPerPersonPerDay * daysThisMonth;
    const ratio = Math.max(0, Math.min(1, totalLiters / recommendedTotal));
    const remainingLiters = Math.max(0, Math.round(recommendedTotal - totalLiters));
    return { jarsThisMonth, totalLiters, recommendedTotal: Math.round(recommendedTotal), ratio, remainingLiters };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  const progress = circumference * (1 - metrics.ratio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-sky-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Droplets className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">Hydration Insights</span>
            </div>
            <Link to="/dashboard" className="text-sky-600 hover:text-sky-700">Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <svg width="220" height="220" viewBox="0 0 160 160" className="block">
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="64" stroke="#e5e7eb" strokeWidth="16" fill="none" />
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="url(#g1)"
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={progress}
                transform="rotate(-90 80 80)"
              />
              <text x="80" y="75" textAnchor="middle" className="fill-gray-900" fontSize="22" fontWeight="700">
                {Math.round(metrics.ratio * 100)}%
              </text>
              <text x="80" y="95" textAnchor="middle" className="fill-gray-500" fontSize="10">
                of monthly target
              </text>
            </svg>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-sky-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Jars ordered</p>
                <p className="text-2xl font-bold text-sky-700">{metrics.jarsThisMonth}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Total liters</p>
                <p className="text-2xl font-bold text-blue-700">{metrics.totalLiters}L</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Recommended</p>
                <p className="text-2xl font-bold text-green-700">{metrics.recommendedTotal}L</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-amber-700">{metrics.remainingLiters}L</p>
              </div>
            </div>
            {metrics.remainingLiters > 0 ? (
              <p className="text-amber-700">
                You may need about {Math.ceil(metrics.remainingLiters / 20)} more jar(s) to reach a healthy monthly intake.
              </p>
            ) : (
              <p className="text-emerald-700">Great! You’ve reached your monthly recommended hydration target.</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HydrationInsights;


