

 
import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NotificationHeader from "./notificationHeader";
import NotificationItem from "./notificationItem";
import NotificationPopup from "./notificationPopUpReader";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
 
export default function NotificationDropdown({ isOpen, onClose, onUpdateCount }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
 
  // ✅ Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/get/user/all/notification", authHeader);
      const list = res.data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  }, []);
 
  // ✅ Live socket updates
  useEffect(() => {
    const handleNewNotif = (e) => {
      setNotifications((prev) => [e.detail, ...prev]);
      onUpdateCount?.();
    };
    document.addEventListener("socket:newNotification", handleNewNotif);
    return () => document.removeEventListener("socket:newNotification", handleNewNotif);
  }, [onUpdateCount]);
 
  // ✅ Fetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);
 
  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put("/api/mark/all/notification/read", {}, authHeader);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUpdateCount?.();
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };
 
  // ✅ Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await api.delete("/api/user/delete/all/notification", authHeader);
      setNotifications([]);
      onUpdateCount?.();
      toast.success("All notifications deleted");
    } catch (err) {
      console.error("❌ Delete all error:", err);
      toast.error("Failed to delete all notifications");
    }
  };
 
  // ✅ Mark single notification as read + open popup
 const handleNotificationClick = async (notif) => {
  setSelectedNotif({ ...notif });   // <-- send full data

  if (!notif.isRead) {
    try {
      await api.put("/api/user/read", { notificationId: notif._id }, authHeader);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id ? { ...n, isRead: true } : n
        )
      );

      onUpdateCount?.();
    } catch (err) {
      console.error("❌ Mark read error:", err);
    }
  }
};

 
  // ✅ Delete individual notification
  const handleDeleteNotification = async (notifId) => {
    try {
      await api.delete("/api/user/delete/notification", {
        ...authHeader,
        data: { notificationId: notifId },
      });
 
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      onUpdateCount?.();
      toast.success("Notification deleted successfully");
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete notification");
    }
  };
 
  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);
 
  const unreadCount = notifications.filter(n => !n.isRead).length;
 
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed sm:absolute right-0 top-14 sm:top-12 w-full sm:w-96 max-w-sm mx-auto sm:mx-0 bg-white rounded-none sm:rounded-xl shadow-2xl sm:shadow-xl border-0 sm:border border-gray-200 overflow-hidden z-50 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[80vh]"
          >
            {/* Header */}
            <NotificationHeader
              notifications={notifications}
              onMarkAllAsRead={markAllAsRead}
              onDeleteAll={handleDeleteAllNotifications}
              unreadCount={unreadCount}
              onClose={onClose}
            />
 
            {/* Notification List */}
            <div className="flex-1 overflow-y-auto h-full sm:max-h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bell size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500 text-sm">When you get notifications, they'll appear here</p>
                </div>
              ) : (
                <div className="p-2 sm:p-0">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NotificationItem
                        notif={notif}
                        onClick={() => handleNotificationClick(notif)}
                        onDelete={handleDeleteNotification}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
 
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-4 sm:p-3">
                <button className="w-full text-center text-sm text-gray-700 font-medium hover:text-gray-900 py-3 sm:py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300">
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={onClose}
        />
      )}
 
      {/* Notification Reader Popup */}
      {selectedNotif && (
        <NotificationPopup
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </>
  );
}
 