// src/components/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Mail, ArrowLeft, Shield, ArrowRight } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyForgotPassword = ({ onViewChange, setUserEmail }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/job/company/send-otp', { email });
      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setUserEmail(email);
        onViewChange('verifyOTP');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
      <motion.div 
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left Side - Header & Branding */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-green-600 to-green-700 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 left-6 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-12 right-8 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute top-20 right-12 w-12 h-12 bg-white rounded-full"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
         

            {/* Main Content */}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <motion.h1 
              className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Reset Your{' '}
              <span className="text-green-200">Password</span>
            </motion.h1>

            <motion.p 
              className="text-sm text-green-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Enter your email address and we'll send you an OTP to reset your password and secure your account.
            </motion.p>
          </motion.div>

          {/* Security Features */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure Process</h3>
                <p className="text-green-100 text-xs">One-time password verification</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Email Delivery</h3>
                <p className="text-green-100 text-xs">OTP sent to registered email</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Text */}
          <motion.div 
            className="mt-6 pt-4 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-green-100 text-xs">
              Your security is our priority
            </p>
          </motion.div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <motion.h2 
                className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Reset Password
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Enter your email to receive verification OTP
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="company@example.com"
                  />
                </div>
                <motion.p 
                  className="text-xs text-gray-500 mt-2 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Shield className="w-3 h-3 text-green-500" />
                  We'll send a 6-digit OTP to this email
                </motion.p>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-sm group"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Additional Options */}
            <motion.div 
              className="mt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Didn't receive OTP?{' '}
                  <button
                    onClick={() => onViewChange('sendOTP')}
                    className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <button
                    onClick={() => onViewChange('login')}
                    className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2"
                  >
                    Back to login
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-xs text-gray-500">
                Need assistance? Contact{' '}
                <a href="mailto:support@prithu.com" className="text-green-600 hover:text-green-700 font-semibold">
                  support@prithu.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanyForgotPassword;