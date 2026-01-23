// src/pages/settings/CommunicationSettings.jsx
import React, { useState } from "react";
import {
  Users,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const CommunicationSettings = () => {
  const [connection, setConnection] = useState("everyone");
  const [messaging, setMessaging] = useState({
    messageRequests: true,
    groupAdd: true,
    sponsoredMessages: false,
  });
  const [discoverability, setDiscoverability] = useState({
    searchEngines: true,
    emailSearch: false,
  });

  const [openSections, setOpenSections] = useState({
    connect: true,
    message: false,
    find: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggle = (obj, key) => {
    obj((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Who can connect with you? */}
      <CollapsibleSection
        title="Who can connect with you?"
        tagline="He moonlights difficult engrossed it, sportsmen. Interested has all Devonshire difficulty gay assistance joy. Unaffected at ye of compliment alteration to."
        isOpen={openSections.connect}
        onToggle={() => toggleSection("connect")}
      >
        <div className="space-y-3 mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="connection"
              value="everyone"
              checked={connection === "everyone"}
              onChange={(e) => setConnection(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              Everyone on social <span className="text-blue-600 text-xs">(recommended)</span>
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="connection"
              value="email"
              checked={connection === "email"}
              onChange={(e) => setConnection(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Only people who know your email address
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="connection"
              value="mutual"
              checked={connection === "mutual"}
              onChange={(e) => setConnection(e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Only people who appear in your mutual connection list
            </span>
          </label>
        </div>
      </CollapsibleSection>

      {/* 2. Who can message you */}
      <CollapsibleSection
        title="Who can message you"
        isOpen={openSections.message}
        onToggle={() => toggleSection("message")}
      >
        <div className="mt-4 space-y-4">
          <ToggleRow
            label="Enable message request notifications"
            checked={messaging.messageRequests}
            onChange={() => toggle(setMessaging, "messageRequests")}
          />
          <ToggleRow
            label="Allow connections to add you on group"
            checked={messaging.groupAdd}
            onChange={() => toggle(setMessaging, "groupAdd")}
          />
          <ToggleRow
            label="Allow Sponsored Messages"
            checked={messaging.sponsoredMessages}
            onChange={() => toggle(setMessaging, "sponsoredMessages")}
            info="Your personal information is safe with our marketing partners unless you respond to their Sponsored Messages"
          />
        </div>
      </CollapsibleSection>

      {/* 3. How people can find you */}
      <CollapsibleSection
        title="How people can find you"
        isOpen={openSections.find}
        onToggle={() => toggleSection("find")}
      >
        <div className="mt-4 space-y-4">
          <ToggleRow
            label="Allow search engines to show your profile"
            checked={discoverability.searchEngines}
            onChange={() => toggle(setDiscoverability, "searchEngines")}
          />
          <ToggleRow
            label="Allow people to search by your email address"
            checked={discoverability.emailSearch}
            onChange={() => toggle(setDiscoverability, "emailSearch")}
          />
          <ToggleRow
            label="Allow Sponsored Messages"
            checked={messaging.sponsoredMessages}
            onChange={() => toggle(setMessaging, "sponsoredMessages")}
            info="Your personal information is safe with our marketing partners unless you respond to their Sponsored Messages"
          />
        </div>
      </CollapsibleSection>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Save changes
        </button>
      </div>
    </div>
  );
};

/* === COLLAPSIBLE SECTION === */
const CollapsibleSection = ({ title, tagline, children, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition"
    >
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {tagline && <p className="text-xs text-gray-600 mt-1">{tagline}</p>}
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
    {isOpen && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
  </div>
);

/* === TOGGLE ROW === */
const ToggleRow = ({ label, checked, onChange, info }) => (
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-900 cursor-pointer">{label}</label>
      {info && (
        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {info}
        </p>
      )}
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

/* === TOGGLE SWITCH === */
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
);

export default CommunicationSettings;