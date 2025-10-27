// src/pages/SettingsPage.jsx
import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Mail,
  MessageCircle,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import NotificationSettings from "../components/Settings/NotificationSettings";
import PrivacySettings from "../components/Settings/PrivacySettings";
import MessagingSettings from "../components/Settings/MessagingSettings";
import CommunicationSettings from "../components/Settings/CommunicationSettings";
import CloseAccountSettings from "../components/Settings/CloseAccountSettings";
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "notification", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Safety", icon: Shield },
    { id: "communication", label: "Communication", icon: Mail },
    { id: "messaging", label: "Messaging", icon: MessageCircle },
    { id: "close", label: "Close Account", icon: LogOut, danger: true },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "account": return <AccountSettings />;
      case "notification": return <NotificationSettings />;
      case "privacy": return <PrivacySettings />;
      case "communication": return <CommunicationSettings />;
      case "messaging": return <MessagingSettings />;
      case "close": return <CloseAccountSettings />;
      default: return <AccountSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDEBAR */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h2>
            </div>
            <nav className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all
                      ${isActive
                        ? "bg-purple-50 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }
                      ${item.danger ? "text-red-600 hover:bg-red-50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h1>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* === PLACEHOLDERS (Replace one by one) === */
const Placeholder = ({ title, children }) => (
  <div className="text-center py-16">
    <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
      <Settings className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 max-w-md mx-auto">{children}</p>
    <p className="text-xs text-gray-500 mt-6">This section will be built next.</p>
  </div>
);

const AccountSettings = () => (
  <Placeholder title="Account Settings">
    Manage your username, email, password, and profile visibility.
  </Placeholder>
);









export default SettingsPage;