// src/pages/settings/NotificationSettings.jsx
import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bell,
  Calendar,
  Mail,
  Smartphone,
  Star,
} from "lucide-react";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    replyToComments: false,
    subscriptions: true,
    birthdays: true,
    events: false,
    email: true,
    push: true,
    weeklySummary: false,
  });

  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Reusable Row */}
      <NotificationRow
        icon={<Heart className="w-4 h-4 text-pink-600" />}
        title="Likes and Comments"
        tagline="Joy say painful removed reached end."
        toggles={[
       
          { key: "comments", label: "" },
        ]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<MessageCircle className="w-4 h-4 text-blue-600" />}
        title="Reply to My Comments"
        tagline="Ask a quick six seven offer see among."
        toggles={[{ key: "replyToComments", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<Bell className="w-4 h-4 text-purple-600" />}
        title="Subscriptions"
        tagline="Preference any astonished unreserved Mrs."
        toggles={[{ key: "subscriptions", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<Calendar className="w-4 h-4 text-green-600" />}
        title="Birthdays"
        tagline="Contented he gentleman agreeable do be."
        toggles={[{ key: "birthdays", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<Calendar className="w-4 h-4 text-indigo-600" />}
        title="Events"
        tagline="Fulfilled direction use continually."
        toggles={[{ key: "events", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<Mail className="w-4 h-4 text-orange-600" />}
        title="Email Notifications"
        tagline="As hastened oh produced prospect."
        toggles={[{ key: "email", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      <NotificationRow
        icon={<Smartphone className="w-4 h-4 text-teal-600" />}
        title="Push Notifications"
        tagline="Rendered six say his striking confined."
        toggles={[{ key: "push", label: "" }]}
        state={notifications}
        onToggle={toggle}
      />

      {/* Pro Feature */}
      
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Weekly Account Summary</h3>
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
              </div>
              <p className="text-xs text-gray-600">Rendered six say his striking confined.</p>
            </div>
          </div>
          <ToggleSwitch
            checked={notifications.weeklySummary}
            onChange={() => toggle("weeklySummary")}
          />
        </div>
      

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

/* Single-line Row Component */
const NotificationRow = ({ icon, title, tagline, toggles, state, onToggle }) => {
  const hasMultiple = toggles.length > 1;
  const isOn = toggles.some((t) => state[t.key]);

  return (
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
      <div className="flex items-center gap-2">
        {hasMultiple ? (
          <>
            <ToggleSwitch checked={state[toggles[0].key]} onChange={() => onToggle(toggles[0].key)} />
            <ToggleSwitch checked={state[toggles[1].key]} onChange={() => onToggle(toggles[1].key)} />
          </>
        ) : (
          <ToggleSwitch checked={isOn} onChange={() => onToggle(toggles[0].key)} />
        )}
      </div>
    </div>
  );
};

/* Clean Toggle Switch */
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
  </label>
);

export default NotificationSettings;