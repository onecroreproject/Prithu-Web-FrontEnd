// src/pages/settings/PrivacySettings.jsx
import React, { useState } from "react";


import {
  Shield,
  Activity,
  Database,
  Search,
  Link,
  Eye,
  MapPin,
  Clock,
  Monitor,
  ShieldCheck,
  X,
  Download,ChevronDown
} from "lucide-react";

const PrivacySettings = () => {
  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    loginActivity: true,
    dataManagement: true,
    searchHistory: false,
    permittedServices: true,
    profileVisibility: true,
    autoplay: "wifi",
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggle = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setValue = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  // Sample login history
  const loginHistory = [
    { time: "2 hours ago", location: "New York, USA", device: "Chrome on Windows", ip: "192.168.1.100", current: true },
    { time: "1 day ago", location: "London, UK", device: "Safari on iPhone", ip: "85.124.22.11", current: false },
    { time: "3 days ago", location: "Tokyo, Japan", device: "Firefox on Mac", ip: "203.0.113.5", current: false },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Two-Factor Authentication */}
      <PrivacyRow
        icon={<Shield className="w-4 h-4 text-green-600" />}
        title="Use two-factor authentication"
        tagline="Unaffected occasional thoroughly. Adieus it no wonders spirit houses."
        rightContent={<ToggleSwitch checked={privacy.twoFactor} onChange={() => toggle("twoFactor")} />}
      />

      {/* 2. Login Activity */}
      <PrivacyRow
        icon={<Activity className="w-4 h-4 text-blue-600" />}
        title="Login activity"
        tagline="View all recent login sessions"
        rightContent={
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
          >
            View
          </button>
        }
      />

      {/* 3. Manage your data and activity – NOW WITH DOWNLOAD BUTTON */}
      <PrivacyRow
        icon={<Database className="w-4 h-4 text-purple-600" />}
        title="Manage your data and activity"
        tagline="Download or delete your account data"
        rightContent={
          <button className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium text-sm">
            <Download className="w-4 h-4" />
            Download Data
          </button>
        }
      />

      {/* 4. Search history */}
      <PrivacyRow
        icon={<Search className="w-4 h-4 text-orange-600" />}
        title="Search history"
        tagline="Choose to autoplay videos on social"
        rightContent={
          <Select
            value={privacy.autoplay}
            onChange={(e) => setValue("autoplay", e.target.value)}
            options={[
              { value: "always", label: "Always" },
              { value: "wifi", label: "Wi-Fi only" },
              { value: "never", label: "Never" },
            ]}
          />
        }
      />

      {/* 5. Permitted services */}
      <PrivacyRow
        icon={<Link className="w-4 h-4 text-indigo-600" />}
        title="Permitted services"
        tagline="Choose if this feature appears on your profile"
        rightContent={<ToggleSwitch checked={privacy.permittedServices} onChange={() => toggle("permittedServices")} />}
      />

      {/* 6. Profile visibility */}
      <PrivacyRow
        icon={<Eye className="w-4 h-4 text-teal-600" />}
        title="Profile visibility"
        tagline="Control who can see your profile and posts"
        rightContent={<ToggleSwitch checked={privacy.profileVisibility} onChange={() => toggle("profileVisibility")} />}
      />

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
          Save Changes
        </button>
      </div>

      {/* LOGIN ACTIVITY MODAL */}
      {showLoginModal && (
        <LoginActivityModal history={loginHistory} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

/* === REUSABLE COMPONENTS === */

/* Privacy Row – Fixed & Defined */
const PrivacyRow = ({ icon, title, tagline, rightContent }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{tagline}</p>
      </div>
    </div>
    <div className="flex items-center">{rightContent}</div>
  </div>
);

/* Toggle Switch */
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
  </label>
);

/* Select Dropdown */
const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
  </div>
);

/* Login Activity Modal */
const LoginActivityModal = ({ history, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Login Activity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                entry.current ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{entry.time}</span>
                </div>
                {entry.current && (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Current Session
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {entry.location}
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  {entry.device}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  IP: {entry.ip}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Don’t recognize a login?{" "}
            <button className="text-purple-600 font-medium hover:underline">
              Secure your account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;