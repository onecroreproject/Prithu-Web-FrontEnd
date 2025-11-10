import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NotificationHeader from "./notificationHeader";
import NotificationItem from "./notificationItem";
import NotificationPopup from "./notificationPopUpReader";
import { Trash2 } from "lucide-react";
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
      toast.success("All notifications deleted 🗑️");
    } catch (err) {
      console.error("❌ Delete all error:", err);
      toast.error("Failed to delete all notifications");
    }
  };

  // ✅ Mark single notification as read + open popup
  const handleNotificationClick = async (notif) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      try {
        await api.put("/api/user/read", { notificationId: notif._id }, authHeader);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
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
      toast.success("Notification deleted successfully 🗑️");
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-xl border overflow-hidden z-50"
          >
            {/* ✅ Header with Mark All + Delete All */}
            <NotificationHeader
              notifications={notifications}
              onMarkAllAsRead={markAllAsRead}
              onDeleteAll={handleDeleteAllNotifications}
            />

            {/* ✅ Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center py-4 text-gray-400 text-sm">No notifications yet.</p>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-between px-3 py-2 border-b hover:bg-gray-50 transition"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <NotificationItem notif={notif} />
                    </div>

                    {/* 🗑️ Individual Delete */}
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Notification Reader Popup */}
      {selectedNotif && (
        <NotificationPopup notification={selectedNotif} onClose={() => setSelectedNotif(null)} />
      )}
    </>
  );
}
