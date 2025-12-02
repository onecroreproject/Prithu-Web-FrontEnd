import React from 'react';
import { 
  FiBriefcase, 
  FiList, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiHome,
  FiBell,
  FiHelpCircle
} from 'react-icons/fi';
import { MdBusiness, MdDashboard } from 'react-icons/md';

const Sidebar = ({ activeTab, setActiveTab, onMobileItemClick }) => {
  const companyInfo = {
    name: "Prithu Technologies",
    logo: "https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    email: "hr@prithutech.com"
  };

  const menuItems = [
    { id: 'createJob', label: 'Create Job', icon: FiBriefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'viewJobs', label: 'View Jobs', icon: FiList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'applicants', label: 'Applicants', icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: FiSettings },
    { id: 'help', label: 'Help Center', icon: FiHelpCircle },
    { id: 'logout', label: 'Logout', icon: FiLogOut, color: 'text-red-600' },
  ];

  const handleItemClick = (itemId) => {
    (itemId)
    setActiveTab(itemId);
    if (onMobileItemClick) onMobileItemClick();
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 shadow-sm">
      {/* Company Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden mb-4">
            <img 
              src={companyInfo.logo} 
              alt="Company Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-900 truncate w-full">
            {companyInfo.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1 truncate w-full">
            {companyInfo.email}
          </p>
          <div className="mt-4 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            Premium Plan
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          {/* Main Menu Items */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              JOB MANAGEMENT
            </h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? `${item.bg} ${item.color} font-semibold shadow-sm` 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? item.bg : 'bg-gray-100'}`}>
                    <Icon className={`text-lg ${isActive ? item.color : 'text-gray-500'}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="px-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="text-xs opacity-90">Active Jobs</div>
              <div className="text-2xl font-bold mt-1">12</div>
              <div className="text-xs opacity-80 mt-1">+2 this week</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              NOTIFICATIONS
            </h3>
            <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <div className="p-2 rounded-lg bg-rose-50">
                <FiBell className="text-lg text-rose-600" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm">New Applications</span>
                <div className="text-xs text-gray-500 mt-1">45 pending review</div>
              </div>
              <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                45
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="border-t border-gray-100 pt-4 pb-6 px-4 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
            onClick={() => handleItemClick(item.id)}
              key={item.id}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Icon className={`text-lg ${item.color || 'text-gray-500'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin Manager</p>
            <p className="text-xs text-gray-500 truncate">admin@prithutech.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;