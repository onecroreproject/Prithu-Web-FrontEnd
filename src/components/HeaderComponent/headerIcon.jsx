// src/components/HeaderIcon.jsx
import React from "react";

export default function HeaderIcon({ Icon, onClick, badge, active }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full transition-all ${active ? "bg-green-100 ring-2 ring-green-400" : "hover:bg-gray-100"}`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-green-700 scale-110" : "text-green-600"}`} />
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
