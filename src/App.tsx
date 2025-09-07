import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import UserLogin from './components/UserLogin';
import ShopkeeperLogin from './components/ShopkeeperLogin';
import ShopkeeperDashboard from './components/ShopkeeperDashboard';
import ShopSelection from './components/ShopSelection';
import UserDashboard from './components/UserDashboard';
import SubscriptionDashboard from './components/SubscriptionDashboard';
import HydrationInsights from './components/HydrationInsights';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/shopkeeper-login" element={<ShopkeeperLogin />} />
          <Route path="/shopkeeper-dashboard" element={<ShopkeeperDashboard />} />
          <Route path="/shops" element={<ShopSelection />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/subscriptions" element={<SubscriptionDashboard />} />
          <Route path="/insights" element={<HydrationInsights />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;