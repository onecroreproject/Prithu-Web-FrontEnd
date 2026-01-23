// src/pages/settings/MessagingSettings.jsx
import React, { useState } from "react";
import {
  MessageCircle,
  Bell,
  Users,
  Reply,
  Activity,
  Lightbulb,
  ChevronDown,
} from "lucide-react";

const MessagingSettings = () => {
  const [messaging, setMessaging] = useState({
    messageRequests: true,
    networkInvites: false,
    groupAdd: true,
    replyToComments: true,
    pageActivity: false,
    personalizeTips: true,
  });

  const toggle = (key) => {
    setMessaging((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Enable message request notifications */}
      <MessagingRow
        icon={<Bell className="w-4 h-4 text-purple-600" />}
        title="Enable message request notifications"
        tagline="As young ye hopes no he place means. Partiality diminution gay yet entreaties admiration."
        rightContent={
          <ToggleSwitch
            checked={messaging.messageRequests}
            onChange={() => toggle("messageRequests")}
          />
        }
      />

      {/* 2. Invitations from your network */}
      <MessagingRow
        icon={<Users className="w-4 h-4 text-blue-600" />}
        title="Invitations from your network"
        tagline="In mention perhaps attempt pointed suppose."
        rightContent={
          <ToggleSwitch
            checked={messaging.networkInvites}
            onChange={() => toggle("networkInvites")}
          />
        }
      />

      {/* 3. Allow connections to add you on group */}
      <MessagingRow
        icon={<Users className="w-4 h-4 text-green-600" />}
        title="Allow connections to add you on group"
        tagline="Unknown ye chamber of warrant of Norland arrived."
        rightContent={
          <ToggleSwitch
            checked={messaging.groupAdd}
            onChange={() => toggle("groupAdd")}
          />
        }
      />

      {/* 4. Reply to comments */}
      <MessagingRow
        icon={<Reply className="w-4 h-4 text-indigo-600" />}
        title="Reply to comments"
        tagline="Receive notifications when someone replies to your comment"
        rightContent={
          <ToggleSwitch
            checked={messaging.replyToComments}
            onChange={() => toggle("replyToComments")}
          />
        }
      />

      {/* 5. Messages from activity on my page or channel */}
      <MessagingRow
        icon={<Activity className="w-4 h-4 text-orange-600" />}
        title="Messages from activity on my page or channel"
        tagline="Get notified about likes, comments, and shares"
        rightContent={
          <ToggleSwitch
            checked={messaging.pageActivity}
            onChange={() => toggle("pageActivity")}
          />
        }
      />

      {/* 6. Personalise tips for my page */}
      <MessagingRow
        icon={<Lightbulb className="w-4 h-4 text-yellow-600" />}
        title="Personalise tips for my page"
        tagline="Receive tailored suggestions to improve engagement"
        rightContent={
          <ToggleSwitch
            checked={messaging.personalizeTips}
            onChange={() => toggle("personalizeTips")}
          />
        }
      />

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

/* === REUSABLE ROW === */
const MessagingRow = ({ icon, title, tagline, rightContent }) => (
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

/* === TOGGLE SWITCH === */
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
  </label>
);

export default MessagingSettings;