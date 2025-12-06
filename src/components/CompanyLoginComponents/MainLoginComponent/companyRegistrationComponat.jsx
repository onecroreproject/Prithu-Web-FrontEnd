// src/components/Auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Briefcase, Shield, MessageCircle, Check, X, Copy, ArrowLeft, ArrowRight, Users, Target, Rocket } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyRegister = ({ onViewChange, setUserEmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
    phone: '',
    whatsAppNumber: '',
    companyName: '',
    companyEmail: '',
    username: ''
  });
  
  // OTP states for both emails
  const [personalOtp, setPersonalOtp] = useState(['', '', '', '']);
  const [companyOtp, setCompanyOtp] = useState(['', '', '', '']);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP sending states
  const [sendingPersonalOtp, setSendingPersonalOtp] = useState(false);
  const [sendingCompanyOtp, setSendingCompanyOtp] = useState(false);
  const [verifyingPersonalOtp, setVerifyingPersonalOtp] = useState(false);
  const [verifyingCompanyOtp, setVerifyingCompanyOtp] = useState(false);
  
  const [availability, setAvailability] = useState({});
  
  // Email verification states
  const [personalEmailVerified, setPersonalEmailVerified] = useState(false);
  const [companyEmailVerified, setCompanyEmailVerified] = useState(false);
  
  // OTP section visibility
  const [showPersonalOtpSection, setShowPersonalOtpSection] = useState(false);
  const [showCompanyOtpSection, setShowCompanyOtpSection] = useState(false);
  
  // Timers for resend OTP
  const [personalOtpTimer, setPersonalOtpTimer] = useState(0);
  const [companyOtpTimer, setCompanyOtpTimer] = useState(0);
  
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
  
  const personalOtpInputsRef = React.useRef([]);
  const companyOtpInputsRef = React.useRef([]);

  // Timer effects
  useEffect(() => {
    let interval;
    if (personalOtpTimer > 0) {
      interval = setInterval(() => {
        setPersonalOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [personalOtpTimer]);

  useEffect(() => {
    let interval;
    if (companyOtpTimer > 0) {
      interval = setInterval(() => {
        setCompanyOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [companyOtpTimer]);

  // Check availability for all fields
  useEffect(() => {
    const checkAvailability = async (field, value) => {
      if (value && value.length > 2) {
        try {
          const response = await api.get(`/job/avilability/check?field=${field}&value=${value}`);
          setAvailability(prev => ({ ...prev, [field]: response.data.available }));
        } catch (error) {
          console.error(`Availability check failed for ${field}`);
        }
      }
    };

    const timeouts = {};

    if (formData.username) {
      clearTimeout(timeouts.username);
      timeouts.username = setTimeout(() => checkAvailability('username', formData.username), 500);
    }

    if (formData.email && formData.email.includes('@')) {
      clearTimeout(timeouts.email);
      timeouts.email = setTimeout(() => checkAvailability('email', formData.email), 500);
    }

    if (formData.companyName) {
      clearTimeout(timeouts.companyName);
      timeouts.companyName = setTimeout(() => checkAvailability('companyName', formData.companyName), 500);
    }

    if (formData.companyEmail && formData.companyEmail.includes('@')) {
      clearTimeout(timeouts.companyEmail);
      timeouts.companyEmail = setTimeout(() => checkAvailability('companyEmail', formData.companyEmail), 500);
    }

    if (formData.phone && formData.phone.length >= 10) {
      clearTimeout(timeouts.phone);
      timeouts.phone = setTimeout(() => checkAvailability('phone', formData.phone), 500);
    }

    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, [formData.username, formData.email, formData.companyName, formData.companyEmail, formData.phone]);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset email verification if email is changed
    if (name === 'email' && personalEmailVerified) {
      setPersonalEmailVerified(false);
      setShowPersonalOtpSection(false);
      setPersonalOtp(['', '', '', '']);
    }
    
    if (name === 'companyEmail' && companyEmailVerified) {
      setCompanyEmailVerified(false);
      setShowCompanyOtpSection(false);
      setCompanyOtp(['', '', '', '']);
    }
  };

  const copyPhoneToWhatsApp = () => {
    if (formData.phone) {
      setFormData(prev => ({
        ...prev,
        whatsAppNumber: prev.phone
      }));
      toast.success('Phone number copied to WhatsApp');
    }
  };

  // Personal Email OTP Functions
  const handleSendPersonalOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (availability.email === false) {
      toast.error('This email is already taken');
      return;
    }

    setSendingPersonalOtp(true);
    try {
      const response = await api.post('/job/company/send-otp', { email: formData.email });
      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        setShowPersonalOtpSection(true);
        setPersonalOtpTimer(60); // 60 seconds timer
        setUserEmail(formData.email);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setSendingPersonalOtp(false);
    }
  };

  const handlePersonalOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...personalOtp];
    newOtp[index] = value;
    setPersonalOtp(newOtp);

    if (value && index < 3) {
      personalOtpInputsRef.current[index + 1].focus();
    }
  };

  const handlePersonalOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !personalOtp[index] && index > 0) {
      personalOtpInputsRef.current[index - 1].focus();
    }
  };

  const handlePersonalOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').concat(Array(4 - pasteData.length).fill(''));
      setPersonalOtp(newOtp);
      personalOtpInputsRef.current[Math.min(pasteData.length, 3)].focus();
    }
  };

  const handleVerifyPersonalOtp = async () => {
    const otpString = personalOtp.join('');

    if (otpString.length !== 4) {
      toast.error('Please enter complete 4-digit OTP');
      return;
    }

    setVerifyingPersonalOtp(true);
    try {
      const response = await api.post('/job/company/verify-otp', {
        email: formData.email,
        otp: otpString
      });

      if (response.data.success) {
        toast.success('Email verified successfully!');
        setPersonalEmailVerified(true);
        setShowPersonalOtpSection(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    } finally {
      setVerifyingPersonalOtp(false);
    }
  };

  const handleResendPersonalOtp = async () => {
    try {
      const response = await api.post('/job/company/send-otp', { email: formData.email });
      
      if (response.data.success) {
        toast.success('New OTP sent!');
        setPersonalOtpTimer(60);
        setPersonalOtp(['', '', '', '']);
        personalOtpInputsRef.current[0].focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    }
  };

  // Company Email OTP Functions
  const handleSendCompanyOtp = async () => {
    if (!formData.companyEmail || !formData.companyEmail.includes('@')) {
      toast.error('Please enter a valid company email address');
      return;
    }

    if (availability.companyEmail === false) {
      toast.error('This company email is already taken');
      return;
    }

    setSendingCompanyOtp(true);
    try {
      const response = await api.post('/job/company/send-otp', { email: formData.companyEmail });
      
      if (response.data.success) {
        toast.success('OTP sent to company email!');
        setShowCompanyOtpSection(true);
        setCompanyOtpTimer(60); // 60 seconds timer
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setSendingCompanyOtp(false);
    }
  };

  const handleCompanyOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...companyOtp];
    newOtp[index] = value;
    setCompanyOtp(newOtp);

    if (value && index < 3) {
      companyOtpInputsRef.current[index + 1].focus();
    }
  };

  const handleCompanyOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !companyOtp[index] && index > 0) {
      companyOtpInputsRef.current[index - 1].focus();
    }
  };

  const handleCompanyOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').concat(Array(4 - pasteData.length).fill(''));
      setCompanyOtp(newOtp);
      companyOtpInputsRef.current[Math.min(pasteData.length, 3)].focus();
    }
  };

  const handleVerifyCompanyOtp = async () => {
    const otpString = companyOtp.join('');

    if (otpString.length !== 4) {
      toast.error('Please enter complete 4-digit OTP');
      return;
    }

    setVerifyingCompanyOtp(true);
    try {
      const response = await api.post('/job/company/verify-otp', {
        email: formData.companyEmail,
        otp: otpString
      });

      if (response.data.success) {
        toast.success('Company email verified successfully!');
        setCompanyEmailVerified(true);
        setShowCompanyOtpSection(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    } finally {
      setVerifyingCompanyOtp(false);
    }
  };

  const handleResendCompanyOtp = async () => {
    try {
      const response = await api.post('/job/company/send-otp', { email: formData.companyEmail });
      
      if (response.data.success) {
        toast.success('New OTP sent!');
        setCompanyOtpTimer(60);
        setCompanyOtp(['', '', '', '']);
        companyOtpInputsRef.current[0].focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!personalEmailVerified) {
      toast.error('Please verify your personal email first');
      return;
    }

    // Company email is optional, but if provided, it must be verified
    if (formData.companyEmail && !companyEmailVerified) {
      toast.error('Please verify your company email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const isStrongPassword = Object.values(passwordStrength).every(Boolean);
    if (!isStrongPassword) {
      toast.error('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await api.post('/job/company/register', submitData);
      
      if (response.data.success) {
        toast.success('Registration successful!');
        onViewChange('login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatus = (field) => {
    if (!formData[field]) return 'neutral';
    return availability[field] ? 'available' : 'taken';
  };

  const getStatusColor = (field) => {
    const status = getFieldStatus(field);
    if (status === 'available') return 'text-green-600';
    if (status === 'taken') return 'text-red-600';
    return 'text-gray-400';
  };

  const getStatusText = (field) => {
    const status = getFieldStatus(field);
    if (status === 'available') return '✓ Available';
    if (status === 'taken') return '✗ Already taken';
    return '';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      <span className="text-xs">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <motion.div 
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxHeight: '90vh' }}
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
            {/* Back Button */}
            <motion.button
              onClick={() => onViewChange("login")}
              className="flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-6 text-sm"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </motion.button>

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
              Join Thousands of{' '}
              <span className="text-emerald-200">Companies</span>
            </motion.h1>

            <motion.p 
              className="text-sm text-green-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Create your company account and start hiring the best talent. Post jobs, manage applications, and grow your team with Prithu.
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
                <h3 className="font-semibold text-sm">Talent Pool</h3>
                <p className="text-green-100 text-xs">Access thousands of candidates</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Smart Matching</h3>
                <p className="text-green-100 text-xs">Find the perfect candidates</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Quick Setup</h3>
                <p className="text-green-100 text-xs">Get started in minutes</p>
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

        {/* Right Side - Registration Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl mx-auto"
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Create Company Account
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-sm md:text-base"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Fill in your company details to get started
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                      placeholder="John Doe"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                      placeholder="HR Manager"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Personal Email */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Email Address *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={personalEmailVerified}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="you@company.com"
                    />
                  </div>
                  {!personalEmailVerified && (
                    <>
                      {personalOtpTimer === 0 ? (
                        <motion.button
                          type="button"
                          onClick={handleSendPersonalOtp}
                          disabled={sendingPersonalOtp || !formData.email || availability.email === false}
                          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap min-w-[100px]"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {sendingPersonalOtp ? 'Sending...' : 'Send OTP'}
                        </motion.button>
                      ) : (
                        <div className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap min-w-[100px] flex items-center justify-center">
                          {formatTime(personalOtpTimer)}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {formData.email && (
                  <motion.p 
                    className={`text-xs mt-1 flex items-center gap-1 ${getStatusColor('email')} font-medium`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {personalEmailVerified ? '✓ Email Verified' : getStatusText('email')}
                  </motion.p>
                )}
              </motion.div>

              {/* Personal OTP Verification Section */}
              <AnimatePresence>
                {showPersonalOtpSection && (
                  <motion.div
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-green-900 text-sm">Verify Personal Email</h3>
                    </div>
                    
                    <p className="text-xs text-green-700 mb-3">
                      Enter the 4-digit code sent to {formData.email}
                    </p>

                    <div className="flex justify-center gap-2 mb-3">
                      {[0, 1, 2, 3].map((index) => (
                        <motion.input
                          key={index}
                          ref={(el) => (personalOtpInputsRef.current[index] = el)}
                          type="text"
                          maxLength="1"
                          value={personalOtp[index]}
                          onChange={(e) => handlePersonalOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handlePersonalOtpKeyDown(index, e)}
                          onPaste={handlePersonalOtpPaste}
                          className="w-12 h-12 text-center text-lg font-semibold border border-green-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          whileFocus={{ scale: 1.05 }}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-xs text-green-600 font-medium">
                        {personalOtpTimer > 0 ? `Expires in: ${formatTime(personalOtpTimer)}` : 'OTP expired'}
                      </div>
                      
                      <div className="flex gap-2">
                        {personalOtpTimer === 0 && (
                          <motion.button
                            type="button"
                            onClick={handleResendPersonalOtp}
                            className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            Resend OTP
                          </motion.button>
                        )}
                        
                        <motion.button
                          type="button"
                          onClick={handleVerifyPersonalOtp}
                          disabled={verifyingPersonalOtp || personalOtp.join('').length !== 4}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {verifyingPersonalOtp ? 'Verifying...' : 'Verify'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phone Number */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                    placeholder="+91 9876543210"
                  />
                </div>
                {formData.phone && formData.phone.length >= 10 && (
                  <motion.p 
                    className={`text-xs mt-1 flex items-center gap-1 ${getStatusColor('phone')} font-medium`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {getStatusText('phone')}
                  </motion.p>
                )}
              </motion.div>

              {/* WhatsApp Number */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <input
                      type="tel"
                      name="whatsAppNumber"
                      value={formData.whatsAppNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={copyPhoneToWhatsApp}
                    disabled={!formData.phone}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 justify-center min-w-[100px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </motion.button>
                </div>
              </motion.div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300"
                      placeholder="Your Company Pvt Ltd"
                    />
                  </div>
                  {formData.companyName && (
                    <motion.p 
                      className={`text-xs mt-1 flex items-center gap-1 ${getStatusColor('companyName')} font-medium`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {getStatusText('companyName')}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        disabled={companyEmailVerified}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 shadow-sm hover:border-green-300 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="info@company.com"
                      />
                    </div>
                    {formData.companyEmail && !companyEmailVerified && (
                      <>
                        {companyOtpTimer === 0 ? (
                          <motion.button
                            type="button"
                            onClick={handleSendCompanyOtp}
                            disabled={sendingCompanyOtp || !formData.companyEmail || availability.companyEmail === false || !personalEmailVerified}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap min-w-[100px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {sendingCompanyOtp ? 'Sending...' : 'Send OTP'}
                          </motion.button>
                        ) : (
                          <div className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap min-w-[100px] flex items-center justify-center">
                            {formatTime(companyOtpTimer)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {formData.companyEmail && (
                    <motion.p 
                      className={`text-xs mt-1 flex items-center gap-1 ${getStatusColor('companyEmail')} font-medium`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {companyEmailVerified ? '✓ Email Verified' : getStatusText('companyEmail')}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Company OTP Verification Section */}
              <AnimatePresence>
                {showCompanyOtpSection && (
                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 text-sm">Verify Company Email</h3>
                    </div>
                    
                    <p className="text-xs text-blue-700 mb-3">
                      Enter the 4-digit code sent to {formData.companyEmail}
                    </p>

                    <div className="flex justify-center gap-2 mb-3">
                      {[0, 1, 2, 3].map((index) => (
                        <motion.input
                          key={index}
                          ref={(el) => (companyOtpInputsRef.current[index] = el)}
                          type="text"
                          maxLength="1"
                          value={companyOtp[index]}
                          onChange={(e) => handleCompanyOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleCompanyOtpKeyDown(index, e)}
                          onPaste={handleCompanyOtpPaste}
                          className="w-12 h-12 text-center text-lg font-semibold border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          whileFocus={{ scale: 1.05 }}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-xs text-blue-600 font-medium">
                        {companyOtpTimer > 0 ? `Expires in: ${formatTime(companyOtpTimer)}` : 'OTP expired'}
                      </div>
                      
                      <div className="flex gap-2">
                        {companyOtpTimer === 0 && (
                          <motion.button
                            type="button"
                            onClick={handleResendCompanyOtp}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            whileHover={{ scale: 1.05 }}
                          >
                            Resend OTP
                          </motion.button>
                        )}
                        
                        <motion.button
                          type="button"
                          onClick={handleVerifyCompanyOtp}
                          disabled={verifyingCompanyOtp || companyOtp.join('').length !== 4}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {verifyingCompanyOtp ? 'Verifying...' : 'Verify'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
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
                      placeholder="Create strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {formData.password && (
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

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
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
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !personalEmailVerified || (formData.companyEmail && !companyEmailVerified)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 text-sm group mt-6"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Company Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => onViewChange('login')}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 underline underline-offset-2"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>

            {/* Support */}
            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
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

export default CompanyRegister;