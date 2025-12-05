import React, { useState } from 'react';
import {
  FiBriefcase,
  FiList,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiBell,
  FiHelpCircle,
  FiChevronRight,
  FiHome
} from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import defaultLogo from '../../../assets/prithu_logo.webp';
import companyApi from '../../../api/companyApi'; // Import your API
import { toast } from 'react-toastify';

const Sidebar = ({ activeTab, setActiveTab, onMobileItemClick, companyInfo }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'createJob', label: 'Create Job', icon: FiBriefcase },
    { id: 'viewJobs', label: 'View Jobs', icon: FiList },
    { id: 'applicants', label: 'Applicants', icon: FiUsers },
    // { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'help', label: 'Help Center', icon: FiHelpCircle },
    { id: 'logout', label: 'Logout', icon: FiLogOut },
  ];

  // Enhanced logout function with API call
  const handleLogout = async () => {
    try {
      // Optional: Call logout API endpoint if you have one
      try {
        await companyApi.post('/company/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('companyToken')}`
          }
        });
      } catch (apiError) {
        console.log('Logout API call failed, proceeding with client-side logout');
        // Continue with client-side logout even if API fails
      }

      // Clear all company-related data from localStorage
      localStorage.removeItem('companyToken');
      localStorage.removeItem('companyData');
      localStorage.removeItem('companyRefreshToken');
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Clear any cookies if needed (optional)
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/company/login';
      }, 500);
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
      
      // Force logout even if there's an error
      localStorage.clear();
      window.location.href = '/company/login';
    }
  };

  // Handle menu item click
  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      setShowLogoutConfirm(true);
      return;
    }
    setActiveTab(itemId);
    if (onMobileItemClick) onMobileItemClick();
  };

  // Get company details with safe fallbacks
  const getCompanyName = () => {
    if (!companyInfo) return 'Loading...';
    
    // Check different possible locations for company name
    return companyInfo.company?.companyName || 
           companyInfo.name || 
           companyInfo.profile?.companyName || 
           'Company Name';
  };
console.log(companyInfo)
  const getCompanyEmail = () => {
    if (!companyInfo) return 'loading...';
    
    return companyInfo.company?.companyEmail || 
           companyInfo.email || 
           companyInfo.profile?.companyEmail || 
           'email@company.com';
  };

  const getCompanyLogo = () => {
    if (!companyInfo) return defaultLogo;
    
    // Check different possible locations for logo
    return companyInfo.company?.logo || 
           companyInfo.logo || 
           companyInfo.profile?.logo || 
           companyInfo.companyLogo || 
           defaultLogo;
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getCompanyName();
    if (name === 'Loading...' || name === 'Company Name') return 'C';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white border-r border-gray-200">
        {/* Company Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 shadow-sm border-2 border-white">
              <img
                src={getCompanyLogo()}
                alt="Company Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultLogo;
                  e.target.onerror = null;
                }}
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 truncate w-full">
              {getCompanyName()}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate w-full">
              {getCompanyEmail()}
            </p>
            {companyInfo?.businessCategory && (
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2">
                {companyInfo.businessCategory}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasNotification = item.id === 'notifications';
              const isLogout = item.id === 'logout';
              const isHelp = item.id === 'help';
             
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    group flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-150
                    ${isActive && !isLogout
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : isLogout
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      : isHelp
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-md transition-colors
                      ${isActive && !isLogout && !isHelp
                        ? 'bg-blue-100 text-blue-600'
                        : isLogout
                        ? 'bg-red-100 text-red-600 group-hover:bg-red-200'
                        : isHelp
                        ? 'bg-green-100 text-green-600 group-hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600'
                      }
                    `}>
                      <Icon className="text-lg" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                 
                  {isActive && !isLogout && (
                    <FiChevronRight className="text-blue-600" />
                  )}
                 
                  {hasNotification && !isActive && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      0
                    </span>
                  )}
                 
                  {hasNotification && isActive && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      0
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="pt-4 pb-6 px-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {companyInfo?.company.position || 'HR Manager'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {companyInfo?.company.email || 'hr@company.com'}
              </p>
            </div>
          </div>
          
          {/* Copyright/Version */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} PrithuTech</p>
            <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowLogoutConfirm(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <FiLogOut className="text-2xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600">
                Are you sure you want to log out from your company account?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FiLogOut className="text-lg" />
                Logout
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                You will need to login again to access your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;