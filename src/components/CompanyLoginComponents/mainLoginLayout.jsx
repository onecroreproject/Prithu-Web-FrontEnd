// src/components/Auth/AuthContainer.jsx
import React, { useState } from 'react';
import Login from './MainLoginComponent/companyLogin';
import Register from './MainLoginComponent/companyRegistrationComponat';
import ForgotPassword from './MainLoginComponent/companyForgotPassword';
import SendOTP from './MainLoginComponent/companySendOtp';
import VerifyOTP from './MainLoginComponent/VerifyOtp';
import CompanyResetPassword from './MainLoginComponent/companyResetPassword';

const CompanyLogin = () => {
  const [currentView, setCurrentView] = useState('login');
  const [userEmail, setUserEmail] = useState('');
console.log(currentView)
  const views = {
    login: <Login onViewChange={setCurrentView} setUserEmail={setUserEmail} />,
    register: <Register onViewChange={setCurrentView} setUserEmail={setUserEmail} />,
    forgotPassword: <ForgotPassword onViewChange={setCurrentView} setUserEmail={setUserEmail} />,
    sendOTP: <SendOTP onViewChange={setCurrentView} userEmail={userEmail} />,
    verifyOTP: <VerifyOTP onViewChange={setCurrentView} userEmail={userEmail} />,
    resetPassword:<CompanyResetPassword onViewChange={setCurrentView} userEmail={userEmail} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full ">
        {views[currentView]}
      </div>
    </div>
  );
};

export default CompanyLogin;