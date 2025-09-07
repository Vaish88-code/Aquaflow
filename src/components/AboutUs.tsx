import React from 'react';
import { Droplets, Heart, Shield, Users, MapPin, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10" />
        {/* Floating glow blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative">
          <Link to="/" className="inline-flex items-center text-sky-700 hover:text-sky-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3 mr-1" /> Our Mission
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Pure water, delivered with care
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-7">
              At AquaFlow, we blend trusted local suppliers with technology to make hydration effortless—fast delivery,
              live updates, and flexible plans you control. AquaFlow stands for pure water, transparent pricing, and
              a delightful customer experience across one-time orders and subscriptions.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-sky-200/60 bg-white/70 backdrop-blur p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-sky-700">30m</p>
                <p className="text-xs text-gray-500">Avg delivery</p>
              </div>
              <div className="rounded-xl border border-sky-200/60 bg-white/70 backdrop-blur p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-sky-700">24x7</p>
                <p className="text-xs text-gray-500">Support</p>
              </div>
              <div className="rounded-xl border border-sky-200/60 bg-white/70 backdrop-blur p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-sky-700">100%</p>
                <p className="text-xs text-gray-500">Quality checks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h3 className="font-semibold text-gray-900">Customer First</h3>
            </div>
            <p className="text-gray-600 text-sm">Your convenience guides every decision we make.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Quality & Trust</h3>
            </div>
            <p className="text-gray-600 text-sm">Verified partners and clear standards for purity.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold text-gray-900">For Everyone</h3>
            </div>
            <p className="text-gray-600 text-sm">Subscriptions or on-demand—AquaFlow fits your lifestyle.</p>
          </div>
        </section>

        {/* What we offer */}
        <section className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-sky-100 p-5">
              <div className="flex items-center space-x-3 mb-2 text-sky-700">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Fast & Live</span>
              </div>
              <p className="text-gray-600 text-sm">Speedy delivery with live order updates.</p>
            </div>
            <div className="rounded-xl border border-sky-100 p-5">
              <div className="flex items-center space-x-3 mb-2 text-sky-700">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Nearby & Reliable</span>
              </div>
              <p className="text-gray-600 text-sm">Find shops by pincode or city instantly.</p>
            </div>
            <div className="rounded-xl border border-sky-100 p-5">
              <div className="flex items-center space-x-3 mb-2 text-sky-700">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Secure Payments</span>
              </div>
              <p className="text-gray-600 text-sm">Transparent billing and secure transactions.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/" className="inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold shadow">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
 


