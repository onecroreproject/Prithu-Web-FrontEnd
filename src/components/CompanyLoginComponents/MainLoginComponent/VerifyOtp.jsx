// src/components/Auth/VerifyOTP.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';

const CompanyVerifyOTP = ({ onViewChange, userEmail }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); 
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
    if (value && index < 5) {
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
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').concat(Array(6 - pasteData.length).fill(''));
      setOtp(newOtp);
      inputsRef.current[Math.min(pasteData.length, 5)].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
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
        onViewChange('login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await api.post('/job/company/send-otp', { email: userEmail });
      
      if (response.data.success) {
        toast.success('New OTP sent!');
        setTimer(300); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={() => onViewChange('login')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </button>
        
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to {userEmail}
        </p>
        
        {/* Timer */}
        <div className="mt-4">
          <p className={`text-sm font-medium ${timer > 60 ? 'text-green-600' : 'text-red-600'}`}>
            OTP expires in: {formatTime(timer)}
          </p>
        </div>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || timer === 0}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Didn't receive code?{' '}
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP {timer > 0 && `(${formatTime(timer)})`}
          </button>
        </p>
      </div>
    </div>
  );
};

export default CompanyVerifyOTP;