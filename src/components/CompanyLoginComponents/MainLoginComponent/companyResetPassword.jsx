// src/components/Auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyResetPassword = ({ onViewChange, userEmail }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });

  const [passwordMatch, setPasswordMatch] = useState(null);

  // Check password strength
  useEffect(() => {
    const password = formData.newPassword;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [formData.newPassword]);

  // Check password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.newPassword === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.newPassword, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password strength
    const isStrongPassword = Object.values(passwordStrength).every(Boolean);
    if (!isStrongPassword) {
      toast.error('Please meet all password requirements');
      return;
    }

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/job/company/reset-password', {
        email: userEmail,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully!');
        // Redirect to login after successful reset
        setTimeout(() => {
          onViewChange('login');
        }, 1500);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span className="text-xs">{text}</span>
    </div>
  );

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
              onClick={() => onViewChange('verifyOTP')}
              className="flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-6 text-sm"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to OTP
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
              Set New{' '}
              <span className="text-green-200">Password</span>
            </motion.h1>

            <motion.p 
              className="text-sm text-green-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Create a strong new password for your account. Make sure it meets all security requirements.
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
                <h3 className="font-semibold text-sm">Secure Reset</h3>
                <p className="text-green-100 text-xs">Your security is protected</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Strong Password</h3>
                <p className="text-green-100 text-xs">Enhanced account security</p>
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
              <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
              <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter (A-Z)" />
              <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter (a-z)" />
              <PasswordRequirement met={passwordStrength.number} text="One number (0-9)" />
              <PasswordRequirement met={passwordStrength.symbol} text="One symbol (!@#$% etc.)" />
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
              Reset for: {userEmail}
            </p>
          </motion.div>
        </div>

        {/* Right Side - Reset Password Form */}
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
                Create New Password
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Enter a strong new password for your account
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="Create strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <motion.div 
                    className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-xs font-medium text-gray-700 mb-1">Password Requirements:</p>
                    <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
                    <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordStrength.number} text="One number" />
                    <PasswordRequirement met={passwordStrength.symbol} text="One special character" />
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {passwordMatch !== null && (
                  <motion.p 
                    className={`text-xs mt-2 flex items-center gap-1 ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {passwordMatch ? (
                      <>
                        <Check className="w-3 h-3" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        Passwords do not match
                      </>
                    )}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !Object.values(passwordStrength).every(Boolean) || !passwordMatch}
                className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-sm group"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
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
              transition={{ delay: 0.9 }}
            >
              {/* Security Note */}
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">
                  <strong>Note:</strong> Your new password cannot be the same as your old password. For security, please choose a completely new password.
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
              transition={{ delay: 1.0 }}
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

export default CompanyResetPassword;