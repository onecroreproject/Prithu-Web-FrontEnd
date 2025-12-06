// src/components/Auth/VerifyOTP.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Shield, ArrowLeft, Mail, Check, X } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const CompanyVerifyOTP = ({ onViewChange, userEmail, setUserEmail }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds timer
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').concat(Array(4 - pasteData.length).fill(''));
      setOtp(newOtp);
      inputsRef.current[Math.min(pasteData.length, 3)].focus();
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const otpString = otp.join('');

  if (otpString.length !== 4) {
    toast.error('Please enter complete 4-digit OTP');
    return;
  }

  setLoading(true);

  try {
    const response = await api.post('/job/company/verify-otp', {
      email: userEmail,
      otp: otpString
    });

    if (response.data.success) {
      toast.success('OTP verified successfully!');
      // Navigate directly to reset password
      onViewChange('resetPassword');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'OTP verification failed';
    toast.error(message);
    setLoading(false);
  }
};

  const handleResend = async () => {
    try {
      const response = await api.post('/job/company/send-otp', { email: userEmail });
      
      if (response.data.success) {
        toast.success('New 4-digit OTP sent!');
        setTimer(60); // Reset timer to 60 seconds
        setOtp(['', '', '', '']);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    }
  };

  const handleChangeEmail = () => {
    // Go back to forgot password with current email pre-filled
    onViewChange('forgotPassword');
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
              onClick={() => onViewChange('forgotPassword')}
              className="flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-6 text-sm"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to reset
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
              Verify Your{' '}
              <span className="text-green-200">OTP</span>
            </motion.h1>

            <motion.p 
              className="text-sm text-green-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Enter the 4-digit verification code sent to your email to reset your password securely.
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
                <h3 className="font-semibold text-sm">4-digit Code</h3>
                <p className="text-green-100 text-xs">Quick and secure verification</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Email Verification</h3>
                <p className="text-green-100 text-xs">Sent to: {userEmail}</p>
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
              Secure password reset process
            </p>
          </motion.div>
        </div>

        {/* Right Side - OTP Verification Form */}
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
                Verify OTP
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm mb-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Enter the 4-digit code sent to {userEmail}
              </motion.p>

              {/* Timer */}
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className={`text-sm font-medium ${timer > 30 ? 'text-green-600' : 'text-red-600'}`}>
                  OTP expires in: {formatTime(timer)}
                </p>
              </motion.div>
            </div>

            {/* Success Message */}
            {showPasswordRequirements && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">
                    OTP verified! Preparing password reset...
                  </p>
                </div>
              </motion.div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Inputs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={otp[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-14 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      whileFocus={{ scale: 1.05 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Enter 4-digit code
                </p>
              </motion.div>

              {/* Verify Button */}
              <motion.button
                type="submit"
                disabled={loading || timer === 0}
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
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify 4-digit OTP
                    <ArrowLeft className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Additional Options */}
            <motion.div 
              className="mt-6 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {/* Change Email */}
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Need to use a different email?
                </p>
                <button
                  onClick={handleChangeEmail}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline underline-offset-2 flex items-center justify-center gap-2 mx-auto"
                >
                  <Mail className="w-4 h-4" />
                  Change Email Address
                </button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Didn't receive code?{' '}
                  <button
                    onClick={handleResend}
                    disabled={timer > 0}
                    className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend 4-digit OTP {timer > 0 && `(${formatTime(timer)})`}
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

export default CompanyVerifyOTP;