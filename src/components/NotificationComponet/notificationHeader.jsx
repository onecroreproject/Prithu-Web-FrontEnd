 
import React from "react";
import { CheckCheck, ArchiveX, Bell, X } from "lucide-react";
 
export default function NotificationHeader({
  notifications,
  onMarkAllAsRead,
  onDeleteAll,
  unreadCount,
  onClose
}) {
  const hasUnread = notifications.some((n) => !n.isRead);
  const hasNotifications = notifications.length > 0;
 
  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-4 sm:hidden">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>
 
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </div>
         
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {hasNotifications
                ? `${notifications.length} total • ${unreadCount} unread`
                : "No new notifications"
              }
            </p>
          </div>
        </div>
 
        {/* Action Buttons */}
        {hasNotifications && (
          <div className="hidden sm:flex items-center gap-2">
            {hasUnread && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-sm"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark Read</span>
              </button>
            )}
           
            <button
              onClick={onDeleteAll}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all duration-200 hover:shadow-sm"
              title="Delete all notifications"
            >
              <ArchiveX className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>
 
      {/* Mobile Stats & Actions */}
      {hasNotifications && (
        <div className="mt-4 sm:mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{unreadCount} unread</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>{notifications.length - unreadCount} read</span>
              </div>
            </div>
 
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllAsRead}
                disabled={!hasUnread}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  hasUnread
                    ? "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                    : "text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                }`}
              >
                Read All
              </button>
              <button
                onClick={onDeleteAll}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 