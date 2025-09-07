import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Truck, Shield, IndianRupee, CreditCard, Package } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AquaFlow</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-sky-600 transition-colors">Features</a>
              <Link to="/about" className="text-gray-600 hover:text-sky-600 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-sky-600 transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Smart Water Jar
                <span className="text-sky-500 block">Delivery</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Order water jars online, pay easily, and track deliveries in real-time. 
                Fresh, pure water delivered right to your doorstep.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/user-login"
                  className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Login as User
                </Link>
                <Link
                  to="/shopkeeper-login"
                  className="bg-white hover:bg-gray-50 text-sky-600 border-2 border-sky-500 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Login as Shopkeeper
                </Link>
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Water delivery service"
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-sky-100 p-2 rounded-lg">
                      <Truck className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Fast Delivery</p>
                      <p className="text-xs text-gray-600">Within 30 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Roadmap style, alternating left-right) */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose AquaFlow?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experience modern water delivery with live updates</p>
          </div>

          <div className="relative">
            {/* center line */}
            <div className="hidden md:block absolute left-1/2 top-0 -translate-x-1/2 w-1 bg-gradient-to-b from-sky-200 to-blue-200 h-full rounded"></div>

            <div className="space-y-10">
              {/* Item 1 - left */}
              <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                <div className="md:pr-12">
                  <div className="bg-sky-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-sky-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <Droplets className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Pure Quality</h3>
                    </div>
                    <p className="text-gray-600">Premium filtered water from trusted sources</p>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="bg-white border-2 border-sky-200 w-6 h-6 rounded-full -ml-3"></div>
                </div>
              </div>

              {/* Item 2 - right */}
              <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                <div className="hidden md:flex justify-center order-2 md:order-1">
                  <div className="bg-white border-2 border-teal-200 w-6 h-6 rounded-full -mr-3"></div>
                </div>
                <div className="md:pl-12 order-1 md:order-2">
                  <div className="bg-teal-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Fast Delivery</h3>
                    </div>
                    <p className="text-gray-600">Quick delivery within 30 minutes</p>
                  </div>
                </div>
              </div>

              {/* Item 3 - left */}
              <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                <div className="md:pr-12">
                  <div className="bg-blue-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <IndianRupee className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Real-time Payments</h3>
                    </div>
                    <p className="text-gray-600">Live payment records as orders are fulfilled</p>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="bg-white border-2 border-blue-200 w-6 h-6 rounded-full -ml-3"></div>
                </div>
              </div>

              {/* Item 4 - right */}
              <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                <div className="hidden md:flex justify-center order-2 md:order-1">
                  <div className="bg-white border-2 border-cyan-200 w-6 h-6 rounded-full -mr-3"></div>
                </div>
                <div className="md:pl-12 order-1 md:order-2">
                  <div className="bg-cyan-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-cyan-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Subscriptions</h3>
                    </div>
                    <p className="text-gray-600">Monthly plans with weekly deliveries and billing</p>
                  </div>
                </div>
              </div>

              {/* Item 5 - left */}
              <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
                <div className="md:pr-12">
                  <div className="bg-indigo-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-indigo-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">One-time Orders</h3>
                    </div>
                    <p className="text-gray-600">Instant ordering with doorstep delivery</p>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="bg-white border-2 border-indigo-200 w-6 h-6 rounded-full -ml-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-sky-100 mb-10">
            Join thousands of satisfied customers who trust AquaFlow for their water needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/user-login"
              className="bg-white hover:bg-gray-100 text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Ordering Now
            </Link>
            <Link
              to="/shopkeeper-login"
              className="border-2 border-white hover:bg-white hover:text-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Partner with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Droplets className="h-8 w-8 text-sky-400" />
                <span className="text-2xl font-bold">AquaFlow</span>
              </div>
              <p className="text-gray-400">
                Smart water jar delivery service bringing pure, fresh water to your doorstep with convenience and reliability.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-sky-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AquaFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;