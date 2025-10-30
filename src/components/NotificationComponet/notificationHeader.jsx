import React from "react";
import { Check, Trash2 } from "lucide-react";

export default function NotificationHeader({
  notifications,
  markingAll,
  clearingAll,
  onMarkAllAsRead,
  onClearAll,
}) {
  return (
    <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
      <h2 className="text-gray-800 font-semibold text-sm">Notifications</h2>

      <div className="flex items-center gap-2">
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            disabled={clearingAll}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition disabled:opacity-50"
            title="Clear all notifications"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={onMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition disabled:opacity-50"
            title="Mark all as read"
          >
            <Check
              className={`w-4 h-4 transition-transform ${
                markingAll ? "rotate-90 text-gray-400" : ""
              }`}
            />
            <span>Mark all</span>
          </button>
        )}
      </div>
    </div>
  );
}
