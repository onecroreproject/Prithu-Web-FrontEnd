 
import React from "react";
import { motion } from "framer-motion";
import { BellRing, Trash2, User } from "lucide-react";
 
export default function NotificationItem({ notif, onClick, onDelete }) {
  const sender = notif.sender || {};
 
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
 
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
 
  // Get type badge color
  const getTypeColor = (type) => {
    const typeColors = {
      alert: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-amber-100 text-amber-800 border-amber-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return typeColors[type?.toLowerCase()] || typeColors.default;
  };
 
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: "#f8fafc" }}
      whileTap={{ scale: 0.995 }}
      className={`relative p-3 sm:p-4 border-b border-gray-100 last:border-b-0 flex items-start gap-3 sm:gap-4 cursor-pointer transition-all duration-200 group ${
        !notif.isRead
          ? "bg-blue-50/60 hover:bg-blue-50"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      {/* Unread Indicator */}
      {!notif.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 sm:h-10 bg-blue-500 rounded-r-full"></div>
      )}
 
      {/* Avatar with fallback */}
      <div className="flex-shrink-0 relative">
        {sender.profileAvatar ? (
          <img
            src={sender.profileAvatar}
            alt={sender.userName || "User"}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <User size={16} className="text-white" />
          </div>
        )}
       
        {/* Notification Type Icon Badge */}
        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
          <BellRing size={8} className="text-blue-600" />
        </div>
      </div>
 
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
        {/* Header with sender and type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {sender.userName || sender.displayName || "System"}
            </p>
           
            {notif.type && (
              <span className={`hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notif.type)}`}>
                {notif.type}
              </span>
            )}
          </div>
         
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
            {formatTime(notif.createdAt)}
          </span>
        </div>
 
        {/* Title */}
        <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 leading-tight">
          {notif.title || "New Notification"}
        </h4>
 
        {/* Message */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
          {notif.message}
        </p>
 
        {/* Additional metadata */}
        <div className="flex items-center gap-2 pt-1">
          {notif.type && (
            <span className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(notif.type)}`}>
              {notif.type}
            </span>
          )}
          {notif.priority && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              notif.priority === "high"
                ? "bg-red-50 text-red-700"
                : notif.priority === "medium"
                ? "bg-amber-50 text-amber-700"
                : "bg-blue-50 text-blue-700"
            }`}>
              {notif.priority}
            </span>
          )}
        </div>
      </div>
 
      {/* Right side - Image or Icon */}
      <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
        {notif.image ? (
          <img
            src={notif.image}
            alt="Notification"
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center shadow-sm">
            <BellRing size={16} className="text-gray-500" />
          </div>
        )}
 
        {/* Delete Button - Shows on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif._id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 sm:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
          title="Delete notification"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
 