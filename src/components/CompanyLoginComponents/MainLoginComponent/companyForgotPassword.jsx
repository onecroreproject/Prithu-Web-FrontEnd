// src/components/Auth/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Shield, ArrowRight, X, Check } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyForgotPassword = ({ onViewChange, setUserEmail }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(null); // null: not checked, true: exists, false: doesn't exist
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check email availability when email changes
  useEffect(() => {
    const checkEmailExists = async () => {
      if (email && email.includes('@')) {
        setCheckingEmail(true);
        try {
          const response = await api.get(`/job/avilability/check?field=email&value=${email}`);
          // Note: The API returns { available: true/false }
          // For forgot password, we want the opposite: if email is "available" (not taken), it doesn't exist
          // If email is "taken" (available: false), it exists
          setEmailExists(!response.data.available);
        } catch (error) {
          console.error('Email check failed:', error);
          setEmailExists(null);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailExists(null);
      }
    };

    const timer = setTimeout(() => {
      if (email && email.includes('@')) {
        checkEmailExists();
      } else {
        setEmailExists(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (emailExists === false) {
      toast.error('This email is not registered. Please register first.');
      return;
    }

    if (emailExists === null) {
      toast.error('Please wait while we verify your email');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/job/company/send-otp', { email });
      
      if (response.data.success) {
        toast.success('4-digit OTP sent to your email!');
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

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
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
            {/* Back Button */}
            <motion.button
              onClick={() => onViewChange("login")}
              className="flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-6 text-sm"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </motion.button>

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
              Enter your registered email address and we'll send you a 4-digit OTP to reset your password securely.
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
                <p className="text-green-100 text-xs">4-digit OTP verification</p>
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

          {/* Password Requirements Info */}
          <motion.div 
            className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-semibold text-sm mb-2 text-green-100">Password Requirements:</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-300" />
                </div>
                <span className="text-xs text-green-100">At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-300" />
                </div>
                <span className="text-xs text-green-100">One uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-300" />
                </div>
                <span className="text-xs text-green-100">One lowercase letter (a-z)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-300" />
                </div>
                <span className="text-xs text-green-100">One number (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-300" />
                </div>
                <span className="text-xs text-green-100">One symbol (!@#$% etc.)</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Text */}
          <motion.div 
            className="mt-6 pt-4 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
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
                Enter your registered email to receive 4-digit verification OTP
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
                    onChange={handleEmailChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="company@example.com"
                  />
                </div>
                
                {/* Email Status Indicator */}
                {checkingEmail && email && email.includes('@') && (
                  <motion.p 
                    className="text-xs text-blue-600 mt-2 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Checking email...
                  </motion.p>
                )}
                
                {emailExists === true && (
                  <motion.p 
                    className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Check className="w-3 h-3" />
                    Email verified. You can send 4-digit OTP.
                  </motion.p>
                )}
                
                {emailExists === false && (
                  <motion.p 
                    className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <X className="w-3 h-3" />
                    This email is not registered.
                  </motion.p>
                )}
                
                {!checkingEmail && !emailExists && email && email.includes('@') && (
                  <motion.p 
                    className="text-xs text-gray-500 mt-2 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Shield className="w-3 h-3 text-green-500" />
                    We'll send a 4-digit OTP to this email
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || checkingEmail || emailExists === false || !email || !email.includes('@')}
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
                    Sending 4-digit OTP...
                  </>
                ) : (
                  <>
                    Send 4-digit OTP
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
              {/* Register Link if email doesn't exist */}
              {emailExists === false && (
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Don't have an account?{' '}
                    <button
                      onClick={() => onViewChange('register')}
                      className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              )}

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