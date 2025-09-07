import React from 'react';
import { Droplets, Phone, Mail, MapPin, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10" />
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 relative">
          <Link to="/" className="inline-flex items-center text-sky-700 hover:text-sky-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <div className="flex items-center space-x-3 mb-6">
              <Droplets className="h-8 w-8 text-sky-500" />
              <h1 className="text-3xl font-bold text-gray-900">Contact AquaFlow</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-800">
                  <Phone className="h-5 w-5 text-sky-600" />
                  <a href="tel:+917411382100" className="hover:text-sky-700">+91 7411382100</a>
                </div>
                <div className="flex items-center space-x-3 text-gray-800">
                  <Mail className="h-5 w-5 text-sky-600" />
                  <a href="mailto:vg2530774@gmail.com" className="hover:text-sky-700">vg2530774@gmail.com</a>
                </div>
                <div className="flex items-center space-x-3 text-gray-800">
                  <MapPin className="h-5 w-5 text-sky-600" />
                  <span>India</span>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" placeholder="How can we help?" />
                </div>
                <button type="button" className="inline-flex items-center bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-semibold">
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactUs;


