import React from "react";
import { Check, Trash2 } from "lucide-react";

export default function NotificationHeader({ notifications, onMarkAllAsRead, onDeleteAll }) {
  const hasUnread = notifications.some((n) => !n.isRead);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
      <h2 className="text-gray-800 font-semibold text-sm">Notifications</h2>

      <div className="flex items-center gap-2">
        {/* ✅ Mark all as read */}
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition"
            title="Mark all as read"
          >
            <Check className="w-4 h-4" />
            <span>Mark all</span>
          </button>
        )}

        {/* 🗑️ Delete all notifications */}
        {hasNotifications && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition"
            title="Delete all notifications"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete all</span>
          </button>
        )}
      </div>
    </div>
  );
}
