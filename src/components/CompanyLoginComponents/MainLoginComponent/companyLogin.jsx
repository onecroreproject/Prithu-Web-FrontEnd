// src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Building, Check, X, ArrowRight, Users, Target, Rocket } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyLoginForm = ({ onViewChange, setUserEmail }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check email availability
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (formData.email && formData.email.includes('@')) {
        setCheckingEmail(true);
        try {
          const response = await api.get(`/job/avilability/check?field=email&value=${formData.email}`);
          setEmailAvailable(response.data.available);
        } catch (error) {
          console.error('Email availability check failed');
          setEmailAvailable(null);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (emailAvailable === true) {
      toast.error('This email is not registered. Please sign up first.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/job/company/login', formData);
      
      if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('companyToken', response.data.token);
        localStorage.setItem('companyData', JSON.stringify(response.data.company));
        window.location.href = '/company/home';
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getEmailStatus = () => {
    if (checkingEmail) {
      return {
        color: 'text-blue-600',
        text: 'Checking email...',
        icon: null
      };
    }
    
    if (emailAvailable === true && formData.email) {
      return {
        color: 'text-red-600',
        text: 'Email not registered',
        icon: <X className="w-3 h-3" />
      };
    }
    
    return null;
  };

  const emailStatus = getEmailStatus();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <motion.div 
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxHeight: '85vh' }}
      >
        {/* Left Side - Header & Branding */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
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
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 mb-6">
              <motion.div 
                className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Building className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold">Prithu</h2>
                <p className="text-green-100 text-xs">Business Platform</p>
              </div>
            </div>

            {/* Main Heading */}
            <motion.h1 
              className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back to{' '}
              <span className="text-emerald-200">Prithu</span>
            </motion.h1>

            <motion.p 
              className="text-sm text-green-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Access your company dashboard and manage your business efficiently.
            </motion.p>
          </motion.div>

          {/* Features List */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Team Management</h3>
                <p className="text-green-100 text-xs">Manage your team efficiently</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Business Analytics</h3>
                <p className="text-green-100 text-xs">Track performance insights</p>
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
              Join 10,000+ companies growing with Prithu
            </p>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
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
                Sign In to Your Account
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Enter your credentials to continue
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="Yourmail@example.com"
                  />
                </div>
                {emailStatus && (
                  <motion.p 
                    className={`text-xs mt-1 flex items-center gap-1 ${emailStatus.color} font-medium`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {emailStatus.icon}
                    {emailStatus.text}
                  </motion.p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password */}
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (formData.email) {
                      setUserEmail(formData.email);
                    }
                    onViewChange('forgotPassword');
                  }}
                  className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 flex items-center gap-1 ml-auto w-fit"
                >
                  Forgot password?
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || (emailAvailable === true && formData.email)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-sm group"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => onViewChange('register')}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2"
                >
                  Create account
                </button>
              </p>
            </motion.div>

            {/* Support */}
            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <p className="text-xs text-gray-500">
                Need help? Contact{' '}
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

export default CompanyLoginForm;